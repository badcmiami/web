/* Renders the authored scenes (assets/photos/_incoming/*.svg) to 4K JPEG
   masters that the photo pipeline can crop and resize like any photograph.
   node tools/render_photos.js                                              */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'assets', 'photos', '_incoming');

(async () => {
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.svg'));
  if (!files.length) return console.log('No scenes to render — run tools/make_photos.py first.');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const file of files) {
    const svg = fs.readFileSync(path.join(DIR, file), 'utf8');
    const w = +svg.match(/width="(\d+)"/)[1];
    const h = +svg.match(/height="(\d+)"/)[1];
    const page = await (await browser.newContext({
      viewport: { width: Math.min(w, 3840), height: Math.min(h, 3840) }, deviceScaleFactor: 1,
    })).newPage();
    await page.setContent(`<!doctype html><style>html,body{margin:0;background:#03091F}
      svg{display:block;width:100vw;height:100vh}</style>${svg}`);
    await page.waitForTimeout(500);   // let the SVG filters settle
    const out = path.join(DIR, file.replace('.svg', '.jpg'));
    await page.screenshot({ path: out, type: 'jpeg', quality: 94 });
    console.log('  ·', path.basename(out), `${w}×${h}`, (fs.statSync(out).size / 1024).toFixed(0) + ' KB');
    await page.context().close();
  }
  await browser.close();
  console.log('\nNow: python3 tools/fetch_photos.py --local && python3 tools/build.py');
})();
