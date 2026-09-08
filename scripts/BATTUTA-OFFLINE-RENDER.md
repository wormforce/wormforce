# Battuta offline turntable

Approved material proof: `public/battuta/community/hero/offline-proof/`.
Renderer: Blender 4.5.10 LTS, Cycles, Metal when available.

## Render

```sh
/Volumes/Blender/Blender.app/Contents/MacOS/Blender -b \
  --python scripts/render-battuta-turntable.py -- \
  --output "$PWD/public/battuta/community/hero/offline-proof" \
  --indices all --frames 72 --samples 512 --size 900 --resume
```

- 72 distinct camera angles, 5° spacing, fixed 51.4° elevation.
- Start azimuth −45.4°, Three-style roll −24° (Blender camera-local roll +24°).
- 512 maximum samples; adaptive threshold 0.006; OpenImageDenoise using color,
  albedo and normal information. Actual inner-wall geometry is retained.
- `--resume` skips decodable PNGs with the expected dimensions. **Only resume
  into an output directory produced with identical material, light and camera
  parameters**; use a new directory if those change.
- Persistent scene data saves preparation work without reducing samples.

## Verify and package

```sh
node scripts/package-battuta-turntable.mjs --wait
```

The packager waits for all 72 fully decodable RGBA 900×900 frames, then writes
lossless WebP assets, a completion manifest and an eight-angle contact sheet to
`public/battuta/community/hero/offline-turntable/`. Original PNGs are preserved.
Without `--wait`, incomplete input fails immediately. A waiting run times out
after three hours; it does not resume or launch Blender itself.

Preview: `/battuta/community/hero/offline-turntable/index.html`.
The preview loads every angle before enabling rotation; no realtime renderer or
quality fallback is involved. PNG and WebP transparency is retained. The
product hero is not replaced by these scripts.

This preview holds all decoded angles for dependable scrubbing. At full RGBA
resolution the raw pixel total is approximately 223 MiB; production integration
should consider a mobile-sized sequence or a bounded decoded-frame cache.

Source model attribution and license remain in the parent hero directory.
