'use strict';
/* Generates original abstract artwork (SVG strings). Used only for the seed placeholders so the
   site has real image files from day one. Replace them with your own images in /admin. */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function art({ hue = 270, label = '', sub = '', w = 800, h = 800, variant = 0 }) {
  const h2 = (hue + 50) % 360;
  let shapes = '';
  const v = variant % 3;
  if (v === 0) {
    for (let i = 1; i <= 6; i++)
      shapes += `<circle cx="${w * 0.68}" cy="${h * 0.36}" r="${i * Math.min(w, h) * 0.09}" fill="none" stroke="hsl(${hue} 100% 75%)" stroke-opacity="${(0.5 - i * 0.06).toFixed(2)}" stroke-width="2"/>`;
  } else if (v === 1) {
    for (let i = 0; i < 70; i++) {
      const x = (((i * 97) % 100) / 100) * w;
      const y = h * 0.55 + (((i * 53) % 45) / 100) * h;
      shapes += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${3 + (i % 4) * 2}" fill="hsl(${hue + (i % 3) * 20} 100% 72%)" fill-opacity="${(0.35 + (i % 5) * 0.12).toFixed(2)}"/>`;
    }
  } else {
    for (let i = 0; i < 5; i++)
      shapes += `<polygon points="${w * (0.1 + i * 0.2)},0 ${w * (0.18 + i * 0.2)},0 ${w * (0.5 + i * 0.12)},${h} ${w * (0.38 + i * 0.12)},${h}" fill="hsl(${hue} 100% 70%)" fill-opacity="${(0.06 + i * 0.02).toFixed(2)}"/>`;
  }
  const fs = Math.round(Math.min(w, h) * 0.075);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 65% 24%)"/><stop offset="1" stop-color="hsl(${h2} 80% 7%)"/></linearGradient>
<radialGradient id="r" cx=".7" cy=".3" r=".65"><stop offset="0" stop-color="hsl(${hue} 100% 66%)" stop-opacity=".85"/><stop offset="1" stop-color="hsl(${hue} 100% 66%)" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" fill="url(#r)"/>${shapes}
<text x="${w * 0.06}" y="${h * 0.9}" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="${fs}" fill="#fff" fill-opacity=".92">${esc(label)}</text>
<text x="${w * 0.06}" y="${h * 0.9 + fs * 0.95}" font-family="DejaVu Sans, Arial, sans-serif" font-size="${Math.round(fs * 0.48)}" fill="#fff" fill-opacity=".6" letter-spacing="3">${esc(sub)}</text>
</svg>`;
}

module.exports = { art };
