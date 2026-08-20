/* =========================================================================
   BEST AMERICAN DIAGNOSTIC — interactions
   Vanilla JS, no dependencies. All effects respect prefers-reduced-motion.
   ========================================================================= */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Header: sticky state + scroll progress ---------------- */
  var header   = $('.header');
  var progress = $('.progress');
  var totop    = $('.totop');
  var mobar    = $('.mobar');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-stuck', y > 12);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    }
    if (totop) totop.classList.toggle('is-on', y > 700);
    if (mobar) mobar.classList.toggle('is-on', y > 400);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (totop) totop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ---------------- Mega menu (hover on desktop, click anywhere) ---------- */
  $$('.has-mega').forEach(function (item) {
    var btn = $('button', item);
    var closeTimer;
    function open(v) {
      clearTimeout(closeTimer);
      item.setAttribute('data-open', v ? 'true' : 'false');
      if (btn) btn.setAttribute('aria-expanded', v ? 'true' : 'false');
    }
    item.addEventListener('mouseenter', function () { if (window.innerWidth > 900) open(true); });
    item.addEventListener('mouseleave', function () {
      if (window.innerWidth > 900) closeTimer = setTimeout(function () { open(false); }, 140);
    });
    if (btn) btn.addEventListener('click', function (e) {
      e.preventDefault();
      open(item.getAttribute('data-open') !== 'true');
    });
    document.addEventListener('click', function (e) { if (!item.contains(e.target)) open(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') open(false); });
  });

  /* ---------------- Mobile drawer ---------------------------------------- */
  var burger = $('.burger');
  var drawer = $('.drawer');
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (!open) {
        var hb = header ? header.getBoundingClientRect().bottom : 76;
        drawer.style.paddingTop = Math.max(hb, 76) + 28 + 'px';
      }
      drawer.classList.toggle('is-open', !open);
      document.body.classList.toggle('is-locked', !open);
      if (!open) {
        $$('nav a', drawer).forEach(function (a, i) { a.style.animationDelay = (0.05 + i * 0.045) + 's'; });
      }
    });
    $$('a', drawer).forEach(function (a) {
      a.addEventListener('click', function () {
        burger.setAttribute('aria-expanded', 'false');
        drawer.classList.remove('is-open');
        document.body.classList.remove('is-locked');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) burger.click();
    });
  }

  /* ---------------- Reveal on scroll -------------------------------------- */
  var revealables = $$('[data-reveal],[data-stagger],.rule');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var d = parseFloat(el.getAttribute('data-delay') || 0);
        setTimeout(function () { el.classList.add('is-in'); }, d * 1000);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- Count-up stats ---------------------------------------- */
  var counters = $$('[data-count]');
  if (counters.length) {
    var format = function (n, dec) { return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
      if (reduced) { el.textContent = format(target, dec); return; }
      var start = null, dur = 1500;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(target * eased, dec);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { cio.observe(c); });
    } else counters.forEach(run);
  }

  /* ---------------- Accordion --------------------------------------------- */
  $$('.acc').forEach(function (acc) {
    var single = acc.hasAttribute('data-single');
    $$('.acc-btn', acc).forEach(function (btn) {
      var item  = btn.closest('.acc-item');
      var panel = $('.acc-panel', item);
      btn.addEventListener('click', function () {
        var isOpen = item.getAttribute('data-open') === 'true';
        if (single) {
          $$('.acc-item', acc).forEach(function (o) {
            if (o !== item) {
              o.setAttribute('data-open', 'false');
              $('.acc-btn', o).setAttribute('aria-expanded', 'false');
              $('.acc-panel', o).style.height = '0px';
            }
          });
        }
        item.setAttribute('data-open', isOpen ? 'false' : 'true');
        btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        panel.style.height = isOpen ? '0px' : $('.acc-panel-in', panel).offsetHeight + 'px';
      });
      if (item.getAttribute('data-open') === 'true') {
        panel.style.height = $('.acc-panel-in', panel).offsetHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
  window.addEventListener('resize', function () {
    $$('.acc-item[data-open="true"] .acc-panel').forEach(function (p) {
      p.style.height = $('.acc-panel-in', p).offsetHeight + 'px';
    });
  });

  /* ---------------- Tabs --------------------------------------------------- */
  $$('[data-tabs]').forEach(function (wrap) {
    var tabs = $$('.tab', wrap);
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          var panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel) panel.hidden = !on;
        });
      });
    });
  });

  /* ---------------- Today's opening hours --------------------------------- */
  $$('[data-day]').forEach(function (el) {
    var days = el.getAttribute('data-day').split(',');
    if (days.indexOf(String(new Date().getDay())) !== -1) el.classList.add('is-today');
  });

  /* ---------------- Forms: validate, then POST to send.php ----------------- */
  $$('form[data-validate]').forEach(function (form) {
    var ack = $('.form-ok', form.parentNode) || $('.form-ok', form);
    var errBox = $('.form-err', form);
    var submit = $('button[type="submit"]', form);

    function succeed() {
      form.style.display = 'none';
      if (ack) {
        ack.classList.add('is-on');
        ack.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
      }
    }
    function fail(msg) {
      if (errBox) { errBox.textContent = msg; errBox.classList.add('is-on'); }
      if (submit) { submit.classList.remove('is-busy'); submit.disabled = false; }
    }

    form.addEventListener('submit', function (e) {
      var ok = true;
      $$('[required]', form).forEach(function (input) {
        var field = input.closest('.field') || input.closest('.check');
        var valid = input.type === 'checkbox' ? input.checked : input.value.trim() !== '';
        if (valid && input.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
        if (valid && input.type === 'tel') valid = input.value.replace(/\D/g, '').length >= 10;
        if (field) field.classList.toggle('is-invalid', !valid);
        if (!valid && ok) { input.focus(); ok = false; }
        if (!valid) ok = false;
      });
      if (!ok) { e.preventDefault(); return; }

      // No action attribute = design preview, nothing to post.
      if (!form.getAttribute('action')) { e.preventDefault(); succeed(); return; }

      // Post in the background so the visitor never leaves the page. If fetch
      // is unavailable or the request fails, let the browser submit normally.
      if (!window.fetch) return;
      e.preventDefault();
      if (errBox) errBox.classList.remove('is-on');
      if (submit) { submit.classList.add('is-busy'); submit.disabled = true; }

      fetch(form.getAttribute('action'), {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
      }).then(function (r) {
        return r.json().catch(function () { return { ok: r.ok }; });
      }).then(function (data) {
        if (data && data.ok) succeed();
        else fail((data && data.message) || 'We could not send your request. Please call (305) 681-7555.');
      }).catch(function () {
        fail('Connection problem. Please call us at (305) 681-7555.');
      });
    });

    $$('input,select,textarea', form).forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field') || input.closest('.check');
        if (field) field.classList.remove('is-invalid');
      });
    });

    // Fallback path: send.php redirected back with ?sent=1 (no-JS submit).
    if (/[?&]sent=1/.test(window.location.search)) succeed();
  });

  /* ---------------- Bilingual switch (EN / ES) ----------------------------- */
  var STORE = 'bad-lang';
  function applyLang(lang) {
    document.documentElement.setAttribute('lang', lang);
    $$('[data-es]').forEach(function (el) {
      if (!el.hasAttribute('data-en')) el.setAttribute('data-en', el.innerHTML);
      el.innerHTML = el.getAttribute(lang === 'es' ? 'data-es' : 'data-en');
    });
    $$('[data-es-ph]').forEach(function (el) {
      if (!el.hasAttribute('data-en-ph')) el.setAttribute('data-en-ph', el.getAttribute('placeholder') || '');
      el.setAttribute('placeholder', el.getAttribute(lang === 'es' ? 'data-es-ph' : 'data-en-ph'));
    });
    $$('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    try { localStorage.setItem(STORE, lang); } catch (e) {}
  }
  $$('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
  });
  var saved;
  try { saved = localStorage.getItem(STORE); } catch (e) {}
  applyLang(saved === 'es' ? 'es' : 'en');

  /* ---------------- Year stamp -------------------------------------------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
