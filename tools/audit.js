/* Link / a11y / i18n smoke test across all built pages. */
const { chromium } = require('playwright');
const fs = require('fs');
const pages = ['index','services','locations','patients','providers','about','contact','proposal','404'].map(p => p + '.html');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  for (const p of pages) {
    errs.length = 0;
    await page.goto('http://127.0.0.1:8811/' + p, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const info = await page.evaluate(() => {
      const bad = [];
      document.querySelectorAll('a[href]').forEach(a => {
        const h = a.getAttribute('href');
        if (/^(https?:|tel:|mailto:|#)/.test(h)) return;
        bad.push(h.split('#')[0]);
      });
      return {
        links: [...new Set(bad)],
        noalt: [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length,
        h1: document.querySelectorAll('h1').length,
        missingIcons: [...new Set([...document.querySelectorAll('use')].filter(u => !document.querySelector(u.getAttribute('href'))).map(u => u.getAttribute('href')))],
        untranslated: document.querySelectorAll('h2:not([data-es]),h3:not([data-es])').length
      };
    });
    const missing = info.links.filter(l => !fs.existsSync('/home/user/web/' + l));
    await page.click('.lang button[data-lang="es"]', { timeout: 8000 });
    await page.waitForTimeout(120);
    const es = await page.evaluate(() => document.querySelector('h1').textContent.trim().slice(0, 34));
    await page.click('.lang button[data-lang="en"]', { timeout: 8000 });
    await page.waitForTimeout(120);
    const en = await page.evaluate(() => document.querySelector('h1').textContent.trim().slice(0, 34));
    console.log(`${p.padEnd(15)} h1:${info.h1} noAlt:${info.noalt} deadLinks:${missing.length ? missing : '0'} missingIcons:${info.missingIcons.length ? info.missingIcons : '0'} headingsWithoutES:${info.untranslated} jsErr:${errs.length ? errs[0] : '0'}`);
    console.log(`   EN "${en}…"  |  ES "${es}…"`);
  }
  await b.close();
})().catch(e => { console.log('ERR', e.message.slice(0, 200)); process.exit(1); });
