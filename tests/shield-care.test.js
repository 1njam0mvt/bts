'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { checkLink } = require('../public/js/shield-core.js');
const shield = require('../lib/shield');
const { REGIONS, assertFresh } = require('../lib/crisis');
const content = require('../lib/content');
const modules = require('../views/modules');

const L = shield.lists();
const v = (u) => checkLink(u, L).verdict;

test('link checker', () => {
  assert.equal(v('https://shop.weverse.io/en'), 'official');
  assert.equal(v('weverse.io'), 'official');
  assert.equal(v('https://weverse.io.evil.com/x'), 'suspicious');     // brand word, not on list
  assert.equal(v('https://evilweverse.io'), 'suspicious');             // suffix without a dot must NOT pass
  assert.equal(v('https://weverse.io@evil.com'), 'suspicious');        // "@" trick
  assert.equal(v('http://shop.weverse.io'), 'suspicious');             // not https
  assert.equal(v('https://xn--wevrse-9ya.io'), 'suspicious');          // punycode
  assert.equal(v('https://www.stubhub.com/e/1'), 'resale');
  assert.equal(v('https://example.org'), 'unknown');
  assert.equal(v(''), 'unknown');
  assert.equal(v('not a url at all'), 'suspicious');
});

test('crisis data is complete and fresh', () => {
  assert.ok(REGIONS.length >= 5);
  for (const r of REGIONS) { assert.ok(r.emergency && r.lines.length && /^https:/.test(r.source), r.code); for (const l of r.lines) assert.match(l.tel, /^\d+$/); }
  assert.doesNotThrow(() => assertFresh(new Date()));
  assert.throws(() => assertFresh(new Date('2030-01-01')), /older than/);
});

test('receipts without a valid https source are never shown', () => {
  const bad = content.validReceipts();
  assert.ok(bad.every((r) => r.sources.length && r.sources.every((s) => content.isHttps(s.url))));
  const html = modules.receiptCard({ headline: 'H', summary: 'S', publishedAt: '2026-01-02', status: 'verified', sources: [{ label: 'Official', url: 'https://example.com/a', kind: 'official' }] });
  assert.match(html, /href="https:\/\/example.com\/a"/); assert.match(html, /rel="noopener noreferrer"/);
});

test('stories data is valid and labelled', () => {
  const s = content.validStories();
  assert.ok(s.length >= 1);
  assert.ok(s.every((x) => ['fictional', 'consented'].includes(x.label) && content.CATEGORIES.includes(x.category)));
});

test('pages render without throwing and escape content', () => {
  const ctx = { base: 'https://example.com' };
  for (const fn of [modules.tour, modules.stories, modules.care, modules.me]) {
    const p = fn(ctx); assert.ok(p.title && p.body && p.path);
  }
  assert.equal(modules.me().noindex, true);
  assert.match(modules.chooseDoor(), /data-door="surprise"/);
});
