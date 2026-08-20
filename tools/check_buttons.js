/* Clicks every interactive control on the site and asserts it does its job.
   node tools/check_buttons.js                                               */
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:8811/';
const PAGES = ['index', 'services', 'patients', 'providers', 'about', 'contact', 'proposal', 'legal', '404']
  .map(p => p + '.html');

const fails = [];
const ok = [];
function assert(cond, label) { (cond ? ok : fails).push(label); return cond; }

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const jsErrors = [];
  page.on('pageerror', e => jsErrors.push(e.message));

  // ---- link hygiene on every page ----------------------------------------
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
    const r = await page.evaluate(() => {
      const links = [...document.querySelectorAll('a[href]')];
      const placeholder = links.filter(a => {
        const h = a.getAttribute('href');
        return h === '#' || h === '' || h === 'javascript:void(0)';
      }).map(a => (a.textContent || a.getAttribute('aria-label') || '?').trim().slice(0, 24));
      const unsafeExternal = links.filter(a => /^https?:/.test(a.getAttribute('href')) &&
        !a.href.includes(location.host) &&
        (a.target !== '_blank' || !(a.rel || '').includes('noopener')))
        .map(a => a.getAttribute('href').slice(0, 40));
      return { placeholder, unsafeExternal };
    });
    assert(r.placeholder.length === 0, `${p}: no placeholder links` + (r.placeholder.length ? ` (found: ${r.placeholder.slice(0,4)})` : ''));
    assert(r.unsafeExternal.length === 0, `${p}: external links open safely` + (r.unsafeExternal.length ? ` (found: ${r.unsafeExternal.slice(0,3)})` : ''));
  }

  // ---- mega menu ----------------------------------------------------------
  await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded' });
  await page.hover('.has-mega > a');
  await page.waitForTimeout(600);
  assert(await page.evaluate(() => document.querySelector('.has-mega').dataset.open === 'true'
    && getComputedStyle(document.querySelector('.mega')).visibility === 'visible'), 'mega menu opens on hover');
  const megaTarget = await page.getAttribute('.mega-item', 'href');
  assert(/^services\.html#/.test(megaTarget || ''), 'mega menu items deep-link into the services page');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  assert(await page.evaluate(() => document.querySelector('.has-mega').dataset.open !== 'true'), 'mega menu closes on Escape');
  await page.click('.has-mega > a');
  await page.waitForLoadState('domcontentloaded');
  assert(page.url().endsWith('services.html'), 'clicking Services navigates instead of closing the panel');
  await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded' });

  // ---- language toggle ----------------------------------------------------
  const enH1 = await page.textContent('h1');
  await page.click('.lang button[data-lang="es"]');
  await page.waitForTimeout(250);
  const esH1 = await page.textContent('h1');
  assert(enH1 !== esH1, 'language switch changes the copy');
  assert(await page.evaluate(() => document.documentElement.lang === 'es'), 'language switch updates <html lang>');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  assert((await page.textContent('h1')) === esH1, 'language choice survives a reload');
  await page.click('.lang button[data-lang="en"]');
  await page.waitForTimeout(250);

  // ---- back to top --------------------------------------------------------
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await page.evaluate(() => window.scrollTo(0, 2000));
  await page.waitForTimeout(400);
  assert(await page.evaluate(() => document.querySelector('.totop').classList.contains('is-on')), 'back-to-top appears after scrolling');
  await page.click('.totop');
  await page.waitForTimeout(700);
  assert(await page.evaluate(() => window.scrollY < 40), 'back-to-top returns to the top');

  // ---- accordion ----------------------------------------------------------
  await page.goto(BASE + 'patients.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  const accBtns = await page.$$('.acc-btn');
  await accBtns[2].click();
  await page.waitForTimeout(600);
  assert(await page.evaluate(() => {
    const items = [...document.querySelectorAll('.acc-item')];
    const open = items.filter(i => i.dataset.open === 'true');
    return open.length === 1 && parseFloat(getComputedStyle(open[0].querySelector('.acc-panel')).height) > 20;
  }), 'accordion opens one panel at a time');

  // ---- tabs ---------------------------------------------------------------
  const tabs = await page.$$('.tab');
  for (let i = 0; i < tabs.length; i++) {
    await tabs[i].click();
    await page.waitForTimeout(120);
    const good = await page.evaluate(idx => {
      const t = document.querySelectorAll('.tab')[idx];
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      const others = [...document.querySelectorAll('.tabpanel')].filter(p => p !== panel);
      return t.getAttribute('aria-selected') === 'true' && !panel.hidden && others.every(p => p.hidden);
    }, i);
    if (!good) { fails.push(`tab ${i + 1} does not switch its panel`); break; }
    if (i === tabs.length - 1) ok.push(`all ${tabs.length} preparation tabs switch panels`);
  }

  // ---- mobile drawer ------------------------------------------------------
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const m = await mctx.newPage();
  m.on('pageerror', e => jsErrors.push('mobile: ' + e.message));
  await m.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded' });
  await m.waitForTimeout(400);
  await m.tap('.burger');
  await m.waitForTimeout(800);
  assert(await m.evaluate(() => document.querySelector('.drawer').classList.contains('is-open')
    && document.body.classList.contains('is-locked')), 'mobile menu opens and locks scrolling');
  const linkBelowHeader = await m.evaluate(() => {
    const a = document.querySelector('.drawer nav a');
    return a.getBoundingClientRect().top >= document.querySelector('.header').getBoundingClientRect().bottom;
  });
  assert(linkBelowHeader, 'mobile menu items clear the header');
  await m.tap('.burger');
  await m.waitForTimeout(700);
  assert(await m.evaluate(() => !document.querySelector('.drawer').classList.contains('is-open')), 'mobile menu closes');
  await m.evaluate(() => window.scrollTo(0, 1200));
  await m.waitForTimeout(500);
  assert(await m.evaluate(() => document.querySelector('.mobar').classList.contains('is-on')), 'sticky call/WhatsApp/book bar appears on mobile');

  // ---- appointment form ---------------------------------------------------
  await page.goto(BASE + 'contact.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  await page.click('form[data-validate] button[type="submit"]');
  await page.waitForTimeout(300);
  assert(await page.evaluate(() => document.querySelectorAll('.is-invalid').length >= 3), 'empty form is blocked with field errors');
  let posted = null;
  page.on('request', r => { if (r.url().endsWith('send.php') && r.method() === 'POST') posted = r.url(); });
  await page.fill('#c-name', 'Prueba QA');
  await page.fill('#c-phone', '(305) 555-1234');
  await page.fill('#c-email', 'qa@example.com');
  await page.selectOption('#c-study', 'MRI');
  await page.check('form[data-validate] .check input');
  await page.click('form[data-validate] button[type="submit"]');
  await page.waitForTimeout(1500);
  assert(posted !== null, 'valid form posts to send.php');
  assert(await page.evaluate(() => {
    const okBox = document.querySelector('.form-ok'), err = document.querySelector('.form-err');
    return okBox.classList.contains('is-on') || (err && err.classList.contains('is-on'));
  }), 'form reports the outcome to the visitor');

  // ---- accessibility widget ----------------------------------------------
  await page.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  await page.evaluate(() => localStorage.removeItem('bad-a11y'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const fabBox = await page.evaluate(() => {
    const a = document.querySelector('.a11y-fab').getBoundingClientRect();
    const w = document.querySelector('.wafab').getBoundingClientRect();
    const overlap = !(a.right < w.left || a.left > w.right || a.bottom < w.top || a.top > w.bottom);
    return { overlap, mid: Math.abs((a.top + a.height / 2) - window.innerHeight / 2) < 40 };
  });
  assert(!fabBox.overlap, 'accessibility button does not overlap the WhatsApp button');
  assert(fabBox.mid, 'accessibility button sits at mid-height on the right');

  await page.click('.a11y-fab');
  await page.waitForTimeout(500);
  assert(await page.evaluate(() => !document.querySelector('.a11y-panel').hidden), 'accessibility panel opens');

  await page.click('[data-profile="dyslexia"]');
  await page.waitForTimeout(400);
  assert(await page.evaluate(() => {
    const r = document.documentElement;
    return r.classList.contains('a11y-readable') && r.dataset.a11ySpace === '2' && r.dataset.a11yLine === '2';
  }), 'the dyslexia profile applies its adjustments');

  const baseFont = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
  await page.click('[data-step="font"][data-dir="1"]');
  await page.waitForTimeout(300);
  assert(await page.evaluate(f => parseFloat(getComputedStyle(document.documentElement).fontSize) > f, baseFont),
    'the text-size stepper really enlarges the page');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  assert(await page.evaluate(() => document.documentElement.classList.contains('a11y-readable')),
    'accessibility choices survive a reload');

  await page.click('.a11y-fab');
  await page.waitForTimeout(400);
  await page.click('#a11yReset');
  await page.waitForTimeout(300);
  assert(await page.evaluate(() => document.documentElement.className === '' && !document.documentElement.dataset.a11yFont),
    'reset clears every accessibility change');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  assert(await page.evaluate(() => document.querySelector('.a11y-panel').hidden), 'accessibility panel closes on Escape');

  // ---- cookie consent -----------------------------------------------------
  await page.evaluate(() => { localStorage.removeItem('bad-consent'); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1400);
  assert(await page.evaluate(() => !document.querySelector('#cookieBar').hidden), 'cookie banner shows on a first visit');
  assert(await page.evaluate(() => {
    const c = document.querySelector('#cookieBar').getBoundingClientRect();
    const w = document.querySelector('.wafab').getBoundingClientRect();
    return c.right < w.left;
  }), 'cookie banner clears the WhatsApp button');
  await page.click('#cookieReject');
  await page.waitForTimeout(700);
  assert(await page.evaluate(() => localStorage.getItem('bad-consent') === 'rejected'
    && document.querySelector('#cookieBar').hidden), 'rejecting stores the choice and hides the banner');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1300);
  assert(await page.evaluate(() => document.querySelector('#cookieBar').hidden
    && window.badcConsent === 'rejected'), 'the consent choice is remembered on the next visit');

  assert(jsErrors.length === 0, 'no JavaScript errors' + (jsErrors.length ? `: ${jsErrors[0]}` : ''));

  console.log(ok.map(o => '  ✓ ' + o).join('\n'));
  console.log(fails.length ? '\n✗ ' + fails.length + ' failing:\n' + fails.map(f => '  ✗ ' + f).join('\n')
                           : `\n✓ ${ok.length} interaction checks passed`);
  await browser.close();
  process.exit(fails.length ? 1 : 0);
})();
