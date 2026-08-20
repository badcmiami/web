#!/usr/bin/env python3
"""Fills the site with royalty-free photography and derives every size it needs.

Sources, in order of how little setup they need:

  openverse   no key at all — CC0 / CC-BY images aggregated from many museums
              and libraries. Works out of the box.
  pexels      free key, huge modern library, no attribution required
  unsplash    free key, same idea
  pixabay     free key

    python3 tools/fetch_photos.py                       # openverse, every slot
    python3 tools/fetch_photos.py --source pexels       # needs PEXELS_API_KEY
    python3 tools/fetch_photos.py hero mri --source unsplash
    python3 tools/fetch_photos.py --url hero=https://…/photo.jpg
    python3 tools/fetch_photos.py --local            # photos you already have

Use --local for anything downloaded by hand — an Envato Elements subscription,
a stock library that needs a login, or the centre's own photography. Drop the
files in assets/photos/_incoming/ named after their slot (hero.jpg, mri.jpg…)
and they get the same crop, the same five sizes and the same WebP treatment.

What it does with each photo:
  1. downloads the largest version the provider offers (4K when available)
  2. keeps that master in assets/photos/_masters/ (git-ignored, not published)
  3. centre-crops it to the aspect the layout expects
  4. writes web-ready JPEG + WebP at 480 / 960 / 1440 / 1920 / 2560 px
  5. records the photographer, licence and source URL in credits.json

Then `python3 tools/build.py` swaps the vector placeholders for <picture>
elements with a full srcset, so phones download a 480px file and 4K screens get
the big one.
"""
import json, os, re, sys, urllib.parse, urllib.request

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 'assets', 'photos')
MASTERS = os.path.join(OUT, '_masters')
WIDTHS = [480, 960, 1440, 1920, 2560]
DEFAULT_WIDTH = 1440          # what plain src= points at
MASTER_CAP = 3840             # 4K wide is plenty for a master
UA = {'User-Agent': 'best-american-diagnostic-site/1.0 (+https://bestamericandiagnostics.com)'}


def fetch(url, headers=None):
    req = urllib.request.Request(url, headers={**UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def key(name):
    value = os.environ.get(name, '')
    if not value:
        sys.exit('%s is not set. Get a free key, export it, and run again — or drop\n'
                 '--source and use openverse, which needs no key at all.' % name)
    return value


# ----------------------------------------------------------------- providers
def from_openverse(query, aspect):
    url = 'https://api.openverse.org/v1/images/?' + urllib.parse.urlencode({
        'q': query, 'license_type': 'commercial,modification',
        'aspect_ratio': 'tall' if aspect in ('4:5', '3:4') else 'wide',
        'size': 'large', 'page_size': 5, 'mature': 'false'})
    for p in json.loads(fetch(url)).get('results', []):
        if p.get('url'):
            return {'src': p['url'], 'author': p.get('creator') or '',
                    'page': p.get('foreign_landing_url') or p.get('url'),
                    'license': (p.get('license') or 'cc').upper(), 'source': 'Openverse'}
    return None


def from_pexels(query, aspect):
    url = 'https://api.pexels.com/v1/search?' + urllib.parse.urlencode({
        'query': query, 'per_page': 5, 'size': 'large',
        'orientation': 'portrait' if aspect in ('4:5', '3:4') else 'landscape'})
    data = json.loads(fetch(url, {'Authorization': key('PEXELS_API_KEY')}))
    for p in data.get('photos', []):
        return {'src': p['src']['original'], 'author': p.get('photographer', ''),
                'page': p.get('url', ''), 'license': 'Pexels License', 'source': 'Pexels'}
    return None


def from_unsplash(query, aspect):
    url = 'https://api.unsplash.com/search/photos?' + urllib.parse.urlencode({
        'query': query, 'per_page': 5,
        'orientation': 'portrait' if aspect in ('4:5', '3:4') else 'landscape'})
    data = json.loads(fetch(url, {'Authorization': 'Client-ID ' + key('UNSPLASH_ACCESS_KEY')}))
    for p in data.get('results', []):
        return {'src': p['urls']['raw'] + '&w=3840&q=85', 'author': p['user'].get('name', ''),
                'page': p['links'].get('html', ''), 'license': 'Unsplash License', 'source': 'Unsplash'}
    return None


def from_pixabay(query, aspect):
    url = 'https://pixabay.com/api/?' + urllib.parse.urlencode({
        'key': key('PIXABAY_API_KEY'), 'q': query, 'image_type': 'photo',
        'orientation': 'vertical' if aspect in ('4:5', '3:4') else 'horizontal',
        'per_page': 5, 'safesearch': 'true'})
    for p in json.loads(fetch(url)).get('hits', []):
        return {'src': p.get('fullHDURL') or p['largeImageURL'], 'author': p.get('user', ''),
                'page': p.get('pageURL', ''), 'license': 'Pixabay Content License', 'source': 'Pixabay'}
    return None


PROVIDERS = {'openverse': from_openverse, 'pexels': from_pexels,
             'unsplash': from_unsplash, 'pixabay': from_pixabay}


# ------------------------------------------------------------- image derivation
MANIFEST = os.path.join(OUT, 'manifest.json')


def record(slot, key, data):
    man = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {}
    man.setdefault(slot, {})[key] = data
    json.dump(man, open(MANIFEST, 'w'), indent=2)


def derive(master_path, slot, aspect):
    """Centre-crop the master, then write every size the site serves."""
    try:
        from PIL import Image, ImageOps
    except ImportError:
        sys.exit('Pillow is required to resize the photos:  pip install Pillow')

    im = Image.open(master_path)
    im = ImageOps.exif_transpose(im).convert('RGB')
    w_r, h_r = (int(x) for x in aspect.split(':'))
    target = w_r / h_r
    w, h = im.size
    if w / h > target:                        # too wide -> trim the sides
        nw = round(h * target)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:                                     # too tall -> trim top and bottom
        nh = round(w / target)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))

    written = []
    for width in WIDTHS:
        if width > im.width and written:      # never upscale past the source
            break
        wide = min(width, im.width)
        resized = im.resize((wide, round(wide / target)), Image.LANCZOS)
        jpg = os.path.join(OUT, '%s-%d.jpg' % (slot, width))
        resized.save(jpg, 'JPEG', quality=82, optimize=True, progressive=True)
        resized.save(os.path.join(OUT, '%s-%d.webp' % (slot, width)), 'WEBP', quality=80, method=5)
        written.append(width)
        if width == DEFAULT_WIDTH or (written and width == max(written) and DEFAULT_WIDTH > im.width):
            resized.save(os.path.join(OUT, slot + '.jpg'), 'JPEG', quality=82,
                         optimize=True, progressive=True)
    if not os.path.exists(os.path.join(OUT, slot + '.jpg')):
        im.save(os.path.join(OUT, slot + '.jpg'), 'JPEG', quality=82, optimize=True)
    fallback = Image.open(os.path.join(OUT, slot + '.jpg'))
    base, kind = ((slot[:-9], 'portrait') if slot.endswith('-portrait') else (slot, 'default'))
    record(base, kind, {'widths': written, 'aspect': aspect,
                        'w': fallback.width, 'h': fallback.height})
    return {'widths': written, 'master': '%dx%d' % (im.width, im.height)}


def shrink_master(path):
    """A 6000px original helps nobody; cap the stored master at 4K."""
    from PIL import Image, ImageOps
    im = ImageOps.exif_transpose(Image.open(path)).convert('RGB')
    if im.width > MASTER_CAP:
        im = im.resize((MASTER_CAP, round(im.height * MASTER_CAP / im.width)), Image.LANCZOS)
        im.save(path, 'JPEG', quality=90, optimize=True)


INCOMING = os.path.join(OUT, '_incoming')


def run_local(cfg, wanted):
    """Derive every size from files the user supplied by hand."""
    os.makedirs(INCOMING, exist_ok=True)
    by_slot = {}
    for fn in sorted(os.listdir(INCOMING)):
        stem, ext = os.path.splitext(fn)
        if ext.lower() in ('.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'):
            by_slot[stem.lower()] = os.path.join(INCOMING, fn)
    if not by_slot:
        print('Nothing in %s.\nDrop your files there named after their slot '
              '(hero.jpg, mri.jpg, team.jpg…) and run this again.'
              % os.path.relpath(INCOMING, ROOT))
        print('Slots: ' + ', '.join(s['slot'] for s in cfg['slots']))
        return {}

    credits = {}
    from PIL import Image, ImageOps

    def process(name, aspect, src):
        master = os.path.join(MASTERS, name + '.jpg')
        ImageOps.exif_transpose(Image.open(src)).convert('RGB').save(
            master, 'JPEG', quality=95, optimize=True)
        shrink_master(master)
        info = derive(master, name, aspect)
        print('· %-16s %s from %-22s -> %s'
              % (name, info['master'], os.path.basename(src), info['widths']))
        return info

    for slot in cfg['slots']:
        name = slot['slot']
        if (wanted and name not in wanted) or name not in by_slot:
            continue
        info = process(name, slot['aspect'], by_slot[name])
        credits[name] = {'author': '', 'page': '', 'license': 'licensed by the client',
                         'source': 'supplied', 'master': info['master']}
        # an art-directed cut for narrow screens, when the slot asks for one
        if slot.get('portrait') and (name + '-portrait') in by_slot:
            process(name + '-portrait', slot['portrait'], by_slot[name + '-portrait'])

    expected = {s['slot'] for s in cfg['slots']} | {
        s['slot'] + '-portrait' for s in cfg['slots'] if s.get('portrait')}
    unused = sorted(set(by_slot) - expected)
    if unused:
        print('\nIgnored (no slot with that name): ' + ', '.join(unused))
    return credits


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = [a for a in sys.argv[1:] if a.startswith('--')]
    source = 'openverse'
    for f in flags:
        if f.startswith('--source='):
            source = f.split('=', 1)[1]
    if '--source' in flags:
        source = sys.argv[sys.argv.index('--source') + 1]
        args = [a for a in args if a != source]
    if source not in PROVIDERS:
        sys.exit('Unknown source %r. Choose from: %s' % (source, ', '.join(PROVIDERS)))

    pinned = {}
    for f in flags:
        if f.startswith('--url'):
            spec = f.split('=', 1)[1] if '=' in f else sys.argv[sys.argv.index(f) + 1]
            slot, _, url = spec.partition('=')
            pinned[slot] = url

    os.makedirs(OUT, exist_ok=True)
    os.makedirs(MASTERS, exist_ok=True)
    cfg = json.load(open(os.path.join(ROOT, 'photos.json')))
    wanted = set(args)
    credits_path = os.path.join(OUT, 'credits.json')
    credits = json.load(open(credits_path)) if os.path.exists(credits_path) else {}

    if '--local' in flags:
        credits.update(run_local(cfg, wanted))
        json.dump(credits, open(credits_path, 'w'), indent=2, ensure_ascii=False)
        print('\nNow run: python3 tools/build.py')
        return

    for slot in cfg['slots']:
        name = slot['slot']
        if wanted and name not in wanted:
            continue
        query = slot['query']
        print('·', name, '—', query)
        try:
            if name in pinned:
                photo = {'src': pinned[name], 'author': '', 'page': pinned[name],
                         'license': 'supplied', 'source': 'manual'}
            elif slot.get('url'):
                photo = {'src': slot['url'], 'author': '', 'page': slot['url'],
                         'license': 'supplied', 'source': 'manual'}
            else:
                photo = PROVIDERS[source](query, slot['aspect'])
        except Exception as exc:                      # network, quota, bad key…
            print('    could not reach %s: %s' % (source, exc))
            continue
        if not photo:
            print('    no result — the placeholder stays')
            continue

        master = os.path.join(MASTERS, name + '.jpg')
        with open(master, 'wb') as f:
            f.write(fetch(photo['src']))
        shrink_master(master)
        info = derive(master, name, slot['aspect'])
        credits[name] = {k: photo[k] for k in ('author', 'page', 'license', 'source')}
        credits[name]['master'] = info['master']
        print('    %s master, sizes %s' % (info['master'], info['widths']))

    json.dump(credits, open(credits_path, 'w'), indent=2, ensure_ascii=False)
    print('\nCredits -> assets/photos/credits.json')
    print('Now run: python3 tools/build.py')


if __name__ == '__main__':
    main()
