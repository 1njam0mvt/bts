'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Store = require('../public/js/store.js');

test('sanitize returns defaults for junk', () => {
  const d = Store.sanitize(null);
  assert.equal(d.v, 1); assert.equal(d.door, null); assert.deepEqual(d.memories, []);
  assert.equal(Store.sanitize('x').audio.volume, 0.6);
});

test('sanitize drops hostile or malformed data', () => {
  const s = Store.sanitize({
    v: 9, door: 'admin', extra: 1,
    audio: { volume: 99, mood: '<script>', era: 'wings', trackId: 'bad id!', playableOnly: false },
    layout: { density: 'x', reduceMotion: 'yes' },
    memories: [{ text: '  hi ', createdAt: 'nope' }, { text: '' }, 42, { text: 'x'.repeat(900) }]
  });
  assert.equal(s.door, null); assert.equal(s.audio.volume, 1); assert.equal(s.audio.mood, 'all');
  assert.equal(s.audio.era, 'wings'); assert.equal(s.audio.trackId, null); assert.equal(s.audio.playableOnly, false);
  assert.equal(s.layout.density, 'cozy'); assert.equal(s.layout.reduceMotion, false);
  assert.equal(s.memories.length, 2); assert.equal(s.memories[0].text, 'hi'); assert.equal(s.memories[1].text.length, 500);
  assert.ok(!('extra' in s));
});

test('import / export round trip and rejection', () => {
  const mem = new Map();
  globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) };
  Store.set((s) => { s.door = 'tour'; s.memories.push({ id: 'a', text: 'concert night', createdAt: new Date().toISOString() }); return s; });
  const out = Store.exportJson();
  Store.clear(); assert.equal(Store.get().door, null);
  assert.deepEqual(Store.importJson(out), { ok: true });
  assert.equal(Store.get().door, 'tour'); assert.equal(Store.get().memories[0].text, 'concert night');
  assert.equal(Store.importJson('not json').ok, false);
  assert.equal(Store.importJson('{"v":2}').ok, false);
  assert.equal(Store.importJson('x'.repeat(300000)).ok, false);
  delete globalThis.localStorage;
});

test('subscribe is called on change and can unsubscribe', () => {
  let n = 0; const off = Store.subscribe(() => { n++; });
  Store.set((s) => s); assert.equal(n, 1);
  off(); Store.set((s) => s); assert.equal(n, 1);
});
