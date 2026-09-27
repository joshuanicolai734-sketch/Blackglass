# Blackglass social kit and OG images

`KIT.md` has every caption, hook, CTA, destination, alt text, bio and the schedule. This folder renders the artwork.

```sh
cd social
npm install                  # Playwright, just for rendering (kept out of the website)
npx playwright install chromium
node render.mjs              # everything → exports/ and ../public/og/
node render.mjs p01-intro    # one asset, by id (see assets.mjs)
```

Video needs `ffmpeg` with libx264 on your PATH, or `FFMPEG=/path/to/ffmpeg node render.mjs`.

**Teaser:** the composition is `teaser.mjs` and the soundtrack is `teaser-sound.py` (numpy). Run `python3 teaser-sound.py` before rendering, and the renderer adds the sound, keeping a `-silent.mp4` copy too.
```sh
python3 teaser-sound.py && node render.mjs teaser-vertical teaser-landscape
```

- **Copy and layout:** `assets.mjs`. Each asset is HTML built from the real logo paths (`../content/brand.ts`), site fonts and app screens.
- **Design system:** `lib.mjs` (colours, facet pane, labels, lockup, button).
- **Video motion:** each video's `seek(t)` is a pure function of time, so renders are exact and repeatable.
- **After changing an OG image,** commit `public/og/*.png` with the site.
