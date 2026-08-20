/* Responsive regression test: loads every page at a device matrix and fails on
   horizontal overflow, tap targets that are too small, or text that overlaps
   the viewport edge.   node tools/check_responsive.js                        */
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:8811/';
const PAGES = ['index', 'services', 'patients', 'providers', 'about', 'contact', 'proposal', 'legal', '404']
  .map(p => p + '.html');
const DEVICES = [
  ['iPhone SE',        320, 568, true],
  ['iPhone 12/13',     390, 844, true],
  ['Pixel 7',          412, 915, true],
  ['iPhone Pro Max',   430, 932, true],
  ['iPad mini',        768, 1024, true],
  ['iPad Pro',         1024, 1366, false],
  ['Laptop',           1366, 768, false],
  ['Desktop',          1920, 1080, false],
];

const fails = [];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [name, w, h, mobile] of DEVICES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    let worst = 0, tiny = 0;
    for (const p of PAGES) {
      await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(250);
      const r = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const over = document.documentElement.scrollWidth - vw;
        // tap targets: anything clickable must be at least 40px tall
        const shown = el => {
          if (el.offsetParent === null) return false;
          for (let n = el; n; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (cs.visibility === 'hidden' || cs.opacity === '0') return false;
          }
          return true;
        };
        const small = [...document.querySelectorAll('a[href],button')].filter(el => {
          if (!shown(el)) return false;
          const b = el.getBoundingClientRect();
          return b.height > 0 && b.height < 30 && !el.closest('.footer,.topbar,.crumbs,.map-list,.dl,.acc-panel');
        }).map(el => (el.textContent || el.getAttribute('aria-label') || '?').trim().slice(0, 20));
        return { over, small };
      });
      if (r.over > 0) { fails.push(`${name} ${w}px — ${p}: ${r.over}px horizontal overflow`); worst = Math.max(worst, r.over); }
      if (r.small.length) { fails.push(`${name} ${w}px — ${p}: tap target under 30px: ${r.small.slice(0,3)}`); tiny += r.small.length; }
    }
    console.log(`${name.padEnd(16)} ${String(w).padStart(4)}×${h}  overflow:${worst}px  small-taps:${tiny}`);
    await ctx.close();
  }
  await browser.close();
  console.log(fails.length ? '\n✗ ' + fails.length + ' issue(s):\n  - ' + fails.join('\n  - ')
                           : '\n✓ no horizontal overflow, no undersized tap targets');
  process.exit(fails.length ? 1 : 0);
})();
