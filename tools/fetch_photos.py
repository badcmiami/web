#!/usr/bin/env python3
"""Fills assets/photos/ with royalty-free photography from Pexels.

Every image on the site is a vector placeholder until a real photo exists for
its slot. This script fetches those photos, centre-crops them to the aspect the
layout expects and records the photographer credits.

  export PEXELS_API_KEY=xxxxxxxx          # free key: pexels.com/api
  python3 tools/fetch_photos.py           # every slot in photos.json
  python3 tools/fetch_photos.py hero mri  # only these slots
  python3 tools/build.py                  # swap the placeholders for the photos

To pin one specific photo instead of the search result, paste its page or image
URL into the slot's "url" field in photos.json and run the script again.

Pexels does not require attribution, but credits are saved to
assets/photos/credits.json so you can display or archive them.
"""
import json, os, re, sys, urllib.request, urllib.parse

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 'assets', 'photos')
API = 'https://api.pexels.com/v1/search'
KEY = os.environ.get('PEXELS_API_KEY', '')
UA = {'User-Agent': 'best-american-diagnostic-site/1.0'}


def get(url, headers=None):
    req = urllib.request.Request(url, headers={**UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read()


def search(query, aspect):
    if not KEY:
        sys.exit('Set PEXELS_API_KEY first (free key at https://www.pexels.com/api/).')
    orientation = 'portrait' if aspect in ('4:5', '3:4') else 'landscape'
    url = '%s?%s' % (API, urllib.parse.urlencode(
        {'query': query, 'per_page': 5, 'orientation': orientation, 'size': 'large'}))
    data = json.loads(get(url, {'Authorization': KEY}))
    photos = data.get('photos') or []
    if not photos:
        return None
    p = photos[0]
    return {'id': p['id'], 'src': p['src']['original'],
            'photographer': p.get('photographer', ''), 'page': p.get('url', '')}


def pinned(url):
    """Accept either a direct image URL or a pexels.com photo page URL."""
    if re.search(r'\.(jpe?g|png|webp)(\?|$)', url, re.I):
        return {'id': '', 'src': url, 'photographer': '', 'page': url}
    m = re.search(r'-(\d+)/?$', url.rstrip('/'))
    if not m:
        sys.exit('Cannot read a photo id from: ' + url)
    pid = m.group(1)
    if not KEY:
        sys.exit('Set PEXELS_API_KEY to resolve a Pexels page URL.')
    p = json.loads(get('https://api.pexels.com/v1/photos/' + pid, {'Authorization': KEY}))
    return {'id': p['id'], 'src': p['src']['original'],
            'photographer': p.get('photographer', ''), 'page': p.get('url', '')}


def crop_to(path, aspect):
    """Centre-crop in place. Needs Pillow; without it the photo is kept as is and
    the CSS object-fit still covers the frame."""
    try:
        from PIL import Image
    except ImportError:
        print('    (Pillow not installed — skipping crop; object-fit will cover)')
        return
    w_r, h_r = (int(x) for x in aspect.split(':'))
    im = Image.open(path).convert('RGB')
    target = w_r / h_r
    w, h = im.size
    if w / h > target:
        new_w = int(h * target)
        box = ((w - new_w) // 2, 0, (w - new_w) // 2 + new_w, h)
    else:
        new_h = int(w / target)
        box = (0, (h - new_h) // 2, w, (h - new_h) // 2 + new_h)
    im = im.crop(box)
    im.thumbnail((2000, 2000), Image.LANCZOS)
    im.save(path, 'JPEG', quality=82, optimize=True, progressive=True)


def main():
    os.makedirs(OUT, exist_ok=True)
    cfg = json.load(open(os.path.join(ROOT, 'photos.json')))
    wanted = set(sys.argv[1:])
    credits_path = os.path.join(OUT, 'credits.json')
    credits = json.load(open(credits_path)) if os.path.exists(credits_path) else {}

    for slot in cfg['slots']:
        name = slot['slot']
        if wanted and name not in wanted:
            continue
        print('·', name, '—', slot['url'] or slot['query'])
        photo = pinned(slot['url']) if slot['url'] else search(slot['query'], slot['aspect'])
        if not photo:
            print('    no result, leaving the placeholder in place')
            continue
        dest = os.path.join(OUT, name + '.jpg')
        with open(dest, 'wb') as f:
            f.write(get(photo['src']))
        crop_to(dest, slot['aspect'])
        credits[name] = {'photographer': photo['photographer'], 'page': photo['page'],
                         'source': 'Pexels', 'id': photo['id']}
        print('    saved %s (%.0f KB)' % (os.path.relpath(dest, ROOT), os.path.getsize(dest) / 1024))

    json.dump(credits, open(credits_path, 'w'), indent=2, ensure_ascii=False)
    print('\nCredits written to assets/photos/credits.json')
    print('Now run: python3 tools/build.py')


if __name__ == '__main__':
    main()
