/* /me: see, change, export, import and erase the data this site keeps in YOUR browser. */
(() => {
  'use strict';
  const S = window.ArmyStore;
  const root = document.getElementById('me-app');
  if (!S || !root) return;
  const $ = (id) => document.getElementById(id);
  const DOOR_TITLE = { song: 'A song', member: 'A member', performance: 'A performance', lyric: 'A lyric', funny: 'A funny clip', tour: 'The tour', surprise: 'Surprise me' };
  const MOOD = window.MusicCore ? window.MusicCore.MOOD_LABEL : {};
  const ERA = window.MusicCore ? window.MusicCore.ERA_LABEL : {};

  const say = (t, ok) => { const s = $('me-status'); s.hidden = !t; s.textContent = t || ''; s.className = 'status mt-3 ' + (ok ? 'ok' : 'err'); };

  function paint() {
    const st = S.get();
    $('me-door').textContent = st.door ? 'You usually come in through "' + DOOR_TITLE[st.door] + '".' : 'You have not chosen a door yet.';
    const list = $('me-mem-list'); list.replaceChildren();
    st.memories.forEach((m) => {
      const li = document.createElement('li'); li.className = 'mem';
      const t = document.createElement('span'); t.textContent = m.text;
      const rm = document.createElement('button'); rm.type = 'button'; rm.className = 'link'; rm.textContent = 'Remove';
      rm.addEventListener('click', () => S.set((s) => { s.memories = s.memories.filter((x) => x.id !== m.id); return s; }));
      li.append(t, rm); list.append(li);
    });
    if (!st.memories.length) { const li = document.createElement('li'); li.className = 'muted'; li.textContent = 'Nothing saved yet.'; list.append(li); }
    $('me-compact').checked = st.layout.density === 'compact';
    $('me-motion').checked = st.layout.reduceMotion;
    const a = st.audio;
    $('me-music').textContent = 'Mood: ' + (a.mood === 'all' ? 'any' : MOOD[a.mood] || a.mood) + ' · Era: ' + (a.era === 'all' ? 'any' : ERA[a.era] || a.era) + ' · Volume: ' + Math.round(a.volume * 100) + '%' + (a.enabled ? '' : ' · No music');
  }

  $('me-mem-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('me-mem').value.trim(); if (!v) return;
    S.set((s) => { s.memories.unshift({ id: S.newId(), text: v, createdAt: new Date().toISOString() }); return s; });
    $('me-mem').value = '';
  });
  $('me-compact').addEventListener('change', (e) => S.set((s) => { s.layout.density = e.target.checked ? 'compact' : 'cozy'; return s; }));
  $('me-motion').addEventListener('change', (e) => S.set((s) => { s.layout.reduceMotion = e.target.checked; return s; }));

  $('me-export').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([S.exportJson()], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'army-hub-data.json'; a.click(); URL.revokeObjectURL(url);
    say('Exported.', true);
  });
  $('me-import').addEventListener('click', () => $('me-file').click());
  $('me-file').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = S.importJson(await f.text());
    say(r.ok ? 'Imported.' : r.error, r.ok); e.target.value = '';
  });
  let sure = false;
  $('me-clear').addEventListener('click', (e) => {
    if (!sure) { sure = true; e.target.textContent = 'Click again to erase everything'; setTimeout(() => { sure = false; e.target.textContent = 'Erase all my data'; }, 5000); return; }
    sure = false; e.target.textContent = 'Erase all my data'; S.clear(); say('Everything was erased from this browser.', true);
  });

  S.subscribe(paint);
  paint();
})();
