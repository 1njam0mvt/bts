'use strict';
/* The seven BTS members and a few timeline moments.
   Facts are limited to widely published, easily checked details (birth date and place, role, solo
   releases). Nothing personal or speculative. Double-check against the official BTS website
   (https://bts.ibighit.com/eng/) before you edit or extend anything here.

   Portraits live in public/img/fan/member-<id>.webp (+ -thumb.webp). Swap the files to change a
   photo; keep the same names. */

const MEMBERS = [
  {
    id: 'rm', stage: 'RM', name: 'Kim Namjoon', role: 'Leader · Rapper', born: '12 September 1994', from: 'Ilsan, Goyang, South Korea',
    bio: 'RM is the leader of BTS and one of its rappers and songwriters. He spoke for the group at the United Nations in New York in 2018 as part of the Love Myself campaign with UNICEF.',
    solo: [['RM', '2015', 'Mixtape'], ['mono.', '2018', 'Mixtape'], ['Indigo', '2022', 'Album'], ['Right Place, Wrong Person', '2024', 'Album']]
  },
  {
    id: 'jin', stage: 'Jin', name: 'Kim Seokjin', role: 'Vocalist', born: '4 December 1992', from: 'Anyang, South Korea',
    bio: 'Jin is the eldest member of BTS and sings in the group. His solo work includes the single "The Astronaut" and the mini albums "Happy" and "Echo".',
    solo: [['The Astronaut', '2022', 'Single'], ['Happy', '2024', 'Mini album'], ['Echo', '2025', 'Mini album']]
  },
  {
    id: 'suga', stage: 'SUGA', name: 'Min Yoongi', role: 'Rapper · Producer', born: '9 March 1993', from: 'Daegu, South Korea',
    bio: 'SUGA is a rapper, songwriter and producer in BTS. He releases solo music under the name Agust D, and has produced and written for the group since its early albums.',
    solo: [['Agust D', '2016', 'Mixtape'], ['D-2', '2020', 'Mixtape'], ['D-DAY', '2023', 'Album']]
  },
  {
    id: 'jhope', stage: 'j-hope', name: 'Jung Hoseok', role: 'Rapper · Dancer', born: '18 February 1994', from: 'Gwangju, South Korea',
    bio: 'j-hope is a rapper and dancer in BTS. In 2022 he headlined the Lollapalooza festival in Chicago.',
    solo: [['Hope World', '2018', 'Mixtape'], ['Jack in the Box', '2022', 'Album'], ['Hope on the Street Vol. 1', '2024', 'Album']]
  },
  {
    id: 'jimin', stage: 'Jimin', name: 'Park Jimin', role: 'Vocalist · Dancer', born: '13 October 1995', from: 'Busan, South Korea',
    bio: 'Jimin is a vocalist and dancer in BTS. His 2023 solo single "Like Crazy" reached No. 1 on the Billboard Hot 100.',
    solo: [['FACE', '2023', 'Mini album'], ['MUSE', '2024', 'Album']]
  },
  {
    id: 'v', stage: 'V', name: 'Kim Taehyung', role: 'Vocalist', born: '30 December 1995', from: 'Daegu, South Korea',
    bio: 'V is a vocalist in BTS. He sang "Sweet Night" for the drama Itaewon Class and released the solo album "Layover" in 2023.',
    solo: [['Sweet Night', '2020', 'Soundtrack single'], ['Layover', '2023', 'Album']]
  },
  {
    id: 'jungkook', stage: 'Jung Kook', name: 'Jeon Jungkook', role: 'Vocalist · Maknae', born: '1 September 1997', from: 'Busan, South Korea',
    bio: 'Jung Kook is the youngest member of BTS (the "maknae") and a vocalist. His 2023 solo single "Seven" debuted at No. 1 on the Billboard Hot 100.',
    solo: [['Seven', '2023', 'Single'], ['GOLDEN', '2023', 'Album']]
  }
].map((m) => ({ ...m, image: `/img/fan/member-${m.id}.webp`, thumb: `/img/fan/member-${m.id}-thumb.webp` }));

/* "ARMY Memories" timeline on the home page. */
const MILESTONES = [
  ['13 Jun 2013', 'Debut', 'BTS debut with "No More Dream" from the single album 2 Cool 4 Skool.'],
  ['May 2017', 'Billboard Music Awards', 'BTS win Top Social Artist, the first Korean act to take a Billboard Music Award.'],
  ['Sep 2018', 'United Nations', 'RM speaks at the United Nations in New York as part of the Love Myself campaign with UNICEF.'],
  ['Aug 2020', 'Dynamite', 'The English-language single "Dynamite" is released and goes on to top the Billboard Hot 100.'],
  ['Jun 2022', 'Proof', 'The anthology album Proof looks back over the group\'s first nine years.'],
  ['Mar 2026', 'ARIRANG', 'ARIRANG arrives, the first full-group album after the members\' military service.']
];

module.exports = { MEMBERS, MILESTONES };
