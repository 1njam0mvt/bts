'use strict';
/* ARMY Hub server: public pages, contact API, password-protected admin API and image uploads. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const sharp = require('sharp');

try { process.loadEnvFile(path.join(__dirname, '.env')); } catch { /* no .env file: use real environment */ }

const store = require('./lib/store');
const { esc, ytId } = require('./lib/util');
const { CLEANERS, settings: cleanSettings, str, letter: cleanLetter } = require('./lib/clean');
const { MEMBERS } = require('./lib/members');
const { layout } = require('./views/layout');
const { home } = require('./views/home');
const pages = require('./views/pages');
const lettersView = require('./views/letters');

const PROD = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT, 10) || 3000;
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
/* Vercel's filesystem is read-only except /tmp. */
const UPLOADS = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR)
  : process.env.VERCEL ? '/tmp/uploads' : path.join(ROOT, 'uploads');
fs.mkdirSync(UPLOADS, { recursive: true });
store.load();

/* ---------- admin credentials ---------- */
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
let ADMIN_PASS = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASS || ADMIN_PASS.length < 8) {
  if (PROD) { console.error('Set ADMIN_PASSWORD (8+ characters) before starting in production.'); process.exit(1); }
  ADMIN_PASS = crypto.randomBytes(9).toString('base64url');
  console.log(`\n  Dev admin login -> user: ${ADMIN_USER}  password: ${ADMIN_PASS}\n  (set ADMIN_PASSWORD in .env to choose your own)\n`);
}
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
const same = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));

/* ---------- app ---------- */
/* Express app, exported for Vercel. */
const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : process.env.TRUST_PROXY);

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      styleSrcAttr: ["'unsafe-inline'"],
      fontSrc: ['https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://i.ytimg.com'],
      frameSrc: ['https://www.youtube-nocookie.com'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      ...(PROD ? { upgradeInsecureRequests: [] } : {})
    }
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },   // YouTube embeds fail with no-referrer
  hsts: PROD ? { maxAge: 15552000, includeSubDomains: true } : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());

/* Cache-busted asset URLs: /css/site.css?v=<hash of file> */
const hashes = new Map();
function asset(p) {
  if (!hashes.has(p) || !PROD) {
    try { hashes.set(p, crypto.createHash('md5').update(fs.readFileSync(path.join(PUBLIC, p))).digest('hex').slice(0, 8)); } catch { hashes.set(p, '0'); }
  }
  return `${p}?v=${hashes.get(p)}`;
}

const ctxFor = (req) => {
  const db = store.get();
  const base = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
  return { s: db.settings, albums: db.albums, base, asset, q: typeof req.query.q === 'string' ? req.query.q.slice(0, 80) : '' };
};
const render = (req, res, build, status = 200) => {
  const ctx = ctxFor(req);
  const page = build(ctx, store.get());
  res.status(status).set('Cache-Control', 'no-cache').type('html').send(layout(ctx, page));
};

/* ---------- static files ---------- */
app.use('/uploads', express.static(UPLOADS, { maxAge: '30d', immutable: true, index: false, dotfiles: 'deny' }));
app.use('/img', express.static(path.join(PUBLIC, 'img'), { maxAge: '30d', immutable: true }));
app.use(express.static(PUBLIC, { maxAge: PROD ? '1y' : 0, index: false, setHeaders: (res, p) => { if (/\.(?:html)$/.test(p)) res.set('Cache-Control', 'no-cache'); } }));

/* ---------- public pages ---------- */
app.get('/', (req, res) => render(req, res, home));
app.get('/about', (req, res) => render(req, res, pages.about));
app.get('/faq', (req, res) => render(req, res, pages.faq));
app.get('/contact', (req, res) => render(req, res, pages.contact));
app.get('/terms', (req, res) => render(req, res, pages.terms));
app.get('/privacy', (req, res) => render(req, res, pages.privacy));
app.get('/healthz', (req, res) => res.json({ ok: true }));

/* ---------- SEO files ---------- */
app.get('/robots.txt', (req, res) => {
  const { base } = ctxFor(req);
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`);
});
app.get('/sitemap.xml', (req, res) => {
  const { base } = ctxFor(req);
  const db = store.get();
  const last = db.settings.legalUpdated;
  const abs = (p) => esc(/^https?:/.test(p) ? p : base + p);
  const images = MEMBERS.map((m) => [m.image, `${m.stage} (${m.name}) portrait`]).concat(db.albums.map((a) => [a.image, `${a.title} cover art`])).concat(db.gallery.map((g) => [g.image, g.caption])).slice(0, 1000);
  const url = (p, freq, pri, extra = '') => `<url><loc>${base}${p}</loc><lastmod>${last}</lastmod><changefreq>${freq}</changefreq><priority>${pri}</priority>${extra}</url>`;
  const imgXml = images.map(([src, cap]) => `<image:image><image:loc>${abs(src)}</image:loc><image:caption>${esc(cap)}</image:caption></image:image>`).join('');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${url('/', 'weekly', '1.0', imgXml)}
${url('/about', 'monthly', '0.6')}
${url('/faq', 'monthly', '0.7')}
${url('/contact', 'yearly', '0.5')}
${url('/terms', 'yearly', '0.3')}
${url('/privacy', 'yearly', '0.3')}
</urlset>`);
});

/* ---------- public API ---------- */
app.use('/api', express.json({ limit: '20kb' }));

const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many messages from your network. Please try again later.' } });
app.post('/api/contact', contactLimiter, async (req, res) => {
  const b = req.body || {};
  if (str(b.website, 100)) return res.json({ ok: true });                   // honeypot: pretend success to bots
  if (Number(b.elapsed) < 2500) return res.status(429).json({ error: 'That was fast. Please check your message and try again.' });
  const name = str(b.name, 80), email = str(b.email, 120), message = str(b.message, 3000);
  const subject = ['General question', 'Fan art or photo submission', 'Report a broken link or mistake', 'Content removal request', 'Shop or order question'].includes(b.subject) ? b.subject : 'General question';
  if (!name) return res.status(400).json({ error: 'Please enter your name.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (message.length < 10) return res.status(400).json({ error: 'Please write at least 10 characters.' });

  const db = store.get();
  db.messages.push({ id: store.newId(), name, email, subject, message, createdAt: new Date().toISOString(), read: false });
  if (db.messages.length > 2000) db.messages.splice(0, db.messages.length - 2000);   // cap so spam cannot fill the disk
  await store.save();
  notifyByEmail({ name, email, subject, message }, db.settings).catch((e) => console.error('[mail]', e.message));
  res.json({ ok: true });
});

/* Optional email notification. Set SMTP_HOST/SMTP_USER/SMTP_PASS (and CONTACT_TO) to turn it on. */
async function notifyByEmail(m, s) {
  const to = process.env.CONTACT_TO || s.contactEmail;
  if (!process.env.SMTP_HOST || !to) return;
  const nodemailer = require('nodemailer');
  const tx = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true', auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
  await tx.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER, to, replyTo: `"${m.name.replace(/["\r\n]/g, '')}" <${m.email}>`,
    subject: `[${s.siteName}] ${m.subject}`.replace(/[\r\n]/g, ' '),
    text: `From: ${m.name} <${m.email}>\nTopic: ${m.subject}\n\n${m.message}`
  });
}

/* ---------- fan letters ----------
   No accounts. Each letter gets a random edit code shown once; only its SHA-256 is stored.
   New and edited letters wait for approval in /admin unless "auto-approve" is switched on. */
const sha256 = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';                       // no 0/O/1/I confusion
const newCode = () => Array.from(crypto.randomBytes(12), (b) => CODE_CHARS[b % CODE_CHARS.length]).join('');
const normCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const codeOk = (l, code) => {
  const a = Buffer.from(l.codeHash, 'hex'), b = Buffer.from(sha256(normCode(code)), 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const ownLetter = (l) => ({ id: l.id, nickname: l.nickname, country: l.country, to: l.to, message: l.message, status: l.status, createdAt: l.createdAt });
const letterCreate = rateLimit({ windowMs: 60 * 60 * 1000, limit: 3, standardHeaders: true, legacyHeaders: false, message: { error: 'You have sent several letters already. Please try again later.' } });
const letterEdit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many attempts. Please wait a few minutes.' } });

app.get('/api/letters/more', (req, res) => res.json(lettersView.more(store.get(), Math.max(0, parseInt(req.query.offset, 10) || 0))));

app.post('/api/letters', letterCreate, async (req, res) => {
  const b = req.body || {};
  if (str(b.website, 100)) return res.json({ ok: true, id: 'x', code: newCode(), status: 'pending' });      // honeypot
  if (Number(b.elapsed) < 5000) return res.status(429).json({ error: 'That was fast. Take a moment to check your letter and send it again.' });
  let data;
  try { data = cleanLetter(b); } catch (e) { return res.status(400).json({ error: e.message }); }
  const db = store.get();
  if (db.letters.filter((l) => l.status === 'pending').length >= 500) return res.status(503).json({ error: 'Many letters are waiting to be read. Please try again in a few days.' });
  const code = newCode(), now = new Date().toISOString();
  const l = { id: store.newId(), ...data, status: db.settings.autoApproveLetters ? 'approved' : 'pending', createdAt: now, updatedAt: now, codeHash: sha256(code) };
  db.letters.push(l);
  await store.save();
  res.json({ ok: true, id: l.id, code, status: l.status });
});
app.post('/api/letters/lookup', letterEdit, (req, res) => {
  const code = normCode(req.body && req.body.code);
  const l = code.length >= 10 && store.get().letters.find((x) => codeOk(x, code));
  if (!l) return res.status(404).json({ error: 'No letter found for that code.' });
  res.json({ letter: ownLetter(l) });
});
app.put('/api/letters/:id', letterEdit, async (req, res) => {
  const db = store.get(), l = db.letters.find((x) => x.id === req.params.id);
  if (!l || !codeOk(l, req.body && req.body.code)) return res.status(403).json({ error: 'That edit code does not match this letter.' });
  let data;
  try { data = cleanLetter(req.body); } catch (e) { return res.status(400).json({ error: e.message }); }
  Object.assign(l, data, { status: db.settings.autoApproveLetters ? 'approved' : 'pending', updatedAt: new Date().toISOString() });
  await store.save();
  res.json({ ok: true, status: l.status });
});
app.delete('/api/letters/:id', letterEdit, async (req, res) => {
  const db = store.get(), l = db.letters.find((x) => x.id === req.params.id);
  if (!l || !codeOk(l, req.body && req.body.code)) return res.status(403).json({ error: 'That edit code does not match this letter.' });
  db.letters = db.letters.filter((x) => x !== l);
  await store.save();
  res.json({ ok: true });
});

/* ---------- admin ---------- */
const authFails = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, skipSuccessfulRequests: true, standardHeaders: true, legacyHeaders: false, message: 'Too many failed logins. Try again in 15 minutes.' });
function adminAuth(req, res, next) {
  res.set({ 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' });
  const h = req.get('authorization') || '';
  const [scheme, token] = h.split(' ');
  if (scheme === 'Basic' && token) {
    const raw = Buffer.from(token, 'base64').toString();
    const i = raw.indexOf(':');
    if (i > -1 && same(raw.slice(0, i), ADMIN_USER) && same(raw.slice(i + 1), ADMIN_PASS)) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="ARMY Hub admin", charset="UTF-8"').status(401);
  return res.type(req.path.startsWith('/api') ? 'json' : 'text').send(req.path.startsWith('/api') ? JSON.stringify({ error: 'Sign in required.' }) : 'Sign in required.');
}
/* Browsers attach Basic credentials automatically, so state-changing calls must carry a custom
   header that a cross-site page cannot send. This blocks CSRF. */
const csrf = (req, res, next) => (req.method === 'GET' || req.get('x-requested-with') === 'army-admin' ? next() : res.status(403).json({ error: 'Forbidden.' }));

app.get('/admin', authFails, adminAuth, (req, res) => res.type('html').send(pages.adminShell(asset)));
app.use('/api/admin', authFails, adminAuth, csrf, rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false }));

app.get('/api/admin/data', (req, res) => { const db = store.get(); res.json({ ...db, letters: db.letters.map(({ codeHash, ...rest }) => rest) }); });

app.put('/api/admin/settings', async (req, res) => {
  try {
    const db = store.get();
    db.settings = { ...db.settings, ...cleanSettings(req.body || {}, db.albums) };
    await store.save();
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.patch('/api/admin/messages/:id', async (req, res) => {
  const m = store.get().messages.find((x) => x.id === req.params.id);
  if (!m) return res.status(404).json({ error: 'Not found.' });
  m.read = !!(req.body && req.body.read);
  await store.save();
  res.json({ ok: true });
});
app.delete('/api/admin/messages/:id', async (req, res) => {
  const db = store.get();
  db.messages = db.messages.filter((x) => x.id !== req.params.id);
  await store.save();
  res.json({ ok: true });
});

app.patch('/api/admin/letters/:id', async (req, res) => {
  const l = store.get().letters.find((x) => x.id === req.params.id);
  if (!l) return res.status(404).json({ error: 'Not found.' });
  l.status = req.body && req.body.status === 'approved' ? 'approved' : 'pending';
  await store.save();
  res.json({ ok: true });
});
app.delete('/api/admin/letters/:id', async (req, res) => {
  const db = store.get();
  db.letters = db.letters.filter((x) => x.id !== req.params.id);
  await store.save();
  res.json({ ok: true });
});

/* Image upload: validated by actually decoding it with sharp, EXIF stripped, converted to WebP. */
const upload = multer({
  storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG, WebP or GIF images are allowed.')))
});
const KINDS = { cover: { w: 1000, tw: 500, square: true }, photo: { w: 2000, tw: 700 }, video: { w: 1280, tw: 640, ratio: 16 / 9 } };

/* Decode, strip metadata, resize and store as WebP (+ thumbnail). Throws if the bytes are not a real image. */
async function processImage(buffer, kindName) {
  const k = KINDS[kindName] || KINDS.photo;
  const src = sharp(buffer, { limitInputPixels: 80e6 }).rotate();
  await src.metadata();
  const dims = (w) => (k.square ? { width: w, height: w, fit: 'cover' } : k.ratio ? { width: w, height: Math.round(w / k.ratio), fit: 'cover' } : { width: w, withoutEnlargement: true });
  const id = crypto.randomBytes(8).toString('hex');
  const full = await src.clone().resize(dims(k.w)).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const thumb = await src.clone().resize(dims(k.tw)).webp({ quality: 78 }).toBuffer();
  await fs.promises.writeFile(path.join(UPLOADS, `${id}.webp`), full.data);
  await fs.promises.writeFile(path.join(UPLOADS, `${id}-t.webp`), thumb);
  return { image: `/uploads/${id}.webp`, thumb: `/uploads/${id}-t.webp`, width: full.info.width, height: full.info.height };
}
app.post('/api/admin/upload', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'That file is over 12 MB.' : err.message });
    if (!req.file) return res.status(400).json({ error: 'Choose an image file.' });
    try { res.json(await processImage(req.file.buffer, req.query.kind)); }
    catch { res.status(400).json({ error: 'That file could not be read as an image.' }); }
  });
});

/* Remote fetch, locked to a short allow-list of hosts (prevents SSRF): no redirects, 10 s timeout, 8 MB cap. */
const ITUNES = (process.env.ITUNES_BASE || 'https://itunes.apple.com').replace(/\/+$/, '');
const ITUNES_URL = new URL(ITUNES);
const ITUNES_HOSTS = [ITUNES_URL.hostname, 'mzstatic.com'];
async function fetchRemote(url, hosts, asJson) {
  const u = new URL(url);
  const hostOk = hosts.some((h) => u.hostname === h || u.hostname.endsWith('.' + h));
  const protoOk = u.protocol === 'https:' || (!!process.env.ITUNES_BASE && u.host === ITUNES_URL.host);   // http only for the test stub
  if (!hostOk || !protoOk) throw new Error('That address is not allowed.');
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 10000);
  try {
    const r = await fetch(u, { signal: ctl.signal, redirect: 'error', headers: { 'User-Agent': 'ARMYHub/1.0 (fan site)' } });
    if (!r.ok) throw Object.assign(new Error(`The remote server answered ${r.status}.`), { remote: true });
    if (asJson) return await r.json();
    if (parseInt(r.headers.get('content-length') || '0', 10) > 8 * 1024 * 1024) throw new Error('The image is too large.');
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 8 * 1024 * 1024) throw new Error('The image is too large.');
    return buf;
  } finally { clearTimeout(t); }
}

/* Official album art via Apple's public iTunes Search API (provided for promoting and linking to music). */
const normTitle = (t) => String(t).toLowerCase().replace(/\s*-\s*(single|ep)$/, '').replace(/[^a-z0-9ㄱ-힝一-鿿]+/g, ' ').trim();
async function findCover(title) {
  const j = await fetchRemote(`${ITUNES}/search?term=${encodeURIComponent('BTS ' + title)}&entity=album&limit=25&country=US`, ITUNES_HOSTS, true);
  const bts = (j.results || []).filter((r) => /bts|방탄소년단/i.test(r.artistName || '') && r.artworkUrl100);
  const want = normTitle(title), words = want.split(' ');
  const name = (r) => normTitle(r.collectionName || '');
  const hit = bts.find((r) => name(r) === want) || bts.find((r) => name(r).startsWith(want)) || bts.find((r) => words.every((w) => name(r).includes(w)));
  return hit ? { name: hit.collectionName, url: hit.artworkUrl100.replace(/\/\d+x\d+(bb)?\.(jpg|png)$/, '/1000x1000bb.jpg') } : null;
}
/* Replaces placeholder covers (or every cover when `all`) with the official artwork. */
async function importCovers(all) {
  const db = store.get(), updated = [], missed = [];
  let network = '';
  for (const a of db.albums) {
    if (!all && !String(a.image).startsWith('/img/seed/')) continue;
    try {
      const hit = await findCover(a.title);
      if (!hit) { missed.push(a.title); continue; }
      const img = await processImage(await fetchRemote(hit.url, ITUNES_HOSTS), 'cover');
      Object.assign(a, { image: img.image, thumb: img.thumb, width: img.width, height: img.height });
      updated.push(a.title);
    } catch (e) {
      if (!e.remote && e.name !== 'TypeError' && e.name !== 'AbortError') { missed.push(a.title); continue; }
      network = e.remote ? e.message : 'Could not reach Apple from this server.'; break;     // stop on network trouble
    }
  }
  if (updated.length) { await store.save(); cleanUploads(); }
  return { updated, missed, network };
}
app.post('/api/admin/import-covers', async (req, res) => res.json(await importCovers(!!(req.body && req.body.all))));

/* Official video frame (YouTube thumbnail) saved as a gallery image, with the channel as credit. */
app.post('/api/admin/import-youtube', async (req, res) => {
  const id = ytId(req.body && req.body.url);
  if (!id) return res.status(400).json({ error: 'Paste a YouTube link or video ID.' });
  try {
    let buf;
    try { buf = await fetchRemote(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`, ['ytimg.com']); }
    catch { buf = await fetchRemote(`https://i.ytimg.com/vi/${id}/mqdefault.jpg`, ['ytimg.com']); }
    const img = await processImage(buf, 'photo');
    let credit = '', title = '';
    try {
      const o = await fetchRemote(`https://www.youtube.com/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + id)}&format=json`, ['youtube.com'], true);
      credit = `${o.author_name} (YouTube)`; title = o.title || '';
    } catch { /* credit stays blank: fill it in by hand */ }
    res.json({ ...img, credit, title });
  } catch (e) { res.status(502).json({ error: 'Could not fetch that video image. ' + e.message }); }
});

/* Generic CRUD for albums, gallery, videos, shop, faqs */
const COLS = Object.keys(CLEANERS);
const col = (req, res, next) => (COLS.includes(req.params.col) ? next() : res.status(404).json({ error: 'Not found.' }));

app.post('/api/admin/:col', col, async (req, res) => {
  try {
    const db = store.get();
    db[req.params.col].push({ id: store.newId(), ...CLEANERS[req.params.col](req.body || {}) });
    await store.save();
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.put('/api/admin/:col/:id', col, async (req, res) => {
  try {
    const list = store.get()[req.params.col];
    const i = list.findIndex((x) => x.id === req.params.id);
    if (i < 0) return res.status(404).json({ error: 'Not found.' });
    list[i] = { id: list[i].id, ...CLEANERS[req.params.col](req.body || {}) };
    await store.save();
    cleanUploads();
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/admin/:col/:id', col, async (req, res) => {
  const db = store.get();
  db[req.params.col] = db[req.params.col].filter((x) => x.id !== req.params.id);
  await store.save();
  cleanUploads();
  res.json({ ok: true });
});
app.post('/api/admin/:col/:id/move', col, async (req, res) => {
  const list = store.get()[req.params.col];
  const i = list.findIndex((x) => x.id === req.params.id), j = i + (req.body && req.body.dir === 1 ? 1 : -1);
  if (i < 0 || j < 0 || j >= list.length) return res.json({ ok: true });
  [list[i], list[j]] = [list[j], list[i]];
  await store.save();
  res.json({ ok: true });
});

/* Remove uploaded files that no item references any more (ignores files newer than 10 minutes). */
function cleanUploads() {
  const db = store.get();
  const used = new Set();
  for (const c of ['albums', 'gallery', 'videos']) for (const it of db[c]) [it.image, it.thumb].forEach((p) => p && used.add(path.basename(p)));
  fs.readdir(UPLOADS, (e, files) => {
    if (e) return;
    for (const f of files) {
      if (f === '.gitkeep' || used.has(f)) continue;
      const p = path.join(UPLOADS, f);
      fs.stat(p, (er, st) => { if (!er && Date.now() - st.mtimeMs > 10 * 60 * 1000) fs.unlink(p, () => {}); });
    }
  });
}

/* ---------- errors ---------- */
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));
app.use((req, res) => render(req, res, pages.notFound, 404));
app.use((err, req, res, next) => {            // eslint-disable-line no-unused-vars
  console.error(err);
  if (req.path.startsWith('/api')) return res.status(err.status || 500).json({ error: err.status === 400 ? 'Invalid request.' : 'Server error.' });
  res.status(500).type('text').send('Something went wrong. Please try again.');
});

/* Local / traditional host: listen on a port. On Vercel the app is served by the api entry instead. */
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`ARMY Hub running on http://localhost:${PORT}  (${PROD ? 'production' : 'development'})`);
    /* First start only: swap placeholder covers for the official artwork. Retry any time from /admin > Albums. */
    const db = store.get();
    if (process.env.AUTO_IMPORT_COVERS !== 'false' && !db.coversTried) {
      setTimeout(async () => {
        db.coversTried = true; await store.save();
        const r = await importCovers(false).catch((e) => ({ updated: [], missed: [], network: e.message }));
        console.log(`[covers] imported ${r.updated.length}${r.network ? ` (stopped: ${r.network})` : ''}${r.missed.length ? `; no match: ${r.missed.join(', ')}` : ''}`);
      }, 3000);
    }
  });
}

module.exports = app;
