'use strict';
/* Songs for the "Customize" music tray (public/js/music.js).

   HOW IT PLAYS: we do not host audio. A song plays in the YouTube embedded player from the OFFICIAL video you put in `youtubeId`.
   Songs without a youtubeId stay in the list (so you can see what is missing) but are hidden by the tray's "Playable only" switch.
   To add a video: paste the 11-character id from the official video's address (youtube.com/watch?v=THIS_PART) into youtubeId.

   `era` values: school, hyyh, wings, love-yourself, map-of-the-soul, be, proof, latest.
   `moods` are editorial opinions of this site, not facts. Values: heartbreak, loneliness, healing, joy, comfort, courage, nostalgia.
   The three ids below are the official MVs already used elsewhere on this site (data/seed.json). */
const TRACKS = [
  { id: 'swim', title: 'SWIM', artist: 'BTS', era: 'latest', moods: ['healing', 'comfort'], youtubeId: 'b4iVv91Z6lY' },
  { id: '2-0', title: '2.0', artist: 'BTS', era: 'latest', moods: ['courage', 'joy'], youtubeId: '_gyultVTesk' },
  { id: 'normal', title: 'NORMAL', artist: 'BTS', era: 'latest', moods: ['loneliness', 'comfort'], youtubeId: 'GEk4jHwfFTA' },

  { id: 'no-more-dream', title: 'No More Dream', artist: 'BTS', era: 'school', moods: ['courage'], youtubeId: '' },
  { id: 'butterfly', title: 'Butterfly', artist: 'BTS', era: 'hyyh', moods: ['comfort', 'nostalgia'], youtubeId: '' },
  { id: 'whalien-52', title: 'Whalien 52', artist: 'BTS', era: 'hyyh', moods: ['loneliness'], youtubeId: '' },
  { id: 'silver-spoon', title: 'Silver Spoon (Baepsae)', artist: 'BTS', era: 'hyyh', moods: ['courage', 'joy'], youtubeId: '' },
  { id: 'begin', title: 'Begin', artist: 'Jung Kook', era: 'wings', moods: ['loneliness', 'healing'], youtubeId: '' },
  { id: 'lie', title: 'Lie', artist: 'Jimin', era: 'wings', moods: ['heartbreak'], youtubeId: '' },
  { id: 'stigma', title: 'Stigma', artist: 'V', era: 'wings', moods: ['heartbreak', 'loneliness'], youtubeId: '' },
  { id: 'magic-shop', title: 'Magic Shop', artist: 'BTS', era: 'love-yourself', moods: ['comfort', 'healing'], youtubeId: '' },
  { id: 'epiphany', title: 'Epiphany', artist: 'Jin', era: 'love-yourself', moods: ['healing'], youtubeId: '' },
  { id: 'black-swan', title: 'Black Swan', artist: 'BTS', era: 'map-of-the-soul', moods: ['nostalgia'], youtubeId: '' },
  { id: 'life-goes-on', title: 'Life Goes On', artist: 'BTS', era: 'be', moods: ['comfort', 'healing'], youtubeId: '' },
  { id: 'yet-to-come', title: 'Yet To Come', artist: 'BTS', era: 'proof', moods: ['joy', 'nostalgia'], youtubeId: '' }
];

const ERAS = ['school', 'hyyh', 'wings', 'love-yourself', 'map-of-the-soul', 'be', 'proof', 'latest'];
const MOODS = ['heartbreak', 'loneliness', 'healing', 'joy', 'comfort', 'courage', 'nostalgia'];

/** Fails loudly at start-up if a row is malformed, so a typo cannot silently break the tray. */
function validate(list = TRACKS) {
  const seen = new Set();
  for (const t of list) {
    if (!/^[\w-]{1,60}$/.test(t.id) || seen.has(t.id)) throw new Error(`tracks.js: bad or duplicate id "${t.id}"`);
    seen.add(t.id);
    if (!t.title || !t.artist) throw new Error(`tracks.js: "${t.id}" needs a title and artist`);
    if (!ERAS.includes(t.era)) throw new Error(`tracks.js: "${t.id}" has unknown era "${t.era}"`);
    if (!Array.isArray(t.moods) || !t.moods.every((m) => MOODS.includes(m))) throw new Error(`tracks.js: "${t.id}" has unknown mood`);
    if (t.youtubeId && !/^[\w-]{11}$/.test(t.youtubeId)) throw new Error(`tracks.js: "${t.id}" youtubeId must be 11 characters`);
  }
  return list;
}

module.exports = { TRACKS: validate(), validate };
