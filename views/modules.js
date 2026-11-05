'use strict';
/* Pages and blocks for the "universe" features:
   chooseDoor() (home page block), /tour (Scam-Shield + receipts), /stories (Story Wall), /care (Purple Care Room), /me (your local data).
   Everything is server-rendered so it works and can be read without JavaScript; public/js/*.js only adds behaviour. */
const { esc } = require('../lib/util');
const { DOORS } = require('../lib/doors');
const shield = require('../lib/shield');
const { REGIONS, FALLBACK } = require('../lib/crisis');
const content = require('../lib/content');

const crumbs = (ctx, name, path) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: ctx.base + '/' },
    { '@type': 'ListItem', position: 2, name, item: ctx.base + path }
  ]
});
const hero = (eyebrow, title, lead) => `
<section class="page-hero"><div class="wrap"><div class="py-14 md:py-20 max-w-3xl">
  <p class="label" style="color:var(--neon)">${eyebrow}</p>
  <h1 class="display mt-3" style="font-size:clamp(2rem,6vw,3.4rem);font-weight:900;line-height:1.05">${title}</h1>
  ${lead ? `<p class="mt-5 text-lg" style="color:var(--muted)">${lead}</p>` : ''}
</div></div></section>`;
const json = (o) => esc(JSON.stringify(o));                       // safe inside a data-attribute
const fmtDate = (iso) => new Date(String(iso).slice(0, 10) + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/* ---------- 1. Choose your door (inserted into the home page) ---------- */
function chooseDoor() {
  const doors = DOORS.map((d) => ({ id: d.id, href: d.href, chip: d.chip || null }));
  return `
<section id="doors" class="section"><div class="wrap">
  <div class="section-head"><div><p class="label" style="color:var(--violet-hi)">Choose your door</p><h2 class="section-title mt-2">How do you want to come in today?</h2></div></div>
  <p id="door-last" class="text-sm mb-5" style="color:var(--muted)" hidden></p>
  <ul class="door-grid" data-doors="${json(doors)}">
    ${DOORS.map((d) => `<li><button class="door" type="button" data-door="${d.id}" aria-pressed="false"><span class="door-title">${esc(d.title)}</span><span class="door-hint">${esc(d.hint)}</span></button></li>`).join('')}
  </ul>
  <p class="text-xs mt-5" style="color:var(--muted)">No account and no email. Your choice stays on this device. <a class="link" href="/me">See or clear it</a>.</p>
</div></section>`;
}

/* ---------- 4. Receipts card ---------- */
const STATUS = { verified: ['Verified', 'ok'], unconfirmed: ['Not yet confirmed', 'wait'], corrected: ['Corrected', 'info'] };
function receiptCard(r) {
  const [label, cls] = STATUS[r.status] || STATUS.unconfirmed;
  const chips = r.sources.map((s) => `<li><a class="src-chip src-${esc(s.kind || 'other')}" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><span class="src-kind">${esc(s.kind || 'source')}</span> ${esc(s.label)} <span aria-hidden="true">&#8599;</span><span class="sr-only"> (opens in a new tab)</span></a></li>`).join('');
  return `
<article class="receipt">
  <div class="receipt-top"><span class="badge-status ${cls}">${label}</span><time datetime="${esc(r.publishedAt)}">${fmtDate(r.publishedAt)}</time></div>
  <h3 class="display receipt-title">${esc(r.headline)}</h3>
  <p class="receipt-sum">${esc(r.summary)}</p>
  ${r.verifiedAt ? `<p class="receipt-meta">Checked against the sources below on <time datetime="${esc(r.verifiedAt)}">${fmtDate(r.verifiedAt)}</time>.</p>` : ''}
  <ul class="src-row" aria-label="Sources">${chips}</ul>
</article>`;
}

/* ---------- 5. /tour: Scam-Shield + receipts ---------- */
function tour(ctx) {
  const tickets = shield.OFFICIAL_TICKETING.length
    ? `<ul class="shield-list">${shield.OFFICIAL_TICKETING.map((t) => `<li><strong>${esc(t.event)}</strong> &middot; ${esc(t.venue)} &middot; ${esc(t.date)}<br><a class="link" href="${esc(t.ticketUrl)}" target="_blank" rel="noopener noreferrer">Official ticket page &#8599;</a> <a class="link muted-link" href="${esc(t.sourceUrl)}" target="_blank" rel="noopener noreferrer">announcement &#8599;</a></li>`).join('')}</ul>`
    : '<p class="shield-empty">No verified ticket links are published yet. Each one will be added only together with its official announcement.</p>';
  const stores = shield.OFFICIAL_STORES.map((s) => `<li><a class="link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(s.name)}</strong> &#8599;</a> <span class="muted">${esc(s.note)}</span></li>`).join('');
  const resale = shield.RESALE.map((r) => `<li class="pill-warn">${esc(r.host)}</li>`).join('');
  const checklist = shield.CHECKLIST.map((c, i) => `<li><label class="check"><input type="checkbox" data-check="${i}"> <span>${esc(c)}</span></label></li>`).join('');
  const receipts = content.validReceipts();

  const body = `${hero('Tour safety', 'Buy only from official sellers', 'Fake ticket and merchandise sites copy the real ones. Reach a seller through an official announcement, then check the address here.')}
<section class="section" style="border-top:1px solid var(--line)"><div class="wrap" id="shield" data-lists="${json(shield.lists())}">
  <div class="grid md:grid-cols-2 gap-6">
    <div class="shop-card shield-ok"><h2 class="display text-xl font-bold">Official tickets</h2>${tickets}
      <h2 class="display text-xl font-bold mt-6">Official stores</h2><ul class="shield-list">${stores}</ul></div>
    <div class="shop-card shield-warn"><h2 class="display text-xl font-bold">Resale marketplaces: not official</h2>
      <p class="text-sm mt-2" style="color:var(--muted)">Sellers here are other people. Prices can be far above face value and tickets can be invalid. We list these only so you can recognise them.</p>
      <ul class="pill-row mt-4">${resale}</ul></div>
  </div>

  <div class="shop-card mt-6"><h2 class="display text-xl font-bold">Check a link before you pay</h2>
    <form id="shield-form" class="shield-form" novalidate>
      <label class="sr-only" for="shield-url">Link to check</label>
      <input id="shield-url" type="text" inputmode="url" autocomplete="off" spellcheck="false" placeholder="Paste a shop or ticket link" maxlength="300">
      <button class="btn btn-primary" type="submit">Check</button>
    </form>
    <p class="text-xs mt-2" style="color:var(--muted)">Checked inside your browser. The link is not sent anywhere.</p>
    <div id="shield-result" class="shield-result" role="status" hidden></div>
    <noscript><p class="status err">The link checker needs JavaScript. Read the checklist below instead.</p></noscript>
  </div>

  <fieldset class="shop-card mt-6 checklist"><legend class="display text-xl font-bold px-1">Before you buy</legend>
    <ul class="shield-list">${checklist}</ul>
    <p id="check-count" class="text-sm font-bold mt-3" aria-live="polite">0 of ${shield.CHECKLIST.length} checked.</p></fieldset>
</div></section>

<section class="section" style="border-top:1px solid var(--line)"><div class="wrap">
  <div class="section-head"><div><p class="label" style="color:var(--violet-hi)">Receipts</p><h2 class="section-title mt-2">Verified updates</h2></div></div>
  <p class="text-sm mb-6 max-w-2xl" style="color:var(--muted)">Every update shows where it came from. If it has no source, it is not published here.</p>
  ${receipts.length ? `<div class="grid md:grid-cols-2 gap-4">${receipts.map(receiptCard).join('')}</div>` : '<p class="empty" style="display:block">No updates yet. Check the official BTS channels for news.</p>'}
</div></section>`;
  return {
    title: 'Tour Safety: Official Tickets, Stores and a Scam Link Checker | ARMY Hub',
    description: 'Avoid ticket and merchandise scams. Official stores, resale marketplaces explained, a browser-only link checker and a buying checklist for BTS fans.',
    path: '/tour', body, scripts: ['/js/shield-core.js', '/js/tour.js'],
    jsonld: [crumbs(ctx, 'Tour safety', '/tour')]
  };
}

/* ---------- 6a. /stories: Story Wall ---------- */
function stories(ctx) {
  const list = content.validStories();
  const cards = list.map((s) => `
    <li class="story" data-cat="${esc(s.category)}"><figure>
      <div class="story-top"><span>${esc(s.category)}</span><span class="${s.label === 'fictional' ? 'tag-fic' : 'tag-ok'}">${s.label === 'fictional' ? 'Fictional composite' : 'Shared with permission'}</span></div>
      <blockquote>${esc(s.body)}</blockquote>${s.song ? `<figcaption>Song: ${esc(s.song)}</figcaption>` : ''}
    </figure></li>`).join('');
  const chips = ['all'].concat(content.CATEGORIES).map((c, i) => `<button class="chip" type="button" data-type="${esc(c)}" aria-pressed="${i === 0}">${c === 'all' ? 'All' : esc(c)}</button>`).join('');
  const body = `${hero('Story wall', 'Stories from ARMY', 'Shared by fans who chose to share them, or clearly marked as fictional. Some touch on hard feelings: take your time. The <a class="link" href="/care">Purple Care Room</a> is always open.')}
<section class="section" style="border-top:1px solid var(--line)"><div class="wrap">
  <div class="flex flex-wrap gap-2" role="group" aria-label="Filter stories" id="story-filters">${chips}</div>
  <ul class="story-grid mt-6" id="story-grid">${cards}</ul>
  <p id="story-empty" class="empty" hidden>No stories in this group yet.</p>

  <form id="story-form" class="shop-card mt-10 grid gap-4" novalidate>
    <h2 class="display text-xl font-bold">Share your own story</h2>
    <div class="field"><label for="st-cat">Theme</label><select id="st-cat" name="category">${content.CATEGORIES.map((c) => `<option>${esc(c)}</option>`).join('')}</select></div>
    <div class="field"><label for="st-body">Your story</label><textarea id="st-body" name="body" rows="6" minlength="40" maxlength="800" required></textarea>
      <span class="hint">No real names, contact details or other people's private details. <span id="st-count">0</span> / 800</span></div>
    <div class="hp" aria-hidden="true"><label for="st-web">Leave this field empty</label><input id="st-web" name="website" type="text" tabindex="-1" autocomplete="off"></div>
    <label class="check"><input type="checkbox" id="st-consent" name="consent" required> <span>I am happy for this to be published anonymously after it is read by a person, and I understand I can ask for it to be removed.</span></label>
    <div class="flex flex-wrap items-center gap-4"><button class="btn btn-primary" type="submit" id="st-send">Send for review</button><p id="st-status" class="status" role="status" aria-live="polite" hidden></p></div>
    <p class="text-sm" style="color:var(--muted)">Stories are never published automatically. No email address is asked for. If you are struggling right now, please visit the <a class="link" href="/care">Care Room</a> before writing.</p>
    <noscript><p class="status err">This form needs JavaScript.</p></noscript>
  </form>
</div></section>`;
  return {
    title: 'Story Wall: Stories from ARMY | ARMY Hub',
    description: 'Short stories from BTS fans, shared with permission or clearly marked as fictional, plus a gentle way to share your own.',
    path: '/stories', body, scripts: ['/js/stories.js'], jsonld: [crumbs(ctx, 'Story wall', '/stories')]
  };
}

/* ---------- 6b. /care: Purple Care Room ---------- */
function care(ctx) {
  const regions = REGIONS.map((r) => `
    <div class="care-region" data-region="${esc(r.code)}">
      <h3 class="display text-lg font-bold">${esc(r.country)}</h3>
      <p class="text-sm mt-1">Emergency number: <a class="link" href="tel:${esc(r.emergency.replace(/\D.*$/, ''))}"><strong>${esc(r.emergency)}</strong></a></p>
      <ul class="care-lines">${r.lines.map((l) => `<li><strong>${esc(l.name)}</strong><br><a class="btn btn-primary btn-sm mt-2" href="tel:${esc(l.tel)}">Call ${esc(l.phone)}</a>${l.note ? `<p class="text-xs mt-2" style="color:var(--muted)">${esc(l.note)}</p>` : ''}</li>`).join('')}</ul>
      <p class="text-xs mt-3" style="color:var(--muted)">Source: <a class="link" href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">${esc(r.source.replace(/^https?:\/\//, ''))}</a> &middot; checked ${esc(r.verifiedOn)}</p>
    </div>`).join('');
  const body = `${hero('Purple Care Room', 'A quiet place to slow down', 'You do not have to be okay to be here.')}
<section class="section" style="border-top:1px solid var(--line)"><div class="wrap max-w-3xl">
  <div class="shop-card care-help" aria-labelledby="help-title">
    <h2 id="help-title" class="display text-xl font-bold">If you might hurt yourself, or someone is in danger</h2>
    <p class="mt-2">Contact your local emergency number now. Below are helplines for your country.</p>
    <div class="field mt-4"><label for="care-country">Where are you?</label>
      <select id="care-country"><option value="">Choose a country</option>${REGIONS.map((r) => `<option value="${esc(r.code)}">${esc(r.country)}</option>`).join('')}</select></div>
    <div id="care-regions" class="mt-4">${regions}</div>
    <p class="mt-4 text-sm">Not listed? <a class="link" href="${esc(FALLBACK.url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(FALLBACK.label)} &#8599;</strong></a></p>
  </div>

  <div class="care-breathe mt-10" aria-labelledby="breathe-title">
    <h2 id="breathe-title" class="display text-xl font-bold">One slow minute</h2>
    <div class="breathe-orb" aria-hidden="true"></div>
    <p class="text-sm" style="color:var(--muted)">Breathe in as it grows, out as it shrinks. Stop whenever you like.</p>
  </div>

  <div class="mt-10">
    <h2 class="display text-xl font-bold">Something gentle to listen to</h2>
    <p class="text-sm mt-2" style="color:var(--muted)">Songs play from official YouTube videos only after you press play.</p>
    <p class="mt-4"><button class="btn btn-ghost" type="button" data-open-music="comfort">Open calm songs</button></p>
  </div>
  <p class="text-xs mt-10" style="color:var(--muted)">This page is not medical advice and is not a crisis service. It is run by fans, not by professionals.</p>
</div></section>`;
  return {
    title: 'Purple Care Room: Calm Songs and Crisis Helplines | ARMY Hub',
    description: 'A quiet space for ARMY: a breathing guide, calm songs and crisis helplines by country.',
    path: '/care', body, scripts: ['/js/care.js'], jsonld: [crumbs(ctx, 'Purple Care Room', '/care')]
  };
}

/* ---------- 2. /me: your data, stored only in this browser ---------- */
function me() {
  const body = `${hero('Your space', 'Everything here stays on this device', 'There is no account. Your choices are stored in this browser only and are never uploaded.')}
<section class="section" style="border-top:1px solid var(--line)"><div class="wrap max-w-3xl"><div id="me-app" class="grid gap-4">
  <noscript><p class="status err">This page needs JavaScript, because your data lives in your browser.</p></noscript>
  <div class="shop-card"><h2 class="display text-xl font-bold">Your door</h2><p id="me-door" class="mt-2 text-sm"></p></div>
  <div class="shop-card"><h2 class="display text-xl font-bold">Saved memories</h2>
    <form id="me-mem-form" class="shield-form mt-3"><label class="sr-only" for="me-mem">A memory</label><input id="me-mem" type="text" maxlength="500" placeholder="A concert, a song, a day it helped…"><button class="btn btn-primary" type="submit">Save</button></form>
    <ul id="me-mem-list" class="shield-list mt-3"></ul></div>
  <div class="shop-card"><h2 class="display text-xl font-bold">Layout</h2>
    <label class="check mt-2"><input type="checkbox" id="me-compact"> <span>Compact spacing</span></label>
    <label class="check"><input type="checkbox" id="me-motion"> <span>Reduce motion</span></label></div>
  <div class="shop-card"><h2 class="display text-xl font-bold">Music</h2><p id="me-music" class="mt-2 text-sm"></p></div>
  <div class="shop-card"><h2 class="display text-xl font-bold">Your data</h2>
    <div class="flex flex-wrap gap-3 mt-3"><button class="btn btn-ghost" type="button" id="me-export">Export (.json)</button><button class="btn btn-ghost" type="button" id="me-import">Import&hellip;</button><input id="me-file" type="file" accept="application/json,.json" hidden><button class="btn btn-ghost" type="button" id="me-clear">Erase all my data</button></div>
    <p id="me-status" class="status mt-3" role="status" aria-live="polite" hidden></p></div>
</div></div></section>`;
  return {
    title: 'Your space | ARMY Hub', description: 'Your choices on ARMY Hub, stored only in your browser.',
    path: '/me', noindex: true, body, scripts: ['/js/me.js']
  };
}

module.exports = { chooseDoor, tour, stories, care, me, receiptCard };
