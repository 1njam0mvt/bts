'use strict';
/* SEO / icons / manifest checks. Renders the real pages and reads the real files; no network. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const seo = require('../lib/seo');
const seoViews = require('../views/seo');
const { layout } = require('../views/layout');

const PUB = path.join(__dirname, '..', 'public');
const seed = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'seed.json'), 'utf8'));
const ctx = { s: seed.settings, albums: seed.albums || [], base: 'https://example.test', asset: (p) => p, q: '' };
const db = { settings: seed.settings, albums: seed.albums || [] };

const ld = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1].replace(/\\u003c/g, '<')));

for (const key of ['army', 'india', 'usa']) {
  test(`guide page ${key}: title, description, canonical, JSON-LD, FAQ matches schema`, () => {
    const g = seo.PAGES[key];
    const page = seoViews[key](ctx, db);
    const html = layout(ctx, page);
    assert.ok(page.title.length <= 65, `title too long: ${page.title.length}`);
    assert.ok(page.description.length >= 80 && page.description.length <= 170, `description length ${page.description.length}`);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://example.test${g.path}">`));
    const types = ld(html).map((o) => o['@type']);
    assert.deepEqual(types.sort(), ['Article', 'BreadcrumbList', 'FAQPage']);
    const faq = ld(html).find((o) => o['@type'] === 'FAQPage');
    faq.mainEntity.forEach((q) => assert.ok(html.includes(q.name.replace(/&/g, '&amp;').replace(/’/g, '’')) || html.includes(q.name), `FAQ "${q.name}" is visible on the page`));
    assert.match(html, /not affiliated with BTS/i);
    assert.match(html, /Last reviewed/);
  });
}

test('keywords appear naturally in the guide copy', () => {
  assert.match(JSON.stringify(seo.PAGES.india), /Indian BTS ARMY/);
  assert.match(JSON.stringify(seo.PAGES.usa), /US BTS ARMY/);
  assert.match(JSON.stringify(seo.HOME_FAQ), /BTS ARMY Hub/);
  ['BTS', 'BTS ARMY', 'BTS ARMY Hub', 'Indian BTS ARMY', 'US BTS ARMY'].forEach((k) => assert.ok(seo.KEYWORDS.includes(k), k));
});

test('time-zone facts are right (KST is UTC+9, IST UTC+5:30)', () => {
  assert.match(seo.PAGES.india.sections.map((s) => s.p.join(' ')).join(' '), /3 hours 30 minutes ahead/);
  assert.match(seo.PAGES.india.sections.map((s) => s.p.join(' ')).join(' '), /8:00 PM KST is 4:30 PM IST/);
});

test('llms.txt and robots.txt', () => {
  const t = seo.llmsTxt('https://example.test');
  assert.match(t, /unofficial/i); assert.match(t, /\/bts-army-india/); assert.match(t, /\/bts-army-usa/);
  const r = seo.ROBOTS('https://example.test');
  assert.match(r, /Sitemap: https:\/\/example\.test\/sitemap\.xml/); assert.match(r, /Disallow: \/admin/); assert.match(r, /GPTBot/);
});

test('every sitemap URL has a route in server.js', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  seo.URLS.forEach(([p]) => { if (p !== '/') assert.ok(src.includes(`'${p}'`), `no route for ${p}`); });
});

test('head has full icon set, light/dark and manifest links that exist on disk', () => {
  const html = layout(ctx, { title: 't', description: 'd', path: '/', body: '' });
  assert.match(html, /prefers-color-scheme: light/); assert.match(html, /prefers-color-scheme: dark/);
  assert.match(html, /name="keywords"/); assert.match(html, /rel="mask-icon"/); assert.match(html, /browserconfig\.xml/);
  [...html.matchAll(/<link rel="(?:icon|apple-touch-icon|mask-icon|manifest)"[^>]*href="([^"]+)"/g)].forEach((m) => assert.ok(fs.existsSync(path.join(PUB, m[1])), `${m[1]} missing`));
});

test('manifest icons exist and have the sizes they claim', async () => {
  const sharp = require('sharp');
  const m = JSON.parse(fs.readFileSync(path.join(PUB, 'site.webmanifest'), 'utf8'));
  const sizes = m.icons.map((i) => i.sizes);
  ['36x36', '48x48', '192x192', '296x296', '512x512'].forEach((s) => assert.ok(sizes.includes(s), `manifest lacks ${s}`));
  assert.ok(m.icons.some((i) => i.purpose === 'maskable'));
  for (const i of m.icons) {
    const meta = await sharp(path.join(PUB, i.src)).metadata();
    assert.equal(`${meta.width}x${meta.height}`, i.sizes, i.src);
  }
  for (const s of m.shortcuts) assert.ok(s.url.startsWith('/'));
});

test('favicon.ico holds 16, 32 and 48; favicon.svg follows light/dark', () => {
  const b = fs.readFileSync(path.join(PUB, 'favicon.ico'));
  assert.equal(b.readUInt16LE(2), 1); assert.equal(b.readUInt16LE(4), 3);
  assert.deepEqual([6, 22, 38].map((o) => b[o]), [16, 32, 48]);
  assert.match(fs.readFileSync(path.join(PUB, 'favicon.svg'), 'utf8'), /prefers-color-scheme: light/);
});
