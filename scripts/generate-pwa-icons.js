import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const svgPath = path.join(rootDir, 'assets', 'ad-logo.svg');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  // 1. 192x192 icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(rootDir, 'assets', 'icon-192.png'));
  console.log('Created icon-192.png');

  // 2. 512x512 icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(rootDir, 'assets', 'icon-512.png'));
  console.log('Created icon-512.png');

  // 3. Apple touch icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(rootDir, 'assets', 'apple-touch-icon.png'));
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(rootDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 4. Maskable 512x512 icon: 80% safe zone inside a dark #111111 background
  const innerSize = Math.round(512 * 0.76); // ~389px
  const innerBuffer = await sharp(svgBuffer).resize(innerSize, innerSize).png().toBuffer();
  
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 17, g: 17, b: 17, alpha: 1 }
    }
  })
  .composite([{
    input: innerBuffer,
    top: Math.round((512 - innerSize) / 2),
    left: Math.round((512 - innerSize) / 2)
  }])
  .png()
  .toFile(path.join(rootDir, 'assets', 'icon-maskable-512.png'));
  console.log('Created icon-maskable-512.png');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
