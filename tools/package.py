#!/usr/bin/env python3
"""Builds the upload-ready archive for shared hosting (Hostinger, cPanel…).

Only what the server needs goes in: the built pages, assets, the PHP form
handler and the server config. Sources, tooling and the preview bundle stay out.

  python3 tools/package.py            -> dist/best-american-diagnostic-web.zip
  SITE_URL=https://otro-dominio.com python3 tools/build.py && python3 tools/package.py
"""
import os, sys, zipfile

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..'))
DIST = os.path.join(ROOT, 'dist')
NAME = 'best-american-diagnostic-web.zip'

PAGES = ['index.html', 'services.html', 'patients.html', 'providers.html', 'about.html',
         'contact.html', 'proposal.html', 'legal.html', '404.html']
ROOT_FILES = PAGES + ['send.php', '.htaccess', 'robots.txt', 'sitemap.xml', 'site.webmanifest']
DIRS = ['assets/css', 'assets/js', 'assets/img', 'assets/photos']
SKIP_DIRS = {'_masters', '__pycache__'}
SKIP_FILES = {'README.md', 'credits.json'}       # credits.json is data, not served


def main():
    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, NAME)
    missing = [f for f in ROOT_FILES if not os.path.exists(os.path.join(ROOT, f))]
    if missing:
        sys.exit('Run tools/build.py first — missing: %s' % ', '.join(missing))

    total = 0
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for f in ROOT_FILES:
            z.write(os.path.join(ROOT, f), f)
            total += 1
        for d in DIRS:
            base = os.path.join(ROOT, d)
            if not os.path.isdir(base):
                continue
            for dirpath, dirnames, filenames in os.walk(base):
                dirnames[:] = [x for x in dirnames if x not in SKIP_DIRS]
                for fn in filenames:
                    if fn in SKIP_FILES or fn.startswith('.'):
                        continue
                    full = os.path.join(dirpath, fn)
                    z.write(full, os.path.relpath(full, ROOT))
                    total += 1

    size = os.path.getsize(out) / 1024
    print('  · %s  —  %d files, %.0f KB' % (os.path.relpath(out, ROOT), total, size))
    print('    Upload it to public_html/ and extract there.')


if __name__ == '__main__':
    main()
