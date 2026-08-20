/* Per-device image audit: does every picture actually fit its frame?
   Flags broken images, zero-height frames, stretched art, heavy crops that
   would cut the subject, missing dimensions (layout shift) and oversized
   downloads.   node tools/check_images.js                                   */
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:8811/';
const PAGES = ['index', 'services', 'patients', 'providers', 'about', 'contact', 'legal', '404']
  .map(p => p + '.html');
const DEVICES = [
  ['iPhone SE', 320, 568, true], ['iPhone 12', 390, 844, true],
  ['Pixel 7', 412, 915, true], ['iPad mini', 768, 1024, true],
  ['iPad Pro', 1024, 1366, false], ['Laptop', 1366, 768, false],
  ['Desktop', 1920, 1080, false],
];
const CROP_LIMIT = 0.45;     // how much of a figure's source may be cropped away
const BLEED_LIMIT = 0.62;    // a full-bleed background is cropped by design

const problems = [];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [name, w, h, mobile] of DEVICES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    let worstCrop = 0, checked = 0, bytes = 0;
    for (const p of PAGES) {
      await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
      await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
      const docH = await page.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y < docH; y += 600) {
        await page.evaluate(v => window.scrollTo(0, v), y);
        await page.waitForTimeout(45);
      }
      await page.waitForTimeout(500);
      const r = await page.evaluate(limit => {
        const out = [];
        document.querySelectorAll('img').forEach(img => {
          const box = img.getBoundingClientRect();
          const slot = img.getAttribute('data-photo') || img.getAttribute('alt') || img.src.split('/').pop();
          if (img.complete && img.naturalWidth === 0) return out.push({ slot, issue: 'broken' });
          if (!img.naturalWidth) return;
          const isPhoto = /assets\/photos\//.test(img.currentSrc);
          if (!isPhoto) return;
          if (box.width < 2 || box.height < 2) return out.push({ slot, issue: 'zero-size frame' });
          const fit = getComputedStyle(img).objectFit;
          const natural = img.naturalWidth / img.naturalHeight;
          const rendered = box.width / box.height;
          if (fit !== 'cover' && fit !== 'contain' && Math.abs(natural - rendered) / natural > 0.02) {
            return out.push({ slot, issue: `stretched (${natural.toFixed(2)} shown as ${rendered.toFixed(2)})` });
          }
          // how much of the source disappears under object-fit: cover
          const scale = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight);
          const visible = (box.width / scale) * (box.height / scale);
          const lost = 1 - visible / (img.naturalWidth * img.naturalHeight);
          if (!img.getAttribute('width') || !img.getAttribute('height')) {
            out.push({ slot, issue: 'no width/height (layout shift)' });
          }
          const bleed = !!img.closest('.hero-media');
          out.push({ slot, crop: lost, bleed, src: img.currentSrc.split('/').pop() });
        });
        return out;
      }, CROP_LIMIT);

      for (const item of r) {
        if (item.issue) problems.push(`${name} ${w}px — ${p}: ${item.slot}: ${item.issue}`);
        else {
          checked++;
          worstCrop = Math.max(worstCrop, item.crop);
          const cap = item.bleed ? BLEED_LIMIT : CROP_LIMIT;
          if (item.crop > cap) {
            problems.push(`${name} ${w}px — ${p}: ${item.slot} loses ${(item.crop * 100).toFixed(0)}% of the frame (${item.src})`);
          }
        }
      }
      bytes += await page.evaluate(() => performance.getEntriesByType('resource')
        .filter(e => /assets\/photos\//.test(e.name))
        .reduce((s, e) => s + (e.transferSize || e.encodedBodySize || 0), 0));
    }
    console.log(`${name.padEnd(11)} ${String(w).padStart(4)}px  ${String(checked).padStart(3)} imágenes  ` +
                `recorte máx ${(worstCrop * 100).toFixed(0)}%  ${(bytes / 1024 / PAGES.length).toFixed(0)} KB/página`);
    await ctx.close();
  }
  await browser.close();
  const unique = [...new Set(problems)];
  console.log(unique.length ? `\n✗ ${unique.length} problema(s):\n  - ` + unique.join('\n  - ')
                            : '\n✓ todas las imágenes encajan en todos los dispositivos');
  process.exit(unique.length ? 1 : 0);
})();
