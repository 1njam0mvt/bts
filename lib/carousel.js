'use strict';
/* Items for the 3D circular carousel on the home page (views/home.js -> public/js/carousel.js).
   Each item: src (full size), srcSm (480 px, used on phones), alt, title, subtitle, kind, position, href.
   Files are the site's own images in public/img/fan/. Captions state only what is visible or already on the site:
   member names and roles come from lib/members.js; group photos are not tied to an album or era. */
const { MEMBERS } = require('./members');

const ALT = {
    rm: 'RM of BTS in a portrait with a blue shirt against a dark teal background',
    jin: 'Jin of BTS in a black-and-white portrait wearing a dark suit, one hand at his chin',
    suga: 'SUGA of BTS with silver-grey hair, a black leather jacket and a chain necklace against a navy background',
    jhope: 'j-hope of BTS with dark hair in a black jacket against an orange background',
    jimin: 'Jimin of BTS with blond hair in a white floral jacket against a pale blue background',
    v: 'V of BTS with light brown hair in a red jacket and a gold necklace',
    jungkook: 'Jung Kook of BTS with dark hair in an open white jacket, looking to the side'
};
// object-position keeps faces centred when a card is wider than the photo.
const POS = { rm: '50% 38%', jin: '50% 34%', suga: '50% 36%', jhope: '50% 36%', jimin: '50% 30%', v: '50% 22%', jungkook: '50% 30%' };

const members = MEMBERS.map((m) => ({
    src: m.image, srcSm: m.thumb, alt: ALT[m.id], title: m.stage, subtitle: m.role, kind: 'Members', position: POS[m.id], href: `#m-${m.id}`, cta: `Read about ${m.stage}`
}));

const group = (file, o) => ({ src: `/img/fan/${file}.webp`, srcSm: `/img/fan/${file}-thumb.webp`, kind: 'Group', href: '', cta: '', ...o });

const ITEMS = members.concat([
    group('hero-group', { alt: 'The seven members of BTS standing on a mirror-like lake under a purple, starry sky', title: 'BTS', subtitle: 'Group concept photo', position: '50% 50%' }),
    group('group-chandelier', { alt: 'The seven members of BTS seated and standing in an ornate room with crystal chandeliers and pink curtains', title: 'BTS', subtitle: 'Group concept photo', position: '50% 82%' }),
    { src: '/img/fan/gallery-concert.webp', srcSm: '/img/fan/gallery-concert-thumb.webp', kind: 'Live', alt: 'BTS on a stadium stage with a crowd of fans holding glowing purple light sticks', title: 'BTS', subtitle: 'Live on stage', position: '50% 55%', href: '', cta: '' },
    { src: '/img/fan/gallery-hug.webp', srcSm: '/img/fan/gallery-hug-thumb.webp', kind: 'Live', alt: 'Members of BTS in pink outfits hugging and laughing together', title: 'BTS', subtitle: 'Together', position: '50% 45%', href: '', cta: '' },
    group('gallery-group', { alt: 'The seven members of BTS in grey and brown suits posing against a terracotta backdrop', title: 'BTS', subtitle: 'Editorial photo', position: '58% 50%' })
]);

module.exports = { ITEMS };