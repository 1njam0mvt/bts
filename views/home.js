'use strict';
/* Home page, rendered on the server so crawlers (and visitors without JS) see every member, album,
   photo, video and letter. public/js/app.js only adds behaviour.
   Order: hero, latest release (with the 25-second preview), members, albums, gallery,
   memories, videos, fan letters, shop. */
const { esc, albumUrl, collectionUrl, videoLink, safeUrl } = require('../lib/util');
const { MEMBERS, MILESTONES } = require('../lib/members');
const letters = require('./letters');

const PLAY = '<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
const PLAY_S = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
const ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';
const CHEV = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

const head = (eyebrow, title, extra = '') => `
<div class="section-head">
  <div><p class="label" style="color:var(--violet-hi)">${eyebrow}</p><h2 class="section-title mt-2">${title}</h2></div>${extra}
</div>`;

const chips = (id, label, items) => `
<div class="flex flex-wrap gap-2" role="group" aria-label="${label}" id="${id}">
  ${items.map(([v, t], i) => `<button class="chip" type="button" data-type="${esc(v)}" aria-pressed="${i === 0}">${t}</button>`).join('')}
</div>`;

const monthYear = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const ytThumb = (id, q = 'maxresdefault') => `https://i.ytimg.com/vi/${id}/${q}.jpg`;
const isPlaceholder = (p) => String(p).startsWith('/img/seed/');

function albumCard(a, s, vids) {
  // No real cover yet: use a frame from the song's official video, if there is one, instead of generated art.
  const mv = isPlaceholder(a.image) && (vids || []).find((v) => v.youtubeId && v.type === 'Music Video' && v.title.toLowerCase().includes(a.title.toLowerCase()));
  const src = mv ? ytThumb(mv.youtubeId, 'hqdefault') : a.thumb || a.image;
  const fb = mv ? ` data-fallback="${esc(a.thumb || a.image)}"` : '';
  return `
<article class="album" data-type="${esc(a.type)}" data-year="${esc(a.year)}" data-text="${esc(`${a.title} ${a.year} ${a.type}`.toLowerCase())}">
  <div class="art skel"><img class="fade" src="${esc(src)}"${fb} alt="${esc(a.title)} cover art" loading="lazy" decoding="async" width="${a.width || 900}" height="${a.height || 900}"></div>
  <div class="p-4 flex flex-col gap-3 flex-1">
    <div class="flex items-center justify-between gap-2"><span class="label" style="color:var(--violet-hi)">${esc(a.type)}</span><span class="label" style="color:var(--muted)">${esc(a.released ? monthYear(a.released) : a.year)}</span></div>
    <h3 class="display text-base md:text-lg font-bold leading-snug">${esc(a.title)}</h3>
    <a class="btn btn-primary btn-sm mt-auto" href="${esc(albumUrl(a, s))}" target="_blank" rel="noopener noreferrer sponsored">Listen / Buy on Shopify</a>
  </div>
</article>`;
}

/* One tile in the gallery. `type` is the filter group: Group, Members, Concert, Concept or Covers. */
function shot({ type, image, thumb, width, height, caption, credit, text, label }) {
  const full = credit ? `${caption} · Photo: ${credit}` : caption;
  return `
<button class="shot skel" type="button" data-type="${esc(type)}" data-full="${esc(image)}" data-caption="${esc(full)}" data-text="${esc(text.toLowerCase())}" aria-label="Open photo: ${esc(caption)}">
  <img class="fade" src="${esc(thumb || image)}" alt="${esc(caption)}" loading="lazy" decoding="async" width="${width || 800}" height="${height || 1000}">
  <span class="cap"><span class="cap-label">${esc(label)}</span><br><span class="text-sm">${esc(caption)}</span>${credit ? `<span class="credit">Photo: ${esc(credit)}</span>` : ''}</span>
</button>`;
}

function videoCard(v) {
  const hasId = !!v.youtubeId;
  const custom = v.image && v.image.startsWith('/uploads/');
  const link = videoLink(v);
  const src = custom ? v.image : hasId ? ytThumb(v.youtubeId) : v.image;
  const fallback = hasId && !custom ? [ytThumb(v.youtubeId, 'hqdefault'), v.image].filter(Boolean).join(' ') : '';
  const img = `<img src="${esc(src)}" ${fallback ? `data-fallback="${esc(fallback)}" ` : ''}alt="" loading="lazy" decoding="async" width="960" height="540"><span class="play"><span>${PLAY}</span></span>`;
  const media = hasId
    ? `<button class="thumb" type="button" data-embed="${esc(v.youtubeId)}" aria-label="Play ${esc(v.title)}">${img}</button>`
    : `<a class="thumb" href="${esc(link)}" target="_blank" rel="noopener noreferrer" aria-label="Find ${esc(v.title)} on YouTube">${img}</a>`;
  return `
<article class="video" data-type="${esc(v.type)}" data-text="${esc(`${v.title} ${v.type} ${v.meta}`.toLowerCase())}">
  ${media}
  <div class="p-4 flex flex-col gap-2">
    <span class="tag">${esc(v.type)}</span>
    <h3 class="font-bold text-lg leading-snug">${esc(v.title)}</h3>
    <p class="text-sm" style="color:var(--muted)">${esc(v.meta)}</p>
    <a class="text-sm font-bold mt-1" style="color:var(--violet-hi)" href="${esc(link)}" target="_blank" rel="noopener noreferrer">${hasId ? 'Watch on YouTube' : 'Find on YouTube'} &rarr;</a>
  </div>
</article>`;
}

/* One preview player. `cover` is the album the song belongs to (small corner image); `lazy` for the one below the fold. */
function heroPreview(pv, cover, lazy) {
  const id = pv.youtubeId, label = pv.label || 'the new single', secs = Math.max(10, Math.min(120, +pv.seconds || 50));
  return `
<div class="preview" data-yt="${esc(id)}" data-start="${esc(pv.start || 0)}" data-seconds="${secs}" style="--dur:${secs}s">
  <div class="preview-ring"><div class="preview-frame">
    <img class="pv-thumb" src="${ytThumb(id)}" data-fallback="${esc([ytThumb(id, 'hqdefault'), cover && cover.image].filter(Boolean).join(' '))}" alt="Still from the official ${esc(label)} music video" width="1280" height="720"${lazy ? ' loading="lazy"' : ' fetchpriority="high"'}>
    ${cover ? `<img class="pv-cover" src="${esc(cover.thumb || cover.image)}" alt="${esc(cover.title)} cover art" width="200" height="200">` : ''}
    <button class="pv-play" type="button" aria-label="Play a ${secs}-second preview of ${esc(label)}"><span class="dot">${PLAY_S}</span><span class="pv-play-text">Play ${secs}s preview</span></button>
  </div></div>
  <div class="eq" aria-hidden="true">${'<span></span>'.repeat(30)}</div>
  <div class="pv-meta"><span class="label" style="color:var(--violet-hi)">${esc(label)} &middot; official MV preview</span><span class="label pv-time" style="color:var(--muted)">${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</span></div>
  <div class="pv-bar" aria-hidden="true"><i class="pv-fill"></i></div>
</div>`;
}

/* ---------- Members ---------- */
function memberCard(m) {
  const text = `${m.stage} ${m.name} ${m.role} ${m.solo.map((x) => x[0]).join(' ')}`.toLowerCase();
  return `
<button class="member skel" type="button" data-open="m-${m.id}" data-text="${esc(text)}" aria-haspopup="dialog" aria-label="Open profile: ${esc(m.stage)} (${esc(m.name)})">
  <img class="fade" src="${esc(m.thumb)}" alt="Portrait of ${esc(m.stage)} of BTS" loading="lazy" decoding="async" width="480" height="480">
  <span class="member-info">
    <span class="member-role label">${esc(m.role)}</span>
    <span class="member-stage display">${esc(m.stage)}</span>
    <span class="member-name">${esc(m.name)}</span>
  </span>
</button>`;
}

function memberDialog(m, i) {
  const prev = MEMBERS[(i + MEMBERS.length - 1) % MEMBERS.length], next = MEMBERS[(i + 1) % MEMBERS.length];
  return `
<dialog class="mdlg" id="m-${m.id}" aria-labelledby="m-${m.id}-t">
  <div class="mdlg-in">
    <div class="mdlg-photo skel"><img class="fade" src="${esc(m.image)}" alt="Portrait of ${esc(m.stage)} of BTS" loading="lazy" decoding="async" width="760" height="760"></div>
    <div class="mdlg-body">
      <div class="flex items-start justify-between gap-3">
        <div><p class="label" style="color:var(--violet-hi)">${esc(m.role)}</p><h3 id="m-${m.id}-t" class="display mt-1" style="font-size:clamp(1.7rem,4vw,2.4rem);font-weight:900;line-height:1.05">${esc(m.stage)}</h3><p class="mt-1" style="color:var(--muted)">${esc(m.name)}</p></div>
        <button class="icon-btn" type="button" data-close aria-label="Close profile"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      </div>
      <p class="mt-5">${esc(m.bio)}</p>
      <dl class="facts mt-5"><div><dt class="label">Born</dt><dd>${esc(m.born)}</dd></div><div><dt class="label">From</dt><dd>${esc(m.from)}</dd></div></dl>
      <p class="label mt-6" style="color:var(--violet-hi)">Solo music</p>
      <ul class="solo mt-2">${m.solo.map(([t, y, k]) => `<li><span>${esc(t)}</span><span class="label" style="color:var(--muted)">${esc(y)} &middot; ${esc(k)}</span></li>`).join('')}</ul>
      <div class="mdlg-nav">
        <button class="btn btn-ghost btn-sm" type="button" data-go="m-${prev.id}">${CHEV('m15 5-7 7 7 7')}${esc(prev.stage)}</button>
        <button class="btn btn-ghost btn-sm" type="button" data-go="m-${next.id}">${esc(next.stage)}${CHEV('m9 5 7 7-7 7')}</button>
      </div>
      <p class="text-xs mt-4" style="color:var(--muted)">Facts come from public sources. For anything official, see the <a class="link" href="https://bts.ibighit.com/eng/" target="_blank" rel="noopener noreferrer">official BTS website</a>.</p>
    </div>
  </div>
</dialog>`;
}

/* ---------- Memories ---------- */
function memories(db) {
  const pics = db.gallery.filter((g) => g.category !== 'Members').slice(0, 3);
  const polaroids = pics.map((g, i) => `
    <figure class="polaroid p${i + 1}"><img class="fade" src="${esc(g.thumb || g.image)}" alt="${esc(g.caption)}" loading="lazy" decoding="async" width="${g.width || 600}" height="${g.height || 600}"><figcaption>${esc(g.caption)}</figcaption></figure>`).join('');
  return `
<section id="memories" class="section"><div class="wrap">
  ${head('Together', 'ARMY Memories')}
  <div class="grid lg:grid-cols-[1fr_1fr] gap-12 items-center">
    <div class="polaroids" aria-label="Photos from the gallery">${polaroids}</div>
    <div class="min-w-0">
      <p style="color:var(--muted)" class="max-w-xl">Every era has its own sound, colour and crowd. A few moments that ARMY still talk about.</p>
      <ol class="timeline mt-6">${MILESTONES.map(([d, t, b]) => `<li><span class="label" style="color:var(--violet-hi)">${esc(d)}</span><h3 class="font-bold">${esc(t)}</h3><p class="text-sm" style="color:var(--muted)">${esc(b)}</p></li>`).join('')}</ol>
      <div class="mt-8 flex flex-wrap gap-3"><a class="btn btn-primary" href="#letters">Write a fan letter</a><a class="btn btn-ghost" href="#gallery">Open the gallery</a></div>
    </div>
  </div>
</div></section>`;
}

function home(ctx, db) {
  const s = db.settings;
  const hero = db.albums.find((a) => a.id === s.heroAlbumId) || db.albums[0];
  const heroUrl = hero ? albumUrl(hero, s) : safeUrl(s.fallbackShopUrl) || '#';
  const heroTitle = hero ? hero.title : s.siteName;
  const byTitle = (label) => db.albums.find((x) => x.title.toLowerCase() === String(label || '').toLowerCase());
  const pv = s.preview && s.preview.youtubeId ? s.preview : null;          // top banner player
  const pv2 = s.preview2 && s.preview2.youtubeId ? s.preview2 : null;      // latest release player
  const heroRight = pv
    ? heroPreview(pv, byTitle(pv.label), false)
    : '<figure class="hero-photo min-w-0"><img src="/img/fan/hero-group.webp" alt="The seven members of BTS standing on a mirror-like lake under a purple, starry sky" width="836" height="626" fetchpriority="high" decoding="async"></figure>';
  const right = pv2
    ? heroPreview(pv2, hero, true)
    : hero ? `<div class="cover-frame"><img src="${esc(hero.image)}" alt="${esc(hero.title)} cover art" width="${hero.width || 900}" height="${hero.height || 900}"></div>` : '';
  // The featured release already has its own section, so the grid starts with the next one.
  const gridAlbums = db.albums.filter((a) => a !== hero);

  const gcat = (g) => g.category || 'Members';
  const photos = db.gallery.map((g) => shot({ type: gcat(g), label: gcat(g), image: g.image, thumb: g.thumb, width: g.width, height: g.height, caption: g.caption, credit: g.credit, text: `${g.member} ${gcat(g)} ${g.caption}` }));
  // Generated placeholders are left out of the gallery; real covers appear as soon as they are imported or uploaded.
  const covers = db.albums.filter((a) => !isPlaceholder(a.image)).map((a) => shot({ type: 'Covers', label: 'Album cover', image: a.image, thumb: a.thumb, width: a.width, height: a.height, caption: `${a.title} cover art (${a.year})`, credit: '', text: `cover ${a.title} ${a.year} ${a.type}` }));
  const years = [...new Set(gridAlbums.map((a) => a.year))].sort((x, y) => y - x);
  const cats = ['Group', 'Members', 'Concert', 'Concept'].filter((c) => db.gallery.some((g) => gcat(g) === c));

  const body = `
<section id="home" class="hero">
  <img class="hero-bg" src="/img/fan/galaxy.webp" alt="" width="1600" height="715" aria-hidden="true" fetchpriority="low" decoding="async">
  <canvas id="lightsea" aria-hidden="true"></canvas>
  <div class="wrap relative">
    <div class="grid lg:grid-cols-[1.05fr_.95fr] gap-10 lg:gap-14 items-center py-12 lg:py-20">
      <div class="min-w-0">
        <p class="label" style="color:var(--violet-hi)">The unofficial fan hub for ARMY</p>
        <h1 class="hero-title display mt-4"><small>Welcome to</small><span>ARMY</span><span>Universe</span></h1>
        <p class="mt-6 max-w-xl text-lg" style="color:var(--muted)">Step into a fan-made home for BTS. Meet the seven members, explore every album and relive the memories that bring ARMY together around the world.</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a class="btn btn-primary" href="#members">Explore BTS</a>
          <a class="btn btn-ghost" href="#music">Discover Albums</a>
        </div>
        <p class="mt-8 counter label" title="Counted from the debut on 13 June 2013"><span style="color:var(--muted)">Debut day</span> <b id="debut-days">D+4,900</b></p>
      </div>
      <div class="min-w-0">${heroRight}</div>
    </div>
  </div>
</section>

<section id="latest" class="section"><div class="wrap">
  <div class="grid lg:grid-cols-[1.05fr_.95fr] gap-10 lg:gap-14 items-center">
    <div class="min-w-0 order-2 lg:order-1">${right}</div>
    <div class="min-w-0 order-1 lg:order-2">
      <p class="label" style="color:var(--violet-hi)">Latest release &middot; ${esc(hero ? (hero.released ? monthYear(hero.released) : hero.year) : '')}</p>
      <h2 class="section-title mt-2">${esc(heroTitle)}</h2>
      <p class="mt-4 max-w-xl" style="color:var(--muted)">${esc(s.heroBlurb)}</p>
      <div class="mt-6 flex flex-wrap gap-3">
        <a class="btn btn-primary" href="${esc(heroUrl)}" target="_blank" rel="noopener noreferrer sponsored">Listen Now / Shop Album ${ARROW}</a>
        <a class="btn btn-ghost" href="#videos">Watch the videos</a>
      </div>
    </div>
  </div>
</div></section>

<section id="members" class="section members-sec"><div class="wrap">
  ${head('The seven', 'Meet BTS', '<p class="text-sm max-w-sm" style="color:var(--muted)">Select a member to read about them and see their solo music.</p>')}
  <div id="member-grid" class="members-grid">${MEMBERS.map(memberCard).join('')}</div>
  <div id="member-empty" class="empty" hidden>No members match your search.</div>
</div></section>

<section id="music" class="section"><div class="wrap">
  ${head('Discography', 'Music &amp; Albums', `<div class="flex flex-wrap items-end gap-3">${chips('music-filters', 'Filter by release type', [['all', 'All'], ['Album', 'Albums'], ['EP', 'EPs'], ['Single', 'Singles']])}
    <label class="year-pick label" for="album-year"><span>Year</span><select id="album-year" aria-label="Filter by release year"><option value="all">All years</option>${years.map((y) => `<option>${y}</option>`).join('')}</select></label></div>`)}
  <div id="album-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">${gridAlbums.map((a) => albumCard(a, s, db.videos)).join('')}</div>
  <div id="album-empty" class="empty" hidden>No releases match your search.</div>
  ${hero ? `<p class="mt-6 text-sm" style="color:var(--muted)">Latest release <a class="link" href="#latest">${esc(hero.title)}</a> is featured above.</p>` : ''}
</div></section>

<section id="gallery" class="section"><div class="wrap">
  ${head('Gallery', 'Photo &amp; Cover Gallery', chips('gallery-filters', 'Filter the gallery', [['all', 'All']].concat(cats.map((c) => [c, c === 'Members' ? 'Members' : c])).concat([['Covers', 'Album covers']])))}
  <p class="text-sm mb-6 max-w-xl" style="color:var(--muted)">Tap any image to open it full size. Use the arrow keys to move between images.</p>
  <div id="gallery-grid" class="masonry">${photos.join('')}${covers.join('')}</div>
  <div id="gallery-empty" class="empty" hidden>No images match your search.</div>
</div></section>

${memories(db)}

<section id="videos" class="section"><div class="wrap">
  ${head('Watch', 'Videos &amp; Vlogs', chips('video-filters', 'Filter by video type', [['all', 'All'], ['Music Video', 'Music videos'], ['Run BTS', 'Run BTS'], ['Vlog', 'Vlogs']]))}
  <div id="video-grid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">${db.videos.map(videoCard).join('')}</div>
  <div id="video-empty" class="empty" hidden>No videos match your search.</div>
</div></section>

${letters.section(db)}

<section id="shop" class="section"><div class="wrap">
  ${head('Shop', 'Official Merch &amp; Albums', '<p class="text-sm max-w-sm" style="color:var(--muted)">Collections open in the store. Buy only licensed products.</p>')}
  <div id="shop-grid" class="grid sm:grid-cols-3 gap-5 md:gap-6">
    ${db.shop.map((c) => `<article class="shop-card"><h3 class="display text-xl font-bold">${esc(c.title)}</h3><p style="color:var(--muted)">${esc(c.note)}</p><a class="btn btn-ghost btn-sm mt-3 w-max" href="${esc(collectionUrl(c, s))}" target="_blank" rel="noopener noreferrer sponsored">Shop ${esc(c.title)} &rarr;</a></article>`).join('')}
  </div>
</div></section>

${MEMBERS.map(memberDialog).join('')}

<dialog id="lightbox" class="lightbox" aria-label="Image viewer">
  <div class="lb-inner">
    <div class="flex items-center justify-between">
      <span id="lb-count" class="label" style="color:var(--muted)"></span>
      <button id="lb-close" class="icon-btn" type="button" aria-label="Close image viewer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
    </div>
    <div class="lb-stage">
      <button id="lb-prev" class="icon-btn lb-nav lb-prev" type="button" aria-label="Previous image">${CHEV('m15 5-7 7 7 7')}</button>
      <img id="lb-img" alt="">
      <button id="lb-next" class="icon-btn lb-nav lb-next" type="button" aria-label="Next image">${CHEV('m9 5 7 7-7 7')}</button>
    </div>
    <p id="lb-caption" class="text-center text-sm" style="color:var(--muted)"></p>
  </div>
</dialog>`;

  const base = ctx.base;
  const abs = (p) => (/^https?:/.test(p) ? p : base + p);
  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: s.siteName, url: base + '/', description: s.tagline, inLanguage: 'en' },
    {
      '@context': 'https://schema.org', '@type': 'ItemList', name: 'Members of BTS',
      itemListElement: MEMBERS.map((m, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Person', name: m.name, alternateName: m.stage, image: abs(m.image), description: m.bio, memberOf: { '@type': 'MusicGroup', name: 'BTS' } } }))
    },
    {
      '@context': 'https://schema.org', '@type': 'ItemList', name: 'BTS albums and singles',
      itemListElement: db.albums.map((a, i) => ({
        '@type': 'ListItem', position: i + 1,
        item: { '@type': 'MusicAlbum', name: a.title, datePublished: a.released || String(a.year), image: abs(a.image), byArtist: { '@type': 'MusicGroup', name: 'BTS' } }
      }))
    }
  ];
  const vids = db.videos.filter((v) => v.youtubeId);
  if (vids.length) jsonld.push({
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'BTS videos and vlogs',
    itemListElement: vids.map((v, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'VideoObject', name: v.title, thumbnailUrl: ytThumb(v.youtubeId), embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtubeId}`, contentUrl: videoLink(v), description: `${v.type} from ${v.meta}`, uploadDate: String(s.legalUpdated) } }))
  });

  return {
    title: 'ARMY Hub: Welcome to ARMY Universe, a BTS Fan Site',
    description: `Unofficial BTS fan site. Meet all seven members, browse the discography and album covers, photo gallery, music videos, Run BTS episodes and fan letters.${hero ? ` Latest: ${hero.title}.` : ''}`,
    path: '/', body, jsonld, scripts: ['/js/letters.js'], preload: pv ? [ytThumb(pv.youtubeId)] : ['/img/fan/hero-group.webp']
  };
}

module.exports = { home };
