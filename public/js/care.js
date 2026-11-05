/* /care: show only the helplines for the chosen country. Without JavaScript every country is listed.
   The country is guessed from the browser's own language setting: there is NO IP lookup, nothing is sent anywhere. */
(() => {
  'use strict';
  const sel = document.getElementById('care-country');
  const regions = Array.from(document.querySelectorAll('.care-region'));
  if (!sel || !regions.length) return;

  const show = (code) => { regions.forEach((r) => { r.hidden = r.dataset.region !== code; }); };
  sel.addEventListener('change', () => show(sel.value));

  let guess = '';
  try { guess = (new Intl.Locale(navigator.language).region || '').toUpperCase(); } catch (e) { /* ignore */ }
  if (regions.some((r) => r.dataset.region === guess)) { sel.value = guess; show(guess); }
  else show('');                                             // none chosen yet: the fallback directory link below stays visible
})();
