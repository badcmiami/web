/* Full-page screenshots of the built site. Usage: node tools/shot.js index.html [...]
   Requires a local server: python3 -m http.server 8899 */
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.SHOT_DIR || '.screenshots';
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const pages = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const p of pages) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('JS: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
    await page.goto('http://127.0.0.1:8899/' + p, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    const h = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 700) {
      await page.evaluate(v => window.scrollTo(0, v), y);
      await page.waitForTimeout(90);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1200);
    const name = p.replace('.html', '');
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    console.log(p, '->', errs.length ? errs.join(' | ') : 'clean');
    await ctx.close();
  }
  await browser.close();
})();
