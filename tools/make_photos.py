#!/usr/bin/env python3
"""Original artwork for every photo slot — one coherent illustration set.

These are not stock photographs and do not pretend to be: they are purpose-drawn
illustrations in the brand palette, rendered at 4K. The treatment is clinical
rather than cinematic — a bright, airy field, one confident subject per frame
drawn in navy line with Tahoe Green accents, and a lot of breathing room. It
reads as a deliberate brand system instead of a stand-in for a photograph.

  python3 tools/make_photos.py      -> assets/photos/_incoming/*.svg
  node tools/render_photos.js       -> the same scenes as 4K JPEG masters
  python3 tools/fetch_photos.py --local && python3 tools/build.py
"""
import math, os

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'photos', '_incoming')
NAVY, NAVY9, TEAL = '#001C77', '#000B33', '#00C6C1'



PAPER, INK, LINE = '#EEF3FB', '#001C77', '#001C77'


def stage(w, h, i, tint=0.0):
    """A lit clinical field: soft paper, one cool light, a faint floor shadow."""
    return f'''
  <defs>
    <linearGradient id="bg{i}" x1="0.1" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="0.45" stop-color="{PAPER}"/>
      <stop offset="1" stop-color="#CBD8EE"/>
    </linearGradient>
    <radialGradient id="lit{i}" cx="0.72" cy="0.18" r="0.85">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.9"/>
      <stop offset="0.5" stop-color="{TEAL}" stop-opacity="{0.05 + tint*0.4:.3f}"/>
      <stop offset="1" stop-color="#8FA8D8" stop-opacity="0.18"/>
    </radialGradient>
    <linearGradient id="acc{i}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{TEAL}"/><stop offset="1" stop-color="#4EE0DC"/>
    </linearGradient>
    <filter id="soft{i}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="{w*0.010:.1f}"/>
    </filter>
    <filter id="glow{i}" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="{w*0.028:.1f}"/>
    </filter>
    <filter id="grain{i}">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="{i*5+11}"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <rect width="{w}" height="{h}" fill="url(#bg{i})"/>
  <rect width="{w}" height="{h}" fill="url(#lit{i})"/>'''


def finish(w, h, i):
    return (f'<rect width="{w}" height="{h}" filter="url(#grain{i})" opacity="0.035"/>'
            f'<rect width="{w}" height="{h}" fill="none" stroke="{TEAL}" stroke-width="{w*0.004:.0f}" '
            f'opacity="0.10"/>')


def ground(w, h, cx, cy, rx, i):
    return (f'<ellipse cx="{cx:.0f}" cy="{cy:.0f}" rx="{rx:.0f}" ry="{rx*0.10:.0f}" '
            f'fill="{NAVY}" opacity="0.13" filter="url(#soft{i})"/>')


def stroke(d, w_, op=1.0, cap='round', col=None):
    return (f'<path d="{d}" fill="none" stroke="{col or LINE}" stroke-width="{w_:.1f}" '
            f'opacity="{op}" stroke-linecap="{cap}" stroke-linejoin="round"/>')


# ------------------------------------------------------------------- scenes
def sc_hero(w, h, i):
    """The bore, seen slightly from the side — the signature image.
    On a tall canvas it recentres and lifts, so a phone gets a frame that was
    composed for it instead of a landscape crop."""
    tall = h > w
    cx, cy, r = (w * 0.50, h * 0.38, w * 0.62) if tall else (w * 0.66, h * 0.52, h * 0.62)
    lw = w * 0.005
    rings = ''.join(
        f'<ellipse cx="{cx - k*r*0.085:.0f}" cy="{cy:.0f}" rx="{r*(0.98-0.055*k):.0f}" '
        f'ry="{r*(0.98-0.055*k):.0f}" fill="none" stroke="{LINE}" stroke-width="{lw:.1f}" '
        f'opacity="{0.55-0.075*k:.2f}"/>' for k in range(6))
    return (f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r*1.35:.0f}" fill="url(#lit{i})" opacity="0.6"/>'
            + f'<rect x="{cx-r*1.5:.0f}" y="{cy-r*1.25:.0f}" width="{r*3.0:.0f}" height="{r*2.5:.0f}" '
              f'rx="{r*0.35:.0f}" fill="#FFFFFF" opacity="0.75"/>'
            + f'<rect x="{cx-r*1.5:.0f}" y="{cy-r*1.25:.0f}" width="{r*3.0:.0f}" height="{r*2.5:.0f}" '
              f'rx="{r*0.35:.0f}" fill="none" stroke="{LINE}" stroke-width="{lw*1.4:.1f}" opacity="0.5"/>'
            + rings
            + f'<circle cx="{cx-r*0.42:.0f}" cy="{cy:.0f}" r="{r*0.30:.0f}" fill="{TEAL}" opacity="0.22" filter="url(#glow{i})"/>'
            + f'<circle cx="{cx-r*0.42:.0f}" cy="{cy:.0f}" r="{r*0.30:.0f}" fill="{TEAL}" '
              f'opacity="0.45" filter="url(#glow{i})"/>'
            + stroke(f'M {cx-r*2.15:.0f} {cy+r*0.62:.0f} H {cx+r*0.5:.0f}', lw*3.2, 0.9)
            + stroke(f'M {cx-r*2.0:.0f} {cy+r*0.62:.0f} H {cx-r*0.6:.0f}', lw*3.2, 1, col=TEAL)
            + ground(w, h, cx, cy + r * 1.5, r * 1.7, i))


def sc_mri(w, h, i):
    cx, cy, r = w * 0.54, h * 0.44, w * 0.56
    lw = w * 0.009
    return (f'<rect x="{cx-r*1.45:.0f}" y="{cy-r*1.15:.0f}" width="{r*2.9:.0f}" height="{r*2.3:.0f}" '
            f'rx="{r*0.34:.0f}" fill="#FFFFFF" opacity="0.8" stroke="{LINE}" stroke-width="{lw:.1f}" '
            f'stroke-opacity="0.5"/>'
            + ''.join(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r*(0.86-0.11*k):.0f}" fill="none" '
                      f'stroke="{LINE}" stroke-width="{lw*0.75:.1f}" opacity="{0.5-0.08*k:.2f}"/>'
                      for k in range(5))
            + f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r*0.32:.0f}" fill="{TEAL}" opacity="0.22" filter="url(#glow{i})"/>'
            + f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r*0.32:.0f}" fill="{TEAL}" opacity="0.5" '
              f'filter="url(#glow{i})"/>'
            + stroke(f'M {cx-r*0.9:.0f} {cy+r*1.55:.0f} H {cx+r*0.9:.0f}', lw*2.6, 0.85)
            + stroke(f'M {cx-r*0.9:.0f} {cy+r*1.55:.0f} H {cx+r*0.1:.0f}', lw*2.6, 1, col=TEAL)
            + ground(w, h, cx, cy + r * 1.95, r * 1.3, i))


def sc_ct(w, h, i):
    cx, cy, r = w * 0.62, h * 0.50, h * 0.58
    lw = w * 0.004
    dashes = ''.join(
        f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r*(1.06+0.09*k):.0f}" fill="none" stroke="{TEAL}" '
        f'stroke-width="{lw*1.6:.1f}" opacity="{0.55-0.15*k:.2f}" '
        f'stroke-dasharray="{r*0.42:.0f} {r*0.20:.0f}" transform="rotate({k*31} {cx:.0f} {cy:.0f})"/>'
        for k in range(3))
    return (f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r:.0f}" fill="#FFFFFF" opacity="0.85" '
            f'stroke="{LINE}" stroke-width="{lw*2.4:.1f}" stroke-opacity="0.5"/>'
            + f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r*0.52:.0f}" fill="none" stroke="{LINE}" '
              f'stroke-width="{lw*2.0:.1f}" opacity="0.4"/>'
            + f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r*0.22:.0f}" fill="{TEAL}" opacity="0.22" filter="url(#glow{i})"/>'
            + dashes
            + stroke(f'M {cx-r*2.3:.0f} {cy+r*0.30:.0f} H {cx+r*0.2:.0f}', lw*5.5, 0.9)
            + stroke(f'M {cx-r*2.2:.0f} {cy+r*0.30:.0f} H {cx-r*0.9:.0f}', lw*5.5, 1, col=TEAL)
            + ground(w, h, cx, cy + r * 1.35, r * 1.5, i))


def sc_mammography(w, h, i):
    cx, cy = w * 0.54, h * 0.50
    lw = w * 0.011
    return (f'<rect x="0" y="{h*0.86:.0f}" width="{w}" height="{h*0.14:.0f}" fill="{NAVY}" opacity="0.9"/>'
            + stroke(f'M {cx:.0f} {cy-h*0.46:.0f} V {cy+h*0.40:.0f}', lw * 2.6, 0.75)
            + ''.join(
                f'<rect x="{cx-w*0.42:.0f}" y="{cy+(k-1)*h*0.165-h*0.022:.0f}" width="{w*0.46:.0f}" '
                f'height="{h*0.052:.0f}" rx="{h*0.022:.0f}" fill="#FFFFFF" stroke="{LINE}" '
                f'stroke-width="{lw*0.8:.1f}" stroke-opacity="0.45"/>' for k in range(3))
            + f'<rect x="{cx-w*0.30:.0f}" y="{cy-h*0.157:.0f}" width="{w*0.33:.0f}" height="{h*0.044:.0f}" '
              f'rx="{h*0.022:.0f}" fill="url(#acc{i})" opacity="0.9"/>'
            + f'<circle cx="{cx-w*0.135:.0f}" cy="{cy+h*0.005:.0f}" r="{w*0.075:.0f}" fill="{TEAL}" '
              f'opacity="0.22" filter="url(#glow{i})"/>'
            + stroke(f'M {cx-w*0.30:.0f} {cy+h*0.30:.0f} H {cx+w*0.13:.0f}', lw * 2.4, 0.85)
            + ground(w, h, cx - w * 0.06, cy + h * 0.345, w * 0.30, i))


def sc_ultrasound(w, h, i):
    cx, cy = w * 0.46, h * 0.17
    lw = w * 0.014
    arcs = ''.join(
        f'<path d="M {cx-w*(0.22+0.145*k):.0f} {cy+h*(0.30+0.185*k):.0f} '
        f'Q {cx:.0f} {cy+h*(0.08+0.115*k):.0f} {cx+w*(0.22+0.145*k):.0f} {cy+h*(0.30+0.185*k):.0f}" '
        f'fill="none" stroke="{TEAL}" stroke-width="{lw*(1.5-0.16*k):.1f}" '
        f'opacity="{0.85-0.14*k:.2f}" stroke-linecap="round"/>' for k in range(5))
    return (f'<rect x="{cx-w*0.048:.0f}" y="{cy-h*0.16:.0f}" width="{w*0.096:.0f}" height="{h*0.185:.0f}" '
            f'rx="{w*0.046:.0f}" fill="#FFFFFF" stroke="{LINE}" stroke-width="{lw:.1f}" stroke-opacity="0.55"/>'
            + f'<rect x="{cx-w*0.048:.0f}" y="{cy+h*0.006:.0f}" width="{w*0.096:.0f}" height="{h*0.020:.0f}" '
              f'rx="{h*0.010:.0f}" fill="url(#acc{i})"/>'
            + arcs
            + f'<ellipse cx="{cx:.0f}" cy="{cy+h*0.60:.0f}" rx="{w*0.40:.0f}" ry="{h*0.10:.0f}" '
              f'fill="{TEAL}" opacity="0.10" filter="url(#glow{i})"/>')


def sc_xray(w, h, i):
    cx, cy = w * 0.50, h * 0.50
    lw = w * 0.0075
    ribs = ''.join(
        stroke(f'M {cx-w*0.042:.0f} {cy-h*0.36+k*h*0.115:.0f} '
               f'C {cx-w*0.26:.0f} {cy-h*0.265+k*h*0.115:.0f} {cx-w*0.30:.0f} {cy-h*0.07+k*h*0.106:.0f} '
               f'{cx-w*0.195:.0f} {cy+h*0.05+k*h*0.070:.0f}', lw * 1.6, 0.55 - 0.05 * k)
        + stroke(f'M {cx+w*0.042:.0f} {cy-h*0.36+k*h*0.115:.0f} '
                 f'C {cx+w*0.26:.0f} {cy-h*0.265+k*h*0.115:.0f} {cx+w*0.30:.0f} {cy-h*0.07+k*h*0.106:.0f} '
                 f'{cx+w*0.195:.0f} {cy+h*0.05+k*h*0.070:.0f}', lw * 1.6, 0.55 - 0.05 * k)
        for k in range(6))
    return (f'<rect x="{cx-w*0.27:.0f}" y="{cy-h*0.36:.0f}" width="{w*0.54:.0f}" height="{h*0.72:.0f}" '
            f'rx="{w*0.02:.0f}" fill="#FFFFFF" opacity="0.7" stroke="{LINE}" stroke-width="{lw*1.6:.1f}" '
            f'stroke-opacity="0.35"/>'
            + f'<ellipse cx="{cx:.0f}" cy="{cy-h*0.02:.0f}" rx="{w*0.28:.0f}" ry="{h*0.40:.0f}" '
              f'fill="{TEAL}" opacity="0.10" filter="url(#glow{i})"/>'
            + stroke(f'M {cx:.0f} {cy-h*0.40:.0f} V {cy+h*0.24:.0f}', lw * 2.6, 0.45)
            + ribs)


def sc_cardiac(w, h, i):
    y0 = h * 0.62
    pts, x = [], 0
    while x <= w:
        t = x / w
        spike = math.exp(-((t % 0.34 - 0.17) ** 2) / 0.00075) * h * 0.42
        y = y0 - spike
        pts.append(f'{x:.0f},{y:.0f}')
        x += w / 460
    line = ' '.join(pts)
    grid = ''.join(f'<line x1="0" y1="{y}" x2="{w}" y2="{y}" stroke="{NAVY}" stroke-width="1" '
                   f'opacity="0.05"/>' for y in range(0, h, max(1, h // 20)))
    grid += ''.join(f'<line x1="{x}" y1="0" x2="{x}" y2="{h}" stroke="{NAVY}" stroke-width="1" '
                    f'opacity="0.05"/>' for x in range(0, w, max(1, w // 32)))
    return (grid
            + f'<rect x="0" y="{h*0.80:.0f}" width="{w}" height="{h*0.20:.0f}" fill="{NAVY}" opacity="0.92"/>'
            + f'<polyline points="{line}" fill="none" stroke="{TEAL}" stroke-width="{w*0.016:.1f}" '
              f'opacity="0.35" filter="url(#glow{i})" stroke-linejoin="round"/>'
            + f'<polyline points="{line}" fill="none" stroke="{NAVY}" stroke-width="{w*0.0055:.1f}" '
              f'stroke-linejoin="round" stroke-linecap="round"/>')


def sc_lobby(w, h, i):
    lw = w * 0.005
    panes = ''.join(
        f'<rect x="{w*(0.58+0.098*k):.0f}" y="{h*0.08:.0f}" width="{w*0.078:.0f}" height="{h*0.52:.0f}" '
        f'rx="{w*0.005:.0f}" fill="#FFFFFF" opacity="0.85" stroke="{LINE}" stroke-width="{lw:.1f}" '
        f'stroke-opacity="0.3"/>' for k in range(4))
    return (panes
            + f'<rect x="0" y="{h*0.83:.0f}" width="{w}" height="{h*0.17:.0f}" fill="{NAVY}" opacity="0.9"/>'
            + f'<rect x="{w*0.04:.0f}" y="{h*0.50:.0f}" width="{w*0.52:.0f}" height="{h*0.30:.0f}" '
              f'rx="{h*0.022:.0f}" fill="#FFFFFF" opacity="0.9" stroke="{LINE}" '
              f'stroke-width="{lw*1.6:.1f}" stroke-opacity="0.45"/>'
            + f'<rect x="{w*0.06:.0f}" y="{h*0.55:.0f}" width="{w*0.42:.0f}" height="{h*0.026:.0f}" '
              f'rx="{h*0.013:.0f}" fill="url(#acc{i})"/>'
            + f'<rect x="{w*0.085:.0f}" y="{h*0.17:.0f}" width="{w*0.26:.0f}" height="{h*0.26:.0f}" '
              f'rx="{h*0.018:.0f}" fill="#FFFFFF" opacity="0.8" stroke="{LINE}" '
              f'stroke-width="{lw:.1f}" stroke-opacity="0.3"/>'
            + f'<circle cx="{w*0.215:.0f}" cy="{h*0.30:.0f}" r="{w*0.045:.0f}" fill="{TEAL}" opacity="0.18"/>'
            + ground(w, h, w * 0.27, h * 0.79, w * 0.24, i))


def sc_tech(w, h, i):
    cx, cy, r = w * 0.46, h * 0.48, w * 0.52
    lw = w * 0.006
    return (f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r*1.28:.0f}" fill="#FFFFFF" opacity="0.8" '
            f'stroke="{LINE}" stroke-width="{lw*1.5:.1f}" stroke-opacity="0.4"/>'
            + ''.join(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r*(1.0-0.14*k):.0f}" fill="none" '
                      f'stroke="{LINE}" stroke-width="{lw:.1f}" opacity="{0.45-0.07*k:.2f}"/>'
                      for k in range(4))
            + f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r*0.30:.0f}" fill="{TEAL}" opacity="0.22" filter="url(#glow{i})"/>'
            + f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r*0.30:.0f}" fill="{TEAL}" opacity="0.4" '
              f'filter="url(#glow{i})"/>'
            + ''.join(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r*1.42:.0f}" fill="none" stroke="{TEAL}" '
                      f'stroke-width="{lw*1.2:.1f}" opacity="{0.4-0.12*k:.2f}" '
                      f'stroke-dasharray="{r*0.30:.0f} {r*0.16:.0f}" '
                      f'transform="rotate({k*23} {cx:.0f} {cy:.0f})"/>' for k in range(2)))


def sc_team(w, h, i):
    """A calendar-and-care mark rather than figures — invented faces would only
    read as fake on a medical site."""
    cx, cy = w * 0.5, h * 0.46
    lw = w * 0.010
    bw, bh = w * 0.52, h * 0.40
    return (f'<rect x="{cx-bw/2:.0f}" y="{cy-bh/2:.0f}" width="{bw:.0f}" height="{bh:.0f}" '
            f'rx="{w*0.04:.0f}" fill="#FFFFFF" opacity="0.92" stroke="{LINE}" '
            f'stroke-width="{lw*1.3:.1f}" stroke-opacity="0.45"/>'
            + f'<rect x="{cx-bw/2:.0f}" y="{cy-bh/2:.0f}" width="{bw:.0f}" height="{bh*0.20:.0f}" '
              f'rx="{w*0.04:.0f}" fill="url(#acc{i})"/>'
            + f'<rect x="{cx-bw/2:.0f}" y="{cy-bh/2+bh*0.13:.0f}" width="{bw:.0f}" height="{bh*0.07:.0f}" '
              f'fill="url(#acc{i})"/>'
            + ''.join(
                f'<rect x="{cx-bw*0.40+col*bw*0.20:.0f}" y="{cy-bh*0.16+row*bh*0.20:.0f}" '
                f'width="{bw*0.13:.0f}" height="{bh*0.12:.0f}" rx="{w*0.008:.0f}" '
                f'fill="{NAVY}" opacity="{0.10 if not (row==1 and col==2) else 0.0}"/>'
                for row in range(3) for col in range(4))
            + f'<circle cx="{cx+bw*0.06:.0f}" cy="{cy+bh*0.10:.0f}" r="{bw*0.085:.0f}" fill="{TEAL}"/>'
            + stroke(f'M {cx+bw*0.02:.0f} {cy+bh*0.10:.0f} l {bw*0.03:.0f} {bh*0.045:.0f} '
                     f'l {bw*0.07:.0f} {-bh*0.09:.0f}', lw * 1.6, 1, col='#FFFFFF')
            + ground(w, h, cx, cy + bh * 0.60, bw * 0.48, i))


SCENES = [
    ('hero',          3840, 2400, sc_hero,        0.04),
    ('hero-portrait', 1600, 3200, sc_hero,        0.04),
    ('lobby',         3840, 2400, sc_lobby,       0.02),
    ('tech',        2600, 2600, sc_tech,        0.06),
    ('mri',         2600, 3250, sc_mri,         0.05),
    ('ct',          3840, 2400, sc_ct,          0.04),
    ('mammography', 2600, 3250, sc_mammography, 0.03),
    ('ultrasound',  2600, 3250, sc_ultrasound,  0.05),
    ('xray',        3840, 2400, sc_xray,        0.03),
    ('cardiac',     3840, 2400, sc_cardiac,     0.02),
    ('team',        2600, 3250, sc_team,        0.04),
]


def main():
    os.makedirs(OUT, exist_ok=True)
    for i, (name, w, h, fn, tint) in enumerate(SCENES):
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
               f'viewBox="0 0 {w} {h}">' + stage(w, h, i, tint)
               + fn(w, h, i) + finish(w, h, i) + '</svg>')
        with open(os.path.join(OUT, name + '.svg'), 'w') as f:
            f.write(svg)
        print('  ·', name + '.svg', '%dx%d' % (w, h))
    print('\nNow: node tools/render_photos.js')


if __name__ == '__main__':
    main()
