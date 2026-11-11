// Creates the PNG app icons in public/icons/ from public/favicon.svg.
// Run once (and again if you change the logo): node scripts/make-icons.mjs
import { chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';

const svg = await readFile('public/favicon.svg');
const source = `data:image/svg+xml;base64,${svg.toString('base64')}`;

// `padding` leaves a safe border for phones that cut icons into circles ("maskable" icons).
const ICONS = [
  { file: 'icon-192.png', size: 192, padding: 0 },
  { file: 'icon-512.png', size: 512, padding: 0 },
  { file: 'icon-maskable-512.png', size: 512, padding: 0.2 },
  { file: 'apple-touch-icon.png', size: 180, padding: 0.1 },
];

await mkdir('public/icons', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();

for (const { file, size, padding } of ICONS) {
  const inner = Math.round(size * (1 - padding));
  const background = padding ? '#e0662a' : 'transparent';
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<body style="margin:0;width:${size}px;height:${size}px;display:grid;place-items:center;background:${background}">
       <img src="${source}" width="${inner}" height="${inner}">
     </body>`,
  );
  await page.screenshot({ path: `public/icons/${file}`, omitBackground: !padding });
  console.log(`✓ public/icons/${file}`);
}

await browser.close();
