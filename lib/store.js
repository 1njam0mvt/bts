'use strict';
/* Tiny JSON-file database. Fine for a fan site (one process, low write volume).
   Writes are queued and atomic (temp file + rename) so a crash never leaves half a file. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
/* On serverless hosts (Vercel etc.) only /tmp is writable, so keep the database there. */
const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL ? '/tmp/data' : path.join(ROOT, 'data'));
const FILE = path.join(DATA_DIR, 'db.json');

let db;
let queue = Promise.resolve();

/* Brings an older db.json up to date without touching anything the owner edited. */
const DEFAULT_PREVIEW2 = { youtubeId: 'GEk4jHwfFTA', start: 50, seconds: 50, label: 'NORMAL' };
const KNOWN_VIDEOS = [[/hooligan/i, 'diBO0gMuTXo']];          // official uploads added after the first release of the project
function migrate(d) {
  const s = d.settings || (d.settings = {});
  if (s.preview2 === undefined) s.preview2 = { ...DEFAULT_PREVIEW2 };
  for (const v of d.videos || []) {
    if (v.youtubeId) continue;
    const hit = KNOWN_VIDEOS.find(([re]) => re.test(v.title));
    if (hit) v.youtubeId = hit[1];
  }
}

function load() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.copyFileSync(path.join(ROOT, 'data', 'seed.json'), FILE);
  db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  db.messages = db.messages || [];
  db.letters = db.letters || [];
  migrate(db);
  return db;
}

function save() {
  queue = queue
    .then(async () => {
      const tmp = FILE + '.tmp';
      await fs.promises.writeFile(tmp, JSON.stringify(db, null, 2));
      await fs.promises.rename(tmp, FILE);
    })
    .catch((e) => console.error('[store] save failed:', e));
  return queue;
}

const newId = () => crypto.randomBytes(5).toString('hex');
const get = () => db;

module.exports = { load, save, get, newId, ROOT };
