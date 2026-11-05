/* Scam-Shield link checker. Runs in the visitor's browser (window.ShieldCore); the pasted address is never sent anywhere.
   The same file is require()d by tests/. Official / resale lists come from lib/shield.js (put into the page as JSON). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ShieldCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const BRAND_WORDS = ['weverse', 'bighit', 'hybe'];
  const hostMatches = (host, domain) => host === domain || host.slice(-(domain.length + 1)) === '.' + domain;   // "evilweverse.io" must NOT match "weverse.io"

  /** lists = { official: ['weverse.io', ...], resale: ['stubhub.com', ...] }  ->  { verdict, host, reasons[] } */
  function checkLink(input, lists) {
    const official = (lists && lists.official) || [], resale = (lists && lists.resale) || [];
    const raw = String(input || '').trim();
    if (!raw) return { verdict: 'unknown', host: '', reasons: ['Paste a link to check it.'] };
    let url;
    try { url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : 'https://' + raw); }
    catch (e) { return { verdict: 'suspicious', host: '', reasons: ['This does not look like a web address.'] }; }

    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    const reasons = [];
    if (url.protocol !== 'https:') reasons.push('The link is not https.');
    if (url.username || url.password) reasons.push('The address contains "@": the real site is the part AFTER it.');
    if (host.split('.').some((l) => l.indexOf('xn--') === 0)) reasons.push('The domain uses look-alike characters (punycode).');
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) reasons.push('The link is a bare IP address.');

    if (official.some((d) => hostMatches(host, d))) {
      return reasons.length ? { verdict: 'suspicious', host, reasons } : { verdict: 'official', host, reasons: ['Matches the official list.'] };
    }
    if (BRAND_WORDS.some((w) => host.indexOf(w) > -1)) reasons.push('The name looks like an official brand but is not on the official list.');
    if (resale.some((d) => hostMatches(host, d))) {
      return { verdict: 'resale', host, reasons: ['A resale marketplace: not the artist, venue or official seller. Prices and tickets are not guaranteed.'].concat(reasons) };
    }
    if (reasons.length) return { verdict: 'suspicious', host, reasons };
    return { verdict: 'unknown', host, reasons: ['Not on the official list. Do not enter payment details unless you reached it from an official announcement.'] };
  }

  return { checkLink, hostMatches };
});
