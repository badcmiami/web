/* Renders the SVG brand assets to PNG — social cards and touch icons cannot
   use SVG. Run after tools/make_logo.py:  node tools/png_export.js          */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const IMG = path.join(__dirname, '..', 'assets', 'img');
const JOBS = [
  { src: 'og-cover.svg',    out: 'og-cover.png',        w: 1200, h: 630, bg: '#000B33' },
  { src: 'logo-mark.svg',   out: 'favicon-32.png',      w: 32,   h: 32,  bg: '#ffffff', pad: 1 },
  { src: 'logo-mark.svg',   out: 'apple-touch-icon.png',w: 180,  h: 180, bg: '#ffffff', pad: 16 },
  { src: 'logo-mark.svg',   out: 'icon-192.png',        w: 192,  h: 192, bg: '#ffffff', pad: 18 },
  { src: 'logo-mark.svg',   out: 'icon-512.png',        w: 512,  h: 512, bg: '#ffffff', pad: 48 },
  { src: 'logo-lockup.svg', out: 'logo-lockup.png',     w: 1160, h: 540, bg: 'transparent' },
];

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const j of JOBS) {
    const svg = fs.readFileSync(path.join(IMG, j.src), 'utf8');
    const page = await (await browser.newContext({
      viewport: { width: j.w, height: j.h }, deviceScaleFactor: 1,
    })).newPage();
    await page.setContent(`<!doctype html><style>
      html,body{margin:0;height:100%}
      body{background:${j.bg};display:grid;place-items:center;padding:${j.pad || 0}px;box-sizing:border-box}
      svg{width:100%;height:100%;display:block}
    </style>${svg}`);
    await page.waitForTimeout(150);
    await page.screenshot({
      path: path.join(IMG, j.out),
      omitBackground: j.bg === 'transparent',
    });
    console.log('  ·', j.out, `${j.w}×${j.h}`);
    await page.context().close();
  }
  await browser.close();
})();
