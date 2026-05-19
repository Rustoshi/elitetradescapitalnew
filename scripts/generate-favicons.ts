import sharp from "sharp";
import path from "path";
import fs from "fs";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const LOGO_PATH = path.join(PUBLIC_DIR, "logo.png");

async function generateFavicons() {
  console.log("Generating favicons from logo.png...");

  const logo = sharp(LOGO_PATH);
  const metadata = await logo.metadata();
  console.log(`Source logo: ${metadata.width}x${metadata.height}`);

  // Determine the square crop (center crop to the smaller dimension)
  const size = Math.min(metadata.width!, metadata.height!);
  const left = Math.floor((metadata.width! - size) / 2);
  const top = Math.floor((metadata.height! - size) / 2);

  const squareLogo = sharp(LOGO_PATH).extract({
    left,
    top,
    width: size,
    height: size,
  });

  // Save the square version for reference
  const squareBuffer = await squareLogo.toBuffer();

  // Generate PNG favicons at various sizes
  const sizes = [
    { name: "favicon-16x16.png", size: 16 },
    { name: "favicon-32x32.png", size: 32 },
    { name: "apple-icon.png", size: 180 },
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
  ];

  for (const { name, size } of sizes) {
    await sharp(squareBuffer)
      .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(PUBLIC_DIR, name));
    console.log(`  ✓ ${name} (${size}x${size})`);
  }

  // Generate favicon.ico (using 32x32 PNG converted to ICO format)
  // Sharp doesn't support ICO natively, so we'll create a minimal ICO file
  const ico16 = await sharp(squareBuffer)
    .resize(16, 16, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  const ico32 = await sharp(squareBuffer)
    .resize(32, 32, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  const ico48 = await sharp(squareBuffer)
    .resize(48, 48, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  const icoBuffer = createIco([ico16, ico32, ico48]);
  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon.ico"), icoBuffer);
  console.log("  ✓ favicon.ico (16x16, 32x32, 48x48)");

  console.log("\nDone! All favicons generated.");
}

function createIco(pngBuffers: Buffer[]): Buffer {
  const headerSize = 6;
  const dirEntrySize = 16;
  const numImages = pngBuffers.length;

  let offset = headerSize + dirEntrySize * numImages;
  const dirEntries: Buffer[] = [];
  const sizes = [16, 32, 48];

  for (let i = 0; i < numImages; i++) {
    const entry = Buffer.alloc(dirEntrySize);
    const s = sizes[i];
    entry.writeUInt8(s < 256 ? s : 0, 0); // width
    entry.writeUInt8(s < 256 ? s : 0, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(pngBuffers[i].length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset
    dirEntries.push(entry);
    offset += pngBuffers[i].length;
  }

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(numImages, 4); // number of images

  return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

generateFavicons().catch(console.error);
