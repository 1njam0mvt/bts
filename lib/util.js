'use strict';
/* Small shared helpers: HTML escaping, URL validation, YouTube id parsing, link building. */

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Returns a normalised http(s) URL, or '' when the value is not a safe absolute URL. */
const safeUrl = (u) => {
  try {
    const x = new URL(String(u).trim());
    return /^https?:$/.test(x.protocol) ? x.href : '';
  } catch {
    return '';
  }
};

/** Accepts a bare 11-character id or any common YouTube URL and returns the id (or ''). */
const ytId = (input) => {
  const s = String(input || '').trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1, 12);
      return /^[\w-]{11}$/.test(id) ? id : '';
    }
    if (/(^|\.)youtube\.com$/.test(u.hostname)) {
      const v = u.searchParams.get('v');
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const m = u.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/);
      if (m) return m[1];
    }
  } catch { /* not a URL */ }
  return '';
};

const storeBase = (s) => (safeUrl(s.shopifyStore) || '').replace(/\/+$/, '');

/** Shopify product link for an album, with graceful fallbacks so a button never dead-ends. */
const albumUrl = (a, s) => {
  if (safeUrl(a.shopUrl)) return safeUrl(a.shopUrl);
  const base = storeBase(s);
  if (base && a.handle) return `${base}/products/${encodeURIComponent(a.handle)}`;
  return safeUrl(a.musicUrl) || safeUrl(s.fallbackShopUrl) || '#';
};
const collectionUrl = (c, s) => {
  const base = storeBase(s);
  return base ? `${base}/collections/${encodeURIComponent(c.handle || '')}` : safeUrl(s.fallbackShopUrl) || '#';
};
const videoLink = (v) => (v.youtubeId ? `https://www.youtube.com/watch?v=${v.youtubeId}` : safeUrl(v.url) || '#');

module.exports = { esc, safeUrl, ytId, storeBase, albumUrl, collectionUrl, videoLink };
