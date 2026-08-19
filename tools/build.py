#!/usr/bin/env python3
"""Tiny static-site builder: src/pages/*.html + src/partials/*.html -> /*.html

Templating:
  <!--meta ... --> front matter at the top of a page (key: value per line)
  {{> name }}     include src/partials/name.html
  {{title}} {{desc}} {{nav}} {{path}}  front-matter / derived values
  {{cur:home}}    -> aria-current="page" when the page's `nav` value matches
Run:  python3 tools/build.py
"""
import os, re, sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..'))
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

def render(src, meta, depth=0):
    if depth > 6:
        raise RuntimeError('include loop')
    src = re.sub(r'\{\{>\s*([\w-]+)\s*\}\}', lambda m: render(partial(m.group(1)), meta, depth + 1), src)
    src = re.sub(r'\{\{cur:([\w-]+)\}\}', lambda m: 'aria-current="page"' if meta.get('nav') == m.group(1) else '', src)
    src = re.sub(r'\{\{(\w+)\}\}', lambda m: meta.get(m.group(1), ''), src)
    return src

def main():
    if not os.path.isdir(PAGES):
        sys.exit('missing ' + PAGES)
    built = 0
    for name in sorted(os.listdir(PAGES)):
        if not name.endswith('.html'):
            continue
        with open(os.path.join(PAGES, name)) as f:
            meta, body = parse_meta(f.read())
        meta.setdefault('title', 'Best American Diagnostic')
        meta.setdefault('desc', '')
        meta['path'] = name
        out = render(body, meta)
        # collapse the blank lines left behind by stripped conditionals
        out = re.sub(r'[ \t]+\n', '\n', out)
        with open(os.path.join(ROOT, name), 'w') as f:
            f.write(out)
        built += 1
        print('  ·', name)
    print('built %d pages' % built)

if __name__ == '__main__':
    main()
