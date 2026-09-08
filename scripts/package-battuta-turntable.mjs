import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(repo, 'public/battuta/community/hero/offline-proof');
const destination = path.join(repo, 'public/battuta/community/hero/offline-turntable');
const count = 72;
const names = Array.from({ length: count }, (_, i) => `frame-${String(i).padStart(3, '0')}`);
const deadline = Date.now() + 3 * 60 * 60 * 1000;
let lastCount = -1;
while (true) {
  const available = await Promise.all(names.map(async name => {
    try {
      const image = sharp(path.join(source, `${name}.png`));
      const metadata = await image.metadata();
      if (metadata.width !== 900 || metadata.height !== 900 || !metadata.hasAlpha) return false;
      await image.stats(); // Decode the entire frame, not just its PNG header.
      return true;
    } catch { return false; }
  }));
  const ready = available.filter(Boolean).length;
  if (ready !== lastCount) { console.log(`Verified ${ready}/${count} frames`); lastCount = ready; }
  if (ready === count) break;
  if (!process.argv.includes('--wait') || Date.now() > deadline) throw new Error('Turntable is incomplete');
  await new Promise(resolve => setTimeout(resolve, 15000));
}
await mkdir(destination, { recursive: true });
let bytes = 0;
for (const name of names) {
  const output = path.join(destination, `${name}.webp`);
  await sharp(path.join(source, `${name}.png`)).webp({ lossless: true, effort: 6 }).toFile(output);
  bytes += (await stat(output)).size;
}
const settings = JSON.parse(await readFile(path.join(source, 'render-settings.json'), 'utf8'));
await writeFile(path.join(destination, 'manifest.json'), JSON.stringify({
  ...settings, complete: true, frameCount: count, degreesPerFrame: 5,
  format: 'lossless WebP', bytes, frames: names.map(name => `${name}.webp`),
}, null, 2) + '\n');
const selected = [0, 9, 18, 27, 36, 45, 54, 63];
const tiles = await Promise.all(selected.map(async (index, i) => ({
  input: await sharp(path.join(source, `${names[index]}.png`)).resize(320, 320).flatten({ background: '#000' }).png().toBuffer(),
  left: (i % 4) * 320, top: Math.floor(i / 4) * 320,
})));
await sharp({ create: { width: 1280, height: 640, channels: 3, background: '#000' } }).composite(tiles).png().toFile(path.join(destination, 'contact-sheet.png'));
console.log(`COMPLETE: ${count} fully decoded frames, ${(bytes / 1024 / 1024).toFixed(1)} MiB lossless WebP`);
