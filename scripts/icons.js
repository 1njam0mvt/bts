'use strict';
/* Generates every favicon / app icon from ONE original mark (the ARMY Hub heart), in light and dark:
   favicon.ico (16/32/48), favicon.svg (switches light/dark by itself), PNGs 16-512 (incl. 36 and 296),
   apple-touch icons, Android/PWA icons (any + maskable), Windows tiles + browserconfig.xml,
   safari-pinned-tab.svg, logo.svg / logo-wordmark.svg and site.webmanifest. Run with `npm run icons`. */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUB = path.join(__dirname, '..', 'public');
const DARK_BG = '#0c0a12';
const LIGHT_BG = '#f5f3ff';
const THEME = { dark: { bg: DARK_BG, a: '#b79cff', b: '#ff4fd8', glow: '#7b46f0', glowOp: 0.55 },
                light: { bg: LIGHT_BG, a: '#7c4aed', b: '#d4249f', glow: '#c4b5fd', glowOp: 0.7 } };
const HEART = 'M12 21s-7-4.6-9.3-9A5.3 5.3 0 0 1 12 6.2 5.3 5.3 0 0 1 21.3 12C19 16.4 12 21 12 21z';

/* scale = how much of the canvas the heart fills, radius = corner radius of the tile (0 = full-bleed square) */
const logo = ({ size = 512, scale = 0.62, radius = 0.22, bg = true, theme = 'dark', id = 'k' }) => {
  const t = THEME[theme], s = size, hs = s * scale, off = (s - hs) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
<defs><linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.a}"/><stop offset="1" stop-color="${t.b}"/></linearGradient>
<radialGradient id="w${id}" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="${t.glow}" stop-opacity="${t.glowOp}"/><stop offset="1" stop-color="${t.glow}" stop-opacity="0"/></radialGradient></defs>
${bg ? `<rect width="${s}" height="${s}" rx="${s * radius}" fill="${t.bg}"/><rect width="${s}" height="${s}" rx="${s * radius}" fill="url(#w${id})"/>` : ''}
<g transform="translate(${off} ${off}) scale(${hs / 24})"><path d="${HEART}" fill="url(#g${id})"/></g>
</svg>`;
};

/* One SVG that follows the visitor's light/dark setting (modern browsers read prefers-color-scheme inside favicons). */
const adaptiveSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
<style>
  .bg{fill:${DARK_BG}} .glow{fill:${THEME.dark.glow};fill-opacity:${THEME.dark.glowOp}} .a{stop-color:${THEME.dark.a}} .b{stop-color:${THEME.dark.b}}
  @media (prefers-color-scheme: light){ .bg{fill:${LIGHT_BG}} .glow{fill:${THEME.light.glow};fill-opacity:${THEME.light.glowOp}} .a{stop-color:${THEME.light.a}} .b{stop-color:${THEME.light.b}} }
</style>
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop class="a" offset="0"/><stop class="b" offset="1"/></linearGradient>
<radialGradient id="w" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="m"><rect width="64" height="64" fill="url(#w)"/></mask></defs>
<rect class="bg" width="64" height="64" rx="14.08"/><rect class="glow" width="64" height="64" rx="14.08" mask="url(#m)"/>
<g transform="translate(12.16 12.16) scale(1.6533)"><path d="${HEART}" fill="url(#g)"/></g>
</svg>`;

/* Single-colour mark for Safari pinned tabs / mask-icon. */
const pinnedSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="${HEART}" transform="translate(0.8 0.9) scale(.6)" fill="#000"/></svg>`;

/* Horizontal logo: mark + "ARMY Hub". Text stays real text so it can be restyled; the font stack falls back to any bold sans. */
const wordmarkSvg = (theme) => {
  const t = THEME[theme], ink = theme === 'dark' ? '#f5f3ff' : '#1a1030';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="160" viewBox="0 0 560 160" role="img" aria-label="ARMY Hub">
<defs><linearGradient id="gw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.a}"/><stop offset="1" stop-color="${t.b}"/></linearGradient></defs>
<g transform="translate(14 14) scale(5.2)"><path d="${HEART}" fill="url(#gw)"/></g>
<text x="170" y="98" font-family="Unbounded, Manrope, 'Segoe UI', Arial, sans-serif" font-size="64" font-weight="800" fill="${ink}">ARMY <tspan fill="url(#gw)">Hub</tspan></text>
<text x="172" y="130" font-family="'IBM Plex Mono', Consolas, monospace" font-size="15" letter-spacing="4" fill="${ink}" fill-opacity=".6">UNOFFICIAL BTS FAN HUB</text>
</svg>`;
};

const png = (svg, px) => sharp(Buffer.from(svg), { density: 384 }).resize(px, px).png({ compressionLevel: 9 }).toBuffer();
const pngWide = (svg, w, h) => sharp(Buffer.from(svg), { density: 384 }).resize(w, h, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9 }).toBuffer();

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

const SIZES_ANY = [16, 32, 36, 48, 72, 96, 144, 192, 296, 384, 512];   // favicon-<n>.png and icon-<n>.png
const APPLE = [120, 152, 167, 180];                                      // iPhone, iPad, iPad Pro, iPhone @3x

(async () => {
  const w = (name, data) => fs.writeFileSync(path.join(PUB, name), data);
  const dark = logo({ theme: 'dark' }), light = logo({ theme: 'light', id: 'l' });

  // ---- vector ----
  w('favicon.svg', adaptiveSvg());
  w('logo.svg', logo({ size: 512, theme: 'dark' }));
  w('logo-light.svg', logo({ size: 512, theme: 'light', id: 'l' }));
  w('logo-wordmark.svg', wordmarkSvg('dark'));
  w('logo-wordmark-light.svg', wordmarkSvg('light'));
  w('safari-pinned-tab.svg', pinnedSvg());

  // ---- favicon.ico (16/32/48, dark tile: reads well on both light and dark tab strips) ----
  w('favicon.ico', ico(await Promise.all([16, 32, 48].map(async (px) => ({ px, buf: await png(dark, px) })))));

  // ---- PNG sets ----
  for (const px of SIZES_ANY) {
    w(`favicon-${px}.png`, await png(dark, px));
    if (px >= 192) w(`icon-${px}.png`, await png(dark, px));
  }
  // light/dark variants for <link rel="icon" media="(prefers-color-scheme: ...)">
  for (const px of [16, 32, 192]) {
    w(`favicon-dark-${px}.png`, await png(dark, px));
    w(`favicon-light-${px}.png`, await png(light, px));
  }
  // iOS rounds the corners itself and dislikes transparency: full-bleed square
  for (const px of APPLE) w(px === 180 ? 'apple-touch-icon.png' : `apple-touch-icon-${px}.png`, await png(logo({ scale: 0.6, radius: 0 }), px));
  // maskable: heart stays inside the central 60% "safe zone", background bleeds to the edges
  w('icon-maskable-192.png', await png(logo({ scale: 0.48, radius: 0 }), 192));
  w('icon-maskable-512.png', await png(logo({ scale: 0.48, radius: 0 }), 512));

  // ---- Windows tiles ----
  const tile = (px) => png(logo({ scale: 0.5, radius: 0 }), px);
  w('mstile-70.png', await tile(128));          // Windows asks for 128 for the "small" tile
  w('mstile-150.png', await tile(270));
  w('mstile-310.png', await tile(558));
  w('mstile-310x150.png', await pngWide(logo({ size: 310, scale: 0.5, radius: 0 }), 558, 270));
  w('browserconfig.xml', `<?xml version="1.0" encoding="utf-8"?>
<browserconfig><msapplication><tile>
<square70x70logo src="/mstile-70.png"/><square150x150logo src="/mstile-150.png"/><wide310x150logo src="/mstile-310x150.png"/><square310x310logo src="/mstile-310.png"/>
<TileColor>${DARK_BG}</TileColor></tile></msapplication></browserconfig>
`);

  // ---- social share fallback (square) ----
  w('logo-512.png', await png(dark, 512));

  // ---- manifest ----
  const icon = (src, sizes, purpose = 'any') => ({ src, sizes, type: 'image/png', purpose });
  w('site.webmanifest', JSON.stringify({
    id: '/', name: 'ARMY Hub: BTS ARMY Fan Hub', short_name: 'ARMY Hub',
    description: 'Unofficial BTS fan site for ARMY: members, albums, photos, videos, tour safety and fan letters.',
    lang: 'en', dir: 'ltr', start_url: '/?source=pwa', scope: '/', display: 'standalone', display_override: ['standalone', 'minimal-ui', 'browser'],
    orientation: 'any', background_color: DARK_BG, theme_color: DARK_BG, categories: ['music', 'entertainment', 'social'],
    icons: [
      icon('/favicon-36.png', '36x36'), icon('/favicon-48.png', '48x48'), icon('/favicon-72.png', '72x72'), icon('/favicon-96.png', '96x96'),
      icon('/favicon-144.png', '144x144'), icon('/icon-192.png', '192x192'), icon('/favicon-296.png', '296x296'), icon('/icon-384.png', '384x384'),
      icon('/icon-512.png', '512x512'),
      icon('/icon-maskable-192.png', '192x192', 'maskable'), icon('/icon-maskable-512.png', '512x512', 'maskable')
    ],
    shortcuts: [
      { name: 'BTS members', short_name: 'Members', url: '/#members', icons: [icon('/favicon-96.png', '96x96')] },
      { name: 'Albums', short_name: 'Albums', url: '/#music', icons: [icon('/favicon-96.png', '96x96')] },
      { name: 'Tour safety', short_name: 'Tour', url: '/tour', icons: [icon('/favicon-96.png', '96x96')] },
      { name: 'What is BTS ARMY?', short_name: 'ARMY', url: '/what-is-bts-army', icons: [icon('/favicon-96.png', '96x96')] }
    ]
  }, null, 2));
  console.log('Icons written to public/');
})();
