'use strict';
/* Generates the starter images (public/img/seed/*.webp + og.png) and data/seed.json.
   Run once with `npm run seed`. The committed output is already included in the project.

   User-supplied photos (hero, galaxy, 7 members, 6 album covers, 5 gallery images) live in
   public/img/fan and are NOT touched by this script. Only the placeholders in public/img/seed are rebuilt.

   REAL DATA below (checked 23 Oct 2026): ARIRANG release date and singles come from the album's
   Wikipedia entry; every YouTube ID was verified through YouTube's oEmbed to be an upload by the
   official channel named in `meta`. Album covers and member photos are NOT bundled (copyright);
   the server imports covers from Apple's iTunes API on first start and you upload photos in /admin. */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { art } = require('../lib/art');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'img', 'seed');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const id = (() => { let n = 0; return () => (++n).toString(16).padStart(10, '0'); })();

async function make(name, opts, fullW, thumbW) {
  const svg = Buffer.from(art(opts));
  const full = await sharp(svg).resize({ width: fullW }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(path.join(OUT, `${name}.webp`), full.data);
  let thumb = null;
  if (thumbW) {
    const t = await sharp(svg).resize({ width: thumbW }).webp({ quality: 78 }).toBuffer();
    fs.writeFileSync(path.join(OUT, `${name}-thumb.webp`), t);
    thumb = `/img/seed/${name}-thumb.webp`;
  }
  return { image: `/img/seed/${name}.webp`, thumb: thumb || `/img/seed/${name}.webp`, width: full.info.width, height: full.info.height };
}

const SPOTIFY = 'https://open.spotify.com/artist/3Nrfpe0tUJi4K4DXYWgMUX';
const yt = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

(async () => {
  // [title, year, type, handle, hue, released, supplied cover file in public/img/fan (or '')]
  const FAN = JSON.parse(fs.readFileSync(path.join(__dirname, 'fan-images.json'), 'utf8'));
  const albums = [
    ['Normal', 2026, 'Single', 'normal', 205, '2026-07-17', ''],
    ['Hooligan', 2026, 'Single', 'hooligan', 12, '2026-04-07', ''],
    ['ARIRANG', 2026, 'Album', 'arirang', 275, '2026-03-20', ''],
    ['Swim', 2026, 'Single', 'swim', 190, '2026-03-20', ''],
    ['Proof', 2022, 'Album', 'proof', 330, '2022-06-10', 'album-proof'],
    ['Butter', 2021, 'Single', 'butter', 45, '2021-05-21', ''],
    ['BE', 2020, 'Album', 'be', 200, '2020-11-20', 'album-be'],
    ['Dynamite', 2020, 'Single', 'dynamite', 18, '2020-08-21', ''],
    ['Map of the Soul: 7', 2020, 'Album', 'map-of-the-soul-7', 250, '2020-02-21', 'album-map-of-the-soul-7'],
    ['Map of the Soul: Persona', 2019, 'EP', 'map-of-the-soul-persona', 320, '2019-04-12', 'album-map-of-the-soul-persona'],
    ['Love Yourself: Answer', 2018, 'Album', 'love-yourself-answer', 300, '2018-08-24', ''],
    ['Love Yourself: Tear', 2018, 'Album', 'love-yourself-tear', 230, '2018-05-18', 'album-love-yourself-tear'],
    ['Wings', 2016, 'Album', 'wings', 160, '2016-10-10', 'album-wings'],
    ['Dark & Wild', 2014, 'Album', 'dark-and-wild', 340, '2014-08-20', ''],
    ['2 Cool 4 Skool', 2013, 'Single', '2-cool-4-skool', 100, '2013-06-12', '']
  ];
  const albumItems = [];
  for (let i = 0; i < albums.length; i++) {
    const [title, year, type, handle, hue, released, fan] = albums[i];
    // Supplied cover if we have one, otherwise a generated placeholder that the first-start import replaces.
    const img = fan ? FAN[fan] : await make(`album-${handle}`, { hue, label: title.toUpperCase().slice(0, 18), sub: String(year), variant: i }, 900, 450);
    albumItems.push({ id: id(), title, year, released, type, handle, shopUrl: '', musicUrl: SPOTIFY, image: img.image, thumb: img.thumb, width: img.width, height: img.height });
  }

  // Gallery: photos supplied by the site owner. Replace or extend them in /admin > Gallery.
  const CREDIT = 'Supplied by the site owner';
  const g = (key, member, category, caption) => ({ id: id(), member, category, caption, credit: CREDIT, image: FAN[key].image, thumb: FAN[key].thumb, width: FAN[key].width, height: FAN[key].height });
  const gallery = [
    g('hero-group', 'BTS', 'Concept', 'BTS standing on a mirror-like lake under a purple starry sky'),
    g('gallery-concert', 'BTS', 'Concert', 'BTS on stage in front of a sea of purple light sticks'),
    g('member-rm', 'RM', 'Members', 'RM portrait'),
    g('member-jin', 'Jin', 'Members', 'Jin portrait'),
    g('group-chandelier', 'BTS', 'Concept', 'BTS in a chandelier-lit lavender hall, concept photo'),
    g('member-suga', 'SUGA', 'Members', 'SUGA portrait'),
    g('gallery-group', 'BTS', 'Group', 'BTS in dark suits against a warm orange backdrop'),
    g('member-jhope', 'j-hope', 'Members', 'j-hope portrait'),
    g('member-jimin', 'Jimin', 'Members', 'Jimin portrait'),
    g('gallery-hug', 'BTS', 'Group', 'BTS members in pink outfits sharing a group hug'),
    g('member-v', 'V', 'Members', 'V portrait'),
    g('member-jungkook', 'Jung Kook', 'Members', 'Jung Kook portrait')
  ];

  // youtubeId = verified official upload. Entries with no id link to a YouTube search so the link always works;
  // paste the exact video link in /admin to turn them into playable cards with real thumbnails.
  const vids = [
    ['Music Video', "BTS (방탄소년단) 'SWIM' Official MV", 'HYBE LABELS', 'b4iVv91Z6lY', '', 205],
    ['Music Video', "BTS (방탄소년단) '2.0' Official MV", 'HYBE LABELS', '_gyultVTesk', '', 280],
    ['Music Video', "BTS (방탄소년단) 'NORMAL' Official MV", 'HYBE LABELS', 'GEk4jHwfFTA', '', 330],
    ['Music Video', "BTS 'Hooligan' Official MV", 'HYBE LABELS', '', yt('BTS Hooligan Official MV HYBE LABELS'), 12],
    ['Music Video', "BTS 'Body to Body' MV", 'HYBE LABELS', '', yt('BTS Body to Body MV HYBE LABELS'), 250],
    ['Run BTS', "Run BTS EP.136: Variety Quiz Show, Part 1", 'Run BTS', 'Ug01oaptA2s', '', 190],
    ['Run BTS', "Run BTS! EP.33: BTS X MANITO", 'Run BTS', 'AbGcosDdT2Y', '', 40],
    ['Run BTS', "BTS's TRIP EP.1", 'BANGTANTV', 'wu6bA3zK_us', '', 160],
    ['Vlog', "ONE LUCKY DAY: V's VLOG", 'BANGTANTV', 'ifimMx-kcqE', '', 230],
    ['Vlog', "[VLOG] RM's Trip in Europe", 'BANGTANTV', 'TVmawu479vY', '', 350]
  ];
  const videos = [];
  for (let i = 0; i < vids.length; i++) {
    const [type, title, meta, youtubeId, url, hue] = vids[i];
    const img = await make(`video-${i + 1}`, { hue, label: type.toUpperCase(), sub: meta.toUpperCase(), w: 960, h: 540, variant: i + 1 }, 960, 0);
    videos.push({ id: id(), type, title, meta, youtubeId, url, image: img.image });
  }

  await sharp(Buffer.from(art({ hue: 275, label: 'ARMY HUB', sub: 'A FAN-MADE HOME FOR BTS FANS', w: 1200, h: 630, variant: 1 }))).png().toFile(path.join(OUT, 'og.png'));

  const data = {
    settings: {
      siteName: 'ARMY Hub',
      tagline: 'A fan-made home for BTS fans',
      shopifyStore: '',
      fallbackShopUrl: 'https://shop.weverse.io/en/home',
      heroAlbumId: albumItems[0].id,
      heroBlurb: "BTS's 2026 comeback album, their first full-group release after the members' military service. Hear 25 seconds of SWIM from the official video, then stream or collect the album.",
      preview: { youtubeId: 'b4iVv91Z6lY', start: 55, label: 'SWIM' },
      autoApproveLetters: false,
      contactEmail: '',
      operatorName: '',
      jurisdiction: 'India',
      legalUpdated: '2026-10-23',
      social: {
        x: 'https://x.com/BTS_twt',
        instagram: 'https://www.instagram.com/bts.bighitofficial/',
        youtube: 'https://www.youtube.com/@BTS',
        tiktok: 'https://www.tiktok.com/@bts_official_bighit'
      }
    },
    albums: albumItems,
    gallery,
    videos,
    shop: [
      { id: id(), title: 'Albums', note: 'CDs, vinyl and photocard sets.', handle: 'albums' },
      { id: id(), title: 'Light Sticks', note: 'For the next show or the couch.', handle: 'light-sticks' },
      { id: id(), title: 'Merch', note: 'Apparel and everyday goods.', handle: 'merch' }
    ],
    faqs: [
      ['What is ARMY Hub?', 'ARMY Hub is a fan-made website for BTS fans. It collects albums, photos, videos, fan letters and shop links in one place so they are easy to browse and search.'],
      ['Is ARMY Hub an official BTS or HYBE website?', 'No. ARMY Hub is an unofficial fan project. It is not affiliated with, endorsed by or connected to BigHit Music, HYBE or BTS. All names, logos and trademarks belong to their owners.'],
      ['How do I write a fan letter?', 'Open the Fan Letters section, pick who the letter is to, write your message and press Send. Choose a nickname; you do not need to share your real name or email. After sending you get a private edit code. Keep it safe.'],
      ['Can I edit or rewrite my fan letter later?', 'Yes. On the device you used, your letters appear under "My letters" with Edit and Delete buttons. On another device, open "Edit a letter with a code" and enter your edit code. Changed letters are checked again before they appear on the wall.'],
      ['Why is my letter not on the wall yet?', 'Every new or edited letter is read by a person first, to keep the wall kind and safe. This usually takes a day or two. Letters with web links, personal contact details or hurtful content are not published.'],
      ['Where can I listen to BTS music?', 'Each album card has a button that opens the album in the store or on a streaming service. You can also find official releases on the major streaming platforms and the official YouTube channels linked in the footer.'],
      ['Where do I buy albums and merchandise?', 'The Shop section and the buy buttons open the store set up by the site owner. For products made by the artist\'s company, the official Weverse Shop is the safest source. Check that any seller you use is licensed.'],
      ['How can I avoid fake or unlicensed merchandise?', 'Buy from the official store or from authorized retailers. Be careful with prices far below normal, sellers with no return policy, and listings that use blurry or copied product photos.'],
      ['What is the 25-second preview on the home page?', 'It plays a short clip of the official SWIM music video from HYBE LABELS on YouTube. It only loads when you press play, and it stops by itself after 25 seconds.'],
      ['Can I send in photos or fan art?', 'Yes. Use the contact form and tell us what you would like to share. Only send work you created or have permission to share, and tell us how you want to be credited. We will reply before anything is published.'],
      ['Something of mine is on the site. How do I ask for it to be removed?', 'Use the contact form, include the page address and say what should be removed. We act on removal requests quickly and do not ask you to explain why.'],
      ['How do I switch between dark and light mode?', 'Use the sun or moon button at the top right of every page. The site remembers your choice on that device and follows your device setting until you pick one.'],
      ['Do you sell concert tickets?', 'No. Buy tickets only through the official channels announced for each show.'],
      ['How does the search bar work?', 'Type a word such as an album name, a member name or "vlog". The albums, photos and videos on the home page filter as you type.'],
      ['How is my information used if I contact you or write a letter?', 'Contact messages are used only to reply to you. Fan letters are shown publicly with the nickname you choose once approved. See the Privacy Policy for full details, including how long things are kept.'],
      ['I found a broken link or a mistake. What should I do?', 'Please tell us through the contact form with the page and what looks wrong. Corrections are usually made within a few days.']
    ].map(([q, a]) => ({ id: id(), q, a })),
    letters: [],
    messages: []
  };
  fs.writeFileSync(path.join(ROOT, 'data', 'seed.json'), JSON.stringify(data, null, 2));
  console.log('Seed written:', albumItems.length, 'albums,', gallery.length, 'photos,', videos.length, 'videos');
})();
