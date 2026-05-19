import sharp from '../node_modules/sharp/lib/index.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const logoPath = path.join(publicDir, 'logo.png');

// Build a minimal ICO file from one or more raw RGBA buffers + sizes
function buildIco(entries) {
  // entries: [{ width, height, buffer }] where buffer is raw RGBA
  const HEADER_SIZE = 6;
  const DIR_ENTRY_SIZE = 16;
  const headerAndDir = HEADER_SIZE + DIR_ENTRY_SIZE * entries.length;

  // Encode each image as PNG inside the ICO
  const pngBuffers = entries.map((e) => e.buffer); // already PNG buffers

  let offset = headerAndDir;
  const offsets = pngBuffers.map((buf) => {
    const o = offset;
    offset += buf.length;
    return o;
  });

  const totalSize = offset;
  const ico = Buffer.alloc(totalSize);

  // ICO header
  ico.writeUInt16LE(0, 0); // reserved
  ico.writeUInt16LE(1, 2); // type: 1 = ICO
  ico.writeUInt16LE(entries.length, 4); // count

  // Directory entries
  entries.forEach((e, i) => {
    const base = HEADER_SIZE + i * DIR_ENTRY_SIZE;
    ico.writeUInt8(e.width >= 256 ? 0 : e.width, base);      // width (0 = 256)
    ico.writeUInt8(e.height >= 256 ? 0 : e.height, base + 1); // height (0 = 256)
    ico.writeUInt8(0, base + 2);  // color count (0 = no palette)
    ico.writeUInt8(0, base + 3);  // reserved
    ico.writeUInt16LE(1, base + 4); // color planes
    ico.writeUInt16LE(32, base + 6); // bits per pixel
    ico.writeUInt32LE(pngBuffers[i].length, base + 8); // image data size
    ico.writeUInt32LE(offsets[i], base + 12); // offset to image data
  });

  // Image data
  pngBuffers.forEach((buf, i) => {
    buf.copy(ico, offsets[i]);
  });

  return ico;
}

async function run() {
  console.log('Reading logo.png…');

  // ── PNG icons ──────────────────────────────────────────────────────────────

  // apple-icon.png  180×180
  await sharp(logoPath).resize(180, 180).png().toFile(path.join(publicDir, 'apple-icon.png'));
  console.log('✓ apple-icon.png  (180×180)');

  // icon-192.png  192×192
  await sharp(logoPath).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✓ icon-192.png    (192×192)');

  // icon-512.png  512×512
  await sharp(logoPath).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✓ icon-512.png    (512×512)');

  // og-image.png  1200×630 — logo centered on dark background
  const { background_color } = { background_color: '#0f172a' }; // from manifest
  const logoResized = await sharp(logoPath).resize(400, 400).png().toBuffer();
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: background_color,
    },
  })
    .composite([{ input: logoResized, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('✓ og-image.png    (1200×630)');

  // ── favicon.ico  (16, 32, 48) ──────────────────────────────────────────────
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map((s) => sharp(logoPath).resize(s, s).png().toBuffer())
  );
  const entries = sizes.map((s, i) => ({ width: s, height: s, buffer: pngBuffers[i] }));
  const icoBuffer = buildIco(entries);
  writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✓ favicon.ico     (16, 32, 48)');

  console.log('\nAll icon assets regenerated successfully.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
