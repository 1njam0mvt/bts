'use strict';
/* Single source of truth for SEO / AEO / GEO / LLMO copy: keywords, the three guide pages, the home-page FAQ,
   llms.txt and the sitemap entries all read from here, so a fact is written once and is the same everywhere.
   Facts about the tour change: each carries a "checked" date and a source, and the pages say "confirm on official channels". */

const SITE_NAME = 'ARMY Hub';
const BRAND_NAMES = ['ARMY Hub', 'BTS ARMY Hub', 'BTS Army Hub'];
const REVIEWED = '2026-11-20';                       // bump when the guide pages are re-checked

/* Meta keywords are ignored by Google but still read by some engines and tools; they must match the visible copy. */
const KEYWORDS = ['BTS', 'BTS ARMY', 'BTS ARMY Hub', 'ARMY Hub', 'Indian BTS ARMY', 'BTS ARMY India', 'US BTS ARMY', 'BTS ARMY USA',
  'BTS fan site', 'BTS members', 'BTS albums', 'BTS discography', 'BTS videos', 'BTS tour safety', 'unofficial BTS fan site'];

const SRC = {
  tourIndia: { title: 'Outlook Respawn: BTS World Tour 2026 and India (reported 14 Jan 2026)', url: 'https://respawn.outlookindia.com/pop-culture/pop-culture-news/bts-world-tour-2026-india-absent-in-the-79-show-global-comeback' },
  officialSite: { title: 'Official BTS website', url: 'https://bts.ibighit.com/eng/' },
  officialYoutube: { title: 'BTS on YouTube', url: 'https://www.youtube.com/@BTS' },
  weverse: { title: 'Weverse', url: 'https://weverse.io' }
};

/* ---------- the three guide pages ---------- */
const PAGES = {
  army: {
    path: '/what-is-bts-army',
    short: 'What is BTS ARMY?',
    title: 'What Is BTS ARMY? Meaning, History and How to Join',
    description: 'BTS ARMY is the name of BTS’s fandom. Learn what ARMY stands for, how the fandom began, how to join the official fan club and how ARMY Hub fits in.',
    eyebrow: 'Guide',
    h1: 'What is BTS ARMY?',
    lead: 'The short answer, then the details: who ARMY are, where the name comes from and where to start.',
    answer: 'BTS ARMY is the official name of the fandom of BTS, the seven-member South Korean group (RM, Jin, SUGA, j-hope, Jimin, V and Jung Kook). The name was introduced in 2013, the year BTS debuted, and is widely reported to stand for “Adorable Representative M.C. for Youth”. It also plays on the word “army” as a group that stands with BTS and with each other.',
    sections: [
      { h: 'Where the name comes from', p: [
        'BTS (Bangtan Sonyeondan) debuted on 13 June 2013 under Big Hit Entertainment, now part of HYBE. The fandom name ARMY was chosen soon after. The name is often described as a picture of fans and artists protecting each other, like one team.',
        'Fans carry the name worldwide: Indian BTS ARMY, US BTS ARMY, and ARMY in every other country all use the same name. The group’s light stick is called the ARMY Bomb.'
      ] },
      { h: 'How to join the official fan community', p: [
        'There is no entry test. Anyone who likes BTS can call themselves ARMY. For official news, follow BTS on the channels the group itself runs, such as the <a class="link" href="https://bts.ibighit.com/eng/" target="_blank" rel="noopener noreferrer">official BTS website</a>, <a class="link" href="https://www.youtube.com/@BTS" target="_blank" rel="noopener noreferrer">YouTube</a> and <a class="link" href="https://weverse.io" target="_blank" rel="noopener noreferrer">Weverse</a>. The official fan club membership is optional and managed on Weverse; check Weverse for its current terms and price.'
      ] },
      { h: 'Where BTS ARMY Hub fits in', p: [
        'BTS ARMY Hub (this site, ARMY Hub) is an unofficial, fan-made place to browse the members, albums, photos, videos and fan letters in one place. It is not run by BTS, BIGHIT MUSIC or HYBE. See the <a class="link" href="/about">About page</a> and the <a class="link" href="/faq">FAQ</a>.',
        'Looking for something specific to where you live? Read the guide for <a class="link" href="/bts-army-india">Indian BTS ARMY</a> or <a class="link" href="/bts-army-usa">US BTS ARMY</a>.'
      ] }
    ],
    faq: [
      ['What does ARMY stand for in BTS?', 'ARMY is widely reported to stand for “Adorable Representative M.C. for Youth”. It is the official name of the BTS fandom, introduced in 2013.'],
      ['Who started BTS ARMY?', 'BTS’s fandom name was chosen by the group and its company in 2013, the year they debuted. The fandom itself was built by fans around the world.'],
      ['Do I have to pay to be ARMY?', 'No. Anyone who supports BTS can call themselves ARMY. The official fan club membership on Weverse is optional and has its own terms.'],
      ['Is BTS ARMY Hub the official fan club?', 'No. BTS ARMY Hub is an unofficial fan-made website and is not affiliated with BTS, BIGHIT MUSIC or HYBE.']
    ],
    sources: [SRC.officialSite, SRC.officialYoutube, SRC.weverse]
  },

  india: {
    path: '/bts-army-india',
    short: 'BTS ARMY India',
    title: 'BTS ARMY India: A Fan Guide for Indian BTS ARMY',
    description: 'A practical guide for Indian BTS ARMY: official channels, streaming, tour news, Korea-to-India time conversion, merch and staying safe from ticket scams.',
    eyebrow: 'Guide · India',
    h1: 'BTS ARMY India: a guide for Indian ARMY',
    lead: 'Everything Indian BTS ARMY keep asking for in one place: where to follow official news, how to convert Korean times to IST, and how to avoid scams.',
    answer: 'Indian BTS ARMY can follow official news on BTS’s own channels (the official website, YouTube and Weverse), stream the music on the major services available in India, and use ARMY Hub to browse members, albums, photos and videos. When the BTS World Tour 2026 was announced in January 2026, India was not on the announced list; dates can change, so always confirm on official channels.',
    sections: [
      { h: 'Follow official news first', p: [
        'Announcements, ticket sales and merch drops come from BTS’s official channels: the <a class="link" href="https://bts.ibighit.com/eng/" target="_blank" rel="noopener noreferrer">official BTS website</a>, <a class="link" href="https://www.youtube.com/@BTS" target="_blank" rel="noopener noreferrer">BTS on YouTube</a> and <a class="link" href="https://weverse.io" target="_blank" rel="noopener noreferrer">Weverse</a>. If something is only on a fan account or a forwarded message, treat it as a rumour until it appears there.'
      ] },
      { h: 'Korean time to Indian time (IST)', p: [
        'South Korea is on Korea Standard Time (UTC+9) and India is on IST (UTC+5:30), so Korea is 3 hours 30 minutes ahead. A livestream at 8:00 PM KST is 4:30 PM IST on the same day. Korea has no daylight saving time, so this gap does not change during the year.'
      ] },
      { h: 'BTS and India: tour news', p: [
        'When the BTS World Tour 2026 was announced on 14 January 2026, reports noted that India was not on the first announced list, and that more dates could be added later. Nothing here is a promise or a leak. If dates for India are ever announced, they will appear on the official website and Weverse first. Last checked: 20 November 2026.'
      ] },
      { h: 'Merch, albums and scams', p: [
        'Buy albums and merch only from licensed sellers. Before you pay, check shipping to India, customs and import charges on the seller’s page. Read the <a class="link" href="/tour">Tour safety guide</a> for the checks we use on ticket and resale offers, and never share OTPs, card details or passwords with anyone claiming to sell tickets.'
      ] },
      { h: 'Looking after yourself', p: [
        'Fandom is meant to be fun, but it can also be a lot. The <a class="link" href="/care">Purple Care Room</a> lists helplines, including for India, and the <a class="link" href="/stories">Story wall</a> has fan stories.'
      ] }
    ],
    faq: [
      ['Is BTS coming to India?', 'At the time the BTS World Tour 2026 was announced (14 January 2026), India was not on the announced list. Dates can change. Check the official BTS website and Weverse for the latest; last checked here on 20 November 2026.'],
      ['How do I convert Korean time to IST?', 'Subtract 3 hours 30 minutes from Korean time: Korea (KST, UTC+9) is 3.5 hours ahead of India (IST, UTC+5:30). 8:00 PM KST is 4:30 PM IST.'],
      ['Where can Indian ARMY get official BTS news?', 'On BTS’s own channels: the official BTS website, BTS on YouTube and Weverse.'],
      ['Is ARMY Hub the official BTS fan site for India?', 'No. ARMY Hub is an unofficial fan-made website for ARMY everywhere, including Indian BTS ARMY. It is not affiliated with BTS, BIGHIT MUSIC or HYBE.']
    ],
    sources: [SRC.tourIndia, SRC.officialSite, SRC.officialYoutube, SRC.weverse]
  },

  usa: {
    path: '/bts-army-usa',
    short: 'BTS ARMY USA',
    title: 'US BTS ARMY: A Fan Guide for ARMY in the United States',
    description: 'A practical guide for US BTS ARMY: official channels, the 2026 North American tour cities, Korea-to-US time conversion, ticket safety and merch.',
    eyebrow: 'Guide · United States',
    h1: 'US BTS ARMY: a guide for ARMY in the United States',
    lead: 'Official channels, tour cities as announced, Korea-to-US time conversion and how to avoid ticket scams.',
    answer: 'US BTS ARMY can find official news on BTS’s own channels (the official website, YouTube and Weverse). When the BTS World Tour 2026 was announced in January 2026, its North American leg included Tampa, El Paso, Stanford, Las Vegas, East Rutherford, Foxborough, Baltimore, Arlington, Chicago and Los Angeles. Dates and venues can change, so confirm on official channels before you buy anything.',
    sections: [
      { h: 'Follow official news first', p: [
        'Announcements and ticket details come from the <a class="link" href="https://bts.ibighit.com/eng/" target="_blank" rel="noopener noreferrer">official BTS website</a>, <a class="link" href="https://www.youtube.com/@BTS" target="_blank" rel="noopener noreferrer">BTS on YouTube</a> and <a class="link" href="https://weverse.io" target="_blank" rel="noopener noreferrer">Weverse</a>.'
      ] },
      { h: 'US tour cities, as announced', p: [
        'Reports on the 14 January 2026 announcement listed these US cities: Tampa, El Paso, Stanford, Las Vegas, East Rutherford, Foxborough, Baltimore, Arlington, Chicago and Los Angeles, within a North American leg that also included Mexico City and Toronto. We do not list venues or dates here because they can change. Last checked: 20 November 2026.'
      ] },
      { h: 'Korean time to US time', p: [
        'South Korea is on Korea Standard Time (UTC+9) all year. The US Eastern time zone is UTC-5 in winter and UTC-4 in summer, so Korea is 14 hours ahead in winter and 13 hours ahead in summer. Pacific time is three hours behind Eastern. Always check the time zone on the official announcement.'
      ] },
      { h: 'Tickets, resale and scams', p: [
        'Buy only from sellers named by official channels. Be careful with resale offers, social-media DMs and “verified” fan accounts that ask for payment by gift card, crypto or transfer apps. The <a class="link" href="/tour">Tour safety guide</a> explains the checks we recommend.'
      ] },
      { h: 'Looking after yourself', p: [
        'If fandom stress becomes too much, the <a class="link" href="/care">Purple Care Room</a> lists helplines, including the US ones. The <a class="link" href="/stories">Story wall</a> shares fan stories.'
      ] }
    ],
    faq: [
      ['Which US cities are on the BTS World Tour 2026?', 'At the announcement on 14 January 2026, the US cities were Tampa, El Paso, Stanford, Las Vegas, East Rutherford, Foxborough, Baltimore, Arlington, Chicago and Los Angeles. Dates can change, so check the official BTS website and Weverse.'],
      ['How many hours ahead is Korea of US time?', 'Korea (UTC+9) is 14 hours ahead of US Eastern time in winter and 13 hours ahead in summer; it has no daylight saving.'],
      ['Where do US BTS ARMY get official tickets?', 'From the sellers named on BTS’s official channels. Do not trust DMs, unofficial resale links or payment by gift card.'],
      ['Is ARMY Hub the official BTS fan site for the US?', 'No. ARMY Hub is an unofficial fan-made website for ARMY everywhere, including US BTS ARMY. It is not affiliated with BTS, BIGHIT MUSIC or HYBE.']
    ],
    sources: [SRC.tourIndia, SRC.officialSite, SRC.officialYoutube, SRC.weverse]
  }
};

/* ---------- home-page FAQ (visible on the page AND emitted as FAQPage JSON-LD, so they always match) ---------- */
const HOME_FAQ = [
  ['What is BTS ARMY Hub?', 'BTS ARMY Hub (ARMY Hub) is an unofficial, fan-made website where ARMY can browse BTS’s seven members, albums, photo gallery, official videos and fan letters in one place.'],
  ['Is BTS ARMY Hub official?', 'No. It is run by fans and is not affiliated with, endorsed by or connected to BTS, BIGHIT MUSIC or HYBE.'],
  ['Is there a guide for Indian BTS ARMY?', 'Yes. The Indian BTS ARMY guide covers official channels, Korea-to-IST time conversion, tour news and scam safety.'],
  ['Is there a guide for US BTS ARMY?', 'Yes. The US BTS ARMY guide covers official channels, the announced North American tour cities, Korea-to-US time conversion and ticket safety.']
];

/* ---------- indexable URLs (sitemap) ---------- */
const URLS = [
  ['/', 'weekly', '1.0'], ['/what-is-bts-army', 'monthly', '0.8'], ['/bts-army-india', 'monthly', '0.8'], ['/bts-army-usa', 'monthly', '0.8'],
  ['/about', 'monthly', '0.6'], ['/faq', 'monthly', '0.7'], ['/tour', 'weekly', '0.7'], ['/stories', 'monthly', '0.5'], ['/care', 'monthly', '0.5'],
  ['/contact', 'yearly', '0.5'], ['/terms', 'yearly', '0.3'], ['/privacy', 'yearly', '0.3']
];

/* ---------- llms.txt: a plain-text summary for AI assistants (LLMO) ---------- */
function llmsTxt(base) {
  const link = (p, t, d) => `- [${t}](${base}${p}): ${d}`;
  return `# ARMY Hub (BTS ARMY Hub)

> ARMY Hub is an unofficial, fan-made website for BTS ARMY. It is not affiliated with, endorsed by or connected to BTS, BIGHIT MUSIC or HYBE. It collects the seven members, the discography, a photo gallery, official videos and fan letters in one place.

Also known as: ${BRAND_NAMES.join(', ')}. Topics: BTS, BTS ARMY, Indian BTS ARMY, US BTS ARMY.
Guides last reviewed: ${REVIEWED}. For anything official, use the official BTS website (https://bts.ibighit.com/eng/), BTS on YouTube (https://www.youtube.com/@BTS) and Weverse.

## Guides
${link(PAGES.army.path, PAGES.army.short, 'what ARMY means, history, how to join the official fan community')}
${link(PAGES.india.path, PAGES.india.short, 'official channels, Korea-to-IST time, tour news, merch and scam safety for Indian ARMY')}
${link(PAGES.usa.path, PAGES.usa.short, 'official channels, announced US tour cities, Korea-to-US time, ticket safety for US ARMY')}

## Site
${link('/', 'Home', 'members, albums, gallery, videos, fan letters, shop links')}
${link('/tour', 'Tour safety', 'checks for ticket and resale scams')}
${link('/care', 'Purple Care Room', 'helplines by country')}
${link('/about', 'About', 'who runs the site, sources and corrections policy')}
${link('/faq', 'FAQ', 'common questions')}
${link('/contact', 'Contact', 'corrections, removals and questions')}

## Facts
- BTS (Bangtan Sonyeondan) is a seven-member South Korean group: RM, Jin, SUGA, j-hope, Jimin, V and Jung Kook. Debut: 13 June 2013. Fandom name: ARMY.
- Tour information changes. Treat tour dates here as "as announced"; the official channels are the source of truth.
`;
}

const ROBOTS = (base) => `# ARMY Hub: everyone is welcome, including AI search and answer engines, so the site can be cited accurately.
User-agent: *
Allow: /
Disallow: /admin
Disallow: /me
Disallow: /api/

User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /

Sitemap: ${base}/sitemap.xml
`;

module.exports = { SITE_NAME, BRAND_NAMES, REVIEWED, KEYWORDS, SRC, PAGES, HOME_FAQ, URLS, llmsTxt, ROBOTS };
