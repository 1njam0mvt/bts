'use strict';
/* Editorial content kept in plain JSON files in /data. Edit them, commit, push. They are read-only on the server, so this works on Vercel too.
   - data/receipts.json : source-verified update cards (see README)
   - data/stories.json  : stories shown on the Story Wall (you publish them after reading submissions) */
const receipts = require('../data/receipts.json');
const stories = require('../data/stories.json');

const CATEGORIES = ['Grief', 'Loneliness', 'Coming-of-age', 'Healing', 'Joy'];
const isHttps = (u) => { try { return new URL(u).protocol === 'https:'; } catch { return false; } };

/** A receipt without at least one valid https source is dropped, so an unsourced claim can never be shown. */
const validReceipts = () => receipts
  .map((r) => ({ ...r, sources: (r.sources || []).filter((s) => s && s.label && isHttps(s.url)) }))
  .filter((r) => r.headline && r.summary && r.publishedAt && r.sources.length)
  .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));

const validStories = () => stories.filter((s) => s && s.id && s.body && CATEGORIES.includes(s.category) && ['fictional', 'consented'].includes(s.label));

module.exports = { CATEGORIES, validReceipts, validStories, isHttps };
