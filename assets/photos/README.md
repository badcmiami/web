Real photography goes here.

Files dropped in this folder are picked up automatically by `python3 tools/build.py`:
any `<img data-photo="hero">` switches from the vector placeholder to
`assets/photos/hero.jpg` (or `.webp` / `.png`) as soon as that file exists.

Fill it with `python3 tools/fetch_photos.py` (Pexels, royalty-free) or by copying
in the center's own photography with the slot names listed in `photos.json`.
