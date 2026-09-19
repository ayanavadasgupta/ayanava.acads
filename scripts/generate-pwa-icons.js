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

  // 4. Maskable 192x192 icon (safe zone inside dark #141414 background)
  const inner192 = Math.round(192 * 0.76); // ~146px
  const inner192Buffer = await sharp(svgBuffer).resize(inner192, inner192).png().toBuffer();
  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 20, g: 20, b: 20, alpha: 1 }
    }
  })
  .composite([{
    input: inner192Buffer,
    top: Math.round((192 - inner192) / 2),
    left: Math.round((192 - inner192) / 2)
  }])
  .png()
  .toFile(path.join(rootDir, 'assets', 'icon-maskable-192.png'));
  console.log('Created icon-maskable-192.png');

  // 5. Maskable 512x512 icon: 80% safe zone inside a dark #141414 background
  const innerSize = Math.round(512 * 0.76); // ~389px
  const innerBuffer = await sharp(svgBuffer).resize(innerSize, innerSize).png().toBuffer();
  
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 20, g: 20, b: 20, alpha: 1 }
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

  // 6. Mobile & Desktop PWA Rich Preview Screenshots
  const mobileSvg = `
  <svg width="540" height="960" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#141414"/>
    <rect x="20" y="30" width="500" height="70" rx="4" fill="#1e1e1e" stroke="#333" stroke-width="1"/>
    <text x="45" y="73" fill="#f1f1f1" font-family="sans-serif" font-size="20" font-weight="bold">Ayanava Dasgupta</text>
    <rect x="20" y="120" width="500" height="380" rx="6" fill="#1b1b1b" stroke="#333" stroke-width="1"/>
    <text x="45" y="170" fill="#f1f1f1" font-family="serif" font-size="24" font-weight="bold">Quantum Information Theory</text>
    <text x="45" y="210" fill="#8db9ff" font-family="sans-serif" font-size="16">Senior Research Fellow · ISI Kolkata</text>
    <text x="45" y="250" fill="#b0b0b0" font-family="sans-serif" font-size="14">TCS Research Scholar · Classical–Quantum Networks</text>
    <text x="45" y="290" fill="#b0b0b0" font-family="sans-serif" font-size="14">Hypothesis Testing · Quantum Learning</text>
    <rect x="20" y="520" width="500" height="180" rx="6" fill="#1e1e1e" stroke="#333" stroke-width="1"/>
    <text x="45" y="565" fill="#f1f1f1" font-family="sans-serif" font-size="18" font-weight="bold">Recent Publications</text>
    <text x="45" y="605" fill="#8db9ff" font-family="sans-serif" font-size="14">IEEE Transactions on Information Theory (2025)</text>
    <text x="45" y="635" fill="#b0b0b0" font-family="sans-serif" font-size="13">Intersection and union of subspaces in CQ channels</text>
  </svg>
  `;
  await sharp(Buffer.from(mobileSvg))
    .png()
    .toFile(path.join(rootDir, 'assets', 'screenshot-mobile.png'));
  console.log('Created screenshot-mobile.png');

  const desktopSvg = `
  <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#141414"/>
    <rect x="60" y="40" width="1160" height="80" rx="4" fill="#1e1e1e" stroke="#333" stroke-width="1"/>
    <text x="100" y="90" fill="#f1f1f1" font-family="sans-serif" font-size="24" font-weight="bold">Ayanava Dasgupta | Quantum Information Researcher</text>
    <rect x="60" y="150" width="700" height="480" rx="6" fill="#1b1b1b" stroke="#333" stroke-width="1"/>
    <text x="100" y="210" fill="#f1f1f1" font-family="serif" font-size="32" font-weight="bold">Ayanava Dasgupta</text>
    <text x="100" y="250" fill="#8db9ff" font-family="sans-serif" font-size="18">Senior Research Fellow · Indian Statistical Institute, Kolkata</text>
    <text x="100" y="300" fill="#b0b0b0" font-family="sans-serif" font-size="16">Recipient of the TCS Research Fellowship</text>
    <rect x="790" y="150" width="430" height="480" rx="6" fill="#1e1e1e" stroke="#333" stroke-width="1"/>
    <text x="820" y="210" fill="#f1f1f1" font-family="sans-serif" font-size="20" font-weight="bold">Research Disciplines</text>
    <text x="820" y="255" fill="#8db9ff" font-family="sans-serif" font-size="15">• Quantum Statistical Inference</text>
    <text x="820" y="295" fill="#8db9ff" font-family="sans-serif" font-size="15">• Quantum Differential Privacy</text>
    <text x="820" y="335" fill="#8db9ff" font-family="sans-serif" font-size="15">• Quantum Learning Theory</text>
  </svg>
  `;
  await sharp(Buffer.from(desktopSvg))
    .png()
    .toFile(path.join(rootDir, 'assets', 'screenshot-desktop.png'));
  console.log('Created screenshot-desktop.png');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
