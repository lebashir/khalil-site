// One-shot: rasterize public/icon.svg into the PNG sizes iOS / Android need.
// Run once with `pnpm icons` (or `node scripts/gen-icons.mjs`).
// Commits the generated PNGs so the rest of the team doesn't need sharp installed.

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, '..', 'public');

const sources = [
  { out: 'apple-touch-icon.png', size: 180 },
  { out: 'icon-192.png',          size: 192 },
  { out: 'icon-512.png',          size: 512 },
  { out: 'icon-maskable-512.png', size: 512, padding: 0.1 }
];

const svgBuf = await readFile(resolve(publicDir, 'icon.svg'));

for (const { out, size, padding = 0 } of sources) {
  const inner = Math.round(size * (1 - padding * 2));
  const offset = Math.round((size - inner) / 2);
  const rendered = await sharp(svgBuf).resize(inner, inner).png().toBuffer();
  const composed = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 26, g: 10, b: 58, alpha: 1 }
    }
  })
    .composite([{ input: rendered, top: offset, left: offset }])
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(resolve(publicDir, out), composed);
  console.log(`✓ ${out} (${size}×${size})`);
}

console.log('Done. Commit the generated PNGs.');
