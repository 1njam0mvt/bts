/* "Customize" music tray + floating player. Loaded on every page.
   - Songs come from lib/tracks.js (inline JSON #tracks-data). They play in the YouTube embedded player from official videos.
   - Nothing from YouTube is requested until the visitor presses play. The player uses youtube-nocookie.com.
   - Filters (mood, era, "playable only"), volume and the last song are remembered in this browser (ArmyStore).
   - Browsers block autoplay with sound, so a returning visitor sees a "Resume" button instead of surprise music.
   - YouTube's embed rules ask for a visible player of at least 200x200 px, so the player is shown in a small card, not hidden. */
(() => {
  'use strict';
  const S = window.ArmyStore, M = window.MusicCore;
  const dataEl = document.getElementById('tracks-data');
  if (!S || !M || !dataEl) return;

  let TRACKS = [];
  try { TRACKS = JSON.parse(dataEl.textContent) || []; } catch (e) { return; }

  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const audio = () => S.get().audio;
  const setAudio = (patch) => S.set((s) => { Object.assign(s.audio, patch); return s; });
  const byId = (id) => TRACKS.find((t) => t.id === id) || null;

  let player = null, apiPromise = null, playing = false, active = false, queue = [], fails = 0, query = '', isOpen = false;

  /* ---------- YouTube IFrame API, loaded on first play only ---------- */
  function loadApi() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (!apiPromise) apiPromise = new Promise((resolve, reject) => {
      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api'; s.async = true;
      s.onerror = () => { apiPromise = null; reject(new Error('blocked')); };
      document.head.appendChild(s);
    });
    return apiPromise;
  }

  /* ---------- build the UI ---------- */
  const btn = el('button', 'icon-btn music-btn');
  btn.id = 'music-btn'; btn.type = 'button';
  btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'music-tray');
  btn.setAttribute('aria-label', 'Customize your universe: music'); btn.title = 'Music';
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>';
  const themeBtn = $('#theme-btn');
  if (themeBtn && themeBtn.parentNode) themeBtn.parentNode.insertBefore(btn, themeBtn); else document.body.appendChild(btn);

  const tray = el('aside', 'music-tray'); tray.id = 'music-tray'; tray.hidden = true; tray.setAttribute('aria-label', 'Customize your universe');
  const head = el('div', 'mt-head'); head.append(el('h2', 'display mt-title', 'Customize your universe'));
  const close = el('button', 'icon-btn'); close.type = 'button'; close.setAttribute('aria-label', 'Close'); close.textContent = '✕'; head.append(close);
  const moods = el('div', 'mt-chips'); moods.setAttribute('role', 'group'); moods.setAttribute('aria-label', 'Mood');
  const search = el('input', 'mt-input'); search.type = 'search'; search.placeholder = 'Search songs or artists…'; search.setAttribute('aria-label', 'Search songs or artists'); search.autocomplete = 'off'; search.maxLength = 60;
  const row = el('div', 'mt-row');
  const era = el('select', 'mt-input'); era.setAttribute('aria-label', 'Era');
  const nomusic = el('button', 'chip'); nomusic.type = 'button'; nomusic.setAttribute('role', 'switch'); nomusic.textContent = 'No music';
  row.append(era, nomusic);
  const onlyLbl = el('label', 'check mt-only'); const only = el('input'); only.type = 'checkbox'; onlyLbl.append(only, el('span', null, 'Show only songs that can play here'));
  const count = el('p', 'mt-count'); count.setAttribute('aria-live', 'polite');
  const err = el('p', 'status err mt-err'); err.setAttribute('role', 'alert'); err.hidden = true;
  const list = el('ul', 'mt-list');
  const volLbl = el('label', 'mt-vol', 'Volume '); const vol = el('input'); vol.type = 'range'; vol.min = '0'; vol.max = '1'; vol.step = '0.05'; vol.setAttribute('aria-label', 'Volume'); volLbl.append(vol);
  const note = el('p', 'mt-note', 'Songs play from official YouTube videos, only after you press play. Mood tags are this site’s own picks. Your choices stay on this device.');
  tray.append(head, moods, search, row, onlyLbl, count, err, list, volLbl, note);

  const card = el('div', 'music-card'); card.hidden = true; card.setAttribute('role', 'region'); card.setAttribute('aria-label', 'Now playing');
  const host = el('div', 'music-host'); const cardTitle = el('p', 'music-now');
  const ctl = el('div', 'music-ctl');
  const bPlay = el('button', 'chip', 'Pause'), bNext = el('button', 'chip', 'Next'), bStop = el('button', 'chip', 'Stop');
  [bPlay, bNext, bStop].forEach((b) => { b.type = 'button'; ctl.append(b); });
  card.append(host, cardTitle, ctl);

  const resume = el('button', 'music-resume'); resume.type = 'button'; resume.hidden = true;
  document.body.append(tray, card, resume);

  /* ---------- rendering ---------- */
  const filterNow = () => ({ query, mood: audio().mood, era: audio().era, playableOnly: audio().playableOnly });

  function paintEraOptions(counts) {
    const cur = audio().era;
    era.replaceChildren();
    const all = el('option', null, 'All eras'); all.value = 'all'; era.append(all);
    S.ERAS.forEach((e) => { const o = el('option', null, M.ERA_LABEL[e] + ' (' + (counts.eras[e] || 0) + ')'); o.value = e; o.disabled = !counts.eras[e] && cur !== e; era.append(o); });
    era.value = cur;
  }
  function paintMoods(counts) {
    const cur = audio().mood;
    moods.replaceChildren();
    const mk = (id, label, disabled) => {
      const b = el('button', 'chip', label); b.type = 'button'; b.dataset.mood = id; b.setAttribute('aria-pressed', String(cur === id)); b.disabled = disabled; moods.append(b);
    };
    mk('all', 'Any mood', false);
    S.MOODS.forEach((m) => mk(m, M.MOOD_LABEL[m], !counts.moods[m] && cur !== m));
  }
  function paintList() {
    const shown = M.filter(TRACKS, filterNow());
    const counts = M.facetCounts(TRACKS, filterNow());
    paintMoods(counts); paintEraOptions(counts);
    const playable = TRACKS.filter(M.isPlayable).length;
    count.textContent = shown.length + ' of ' + (audio().playableOnly ? playable : TRACKS.length) + ' songs';
    list.replaceChildren();
    const cur = audio().trackId;
    shown.forEach((t) => {
      const li = el('li'); const b = el('button', 'mt-song'); b.type = 'button'; b.dataset.id = t.id; b.disabled = !M.isPlayable(t);
      const on = active && cur === t.id;
      b.setAttribute('aria-current', String(on));
      b.append(el('span', 'mt-play', on && playing ? '❚❚' : '▶'));
      const txt = el('span', 'mt-txt'); txt.append(el('span', 'mt-name', t.title), el('span', 'mt-sub', t.artist + ' · ' + (M.ERA_LABEL[t.era] || '') + (M.isPlayable(t) ? '' : ' · video not added yet')));
      b.append(txt); li.append(b); list.append(li);
    });
    if (!shown.length) list.append(el('li', 'mt-none', 'No songs match. Try fewer filters.'));
  }
  function paintState() {
    const a = audio(), t = byId(a.trackId);
    nomusic.setAttribute('aria-checked', String(!a.enabled)); nomusic.setAttribute('aria-pressed', String(!a.enabled));
    only.checked = a.playableOnly; vol.value = String(a.volume);
    card.hidden = !active; cardTitle.textContent = t ? t.title + ' · ' + t.artist : '';
    bPlay.textContent = playing ? 'Pause' : 'Play';
    btn.classList.toggle('is-playing', active && playing);
    const canResume = !active && a.enabled && t && M.isPlayable(t);
    resume.hidden = !canResume; if (canResume) resume.textContent = '▶ Resume: ' + t.title;
  }
  const paintAll = () => { paintList(); paintState(); };
  const showErr = (m) => { err.hidden = !m; err.textContent = m || ''; };

  /* ---------- playback ---------- */
  function play(t, q) {
    if (!t || !M.isPlayable(t)) { showErr('This song has no video yet.'); return; }
    if (q) queue = q.filter(M.isPlayable); else if (!queue.length) queue = TRACKS.filter(M.isPlayable);
    showErr(''); active = true; setAudio({ enabled: true, trackId: t.id }); paintAll();
    loadApi().then((YT) => {
      if (player) { player.loadVideoById(t.youtubeId); return; }
      host.replaceChildren(); const mount = el('div'); host.append(mount);
      player = new YT.Player(mount, {
        width: '360', height: '202', videoId: t.youtubeId, host: 'https://www.youtube-nocookie.com',
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, playsinline: 1, rel: 0, origin: location.origin },
        events: {
          onReady: (e) => { e.target.setVolume(Math.round(audio().volume * 100)); e.target.playVideo(); },
          onStateChange: (e) => {
            if (e.data === 1) { playing = true; fails = 0; } else if (e.data === 2) playing = false; else if (e.data === 0) { playing = false; next(); }
            paintAll();
          },
          onError: () => { showErr('That song cannot be played here. Skipping.'); if (++fails <= queue.length) next(); else stop(false); }
        }
      });
    }).catch(() => { showErr('The music player could not load. A blocker may be stopping it.'); active = false; paintAll(); });
  }
  function next() {
    if (queue.length < 2) return;
    const i = queue.findIndex((t) => t.id === audio().trackId);
    play(queue[(i + 1) % queue.length]);
  }
  function toggle() {
    if (!player) { const t = byId(audio().trackId); if (t) play(t, queue.length ? queue : null); return; }
    if (playing) player.pauseVideo(); else player.playVideo();
  }
  function stop(persist) {
    if (player) player.stopVideo();
    playing = false; active = false;
    if (persist !== false) setAudio({ enabled: false });
    paintAll();
  }

  /* ---------- open / close ---------- */
  function openTray(mood) {
    if (mood && S.MOODS.indexOf(mood) > -1) setAudio({ mood });
    isOpen = true; tray.hidden = false; btn.setAttribute('aria-expanded', 'true'); paintAll(); search.focus({ preventScroll: true });
  }
  function closeTray() { isOpen = false; tray.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.focus({ preventScroll: true }); }

  btn.addEventListener('click', () => (isOpen ? closeTray() : openTray()));
  close.addEventListener('click', closeTray);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) closeTray(); });
  document.addEventListener('click', (e) => { const o = e.target.closest('[data-open-music]'); if (o) { e.preventDefault(); openTray(o.dataset.openMusic); } });

  moods.addEventListener('click', (e) => { const b = e.target.closest('[data-mood]'); if (b && !b.disabled) { setAudio({ mood: b.dataset.mood }); paintAll(); } });
  era.addEventListener('change', () => { setAudio({ era: era.value }); paintAll(); });
  search.addEventListener('input', () => { query = search.value; paintList(); });
  only.addEventListener('change', () => { setAudio({ playableOnly: only.checked }); paintAll(); });
  nomusic.addEventListener('click', () => { if (audio().enabled) stop(true); else { setAudio({ enabled: true }); paintAll(); } });
  vol.addEventListener('input', () => { const v = Number(vol.value); setAudio({ volume: v }); if (player) player.setVolume(Math.round(v * 100)); });
  list.addEventListener('click', (e) => {
    const b = e.target.closest('.mt-song'); if (!b || b.disabled) return;
    const t = byId(b.dataset.id);
    if (active && audio().trackId === t.id) toggle(); else play(t, M.filter(TRACKS, filterNow()));
  });
  bPlay.addEventListener('click', toggle); bNext.addEventListener('click', next); bStop.addEventListener('click', () => stop(true));
  resume.addEventListener('click', () => { const t = byId(audio().trackId); if (t) play(t); });
  S.subscribe(() => { paintState(); });                    // another tab changed the data

  paintAll();
  window.ArmyMusic = { open: openTray, play, stop };         // small public handle for other scripts and tests
})();
