#!/usr/bin/env python3
"""Bundles the whole site into ONE self-contained HTML file.

Every page's <main> becomes a route inside a single document, the shared header
and footer appear once, and CSS, JS and images are inlined (images as data URIs).
The result opens from a file:// path, an email attachment or a shared link with
no server at all — handy for showing the client the full site before hosting it.

  python3 tools/bundle.py        ->  dist/preview.html
"""
import base64, os, re

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..'))
DIST = os.path.join(ROOT, 'dist')
PAGES = [
    ('index', 'Home', 'Inicio'),
    ('services', 'Services', 'Servicios'),
    ('locations', 'Locations', 'Sedes'),
    ('patients', 'Patients', 'Pacientes'),
    ('providers', 'Providers', 'Médicos'),
    ('about', 'About', 'Nosotros'),
    ('contact', 'Contact', 'Contacto'),
    ('proposal', 'Design proposal', 'Propuesta'),
]
MIME = {'.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg', '.webp': 'image/webp'}


def read(*parts):
    with open(os.path.join(ROOT, *parts), encoding='utf-8') as f:
        return f.read()


def grab(html, tag, attrs=''):
    m = re.search(r'<%s%s[^>]*>(.*?)</%s>' % (tag, attrs, tag), html, re.S)
    return m.group(1) if m else ''


def data_uri(path):
    ext = os.path.splitext(path)[1].lower()
    with open(os.path.join(ROOT, path), 'rb') as f:
        raw = f.read()
    return 'data:%s;base64,%s' % (MIME.get(ext, 'application/octet-stream'),
                                  base64.b64encode(raw).decode())


def inline_images(html, cache):
    def sub(m):
        path = m.group(2)
        if path.startswith(('http', 'data:')):
            return m.group(0)
        if path not in cache:
            cache[path] = data_uri(path)
        return '%s%s%s' % (m.group(1), cache[path], m.group(3))
    return re.sub(r'(src=")(assets/img/[^"]+)(")', sub, html)


def rewrite_links(html):
    """page.html -> #/page   ·   page.html#anchor -> #/page!anchor"""
    html = re.sub(r'href="([a-z0-9-]+)\.html#([\w-]+)"', r'href="#/\1!\2"', html)
    html = re.sub(r'href="([a-z0-9-]+)\.html"', r'href="#/\1"', html)
    return html


def main():
    os.makedirs(DIST, exist_ok=True)
    cache = {}
    index = read('index.html')

    header = index[index.index('<body>') + 6:index.index('<main>')]
    footer = index[index.index('</main>') + 7:index.index('</body>')]
    footer = footer.replace('<script src="assets/js/main.js" defer></script>', '')

    routes = []
    for slug, en, es in PAGES:
        page = read(slug + '.html')
        title = grab(page, 'title')
        main_html = page[page.index('<main>'):page.index('</main>') + 7]
        # the preview has no PHP behind it: let the forms show their demo state
        main_html = main_html.replace(' action="send.php" method="post"', '')
        routes.append(
            '<div class="route" data-route="%s" data-title="%s" hidden>\n%s\n</div>'
            % (slug, title.replace('"', '&quot;'), main_html))

    body = header + '\n'.join(routes) + footer
    body = inline_images(rewrite_links(body), cache)

    css = read('assets', 'css', 'style.css')
    js = read('assets', 'js', 'main.js')

    router = '''
/* ---- single-file router: each page lives in a .rt block ------------------ */
(function () {
  var routes = [].slice.call(document.querySelectorAll('.route'));
  var fallback = 'index';
  function show() {
    var raw = (location.hash || '#/index').replace(/^#\\//, '');
    var parts = raw.split('!');
    var name = parts[0] || fallback;
    var anchor = parts[1];
    var found = false;
    routes.forEach(function (r) {
      var on = r.getAttribute('data-route') === name;
      r.hidden = !on;
      if (on) { found = true; document.title = r.getAttribute('data-title'); }
    });
    if (!found) routes.forEach(function (r, i) { r.hidden = i !== 0; });
    document.querySelectorAll('.nav a, .drawer nav a').forEach(function (a) {
      var h = a.getAttribute('href') || '';
      if (h.replace('#/', '') === name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    // re-run the reveal pass for the freshly shown route
    document.querySelectorAll('.route:not([hidden]) [data-reveal], .route:not([hidden]) [data-stagger]')
      .forEach(function (el) { el.classList.add('is-in'); });
    var target = anchor && document.getElementById(anchor);
    if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
    else window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', show);
  show();
})();
'''

    banner = '''
<div class="preview-note">
  <strong>Preview</strong>
  <span data-es="Sitio completo en un solo archivo — navegue por el menú. Los formularios muestran su estado de confirmación sin enviar nada.">Whole site in a single file — use the menu to navigate. Forms show their confirmation state without sending anything.</span>
</div>'''

    extra_css = '''
.preview-note{position:fixed;left:50%;bottom:1rem;transform:translateX(-50%);z-index:60;
  display:flex;gap:.6rem;align-items:center;max-width:min(680px,92vw);
  background:rgba(0,11,51,.92);color:#EAEEFF;backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,.14);border-radius:999px;
  padding:.55rem 1.1rem;font-size:.78rem;line-height:1.4;box-shadow:0 20px 50px -20px rgba(0,0,0,.6)}
.preview-note strong{color:#00C6C1;letter-spacing:.12em;text-transform:uppercase;font-size:.66rem}
@media (max-width:900px){.preview-note{bottom:5.5rem;border-radius:14px}}
'''

    head = read('index.html')
    head = head[head.index('<head>') + 6:head.index('</head>')]
    head = re.sub(r'<link rel="stylesheet" href="assets/css/style\.css">', '', head)
    head = re.sub(r'<link rel="(icon|apple-touch-icon|manifest|canonical)"[^>]*>', '', head)
    head = re.sub(r'<meta (property="og:image[^"]*"|name="twitter:image")[^>]*>', '', head)
    head = head.replace('<title>', '<title>')

    out = ('<!doctype html>\n<html lang="en">\n<head>\n' + head.strip() +
           '\n<style>\n' + css + extra_css + '\n</style>\n</head>\n<body>\n' +
           body + banner + '\n<script>\n' + js + router + '\n</script>\n</body>\n</html>\n')

    path = os.path.join(DIST, 'preview.html')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(out)
    print('  · dist/preview.html  %.1f KB  (%d routes, %d images inlined)'
          % (len(out.encode()) / 1024, len(routes), len(cache)))


if __name__ == '__main__':
    main()
