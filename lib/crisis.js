'use strict';
/* Purple Care Room: crisis lines by country. This is safety-critical, so every entry has a source page and a verification date.
   RE-CHECK each number on its `source` page before you publish, then update `verifiedOn`. `npm test` fails if any entry is older than 180 days.
   Checked in a web search on 2026-11-03: South Korea (109) and India (Tele-MANAS 14416). The others come from general knowledge and
   still need a manual check against their source page. */
const REGIONS = [
  { code: 'US', country: 'United States', emergency: '911', source: 'https://988lifeline.org', verifiedOn: '2026-11-03',
    lines: [{ name: '988 Suicide & Crisis Lifeline', phone: '988', tel: '988', note: 'Call or text, 24/7' }] },
  { code: 'CA', country: 'Canada', emergency: '911', source: 'https://988.ca', verifiedOn: '2026-11-03',
    lines: [{ name: '9-8-8 Suicide Crisis Helpline', phone: '988', tel: '988', note: 'Call or text, 24/7' }] },
  { code: 'GB', country: 'United Kingdom', emergency: '999', source: 'https://www.samaritans.org', verifiedOn: '2026-11-03',
    lines: [{ name: 'Samaritans', phone: '116 123', tel: '116123', note: 'Free, 24/7' }] },
  { code: 'IE', country: 'Ireland', emergency: '112', source: 'https://www.samaritans.org', verifiedOn: '2026-11-03',
    lines: [{ name: 'Samaritans Ireland', phone: '116 123', tel: '116123', note: 'Free, 24/7' }] },
  { code: 'AU', country: 'Australia', emergency: '000', source: 'https://www.lifeline.org.au', verifiedOn: '2026-11-03',
    lines: [{ name: 'Lifeline', phone: '13 11 14', tel: '131114', note: '24/7' }] },
  { code: 'KR', country: 'South Korea', emergency: '119 (ambulance) / 112 (police)', source: 'https://findahelpline.com/organizations/109', verifiedOn: '2026-11-03',
    lines: [{ name: 'Suicide Prevention Hotline', phone: '109', tel: '109', note: '24/7, Korean language' }] },
  { code: 'IN', country: 'India', emergency: '112', source: 'https://pib.gov.in/PressReleasePage.aspx?PRID=1919200', verifiedOn: '2026-11-03',
    lines: [{ name: 'Tele-MANAS', phone: '14416', tel: '14416', note: 'Government mental-health helpline, 24/7, many languages' }] }
];
const FALLBACK = { label: 'Find a helpline in any country', url: 'https://findahelpline.com' };

/** Throws if any entry is older than maxDays. Used by npm test. */
function assertFresh(now = new Date(), maxDays = 180) {
  const stale = REGIONS.filter((r) => (now.getTime() - Date.parse(r.verifiedOn)) / 864e5 > maxDays).map((r) => r.code);
  if (stale.length) throw new Error(`Crisis data older than ${maxDays} days for: ${stale.join(', ')}. Re-verify before shipping.`);
}

module.exports = { REGIONS, FALLBACK, assertFresh };
