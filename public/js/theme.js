/* Loaded in <head> before the page paints, so the chosen theme never flashes.
   Uses the visitor's saved choice, otherwise their device setting. */
(function () {
  var t = null;
  try { t = localStorage.getItem('armyhub.theme'); } catch (e) { /* storage blocked: fall back to device setting */ }
  if (t !== 'light' && t !== 'dark') t = window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.classList.add('js');            // lets CSS fade images in only when scripts run
  var m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute('content', t === 'light' ? '#f7f5fc' : '#0b0714');
})();
