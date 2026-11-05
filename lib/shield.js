'use strict';
/* Scam-Shield data. Edit only from official announcements.

   OFFICIAL_TICKETING: add one row per show, ONLY from the official announcement, and put that announcement's address in sourceUrl.
     { event: 'Event name', venue: 'Venue', date: '2026-08-01', ticketUrl: 'https://…official ticket page…', sourceUrl: 'https://…announcement…' }
   While it is empty the page says "no verified ticket links yet" instead of guessing.
   OFFICIAL_STORES: confirm every store on the artist's official channels before adding it.
   `host` is the domain the link checker treats as official (subdomains such as shop.weverse.io are included). */
const OFFICIAL_STORES = [
  { name: 'Weverse Shop', url: 'https://shop.weverse.io', host: 'weverse.io', note: 'Official merchandise and albums' }
];
const OFFICIAL_TICKETING = [];
const RESALE = [
  { name: 'StubHub', host: 'stubhub.com' },
  { name: 'SeatGeek', host: 'seatgeek.com' },
  { name: 'Vivid Seats', host: 'vividseats.com' }
];
const CHECKLIST = [
  'Did you reach the page from an official announcement, not an ad or a private message?',
  'Does the address end exactly in an official domain? Read it right to left.',
  'Is it https, and free of "@", odd characters or extra words before the domain?',
  'Are you paying by a method with buyer protection (a card or a trusted wallet)?',
  'Is anyone asking you to pay by gift card, crypto or a bank transfer to a person? If so, stop: that is a scam.'
];

const hostOf = (u) => { try { return new URL(u).hostname.toLowerCase(); } catch { return ''; } };
const lists = () => ({
  official: OFFICIAL_STORES.map((s) => s.host).concat(OFFICIAL_TICKETING.map((t) => hostOf(t.ticketUrl)).filter(Boolean)),
  resale: RESALE.map((r) => r.host)
});

module.exports = { OFFICIAL_STORES, OFFICIAL_TICKETING, RESALE, CHECKLIST, lists };
