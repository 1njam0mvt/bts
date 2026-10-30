/* Admin panel. Schema-driven: each content type is a list of fields, and the form,
   list and API calls are generated from it. Talks to /api/admin/* (HTTP Basic auth). */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const root = $('#admin');

  const SCHEMA = {
    albums: {
      label: 'Albums', title: 'title', sub: (i) => `${i.type} · ${i.released || i.year}`, fields: [
        { k: 'title', l: 'Title', t: 'text', req: 1 }, { k: 'year', l: 'Year', t: 'number', req: 1 },
        { k: 'released', l: 'Release date (optional)', t: 'date', h: 'Shown on the card instead of the year.' },
        { k: 'type', l: 'Type', t: 'select', o: ['Album', 'EP', 'Single'] },
        { k: 'handle', l: 'Shopify product handle', t: 'text', h: 'The end of the product URL, e.g. arirang' },
        { k: 'shopUrl', l: 'Full Shopify link (optional)', t: 'url', h: 'Overrides the handle. Use for variants or bundles.' },
        { k: 'musicUrl', l: 'Streaming link', t: 'url', h: 'Used when no Shopify store is set.' },
        { k: 'image', l: 'Cover image', t: 'image', kind: 'cover' }]
    },
    gallery: {
      label: 'Gallery', title: 'caption', sub: (i) => (i.category || 'Members') + ' · ' + i.member + (i.credit ? ' · ' + i.credit : ''), fields: [
        { k: 'ytimport', t: 'ytimport' },
        { k: 'member', l: 'Member / tag', t: 'text', req: 1, h: 'For example RM, Jung Kook or BTS for group photos.' },
        { k: 'category', l: 'Category', t: 'select', o: ['Group', 'Members', 'Concert', 'Concept'] }, { k: 'caption', l: 'Caption', t: 'text', req: 1 },
        { k: 'credit', l: 'Photo credit / source', t: 'text', h: 'Who took it or where it comes from. Shown with the photo.' },
        { k: 'image', l: 'Photo (use only photos you have rights to)', t: 'image', kind: 'photo', req: 1 }]
    },
    videos: {
      label: 'Videos', title: 'title', sub: (i) => `${i.type} · ${i.youtubeId ? 'plays on site' : 'link only'}`, fields: [
        { k: 'type', l: 'Type', t: 'select', o: ['Music Video', 'Run BTS', 'Vlog'] },
        { k: 'title', l: 'Title', t: 'text', req: 1 }, { k: 'meta', l: 'Channel / source', t: 'text' },
        { k: 'youtubeId', l: 'YouTube link or ID', t: 'text', h: 'Paste the full link. The video then plays on the site and its thumbnail loads from YouTube.' },
        { k: 'url', l: 'Other link (if no YouTube video)', t: 'url' },
        { k: 'image', l: 'Custom thumbnail (optional)', t: 'image', kind: 'video' }]
    },
    shop: {
      label: 'Shop', title: 'title', sub: (i) => i.note, fields: [
        { k: 'title', l: 'Collection name', t: 'text', req: 1 }, { k: 'note', l: 'Short description', t: 'text' },
        { k: 'handle', l: 'Shopify collection handle', t: 'text', h: 'The end of the collection URL, e.g. albums' }]
    },
    faqs: {
      label: 'FAQs', title: 'q', sub: (i) => i.a.slice(0, 80), fields: [
        { k: 'q', l: 'Question', t: 'text', req: 1 }, { k: 'a', l: 'Answer (blank line = new paragraph)', t: 'textarea', req: 1 }]
    }
  };

  /* [key, label, hint, type] — preview and bool settings are read from nested values below */
  const SETTINGS = [
    ['siteName', 'Site name'], ['tagline', 'Tagline'],
    ['shopifyStore', 'Shopify store URL', 'https://your-store.myshopify.com (no trailing slash)'],
    ['fallbackShopUrl', 'Fallback shop URL'], ['heroAlbumId', 'Hero album', null, 'album'], ['heroBlurb', 'Hero text', null, 'area'],
    ['previewYoutube', 'Top banner preview: YouTube link or ID', 'The official video that plays in the big banner at the top of the home page. Leave empty to show the group photo instead.'],
    ['previewStart', 'Top banner preview starts at (seconds)', 'Example: 55 starts at 0:55. Pick the chorus.'],
    ['previewSeconds', 'Top banner preview length (seconds)', '10 to 120. Default 50.'],
    ['previewLabel', 'Top banner preview title', 'Example: SWIM'],
    ['preview2Youtube', 'Latest release preview: YouTube link or ID', 'A second official video, shown beside the latest release. Leave empty to show the album cover instead.'],
    ['preview2Start', 'Latest release preview starts at (seconds)', 'Example: 50'],
    ['preview2Seconds', 'Latest release preview length (seconds)', '10 to 120. Default 50.'],
    ['preview2Label', 'Latest release preview title', 'Example: NORMAL'],
    ['autoApproveLetters', 'Publish fan letters without review?', 'Keep this on "No" unless you check the wall often.', 'bool'],
    ['contactEmail', 'Public contact email (shown on Contact, Terms, Privacy)'], ['operatorName', 'Site operator name (used in Terms and Privacy)'],
    ['jurisdiction', 'Governing law (country)'], ['legalUpdated', 'Terms/Privacy last updated (YYYY-MM-DD)'],
    ['social.x', 'X URL'], ['social.instagram', 'Instagram URL'], ['social.youtube', 'YouTube URL'], ['social.tiktok', 'TikTok URL']
  ];
  const pv = (k, f, d) => (s) => { const o = s[k]; return o && o[f] != null && o[f] !== '' ? o[f] : d; };
  const READ = {
    previewYoutube: pv('preview', 'youtubeId', ''), previewStart: pv('preview', 'start', 0), previewSeconds: pv('preview', 'seconds', 50), previewLabel: pv('preview', 'label', ''),
    preview2Youtube: pv('preview2', 'youtubeId', ''), preview2Start: pv('preview2', 'start', 0), preview2Seconds: pv('preview2', 'seconds', 50), preview2Label: pv('preview2', 'label', ''),
    autoApproveLetters: (s) => String(!!s.autoApproveLetters)
  };

  let data = null, tab = 'albums', editing = null, draft = {}, flash = null;

  async function api(method, url, body) {
    const o = { method, headers: { 'X-Requested-With': 'army-admin' } };
    if (body instanceof FormData) o.body = body;
    else if (body !== undefined) { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(body); }
    const r = await fetch(url, o);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || `Request failed (${r.status})`);
    return j;
  }
  const load = async () => { data = await api('GET', '/api/admin/data'); render(); };
  const say = (t, ok = true) => { flash = { t, ok }; render(); setTimeout(() => { if (flash && flash.t === t) { flash = null; render(); } }, 6000); };
  const previewImg = (src) => `<img id="prev" src="${esc(src)}" alt="" style="width:96px;height:96px;object-fit:cover;border-radius:10px;background:var(--panel-2)">`;

  /* ---------- views ---------- */
  function shell(inner) {
    const pending = data.letters.filter((l) => l.status !== 'approved').length;
    const unread = data.messages.filter((m) => !m.read).length;
    const tabs = Object.entries(SCHEMA).map(([k, v]) => [k, v.label]).concat([
      ['letters', `Letters${pending ? ` (${pending})` : ''}`], ['messages', `Messages${unread ? ` (${unread})` : ''}`], ['settings', 'Settings']]);
    return `
<div class="flex flex-wrap items-center justify-between gap-4 mb-6">
  <h1 class="display text-2xl font-bold">ARMY Hub <span style="color:var(--violet-hi)">Admin</span></h1>
  <a class="btn btn-ghost btn-sm" href="/" target="_blank" rel="noopener">View site</a>
</div>
<div class="flex flex-wrap gap-2 mb-6" role="tablist">${tabs.map(([k, t]) => `<button class="adm-tab" role="tab" data-tab="${k}" aria-selected="${k === tab}">${t}</button>`).join('')}</div>
${flash ? `<p class="status ${flash.ok ? 'ok' : 'err'} mb-4" role="status">${esc(flash.t)}</p>` : ''}
${inner}`;
  }

  function fieldHtml(f, v) {
    if (f.t === 'ytimport') return `<div class="field"><label for="yt-url">Import a frame from an official YouTube video</label>
      <div class="flex gap-2 flex-wrap"><input id="yt-url" type="text" placeholder="Paste a YouTube link" style="flex:1;min-width:12rem"><button class="btn btn-ghost btn-sm" type="button" data-act="ytimport">Import frame</button></div>
      <span class="hint" style="justify-self:start" id="yt-status">Downloads the video's own thumbnail and fills in the credit. Only use it for videos you are allowed to feature.</span></div>`;
    const id = 'f_' + f.k, hint = f.h ? `<span class="hint" style="justify-self:start">${esc(f.h)}</span>` : '';
    if (f.t === 'select') return `<div class="field"><label for="${id}">${f.l}</label><select id="${id}" data-k="${f.k}">${f.o.map((o) => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`;
    if (f.t === 'textarea') return `<div class="field"><label for="${id}">${f.l}</label><textarea id="${id}" data-k="${f.k}" rows="5">${esc(v)}</textarea>${hint}</div>`;
    if (f.t === 'image') {
      const src = draft.thumb || draft.image;
      return `<div class="field"><label for="${id}">${f.l}</label>
        <div class="flex items-center gap-4">${src ? previewImg(src) : '<span id="prev"></span>'}
        <input id="${id}" type="file" accept="image/jpeg,image/png,image/webp,image/gif" data-upload="${f.kind}"></div>
        <span class="hint" style="justify-self:start" id="up-status">${src ? 'Choose a file to replace it.' : 'JPG, PNG, WebP or GIF up to 12 MB. It is resized and converted to WebP automatically.'}</span></div>`;
    }
    return `<div class="field"><label for="${id}">${f.l}</label><input id="${id}" data-k="${f.k}" type="${f.t}" value="${esc(v)}"${f.t === 'number' ? ' min="1900" max="2100"' : ''}>${hint}</div>`;
  }

  function collectionView() {
    const sc = SCHEMA[tab], items = data[tab];
    const form = editing === null ? '' : `
<form id="item-form" class="adm-card grid gap-4 mb-6">
  <h2 class="display text-lg font-bold">${editing === 'new' ? 'Add' : 'Edit'} ${sc.label.replace(/s$/, '').toLowerCase()}</h2>
  ${sc.fields.map((f) => fieldHtml(f, f.t === 'image' || f.t === 'ytimport' ? '' : (draft[f.k] ?? ''))).join('')}
  <div class="flex gap-3"><button class="btn btn-primary btn-sm" type="submit">Save</button><button class="btn btn-ghost btn-sm" type="button" data-act="cancel">Cancel</button></div>
</form>`;
    const tools = tab === 'albums' ? `
<div class="adm-card mb-6 grid gap-3">
  <p class="font-bold">Official cover art</p>
  <p class="text-sm" style="color:var(--muted)">Fetches each album's artwork from Apple's public iTunes catalogue and saves it here. Needs this server to reach the internet.</p>
  <div class="flex flex-wrap gap-2"><button class="btn btn-primary btn-sm" data-act="covers">Get missing covers</button><button class="btn btn-ghost btn-sm" data-act="covers-all">Replace every cover</button></div>
</div>` : '';
    return `
<div class="flex items-center justify-between mb-4"><p style="color:var(--muted)">${items.length} item${items.length === 1 ? '' : 's'}. Order here is the order on the site.</p>
<button class="btn btn-primary btn-sm" data-act="add">Add new</button></div>
${tools}${form}
<div class="grid gap-3">${items.map((it, i) => `
<div class="adm-row">
  ${it.thumb || it.image ? `<img src="${esc(it.thumb || it.image)}" alt="" loading="lazy">` : ''}
  <div class="min-w-0 flex-1"><p class="font-bold" style="overflow-wrap:anywhere">${esc(it[sc.title])}</p><p class="text-sm" style="color:var(--muted);overflow-wrap:anywhere">${esc(sc.sub(it))}</p></div>
  <div class="flex flex-wrap gap-2 justify-end">
    <button class="chip" data-act="up" data-id="${it.id}" aria-label="Move up"${i === 0 ? ' disabled' : ''}>&uarr;</button>
    <button class="chip" data-act="down" data-id="${it.id}" aria-label="Move down"${i === items.length - 1 ? ' disabled' : ''}>&darr;</button>
    <button class="chip" data-act="edit" data-id="${it.id}">Edit</button>
    <button class="chip" data-act="del" data-id="${it.id}">Delete</button>
  </div>
</div>`).join('')}</div>`;
  }

  function lettersView() {
    const list = data.letters.slice().sort((a, b) => (a.status === b.status ? b.createdAt.localeCompare(a.createdAt) : a.status === 'approved' ? 1 : -1));
    const auto = data.settings.autoApproveLetters;
    const note = `<p class="mb-4" style="color:var(--muted)">${auto ? 'Auto-publish is ON: letters go live immediately. You can switch it off in Settings.' : 'Every new or edited letter waits here until you approve it.'}</p>`;
    if (!list.length) return note + '<div class="empty">No letters yet. They appear here after visitors send them from the home page.</div>';
    return note + `<div class="grid gap-4">${list.map((l) => `
<article class="adm-card">
  <div class="flex flex-wrap justify-between gap-2"><p class="font-bold">Dear ${esc(l.to)}, <span class="text-sm" style="color:var(--muted)">from ${esc(l.nickname)}${l.country ? ' · ' + esc(l.country) : ''}</span></p>
  <span class="badge ${l.status === 'approved' ? 'live' : 'wait'}">${l.status === 'approved' ? 'On the wall' : 'Waiting'}</span></div>
  <p class="mt-3" style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(l.message)}</p>
  <p class="label mt-3" style="color:var(--muted)">${esc(new Date(l.updatedAt || l.createdAt).toLocaleString())}</p>
  <div class="flex gap-2 mt-4">${l.status === 'approved'
        ? `<button class="chip" data-act="unapprove" data-id="${l.id}">Hide from wall</button>`
        : `<button class="chip" data-act="approve" data-id="${l.id}" style="border-color:var(--ok-line);color:var(--ok)">Approve</button>`}
    <button class="chip" data-act="dellet" data-id="${l.id}">Delete</button></div>
</article>`).join('')}</div>`;
  }

  function messagesView() {
    if (!data.messages.length) return '<div class="empty">No messages yet. Messages sent from the Contact page appear here.</div>';
    return `<div class="grid gap-4">${data.messages.slice().reverse().map((m) => `
<article class="adm-card" style="${m.read ? 'opacity:.7' : ''}">
  <div class="flex flex-wrap justify-between gap-2"><p class="font-bold">${esc(m.name)} <span class="text-sm" style="color:var(--muted)">&lt;${esc(m.email)}&gt;</span></p><p class="label" style="color:var(--muted)">${esc(new Date(m.createdAt).toLocaleString())}</p></div>
  <p class="label mt-1" style="color:var(--violet-hi)">${esc(m.subject)}</p>
  <p class="mt-3" style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(m.message)}</p>
  <div class="flex gap-2 mt-4">${m.read ? '' : `<button class="chip" data-act="read" data-id="${m.id}">Mark read</button>`}<button class="chip" data-act="delmsg" data-id="${m.id}">Delete</button></div>
</article>`).join('')}</div>`;
  }

  const getPath = (o, p) => p.split('.').reduce((a, k) => (a ? a[k] : ''), o) ?? '';
  function settingsView() {
    return `<form id="settings-form" class="adm-card grid gap-4 max-w-2xl">
${SETTINGS.map(([k, l, h, t]) => {
      const v = READ[k] ? READ[k](data.settings) : getPath(data.settings, k), id = 's_' + k;
      const hint = h ? `<span class="hint" style="justify-self:start">${esc(h)}</span>` : '';
      if (t === 'album') return `<div class="field"><label for="${id}">${l}</label><select id="${id}" data-k="${k}">${data.albums.map((a) => `<option value="${a.id}"${a.id === v ? ' selected' : ''}>${esc(a.title)}</option>`).join('')}</select></div>`;
      if (t === 'bool') return `<div class="field"><label for="${id}">${l}</label><select id="${id}" data-k="${k}"><option value="false"${v === 'false' ? ' selected' : ''}>No, I approve each letter</option><option value="true"${v === 'true' ? ' selected' : ''}>Yes, publish immediately</option></select>${hint}</div>`;
      if (t === 'area') return `<div class="field"><label for="${id}">${l}</label><textarea id="${id}" data-k="${k}" rows="3">${esc(v)}</textarea></div>`;
      return `<div class="field"><label for="${id}">${l}</label><input id="${id}" data-k="${k}" value="${esc(v)}">${hint}</div>`;
    }).join('')}
<div><button class="btn btn-primary btn-sm" type="submit">Save settings</button></div></form>`;
  }

  function render() {
    if (!data) return;
    const inner = tab === 'messages' ? messagesView() : tab === 'letters' ? lettersView() : tab === 'settings' ? settingsView() : collectionView();
    root.innerHTML = shell(inner);
  }

  /* ---------- events ---------- */
  const sure = (t) => { if (t.dataset.sure) return true; t.dataset.sure = '1'; t.textContent = 'Click again to confirm'; return false; };

  root.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-tab],[data-act]');
    if (!t) return;
    try {
      if (t.dataset.tab) { tab = t.dataset.tab; editing = null; draft = {}; return render(); }
      const { act, id } = t.dataset;
      if (act === 'add') { editing = 'new'; draft = {}; SCHEMA[tab].fields.forEach((f) => { if (f.t === 'select') draft[f.k] = f.o[0]; }); return render(); }
      if (act === 'cancel') { editing = null; draft = {}; return render(); }
      if (act === 'edit') { editing = id; draft = { ...data[tab].find((x) => x.id === id) }; return render(); }
      if (act === 'up' || act === 'down') { await api('POST', `/api/admin/${tab}/${id}/move`, { dir: act === 'up' ? -1 : 1 }); return load(); }
      if (act === 'del') { if (!sure(t)) return; await api('DELETE', `/api/admin/${tab}/${id}`); say('Deleted.'); return load(); }
      if (act === 'read') { await api('PATCH', `/api/admin/messages/${id}`, { read: true }); return load(); }
      if (act === 'delmsg') { if (!sure(t)) return; await api('DELETE', `/api/admin/messages/${id}`); return load(); }
      if (act === 'approve' || act === 'unapprove') { await api('PATCH', `/api/admin/letters/${id}`, { status: act === 'approve' ? 'approved' : 'pending' }); return load(); }
      if (act === 'dellet') { if (!sure(t)) return; await api('DELETE', `/api/admin/letters/${id}`); return load(); }
      if (act === 'covers' || act === 'covers-all') {
        t.disabled = true; t.textContent = 'Fetching covers…';
        const r = await api('POST', '/api/admin/import-covers', { all: act === 'covers-all' });
        const parts = [];
        if (r.updated.length) parts.push(`Updated: ${r.updated.join(', ')}.`);
        if (r.missed.length) parts.push(`No match on Apple for: ${r.missed.join(', ')}. Upload those by hand.`);
        if (r.network) parts.push(`Stopped early: ${r.network}`);
        if (!parts.length) parts.push('Every cover is already set. Use "Replace every cover" to fetch them again.');
        await load(); return say(parts.join(' '), !r.network);
      }
      if (act === 'ytimport') {
        const st = $('#yt-status'); st.textContent = 'Importing…';
        const r = await api('POST', '/api/admin/import-youtube', { url: $('#yt-url').value });
        Object.assign(draft, { image: r.image, thumb: r.thumb, width: r.width, height: r.height, credit: r.credit });
        const cap = $('#f_caption'), cr = $('#f_credit');
        if (cr) cr.value = r.credit; if (cap && !cap.value && r.title) cap.value = r.title;
        $('#prev').outerHTML = previewImg(r.thumb); $('#up-status').textContent = 'Imported. Click Save to keep it.';
        st.textContent = 'Frame imported' + (r.credit ? ` (credit: ${r.credit})` : '') + '.';
      }
    } catch (err) {
      const st = $('#yt-status');
      if (t.dataset.act === 'ytimport' && st) st.textContent = err.message; else say(err.message, false);
    }
  });

  root.addEventListener('change', async (e) => {
    const inp = e.target.closest('[data-upload]');
    if (!inp || !inp.files[0]) return;
    const st = $('#up-status');
    st.textContent = 'Uploading…';
    try {
      const fd = new FormData(); fd.append('file', inp.files[0]);
      const r = await api('POST', `/api/admin/upload?kind=${inp.dataset.upload}`, fd);
      Object.assign(draft, { image: r.image, thumb: r.thumb, width: r.width, height: r.height });
      $('#prev').outerHTML = previewImg(r.thumb);
      st.textContent = 'Uploaded. Click Save to keep it.';
    } catch (err) { st.textContent = err.message; }
  });

  root.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      if (e.target.id === 'item-form') {
        const body = { ...draft };
        e.target.querySelectorAll('[data-k]').forEach((el) => { body[el.dataset.k] = el.value; });
        if (editing === 'new') await api('POST', `/api/admin/${tab}`, body);
        else await api('PUT', `/api/admin/${tab}/${editing}`, body);
        editing = null; draft = {}; say('Saved.'); await load();
      } else if (e.target.id === 'settings-form') {
        const body = { social: {} };
        e.target.querySelectorAll('[data-k]').forEach((el) => {
          const k = el.dataset.k;
          if (k.startsWith('social.')) body.social[k.slice(7)] = el.value; else body[k] = el.value;
        });
        await api('PUT', '/api/admin/settings', body); say('Settings saved.'); await load();
      }
    } catch (err) { say(err.message, false); }
  });

  load().catch((err) => { root.innerHTML = `<p class="status err">${esc(err.message)}</p>`; });
})();