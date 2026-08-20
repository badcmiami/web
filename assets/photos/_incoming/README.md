Drop hand-downloaded photography here — Envato Elements, another paid library,
or the center's own shoot — named after its slot:

  hero.jpg  lobby.jpg  tech.jpg  mri.jpg  ct.jpg  mammography.jpg
  ultrasound.jpg  xray.jpg  cardiac.jpg  team.jpg

Then run:

  python3 tools/fetch_photos.py --local
  python3 tools/build.py

Each file is cropped to the aspect its layout expects and written out as JPEG
and WebP at 480 / 960 / 1440 / 1920 / 2560 px. Originals stay in _masters/ and
are never published.
