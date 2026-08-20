#!/usr/bin/env python3
"""Drop a logo file into the site in one step.

  python3 tools/set_logo.py path/to/logo.svg              # brand mark (header, footer, favicon)
  python3 tools/set_logo.py path/to/lockup.svg --original  # the lockup shown on proposal.html

Accepts .svg, .png, .webp or .jpg. Copies the file into assets/img/, rewrites the
reference in the shared brand partials when the extension is not .svg, and rebuilds
every page so the change lands across the whole site.
"""
import os, re, shutil, subprocess, sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..'))
IMG = os.path.join(ROOT, 'assets', 'img')
OK_EXT = {'.svg', '.png', '.webp', '.jpg', '.jpeg'}


def install(src, stem):
    ext = os.path.splitext(src)[1].lower()
    if ext not in OK_EXT:
        sys.exit('unsupported file type %s — use %s' % (ext, ', '.join(sorted(OK_EXT))))
    dest = os.path.join(IMG, stem + ext)
    shutil.copyfile(src, dest)
    print('  · installed', os.path.relpath(dest, ROOT))
    return stem + ext


def repoint(partial, old_stem, new_file):
    """Point a brand partial at the new file when the extension changed."""
    path = os.path.join(ROOT, 'src', 'partials', partial)
    with open(path) as f:
        html = f.read()
    updated = re.sub(r'assets/img/' + re.escape(old_stem) + r'\.(svg|png|webp|jpe?g)',
                     'assets/img/' + new_file, html)
    if updated != html:
        with open(path, 'w') as f:
            f.write(updated)
        print('  · repointed', partial, '->', new_file)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    original = '--original' in sys.argv
    if not args:
        sys.exit(__doc__)
    src = args[0]
    if not os.path.isfile(src):
        sys.exit('file not found: ' + src)

    if original:
        # the comparison slot on proposal.html
        name = install(src, 'logo-lockup')
        page = os.path.join(ROOT, 'src', 'pages', 'proposal.html')
        with open(page) as f:
            html = f.read()
        html = re.sub(r'assets/img/logo-lockup\.(svg|png|webp|jpe?g)', 'assets/img/' + name, html)
        with open(page, 'w') as f:
            f.write(html)
        print('  · proposal.html now shows', name)
    else:
        # the live brand mark: same file for header and footer unless a teal
        # variant is supplied separately as the second argument
        name = install(src, 'logo-mark')
        repoint('brand.html', 'logo-mark', name)
        inverse = args[1] if len(args) > 1 else src
        if not os.path.isfile(inverse):
            sys.exit('file not found: ' + inverse)
        name_i = install(inverse, 'logo-mark-inverse')
        repoint('brand-footer.html', 'logo-mark-inverse', name_i)
        if os.path.splitext(src)[1].lower() == '.svg':
            shutil.copyfile(src, os.path.join(IMG, 'favicon.svg'))
            print('  · favicon.svg updated')
        else:
            print('  ! favicon.svg left as is — supply an SVG to update it too')

    subprocess.check_call([sys.executable, os.path.join(ROOT, 'tools', 'build.py')])


if __name__ == '__main__':
    main()
