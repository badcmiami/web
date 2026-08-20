/* Verifies every action button points where the business wants it to point.
   Run against a local server:  node tools/check_actions.js                  */
const { chromium } = require('playwright');
const fs = require('fs');

const BASE  = process.env.BASE || 'http://127.0.0.1:8811/';
const PHONE = 'tel:+13056817555';
const WA    = 'https://wa.me/17868196086';
const MAIL  = 'billing@bestamericandiagnostics.com';
const ADDR  = '5005 E 8th Ave';
const PAGES = ['index', 'services', 'patients', 'providers', 'about', 'contact', 'proposal', '404']
  .map(p => p + '.html');

const fails = [];
const rows = [];
function check(cond, msg) { if (!cond) fails.push(msg); return cond; }

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
    const r = await page.evaluate(() => {
      const all = [...document.querySelectorAll('a[href]')];
      const visible = a => {
        const s = getComputedStyle(a);
        return s.display !== 'none' && s.visibility !== 'hidden' && a.offsetParent !== null;
      };
      return {
        tel:    all.filter(a => a.href.startsWith('tel:')).map(a => a.getAttribute('href')),
        wa:     all.filter(a => a.href.includes('wa.me')).map(a => a.getAttribute('href')),
        waVis:  all.filter(a => a.href.includes('wa.me') && visible(a)).length,
        mailto: all.filter(a => a.href.startsWith('mailto:')).map(a => a.getAttribute('href').slice(7)),
        dead:   all.filter(a => /locations\.html/.test(a.getAttribute('href') || '')).length,
        forms:  [...document.querySelectorAll('form[data-validate]')].map(f => f.getAttribute('action')),
        bookCta: all.filter(a => /contact\.html$/.test(a.getAttribute('href') || '')).length,
        body:   document.body.innerText,
      };
    });

    check(r.tel.every(t => t === PHONE), `${p}: unexpected tel target ${[...new Set(r.tel)].filter(t => t !== PHONE)}`);
    check(r.wa.every(w => w === WA), `${p}: unexpected WhatsApp target ${[...new Set(r.wa)].filter(w => w !== WA)}`);
    check(r.waVis > 0, `${p}: no visible WhatsApp button`);
    check(r.mailto.every(m => m === MAIL), `${p}: unexpected mailto ${[...new Set(r.mailto)].filter(m => m !== MAIL)}`);
    check(r.dead === 0, `${p}: still links to the removed locations page`);
    check(r.forms.every(a => a === 'send.php'), `${p}: form posts to ${r.forms}`);
    check(!/305\)\s*825-1535|637 E 49th/.test(r.body), `${p}: stale phone or address in the copy`);

    rows.push(`${p.padEnd(15)} tel:${String(r.tel.length).padStart(2)}  whatsapp:${String(r.wa.length).padStart(2)}` +
              `  mailto:${r.mailto.length}  book-cta:${String(r.bookCta).padStart(2)}  forms:[${r.forms}]`);
  }

  // menu must not offer Locations any more
  await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded' });
  const menu = await page.evaluate(() => ({
    nav: [...document.querySelectorAll('.nav > li > a, .nav > li > button')].map(a => a.textContent.trim()),
    drawer: [...document.querySelectorAll('.drawer nav a')].map(a => a.textContent.trim()),
  }));
  check(!menu.nav.join('|').toLowerCase().includes('location'), 'desktop menu still lists Locations');
  check(!menu.drawer.join('|').toLowerCase().includes('location'), 'mobile menu still lists Locations');

  // the handler must deliver to billing@
  const php = fs.readFileSync(__dirname + '/../send.php', 'utf8');
  check(new RegExp("MAIL_TO\\s*=\\s*'" + MAIL + "'").test(php), 'send.php does not deliver to ' + MAIL);

  // the address must appear where a patient looks for it
  for (const p of ['index.html', 'contact.html']) {
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
    const hasAddr = await page.evaluate(a => document.body.innerText.includes(a), ADDR);
    check(hasAddr, `${p}: official address missing`);
  }

  console.log(rows.join('\n'));
  console.log('\nmenu:', menu.nav.join(' · '));
  console.log(fails.length ? '\n✗ ' + fails.length + ' problem(s):\n  - ' + fails.join('\n  - ')
                           : '\n✓ every action button points where it should');
  await browser.close();
  process.exit(fails.length ? 1 : 0);
})();
