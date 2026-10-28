'use strict';
/* Generates every favicon/app icon from one logo: favicon.ico (16/32/48), favicon.svg, apple-touch-icon,
   Android/PWA icons (192, 512, maskable 512) and site.webmanifest. Run with `npm run icons`. */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUB = path.join(__dirname, '..', 'public');
const BG = '#0c0a12';

/* heart: scale = how much of the canvas the heart occupies, radius = corner radius of the tile */
const logo = ({ size = 512, scale = 0.62, radius = 0.22, bg = true }) => {
  const s = size, hs = s * scale, off = (s - hs) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b79cff"/><stop offset="1" stop-color="#ff4fd8"/></linearGradient>
<radialGradient id="glow" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#7b46f0" stop-opacity=".55"/><stop offset="1" stop-color="#7b46f0" stop-opacity="0"/></radialGradient></defs>
${bg ? `<rect width="${s}" height="${s}" rx="${s * radius}" fill="${BG}"/><rect width="${s}" height="${s}" rx="${s * radius}" fill="url(#glow)"/>` : ''}
<g transform="translate(${off} ${off}) scale(${hs / 24})"><path d="M12 21s-7-4.6-9.3-9A5.3 5.3 0 0 1 12 6.2 5.3 5.3 0 0 1 21.3 12C19 16.4 12 21 12 21z" fill="url(#g)"/></g>
</svg>`;
};
const png = (svg, px) => sharp(Buffer.from(svg)).resize(px, px).png({ compressionLevel: 9 }).toBuffer();

function ico(pngs) {
  const n = pngs.length, head = Buffer.alloc(6 + n * 16);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(n, 4);
  let offset = head.length;
  pngs.forEach(({ px, buf }, i) => {
    const o = 6 + i * 16;
    head[o] = px >= 256 ? 0 : px; head[o + 1] = px >= 256 ? 0 : px; head[o + 2] = 0; head[o + 3] = 0;
    head.writeUInt16LE(1, o + 4); head.writeUInt16LE(32, o + 6);
    head.writeUInt32LE(buf.length, o + 8); head.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([head, ...pngs.map((p) => p.buf)]);
}

(async () => {
  const rounded = logo({ scale: 0.62, radius: 0.22 });
  fs.writeFileSync(path.join(PUB, 'favicon.svg'), logo({ size: 64, scale: 0.62, radius: 0.22 }));
  const sizes = [16, 32, 48];
  fs.writeFileSync(path.join(PUB, 'favicon.ico'), ico(await Promise.all(sizes.map(async (px) => ({ px, buf: await png(rounded, px) })))));
  fs.writeFileSync(path.join(PUB, 'favicon-32.png'), await png(rounded, 32));
  // iOS rounds the corners itself and dislikes transparency: full-bleed square
  fs.writeFileSync(path.join(PUB, 'apple-touch-icon.png'), await png(logo({ scale: 0.6, radius: 0 }), 180));
  fs.writeFileSync(path.join(PUB, 'icon-192.png'), await png(rounded, 192));
  fs.writeFileSync(path.join(PUB, 'icon-512.png'), await png(rounded, 512));
  // maskable: heart stays inside the central 60% "safe zone", background bleeds to the edges
  fs.writeFileSync(path.join(PUB, 'icon-maskable-512.png'), await png(logo({ scale: 0.48, radius: 0 }), 512));
  fs.writeFileSync(path.join(PUB, 'logo.svg'), logo({ size: 512 }));
  fs.writeFileSync(path.join(PUB, 'site.webmanifest'), JSON.stringify({
    name: 'ARMY Hub', short_name: 'ARMY Hub', description: 'Unofficial BTS fan site: albums, photos, videos and fan letters.',
    start_url: '/', scope: '/', display: 'standalone', background_color: BG, theme_color: BG,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }, null, 2));
  console.log('Icons written to public/');
})();
