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

**Teaser:** the composition is `teaser-hype.mjs` plus `teaser-hype.client.js` (60 fps, 150 BPM), and the soundtrack is `teaser-hype-sound.py` (numpy). Run the sound script before rendering, and the renderer adds the sound, keeping a `-silent.mp4` copy too. The earlier cinematic cut is still available as `teaser-cinematic-*` (`teaser.mjs`, `teaser-sound.py`).
```sh
python3 teaser-hype-sound.py && node render.mjs teaser-vertical teaser-landscape
```
The exports are high-bitrate masters for uploading to social platforms. The website uses lighter encodes (CRF 30, which looks the same at about a third of the size):
```sh
for s in 1920x1080:landscape 1080x1920:vertical; do
  ffmpeg -y -i exports/video/blackglass-teaser-${s%%:*}.mp4 -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p \
    -c:a aac -b:a 160k -movflags +faststart ../public/media/teaser-${s##*:}.mp4
done
```

- **Copy and layout:** `assets.mjs`. Each asset is HTML built from the real logo paths (`../content/brand.ts`), site fonts and app screens.
- **Design system:** `lib.mjs` (colours, facet pane, labels, lockup, button).
- **Video motion:** each video's `seek(t)` is a pure function of time, so renders are exact and repeatable.
- **After changing an OG image,** commit `public/og/*.png` with the site.
