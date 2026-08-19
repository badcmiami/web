#!/usr/bin/env python3
"""Generates the SVG asset kit (logo, favicon, photo placeholders, map).
Every image is a self-contained duotone SVG in the brand palette so the
proposal ships with zero external/licensed media. Replace the `scene-*.svg`
files with real photography before launch (same aspect ratios)."""
import math, os, random

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')
os.makedirs(OUT, exist_ok=True)
NAVY, NAVY9, TEAL = '#001C77', '#000B33', '#00C6C1'

def w(name, body):
    with open(os.path.join(OUT, name), 'w') as f:
        f.write(body)
    print('  ·', name)

# ---------------------------------------------------------------- logo mark
def mark(fg_a, fg_b, size=64):
    """Infinity mark: two interlocking loops = continuity of care + 'Best American'."""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="{size}" height="{size}" role="img" aria-label="Best American Diagnostic">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{fg_a}"/><stop offset="1" stop-color="{fg_b}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="17" fill="url(#bg)"/>
  <path d="M20.5 32c0-5 3.6-8.6 8-8.6 3.4 0 5.9 2 7.5 4.6l3.4 5.4c1.4 2.2 3 3.6 5.1 3.6 2.6 0 4.6-2.1 4.6-5s-2-5-4.6-5c-1.6 0-2.9.7-4 2l-2.2-3.5c1.7-1.7 3.9-2.7 6.4-2.7 5 0 8.8 3.8 8.8 9.2s-3.8 9.2-8.8 9.2c-3.4 0-5.9-2-7.5-4.6l-3.4-5.4c-1.4-2.2-3-3.6-5.3-3.6-2.4 0-4.2 2.1-4.2 4.4s1.8 4.4 4.2 4.4c1.4 0 2.6-.6 3.6-1.8l2.2 3.5c-1.6 1.6-3.6 2.5-6 2.5-4.6 0-8.3-3.7-8.3-8.6z" fill="#fff" opacity=".97"/>
  <circle cx="14" cy="32" r="3.4" fill="{TEAL if fg_a!=TEAL else '#fff'}"/>
</svg>'''

w('logo.svg', mark(NAVY, '#0B3AB0'))
w('logo-teal.svg', mark(TEAL, '#00A9A5'))
w('favicon.svg', mark(NAVY, TEAL, 32))

# --------------------------------------------------------- photo placeholders
FRAME = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="{alt}">
  <defs>
    <linearGradient id="g{i}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{c1}"/><stop offset="0.55" stop-color="{c2}"/><stop offset="1" stop-color="{c3}"/>
    </linearGradient>
    <radialGradient id="r{i}" cx="{gx}" cy="{gy}" r="0.75">
      <stop offset="0" stop-color="{glow}" stop-opacity="0.55"/><stop offset="1" stop-color="{glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="n{i}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/>
      <feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#g{i})"/>
  <rect width="{W}" height="{H}" fill="url(#r{i})"/>
  {motif}
  <rect width="{W}" height="{H}" filter="url(#n{i})" opacity="0.06"/>
</svg>'''

def concentric(W, H, cx, cy, n=16, step=None, stroke=TEAL, op=.5):
    step = step or W / (n * 2.1)
    return ''.join(
        f'<circle cx="{cx}" cy="{cy}" r="{round(step*(k+1),1)}" fill="none" stroke="{stroke}" '
        f'stroke-width="{round(1+ (k%3)*0.6,1)}" opacity="{round(op*(1-k/(n*1.25)),3)}"/>'
        for k in range(n))

def scanlines(W, H, gap=14, stroke='#fff', op=.10, angle=0):
    lines = ''.join(f'<line x1="0" y1="{y}" x2="{W}" y2="{y}" stroke="{stroke}" stroke-width="1" opacity="{op}"/>'
                    for y in range(0, H, gap))
    return f'<g transform="rotate({angle} {W/2} {H/2})">{lines}</g>'

_pid = [0]
def dotgrid(W, H, gap=26, r=1.9, fill='#fff', op=.16):
    """Dot field drawn as a tiled pattern (keeps the file a few KB, not 100)."""
    _pid[0] += 1
    pid = 'dp%d' % _pid[0]
    return (f'<pattern id="{pid}" width="{gap}" height="{gap}" patternUnits="userSpaceOnUse">'
            f'<circle cx="{gap/2}" cy="{gap/2}" r="{r}" fill="{fill}"/></pattern>'
            f'<rect width="{W}" height="{H}" fill="url(#{pid})" opacity="{op}"/>')

def wave(W, H, y0, amp, freq, stroke=TEAL, sw=2.5, op=.9):
    pts, x = [], 0
    while x <= W:
        t = x / W
        spike = math.exp(-((t % .25 - .12) ** 2) / 0.00035) * amp * 2.4
        y = y0 + math.sin(t * freq * math.tau) * amp * .35 - spike
        pts.append(f'{round(x,1)},{round(y,1)}')
        x += 4
    return f'<polyline points="{" ".join(pts)}" fill="none" stroke="{stroke}" stroke-width="{sw}" opacity="{op}" stroke-linejoin="round"/>'

def cone(W, H, cx, cy, spread=42, n=9, stroke='#fff', op=.22):
    out = []
    for k in range(n):
        a = math.radians(-90 - spread + (2 * spread) * k / (n - 1))
        out.append(f'<line x1="{cx}" y1="{cy}" x2="{round(cx+math.cos(a)*H*1.3,1)}" y2="{round(cy+math.sin(a)*H*1.3,1)}" stroke="{stroke}" stroke-width="1.2" opacity="{op}"/>')
    arcs = ''.join(f'<path d="M {cx-260+k*30} {cy-120-k*80} Q {cx} {cy-320-k*90} {cx+260-k*30} {cy-120-k*80}" fill="none" stroke="{TEAL}" stroke-width="2" opacity="{round(.45-k*.1,2)}"/>' for k in range(3))
    return ''.join(out) + arcs

def blocks(W, H, seed=3):
    random.seed(seed)
    out = []
    for k in range(14):
        x = random.randint(0, W); y = random.randint(int(H*.45), H)
        bw = random.randint(40, 150); bh = random.randint(60, int(H*.5))
        out.append(f'<rect x="{x}" y="{y-bh}" width="{bw}" height="{bh}" fill="#fff" opacity="{round(random.uniform(.04,.12),3)}" rx="4"/>')
    return ''.join(out)

def body_outline(W, H):
    cx, cy = W*.62, H*.55
    return (f'<g opacity=".5" fill="none" stroke="{TEAL}" stroke-width="2">'
            f'<ellipse cx="{cx}" cy="{cy-H*.2}" rx="{W*.07}" ry="{H*.11}"/>'
            f'<path d="M {cx-W*.11} {cy+H*.34} C {cx-W*.13} {cy-H*.04} {cx-W*.07} {cy-H*.07} {cx} {cy-H*.07} '
            f'C {cx+W*.07} {cy-H*.07} {cx+W*.13} {cy-H*.04} {cx+W*.11} {cy+H*.34}"/>'
            f'</g>')

SCENES = [
    # name, W, H, palette, glow xy, alt, motif builder
    ('hero.svg', 1600, 1000, (NAVY9, '#04186B', '#0B3AB0'), (.72, .3),
     'Abstract MRI scanner bore rendered in the brand gradient',
     lambda W, H: concentric(W, H, W*.72, H*.44, 20, W/40, TEAL, .55) + scanlines(W, H, 16, '#fff', .05) + body_outline(W, H)),
    ('scene-mri.svg', 1200, 1500, (NAVY9, '#052081', TEAL), (.5, .35),
     'MRI suite placeholder image',
     lambda W, H: concentric(W, H, W*.5, H*.42, 18, W/34, '#fff', .35) + scanlines(W, H, 18, TEAL, .12)),
    ('scene-ct.svg', 1400, 900, ('#04186B', NAVY, '#0B3AB0'), (.3, .6),
     'CT scanner placeholder image',
     lambda W, H: concentric(W, H, W*.34, H*.5, 12, W/26, TEAL, .5) + dotgrid(W, H, 30, 1.6)),
    ('scene-ekg.svg', 1400, 900, (NAVY9, '#00135A', '#062A9B'), (.5, .5),
     'Cardiac diagnostics placeholder image',
     lambda W, H: wave(W, H, H*.55, 90, 6) + wave(W, H, H*.78, 42, 9, '#fff', 1.4, .28) + scanlines(W, H, 22, '#fff', .06)),
    ('scene-ultrasound.svg', 1200, 1500, ('#04186B', NAVY, '#0A34A6'), (.5, .8),
     'Ultrasound study placeholder image',
     lambda W, H: cone(W, H, W*.5, H*.94, 40, 11) + dotgrid(W, H, 34, 1.4, TEAL, .2)),
    ('scene-mammo.svg', 1400, 900, (NAVY, '#0B3AB0', TEAL), (.7, .45),
     '3D mammography placeholder image',
     lambda W, H: dotgrid(W, H, 22, 2.2, '#fff', .22) + concentric(W, H, W*.68, H*.5, 9, W/22, '#fff', .3)),
    ('scene-xray.svg', 1400, 900, (NAVY9, '#031A6E', '#0B3AB0'), (.4, .4),
     'Digital X-ray placeholder image',
     lambda W, H: scanlines(W, H, 10, TEAL, .14) + blocks(W, H, 7)),
    ('scene-team.svg', 1400, 1000, ('#02114A', NAVY, '#0B3AB0'), (.55, .35),
     'Care team placeholder image',
     lambda W, H: blocks(W, H, 11) + dotgrid(W, H, 40, 2, TEAL, .18) + concentric(W, H, W*.2, H*.25, 8, W/30, TEAL, .3)),
    ('scene-lobby.svg', 1600, 900, ('#03165E', '#0B3AB0', TEAL), (.8, .25),
     'Reception and waiting area placeholder image',
     lambda W, H: blocks(W, H, 23) + scanlines(W, H, 26, '#fff', .07)),
    ('scene-tech.svg', 1200, 1200, (NAVY9, NAVY, '#0B3AB0'), (.6, .6),
     'Imaging technology placeholder image',
     lambda W, H: concentric(W, H, W*.5, H*.5, 22, W/44, TEAL, .45) + dotgrid(W, H, 28, 1.5)),
]

print('SVG asset kit →', os.path.normpath(OUT))
for i, (name, W, H, pal, g, alt, motif) in enumerate(SCENES):
    w(name, FRAME.format(W=W, H=H, i=i, c1=pal[0], c2=pal[1], c3=pal[2],
                         gx=g[0], gy=g[1], glow=TEAL, alt=alt, motif=motif(W, H)))

# ------------------------------------------------------------------- map art
def street_map(seed, W=900, H=700):
    random.seed(seed)
    roads = []
    for k in range(9):
        y = int(H * (k + .5) / 9) + random.randint(-14, 14)
        roads.append(f'<line x1="0" y1="{y}" x2="{W}" y2="{y}" stroke="#fff" stroke-width="{random.choice([2,2,3,6])}" opacity=".55"/>')
    for k in range(11):
        x = int(W * (k + .5) / 11) + random.randint(-12, 12)
        roads.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{H}" stroke="#fff" stroke-width="{random.choice([2,2,3,5])}" opacity=".45"/>')
    blocksv = ''.join(f'<rect x="{random.randint(0,W)}" y="{random.randint(0,H)}" width="{random.randint(24,70)}" height="{random.randint(20,60)}" fill="{NAVY}" opacity=".07" rx="2"/>' for _ in range(40))
    pin = f'''<g transform="translate({W*.5} {H*.46})">
      <circle r="46" fill="{TEAL}" opacity=".22"><animate attributeName="r" values="30;58;30" dur="3.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values=".35;0;.35" dur="3.4s" repeatCount="indefinite"/></circle>
      <path d="M0-34c-9.4 0-17 7.6-17 17 0 12.8 17 31 17 31s17-18.2 17-31c0-9.4-7.6-17-17-17z" fill="{NAVY}"/>
      <circle cy="-17" r="6.4" fill="{TEAL}"/></g>'''
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map placeholder">
  <rect width="{W}" height="{H}" fill="#E8EDF7"/>{blocksv}
  <rect width="{W}" height="{H}" fill="none"/>{''.join(roads)}
  <rect x="0" y="{H*.62}" width="{W}" height="{H*.09}" fill="{TEAL}" opacity=".18"/>{pin}
</svg>'''

w('map-1.svg', street_map(4))
w('map-2.svg', street_map(19))

# ------------------------------------------------------------- og / share art
w('og-cover.svg', FRAME.format(W=1200, H=630, i=99, c1=NAVY9, c2=NAVY, c3='#0B3AB0',
    gx=.75, gy=.3, glow=TEAL, alt='Best American Diagnostic',
    motif=concentric(1200, 630, 900, 300, 14, 30, TEAL, .5) + scanlines(1200, 630, 18, '#fff', .05)))
print('done.')
