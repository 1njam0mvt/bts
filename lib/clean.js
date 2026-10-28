'use strict';
/* Server-side validation for everything the admin panel saves. Never trust the browser. */
const { safeUrl, ytId } = require('./util');

const IMG_PATH = /^\/(uploads|img\/seed|img\/fan)\/[A-Za-z0-9._-]+$/;
const str = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);

function image(src, out) {
  const img = str(src.image, 200), th = str(src.thumb, 200);
  if (!img) return;
  if (!IMG_PATH.test(img) || (th && !IMG_PATH.test(th))) throw new Error('Invalid image path. Upload the image again.');
  out.image = img; out.thumb = th || img;
  const w = parseInt(src.width, 10), h = parseInt(src.height, 10);
  if (w > 0 && w < 10000 && h > 0 && h < 10000) { out.width = w; out.height = h; }
}
const need = (v, label) => { if (!v) throw new Error(`${label} is required.`); return v; };
const url = (v, label) => {
  const s = str(v, 500);
  if (!s) return '';
  const u = safeUrl(s);
  if (!u) throw new Error(`${label} must be a full link starting with https://`);
  return u;
};

const releasedDate = (v) => {
  const d = str(v, 10);
  if (!d) return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(Date.parse(d))) throw new Error('Release date must look like 2026-03-20.');
  return d;
};

const GALLERY_CATS = ['Group', 'Members', 'Concert', 'Concept'];

const CLEANERS = {
  albums(i) {
    const year = parseInt(i.year, 10);
    if (!(year >= 1900 && year <= 2100)) throw new Error('Year must be between 1900 and 2100.');
    const o = {
      title: need(str(i.title, 120), 'Title'), year, released: releasedDate(i.released),
      type: ['Album', 'EP', 'Single'].includes(i.type) ? i.type : 'Album',
      handle: str(i.handle, 120).replace(/[^A-Za-z0-9-_]/g, ''),
      shopUrl: url(i.shopUrl, 'Shopify link'), musicUrl: url(i.musicUrl, 'Streaming link')
    };
    image(i, o);
    if (!o.image) throw new Error('Upload a cover image.');
    return o;
  },
  gallery(i) {
    const o = { member: need(str(i.member, 60), 'Member'), category: GALLERY_CATS.includes(i.category) ? i.category : 'Members', caption: need(str(i.caption, 160), 'Caption'), credit: str(i.credit, 120) };
    image(i, o);
    if (!o.image) throw new Error('Upload a photo first.');
    return o;
  },
  videos(i) {
    const raw = str(i.youtubeId, 300);
    const id = raw ? ytId(raw) : '';
    if (raw && !id) throw new Error('That does not look like a YouTube link or video ID.');
    const o = {
      type: ['Music Video', 'Run BTS', 'Vlog'].includes(i.type) ? i.type : 'Music Video',
      title: need(str(i.title, 160), 'Title'), meta: str(i.meta, 80), youtubeId: id, url: url(i.url, 'Link')
    };
    if (!o.youtubeId && !o.url) throw new Error('Add a YouTube link or another link.');
    image(i, o);
    if (!o.image && !o.youtubeId) throw new Error('Upload a thumbnail, or add a YouTube link (its thumbnail is used automatically).');
    return o;
  },
  shop(i) {
    return { title: need(str(i.title, 60), 'Name'), note: str(i.note, 140), handle: str(i.handle, 120).replace(/[^A-Za-z0-9-_]/g, '') };
  },
  faqs(i) {
    return { q: need(str(i.q, 200), 'Question'), a: need(str(i.a, 3000), 'Answer') };
  }
};

function previewCfg(i) {
  const raw = str(i.previewYoutube, 300);
  const id = raw ? ytId(raw) : '';
  if (raw && !id) throw new Error('Preview video must be a YouTube link or ID.');
  const start = Math.max(0, Math.min(3600, parseInt(i.previewStart, 10) || 0));
  return { youtubeId: id, start, label: str(i.previewLabel, 40) };
}

function settings(i, albums) {
  const email = str(i.contactEmail, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Contact email is not valid.');
  const date = str(i.legalUpdated, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) throw new Error('Legal date must look like 2026-10-22.');
  const hero = albums.some((a) => a.id === i.heroAlbumId) ? i.heroAlbumId : albums[0] && albums[0].id;
  const soc = i.social || {};
  return {
    siteName: need(str(i.siteName, 60), 'Site name'), tagline: str(i.tagline, 120),
    shopifyStore: url(i.shopifyStore, 'Shopify store URL').replace(/\/+$/, ''), fallbackShopUrl: url(i.fallbackShopUrl, 'Fallback shop URL'),
    heroAlbumId: hero, heroBlurb: str(i.heroBlurb, 400),
    preview: previewCfg(i),
    autoApproveLetters: i.autoApproveLetters === true || i.autoApproveLetters === 'true',
    contactEmail: email, operatorName: str(i.operatorName, 100), jurisdiction: str(i.jurisdiction, 60) || 'India', legalUpdated: date,
    social: { x: url(soc.x, 'X URL'), instagram: url(soc.instagram, 'Instagram URL'), youtube: url(soc.youtube, 'YouTube URL'), tiktok: url(soc.tiktok, 'TikTok URL') }
  };
}

/* Fan letters. Links and contact details are rejected so the wall cannot be used for spam. */
const LINKISH = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|in|me|ly|gg|tv|xyz|app)\b|@[a-z0-9_.-]+\.[a-z]{2,}|\+?\d[\d\s().-]{8,}\d)/i;
const TO = ['BTS', 'RM', 'Jin', 'SUGA', 'j-hope', 'Jimin', 'V', 'Jung Kook', 'ARMY'];
function letter(i) {
  const nickname = str(i.nickname, 40), country = str(i.country, 40), message = str(i.message, 1200).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  if (!nickname) throw new Error('Please choose a nickname.');
  if (message.length < 20) throw new Error('Please write at least 20 characters.');
  if (LINKISH.test(message) || LINKISH.test(nickname) || LINKISH.test(country)) throw new Error('Please remove web links, email addresses and phone numbers.');
  return { nickname, country, to: TO.includes(i.to) ? i.to : 'BTS', message };
}

module.exports = { GALLERY_CATS, CLEANERS, settings, str, letter };
