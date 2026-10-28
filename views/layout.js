'use strict';
/* Shared page shell: <head> SEO tags, header, footer. Every public page goes through layout(). */
const { esc, safeUrl } = require('../lib/util');
const { MEMBERS } = require('../lib/members');

const SOCIAL = [
  ['x', 'X', '<path d="M5 5l14 14M19 5 5 19" stroke-width="2.2"/>'],
  ['instagram', 'Instagram', '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r=".6" fill="currentColor"/>'],
  ['youtube', 'YouTube', '<rect x="3" y="6" width="18" height="12" rx="4"/><path d="m10.5 9.5 4 2.5-4 2.5z" fill="currentColor"/>'],
  ['tiktok', 'TikTok', '<path d="M14 4v10.2a3.2 3.2 0 1 1-3.2-3.2M14 4c.3 2.3 1.8 3.8 4 4"/>']
];

const SEARCH_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="color:var(--muted)"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

const NAV = [
  ['/', 'Home'],
  ['/#members', 'Members'],
  ['/#music', 'Albums'],
  ['/#gallery', 'Gallery'],
  ['/#videos', 'Videos'],
  ['/#letters', 'Fan Letters'],
  ['/#shop', 'Shop'],
  ['/about', 'About']
];
const MEMBER_LINKS = MEMBERS.map((m) => [`/#m-${m.id}`, m.stage]);
const OFFICIAL = [
  ['https://bts.ibighit.com/eng/discography/', 'Official BTS discography'],
  ['https://open.spotify.com/artist/3Nrfpe0tUJi4K4DXYWgMUX', 'BTS on Spotify']
];

function header(ctx) {
  const links = NAV.map(([h, t]) => `<a class="nav-link" href="${h}">${t}</a>`).join('');
  const mlinks = NAV.map(([h, t], i) => `<a class="nav-link py-3${i < NAV.length - 1 ? ' border-b border-line' : ''}" href="${h}">${t}</a>`).join('');
  const q = esc(ctx.q || '');
  const search = (id) => `
    <form action="/" method="get" role="search" class="search-form">
      <label class="search" for="${id}">${SEARCH_ICON}
        <input id="${id}" name="q" type="search" value="${q}" placeholder="Search the site" autocomplete="off" aria-label="Search the site" maxlength="80">
      </label>
    </form>`;
  return `
<a href="#main" class="skip-link">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <div class="flex items-center gap-4 py-3">
      <a href="/" class="flex items-center gap-2 shrink-0" aria-label="${esc(ctx.s.siteName)} home">
        <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="logoG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b79cff"/><stop offset="1" stop-color="#ff4fd8"/></linearGradient></defs><path d="M12 21s-7-4.6-9.3-9A5.3 5.3 0 0 1 12 6.2 5.3 5.3 0 0 1 21.3 12C19 16.4 12 21 12 21z" fill="url(#logoG)"/></svg>
        <span class="display text-lg font-bold">ARMY <span style="color:var(--violet-hi)">Hub</span></span>
      </a>
      <nav class="hidden xl:flex items-center gap-5 2xl:gap-6 ml-4 2xl:ml-6" aria-label="Primary">${links}</nav>
      <div class="flex-1"></div>
      <div class="hidden sm:block w-44 xl:w-52 2xl:w-64">${search('site-search')}</div>
      <button id="theme-btn" class="icon-btn theme-btn" type="button" aria-label="Switch theme" title="Switch between dark and light mode">
        <svg class="i-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        <svg class="i-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
      </button>
      <button id="menu-btn" class="icon-btn xl:hidden" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
    <div id="mobile-menu" hidden class="xl:hidden pb-4">
      <div class="sm:hidden mb-3">${search('site-search-m')}</div>
      <nav class="flex flex-col" aria-label="Mobile">${mlinks}</nav>
    </div>
  </div>
</header>`;
}

function footer(ctx) {
  const s = ctx.s;
  const li = (h, t, ext) => `<li><a class="foot-link" href="${esc(h)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(t)}</a></li>`;
  const social = SOCIAL.map(([k, name, icon]) => {
    const url = safeUrl(s.social && s.social[k]);
    return url ? `<li><a class="social" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${name}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg></a></li>` : '';
  }).join('');
  const albums = (ctx.albums || []).filter((a) => a.type !== 'Single').slice(0, 6).map((a) => li(`/?q=${encodeURIComponent(a.title)}#music`, a.title)).join('');
  const shop = safeUrl(s.fallbackShopUrl);
  const official = OFFICIAL.map(([h, t]) => li(h, t, true)).join('') + (shop ? li(shop, 'Weverse Shop', true) : '');
  return `
<footer class="site-footer">
  <div class="wrap py-12 md:py-14">
    <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
      <div class="min-w-0 sm:col-span-2 lg:col-span-1">
        <p class="display text-xl font-bold">ARMY <span style="color:var(--violet-hi)">Hub</span></p>
        <p class="mt-3 text-sm max-w-xs" style="color:var(--muted)">A fan-made home for ARMY. Meet the seven members, explore the albums, revisit the photos and videos, and write a letter to the group. Borahae.</p>
        <a class="btn btn-ghost btn-sm mt-5" href="#top" id="to-top"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>Back to top</a>
      </div>
      <nav aria-label="Explore" class="min-w-0">
        <p class="label" style="color:var(--violet-hi)">Explore</p>
        <ul class="mt-3 grid gap-2 text-sm">${NAV.map(([h, t]) => li(h, t.replace(/&amp;/g, '&'))).join('')}</ul>
      </nav>
      <nav aria-label="Members" class="min-w-0">
        <p class="label" style="color:var(--violet-hi)">Members</p>
        <ul class="mt-3 grid gap-2 text-sm">${MEMBER_LINKS.map(([h, t]) => li(h, t)).join('')}</ul>
      </nav>
      <nav aria-label="Albums" class="min-w-0">
        <p class="label" style="color:var(--violet-hi)">Albums</p>
        <ul class="mt-3 grid gap-2 text-sm">${albums}<li><a class="foot-link" href="/#music">All releases</a></li></ul>
      </nav>
      <div class="min-w-0">
        <p class="label" style="color:var(--violet-hi)">Official</p>
        <ul class="mt-3 grid gap-2 text-sm">${official}</ul>
        ${social ? `<p class="label mt-6" style="color:var(--violet-hi)">Follow BTS</p><ul class="mt-3 flex flex-wrap gap-3" aria-label="Social media">${social}</ul>` : ''}
      </div>
    </div>
    <hr class="my-8" style="border-color:var(--line)">
    <div class="flex flex-wrap justify-between gap-x-8 gap-y-3 text-sm" style="color:var(--muted)">
      <div class="grid gap-1 max-w-2xl">
        <p><strong style="color:var(--fg)">This is an unofficial fan-made website and is not affiliated with or endorsed by BTS or BIGHIT MUSIC.</strong></p>
        <p>All names, images, logos and trademarks belong to their respective owners. &copy; ${new Date().getFullYear()} ${esc(s.siteName)}, a fan project. <a class="link" href="/contact">Request a removal</a></p>
      </div>
      <ul class="flex flex-wrap gap-x-5 gap-y-1 items-start"><li><a class="foot-link" href="/faq">FAQ</a></li><li><a class="foot-link" href="/contact">Contact</a></li><li><a class="foot-link" href="/terms">Terms</a></li><li><a class="foot-link" href="/privacy">Privacy</a></li></ul>
    </div>
  </div>
</footer>`;
}

/**
 * @param {object} ctx  { s: settings, base: absolute site URL, asset: fn(path) -> versioned URL, q }
 * @param {object} page { title, description, path, body, jsonld[], noindex, scripts[], preload[], ogImage }
 */
function layout(ctx, page) {
  const { s, base, asset } = ctx;
  const url = base + (page.path === '/' ? '/' : page.path);
  const og = page.ogImage || `${base}/img/fan/og.png`;
  const ld = (page.jsonld || []).map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  const pre = (page.preload || []).map((p) => `<link rel="preload" as="image" href="${esc(p)}" fetchpriority="high">`).join('\n');
  const scripts = ['/js/app.js'].concat(page.scripts || []).map((p) => `<script src="${asset(p)}" defer></script>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="robots" content="${page.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">
<meta name="theme-color" content="#0b0714">
<script src="${asset('/js/theme.js')}"></script>
<link rel="canonical" href="${esc(url)}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:site_name" content="${esc(s.siteName)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(og)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${esc(og)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;700&family=Unbounded:wght@500;700;900&display=swap">
<link rel="stylesheet" href="${asset('/css/site.css')}">
${pre}
${ld}
</head>
<body id="top">
${header({ s, q: ctx.q })}
<main id="main">
${page.body}
</main>
${footer({ s, albums: ctx.albums })}
${scripts}
</body>
</html>`;
}

module.exports = { layout };
