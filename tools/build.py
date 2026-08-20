#!/usr/bin/env python3
"""Tiny static-site builder: src/pages/*.html + src/partials/*.html -> /*.html

Templating:
  <!--meta ... --> front matter at the top of a page (key: value per line)
  {{> name }}     include src/partials/name.html
  {{title}} {{desc}} {{nav}} {{path}}  front-matter / derived values
  {{cur:home}}    -> aria-current="page" when the page's `nav` value matches
Run:  python3 tools/build.py
"""
import datetime, json, os, re, sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..'))

# Absolute origin used for canonical links, og:url and sitemap.xml.
# Change this one line when the final domain is confirmed.
SITE = os.environ.get('SITE_URL', 'https://bestamerican.center').rstrip('/')
PAGES = os.path.join(ROOT, 'src', 'pages')
PARTS = os.path.join(ROOT, 'src', 'partials')

def partial(name):
    with open(os.path.join(PARTS, name + '.html')) as f:
        return f.read()

def parse_meta(src):
    meta = {}
    m = re.match(r'\s*<!--meta(.*?)-->\s*', src, re.S)
    if m:
        for line in m.group(1).strip().splitlines():
            if ':' in line:
                k, v = line.split(':', 1)
                meta[k.strip()] = v.strip()
        src = src[m.end():]
    return meta, src

def load(name, default=None):
    path = os.path.join(ROOT, name)
    if not os.path.exists(path):
        return default
    with open(path, encoding='utf-8') as f:
        return json.load(f)


SITE_CFG = load('site.json', {}) or {}
REVIEWS = load('reviews.json', {}) or {}

SOCIAL_ICONS = {'facebook': 'i-fb', 'instagram': 'i-ig', 'linkedin': 'i-in',
                'youtube': 'i-yt', 'tiktok': 'i-tt'}


def social_html():
    """Only renders the networks that actually have a URL — no dead icons."""
    out = ['<a href="%s" target="_blank" rel="noopener" aria-label="WhatsApp">'
           '<svg><use href="#i-wa"/></svg></a>' % ('https://wa.me/' + SITE_CFG.get('whatsapp', ''))]
    if SITE_CFG.get('maps'):
        out.append('<a href="%s" target="_blank" rel="noopener" aria-label="Google Business Profile">'
                   '<svg><use href="#i-google"/></svg></a>' % SITE_CFG['maps'])
    for net, url in (SITE_CFG.get('social') or {}).items():
        if url and net in SOCIAL_ICONS:
            out.append('<a href="%s" target="_blank" rel="noopener" aria-label="%s">'
                       '<svg><use href="#%s"/></svg></a>' % (url, net.capitalize(), SOCIAL_ICONS[net]))
    return '\n          '.join(out)


def stars_html(n=5):
    return ''.join('<svg><use href="#i-star"/></svg>' for _ in range(n))


def reviews_html():
    cards = []
    for r in REVIEWS.get('reviews', []):
        initial = (r.get('name') or '?').strip()[0]
        cards.append(
            '<figure class="review">\n'
            '            <div class="review-top">\n'
            '              <span class="review-avatar" aria-hidden="true">%s</span>\n'
            '              <span><b>%s</b><span class="review-date" data-es="%s">%s</span></span>\n'
            '              <svg class="review-g" aria-label="Google"><use href="#i-google"/></svg>\n'
            '            </div>\n'
            '            <div class="stars" aria-label="%d out of 5">%s</div>\n'
            '            <blockquote data-es="%s">%s</blockquote>\n'
            '          </figure>' % (
                initial, r.get('name', ''), r.get('date', ''), r.get('date_en', ''),
                r.get('stars', 5), stars_html(r.get('stars', 5)),
                r.get('text_es', '').replace('"', '&quot;'), r.get('text_en', '')))
    return '\n          '.join(cards)


def photo_credits_html():
    """Attribution for whatever photography is actually installed."""
    credits = load(os.path.join('assets', 'photos', 'credits.json'), {}) or {}
    rows = []
    for slot, c in sorted(credits.items()):
        who = c.get('author') or c.get('source', '')
        link = c.get('page') or ''
        label = '%s — %s' % (who, c.get('license', '')) if who else c.get('license', '')
        rows.append('<li><b>%s</b><span>%s</span></li>' % (
            ('<a href="%s" target="_blank" rel="noopener">%s</a>' % (link, slot)) if link else slot,
            label))
    if not rows:
        return ''
    return ('<h3 class="mt-3" data-es="Créditos fotográficos">Photo credits</h3>'
            '<ul class="map-list mt-1">%s</ul>' % ''.join(rows))


def reviews_meta():
    rs = REVIEWS.get('reviews', [])
    placeholder = any(r.get('placeholder') for r in rs)
    return {
        'reviews': reviews_html(),
        'reviews_rating': ('%.1f' % REVIEWS.get('rating', 5.0)),
        'reviews_count': str(REVIEWS.get('count') or len(rs)),
        'reviews_stars': stars_html(5),
        'reviews_note': (
            '<p class="small muted mt-2" data-reveal data-es="Reseñas de ejemplo con el formato final. '
            'Al conectar el perfil de Google Business se sustituyen por las reales editando reviews.json.">'
            'Sample reviews shown in the final format. Connect the Google Business Profile and swap in the '
            'real ones by editing reviews.json.</p>') if placeholder else '',
        'maps': SITE_CFG.get('maps', '#'),
        'review_link': ('https://search.google.com/local/writereview?placeid=' + SITE_CFG['google_place_id'])
                       if SITE_CFG.get('google_place_id') else SITE_CFG.get('maps', '#'),
        'social': social_html(),
        'photo_credits': photo_credits_html(),
    }


PHOTO_EXT = ('.jpg', '.jpeg', '.webp', '.png')


PHOTO_WIDTHS = [480, 960, 1440, 1920, 2560]
PHOTO_SIZES = {s['slot']: s.get('sizes', '(max-width:900px) 100vw, 50vw')
               for s in (load('photos.json', {}) or {}).get('slots', [])}
EAGER = {'hero'}


def photo_for(slot):
    """Real photography wins over the vector placeholder as soon as it exists."""
    for ext in PHOTO_EXT:
        rel = 'assets/photos/%s%s' % (slot, ext)
        if os.path.exists(os.path.join(ROOT, rel)):
            return rel
    return None


def srcset_for(slot, ext):
    parts = []
    for w in PHOTO_WIDTHS:
        rel = 'assets/photos/%s-%d.%s' % (slot, w, ext)
        if os.path.exists(os.path.join(ROOT, rel)):
            parts.append('%s %dw' % (rel, w))
    return ', '.join(parts)


PHOTOS = load('assets/photos/manifest.json', {}) or {}
DEFAULT_SIZES = '(max-width:900px) 100vw, 46vw'


def srcset(slot, widths, ext):
    return ', '.join('assets/photos/%s-%d.%s %dw' % (slot, w, ext, w) for w in widths)


def swap_photos(html):
    """<img data-photo="hero"> becomes a <picture> with every size the layout
    needs — plus an art-directed portrait cut for phones when the slot has one,
    so a tall screen never gets a landscape frame cropped to ribbons."""
    def sub(m):
        tag, slot = m.group(0), m.group(1)
        entry = PHOTOS.get(slot)
        if not entry or 'default' not in entry:
            return tag
        d = entry['default']
        alt = re.search(r'alt="([^"]*)"', tag)
        alt = alt.group(1) if alt else ''
        eager = 'data-eager' in tag
        sizes = re.search(r'data-sizes="([^"]*)"', tag)
        sizes = sizes.group(1) if sizes else DEFAULT_SIZES

        sources = []
        if 'portrait' in entry:
            p = entry['portrait']
            sources.append('<source media="(max-width:640px)" type="image/webp" '
                           'sizes="100vw" srcset="%s">' % srcset(slot + '-portrait', p['widths'], 'webp'))
            sources.append('<source media="(max-width:640px)" '
                           'sizes="100vw" srcset="%s">' % srcset(slot + '-portrait', p['widths'], 'jpg'))
        sources.append('<source type="image/webp" sizes="%s" srcset="%s">'
                       % (sizes, srcset(slot, d['widths'], 'webp')))

        img = ('<img src="assets/photos/%s.jpg" srcset="%s" sizes="%s" width="%d" height="%d" '
               'alt="%s" %s decoding="async">'
               % (slot, srcset(slot, d['widths'], 'jpg'), sizes, d['w'], d['h'], alt,
                  'fetchpriority="high"' if eager else 'loading="lazy"'))
        return '<picture>' + ''.join(sources) + img + '</picture>'

    return re.sub(r'<img[^>]*data-photo="([\w-]+)"[^>]*>', sub, html)


def render(src, meta, depth=0):
    if depth > 6:
        raise RuntimeError('include loop')
    src = re.sub(r'\{\{>\s*([\w-]+)\s*\}\}', lambda m: render(partial(m.group(1)), meta, depth + 1), src)
    src = re.sub(r'\{\{cur:([\w-]+)\}\}', lambda m: 'aria-current="page"' if meta.get('nav') == m.group(1) else '', src)
    src = re.sub(r'\{\{(\w+)\}\}', lambda m: meta.get(m.group(1), ''), src)
    return src

def write_sitemap(pages):
    today = datetime.date.today().isoformat()
    entries = '\n'.join(
        '  <url><loc>%s</loc><lastmod>%s</lastmod><changefreq>monthly</changefreq>'
        '<priority>%s</priority></url>' % (url, today, pri)
        for url, pri in sorted(pages, key=lambda p: -float(p[1])))
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s\n</urlset>\n' % entries)
    with open(os.path.join(ROOT, 'sitemap.xml'), 'w') as f:
        f.write(xml)


def main():
    if not os.path.isdir(PAGES):
        sys.exit('missing ' + PAGES)
    built = 0
    pages = []
    for name in sorted(os.listdir(PAGES)):
        if not name.endswith('.html'):
            continue
        with open(os.path.join(PAGES, name)) as f:
            meta, body = parse_meta(f.read())
        meta.setdefault('title', 'Best American Diagnostic')
        meta.setdefault('desc', '')
        meta['path'] = name
        meta['site'] = SITE
        meta['base'] = '<base href="/">' if meta.get('base') == 'root' else ''
        meta.update(reviews_meta())
        meta['url'] = SITE + '/' + ('' if name == 'index.html' else name)
        if meta.get('index', 'yes').lower() != 'no':
            pages.append((meta['url'], meta.get('priority', '0.8')))
        meta['robots'] = ('noindex, nofollow' if meta.get('index', 'yes').lower() == 'no'
                          else 'index, follow, max-image-preview:large')
        out = swap_photos(render(body, meta))
        # collapse the blank lines left behind by stripped conditionals
        out = re.sub(r'[ \t]+\n', '\n', out)
        with open(os.path.join(ROOT, name), 'w') as f:
            f.write(out)
        built += 1
        print('  ·', name)
    write_sitemap(pages)
    print('built %d pages + sitemap.xml' % built)

if __name__ == '__main__':
    main()
