/* ARMY Hub local-first store: everything a visitor chooses stays in THEIR browser (localStorage). Nothing is sent anywhere.
   Loaded on every page as window.ArmyStore. Also works in Node (tests/): the same file is require()d.
   - One versioned key. sanitize() is the only way data gets in, whether it comes from localStorage or from a file the visitor imports.
   - If localStorage is blocked the store keeps working in memory for that visit. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(root);
  else root.ArmyStore = factory(root);
})(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';

  const DOORS = ['song', 'member', 'performance', 'lyric', 'funny', 'tour', 'surprise'];
  const MOODS = ['heartbreak', 'loneliness', 'healing', 'joy', 'comfort', 'courage', 'nostalgia'];
  const ERAS = ['school', 'hyyh', 'wings', 'love-yourself', 'map-of-the-soul', 'be', 'proof', 'latest'];
  const KEY = 'armyhub:v1';
  const MAX_IMPORT_BYTES = 200000;
  const MAX_MEMORIES = 200;
  const MAX_MEMORY_CHARS = 500;

  const DEFAULT = () => ({
    v: 1,
    door: null,
    memories: [],
    layout: { density: 'cozy', reduceMotion: false },
    audio: { enabled: false, trackId: null, volume: 0.6, mood: 'all', era: 'all', playableOnly: true }
  });

  const isObj = (x) => typeof x === 'object' && x !== null && !Array.isArray(x);
  const oneOf = (list, x) => (list.indexOf(x) > -1 ? x : null);
  const str = (x, max) => (typeof x === 'string' ? x.slice(0, max) : '');
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  /** Turn ANY value into a valid state object. Unknown fields are dropped; bad values fall back to defaults. */
  function sanitize(input) {
    const o = isObj(input) ? input : {};
    const layout = isObj(o.layout) ? o.layout : {};
    const audio = isObj(o.audio) ? o.audio : {};
    const memories = (Array.isArray(o.memories) ? o.memories : [])
      .filter(isObj)
      .map((m) => ({
        id: str(m.id, 40) || newId(),
        text: str(m.text, MAX_MEMORY_CHARS).trim(),
        createdAt: typeof m.createdAt === 'string' && !Number.isNaN(Date.parse(m.createdAt)) ? new Date(m.createdAt).toISOString() : new Date().toISOString()
      }))
      .filter((m) => m.text)
      .slice(0, MAX_MEMORIES);
    const vol = typeof audio.volume === 'number' && Number.isFinite(audio.volume) ? Math.min(1, Math.max(0, audio.volume)) : 0.6;
    return {
      v: 1,
      door: oneOf(DOORS, o.door),
      memories,
      layout: { density: layout.density === 'compact' ? 'compact' : 'cozy', reduceMotion: layout.reduceMotion === true },
      audio: {
        enabled: audio.enabled === true,
        trackId: typeof audio.trackId === 'string' && /^[\w-]{1,60}$/.test(audio.trackId) ? audio.trackId : null,
        volume: vol,
        mood: oneOf(MOODS, audio.mood) || 'all',
        era: oneOf(ERAS, audio.era) || 'all',
        playableOnly: audio.playableOnly !== false
      }
    };
  }

  /* ---------- storage ---------- */
  let cache = null;
  const listeners = [];
  const emit = () => listeners.slice().forEach((fn) => { try { fn(cache); } catch (e) { /* a bad listener must not break the others */ } });

  function read() {
    try {
      const raw = root.localStorage.getItem(KEY);
      return raw ? sanitize(JSON.parse(raw)) : DEFAULT();
    } catch (e) {
      return cache || DEFAULT();                       // blocked or corrupt: keep what we have
    }
  }
  function get() { if (!cache) cache = read(); return cache; }
  function write() { try { root.localStorage.setItem(KEY, JSON.stringify(cache)); } catch (e) { /* memory only */ } }

  /** set(fn): fn receives the current state and returns the new one (or mutates it). */
  function set(fn) {
    const cur = get();
    const next = fn(JSON.parse(JSON.stringify(cur)));
    cache = sanitize(next === undefined ? cur : next);
    write(); emit();
    return cache;
  }
  function clear() {
    cache = DEFAULT();
    try { root.localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    emit();
  }
  function exportJson() { return JSON.stringify(get(), null, 2); }
  function importJson(text) {
    if (typeof text !== 'string' || text.length > MAX_IMPORT_BYTES) return { ok: false, error: 'That file is too large to be an ARMY Hub export.' };
    let parsed;
    try { parsed = JSON.parse(text); } catch (e) { return { ok: false, error: 'That file is not valid JSON.' }; }
    if (!isObj(parsed) || parsed.v !== 1) return { ok: false, error: 'This does not look like an ARMY Hub export (version 1).' };
    cache = sanitize(parsed); write(); emit();
    return { ok: true };
  }
  function subscribe(fn) { listeners.push(fn); return () => { const i = listeners.indexOf(fn); if (i > -1) listeners.splice(i, 1); }; }

  /* Layout choices apply to the whole site (html[data-density], html[data-reduce-motion]). */
  function applyLayout() {
    const de = root.document && root.document.documentElement;
    if (!de) return;
    const l = get().layout;
    de.setAttribute('data-density', l.density);
    de.setAttribute('data-reduce-motion', String(l.reduceMotion));
  }
  listeners.push(applyLayout);
  applyLayout();

  // Another tab changed the data: pick it up.
  if (root.addEventListener) root.addEventListener('storage', (e) => { if (e.key === KEY || e.key === null) { cache = read(); emit(); } });

  return { DOORS, MOODS, ERAS, KEY, sanitize, get, set, clear, exportJson, importJson, subscribe, newId };
});
