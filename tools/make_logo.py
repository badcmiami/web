#!/usr/bin/env python3
"""Rebuilds the Best American Diagnostic Center logo as vector SVG.

Traced from the brand artwork supplied by the client: the navy "b" whose bowl is
a Tahoe Green disc, holding a scanner gantry (ring) and patient table. Produces
the mark on light and dark backgrounds, a favicon and a full stacked lockup.
"""
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')
NAVY, TEAL = '#001C77', '#00C6C1'


def mark(navy=NAVY, teal=TEAL, paper='#FFFFFF', pad=True):
    """The icon: b + disc + gantry + table. viewBox 0 0 430 470."""
    return f'''  <circle cx="270" cy="272" r="120" fill="{teal}"/>
  <path d="M151 138 V300 Q151 387 238 387 H266" fill="none" stroke="{navy}"
        stroke-width="67" stroke-linecap="round"/>
  <circle cx="258" cy="266" r="58" fill="none" stroke="{paper}" stroke-width="36"/>
  <circle cx="258" cy="266" r="58" fill="none" stroke="{navy}" stroke-width="23"/>
  <path d="M224 288 H292 L332 386 A10 10 0 0 1 322 399 H194 A10 10 0 0 1 184 386 Z"
        fill="{navy}" stroke="{paper}" stroke-width="13" stroke-linejoin="round"/>'''


def mono(colour='#FFFFFF'):
    """Single-colour version. The shapes stay identical; the white separations of
    the original become transparent gaps via a mask, so it sits on any dark
    background without recolouring or reshaping the artwork."""
    return f'''  <defs>
    <mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="430" height="470">
      <rect width="430" height="470" fill="#000"/>
      <circle cx="270" cy="272" r="120" fill="#fff"/>
      <path d="M151 138 V300 Q151 387 238 387 H266" fill="none" stroke="#fff"
            stroke-width="67" stroke-linecap="round"/>
      <circle cx="258" cy="266" r="58" fill="none" stroke="#000" stroke-width="36"/>
      <circle cx="258" cy="266" r="58" fill="none" stroke="#fff" stroke-width="23"/>
      <path d="M224 288 H292 L332 386 A10 10 0 0 1 322 399 H194 A10 10 0 0 1 184 386 Z"
            fill="#fff" stroke="#000" stroke-width="13" stroke-linejoin="round"/>
    </mask>
  </defs>
  <rect width="430" height="470" fill="{colour}" mask="url(#m)"/>'''


def svg(body, w=430, h=470, title='Best American Diagnostic Center'):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'role="img" aria-label="{title}">\n{body}\n</svg>\n')


def write(name, content):
    with open(os.path.join(OUT, name), 'w') as f:
        f.write(content)
    print('  ·', name)


# --- icon, light and dark backgrounds --------------------------------------
write('logo-mark.svg', svg(mark()))
write('logo-mark-white.svg', svg(mono()))
write('favicon.svg', svg('  <rect width="430" height="470" fill="#FFFFFF" rx="0"/>\n' + mark()))

# --- full stacked lockup (mark + wordmark) ---------------------------------
FONT = "Inter Tight, Inter, Helvetica Neue, Arial, sans-serif"


def lockup(navy=NAVY, teal=TEAL, paper='#FFFFFF'):
    return f'''  <g transform="translate(20 30)">
{mark(navy, teal, paper)}
  </g>
  <g font-family="{FONT}" font-weight="700" letter-spacing="-1">
    <text x="500" y="205" font-size="96" fill="{navy}">BEST</text>
    <text x="500" y="305" font-size="96" fill="{navy}">AMERICAN</text>
    <text x="500" y="405" font-size="96" fill="{navy}">DIAGNOSTIC</text>
    <text x="1122" y="497" font-size="86" font-weight="500" fill="{teal}" text-anchor="end">Center</text>
  </g>'''


write('logo-lockup.svg', svg(lockup(), w=1160, h=540))
write('logo-lockup-white.svg', svg(f'''  <g transform="translate(20 30)">
{mono()}
  </g>
  <g font-family="{FONT}" font-weight="700" letter-spacing="-1" fill="#FFFFFF">
    <text x="500" y="205" font-size="96">BEST</text>
    <text x="500" y="305" font-size="96">AMERICAN</text>
    <text x="500" y="405" font-size="96">DIAGNOSTIC</text>
    <text x="1122" y="497" font-size="86" font-weight="500" text-anchor="end">Center</text>
  </g>''', w=1160, h=540))

# --- social share card ------------------------------------------------------
write('og-cover.svg', svg(
    f'''  <rect width="1200" height="630" fill="#000B33"/>
  <circle cx="1010" cy="150" r="300" fill="{TEAL}" opacity=".14"/>
  <circle cx="1010" cy="150" r="200" fill="{TEAL}" opacity=".10"/>
  <g transform="translate(88 96) scale(0.62)">
{mono()}
  </g>
  <g font-family="{FONT}" fill="#FFFFFF" letter-spacing="-2">
    <text x="88" y="430" font-size="72" font-weight="700">Best American Diagnostic</text>
    <text x="88" y="510" font-size="72" font-weight="700" fill="{TEAL}">Center</text>
    <text x="92" y="570" font-size="28" font-weight="500" fill="#9FADDF" letter-spacing="3">
      MRI · CT · 3D MAMMOGRAPHY · ULTRASOUND · HIALEAH, FL</text>
  </g>''', w=1200, h=630))
print('logo kit rebuilt')
