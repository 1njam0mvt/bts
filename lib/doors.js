'use strict';
/* "Choose your door" options. One list drives the home page buttons and public/js/door.js.
   href is where the door leads. A home-page anchor can also set a filter: { chips: [['#video-filters', 'Run BTS']] } is applied by door.js. */
const DOORS = [
  { id: 'song', title: 'A song', hint: 'Start from the music', href: '/#music' },
  { id: 'member', title: 'A member', hint: 'Meet one of the seven', href: '/#members' },
  { id: 'performance', title: 'A performance', hint: 'Stages and live moments', href: '/#gallery', chip: ['#gallery-filters', 'Concert'] },
  { id: 'lyric', title: 'A lyric', hint: 'Words that stayed with you', href: '/stories' },
  { id: 'funny', title: 'A funny clip', hint: 'Run BTS and good laughs', href: '/#videos', chip: ['#video-filters', 'Run BTS'] },
  { id: 'tour', title: 'The tour', hint: 'Safety, tickets, checks', href: '/tour' },
  { id: 'surprise', title: 'Surprise me', hint: 'We pick a door', href: '/' }
];
module.exports = { DOORS };
