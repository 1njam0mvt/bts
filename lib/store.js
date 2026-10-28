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

function load() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.copyFileSync(path.join(ROOT, 'data', 'seed.json'), FILE);
  db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  db.messages = db.messages || [];
  db.letters = db.letters || [];
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
