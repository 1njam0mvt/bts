'use strict';
/* Brings an older db.json up to date without touching anything the owner edited.
   Called from lib/store.js right after the file is loaded. Safe to run on every start. */
const DEFAULT_PREVIEW2 = { youtubeId: 'GEk4jHwfFTA', start: 50, seconds: 50, label: 'NORMAL' };
const KNOWN_VIDEOS = [[/hooligan/i, 'diBO0gMuTXo']];            // official uploads that were missing at first
const sq = (n) => ({ image: `/img/fan/album-${n}.webp`, thumb: `/img/fan/album-${n}-thumb.webp`, width: 900, height: 900 });
/* Covers that replace generated placeholders (only when the album still has a placeholder image). */
const COVERS = { normal: sq('normal'), arirang: sq('arirang'), butter: sq('butter'), dynamite: sq('dynamite'), 'love yourself: answer': sq('love-yourself-answer'), 'dark & wild': sq('dark-and-wild'), '2 cool 4 skool': sq('2-cool-4-skool') };
const isSeed = (p) => String(p || '').startsWith('/img/seed/');

function migrate(d) {
    const s = d.settings || (d.settings = {});
    if (s.preview2 === undefined) s.preview2 = { ...DEFAULT_PREVIEW2 };
    if (s.preview && s.preview.seconds == null) s.preview.seconds = 50;
    // The footer YouTube icon used the old @BANGTANTV handle. The official channel is @BTS. Only that old value is replaced.
    if (s.social && /youtube\.com\/@BTS\/?$/i.test(s.social.youtube || '')) s.social.youtube = 'https://www.youtube.com/@BTS';
    for (const v of d.videos || []) {
        if (!v.youtubeId) {
            const hit = KNOWN_VIDEOS.find(([re]) => re.test(v.title));
            if (hit) v.youtubeId = hit[1];
        }
        if (!v.youtubeId && /body to body/i.test(v.title) && isSeed(v.image)) v.image = '/img/fan/video-body-to-body.webp';
    }
    for (const a of d.albums || []) {
        const c = COVERS[String(a.title).toLowerCase()];
        if (c && isSeed(a.image)) Object.assign(a, c);
    }
}
module.exports = migrate;
