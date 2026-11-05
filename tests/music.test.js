'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../public/js/music-core.js');
const { TRACKS, validate } = require('../lib/tracks');

test('tracks.js is valid', () => { assert.doesNotThrow(() => validate(TRACKS)); assert.ok(TRACKS.some(M.isPlayable)); });

test('filter by mood, era, words and playable-only', () => {
  assert.equal(M.filter(TRACKS, {}).length, TRACKS.length);
  assert.ok(M.filter(TRACKS, { mood: 'heartbreak' }).every((t) => t.moods.includes('heartbreak')));
  assert.ok(M.filter(TRACKS, { era: 'wings' }).every((t) => t.era === 'wings'));
  assert.deepEqual(M.filter(TRACKS, { query: 'jimin lie' }).map((t) => t.id), ['lie']);
  assert.deepEqual(M.filter(TRACKS, { query: 'WINGS  stigma' }).map((t) => t.id), ['stigma']);
  assert.equal(M.filter(TRACKS, { query: 'zzzz' }).length, 0);
  assert.ok(M.filter(TRACKS, { playableOnly: true }).every(M.isPlayable));
  assert.ok(M.filter(TRACKS, { playableOnly: true }).length < TRACKS.length);
});

test('search ignores accents and case', () => {
  const list = [{ id: 'a', title: 'Café Noir', artist: 'X', era: 'be', moods: ['joy'], youtubeId: '' }];
  assert.equal(M.filter(list, { query: 'CAFE' }).length, 1);
});

test('facet counts respect the other filters', () => {
  const c = M.facetCounts(TRACKS, { mood: 'heartbreak' });
  assert.equal(c.eras.wings, 2); assert.equal(c.eras.hyyh, undefined);
});

test('validate rejects bad rows', () => {
  assert.throws(() => validate([{ id: 'a', title: 't', artist: 'a', era: 'nope', moods: [], youtubeId: '' }]), /unknown era/);
  assert.throws(() => validate([{ id: 'a', title: 't', artist: 'a', era: 'be', moods: ['joy'], youtubeId: 'short' }]), /11 characters/);
});
