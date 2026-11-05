/* /tour: link checker (runs in the browser, nothing is sent) and the "before you buy" checklist. */
(() => {
  'use strict';
  const box = document.getElementById('shield');
  const form = document.getElementById('shield-form');
  if (!box || !form || !window.ShieldCore) return;
  let lists = { official: [], resale: [] };
  try { lists = JSON.parse(box.dataset.lists); } catch (e) { /* keep empty lists: everything shows as "not on our list" */ }
  const out = document.getElementById('shield-result');
  const input = document.getElementById('shield-url');
  const TITLE = { official: 'Looks official', resale: 'Resale marketplace', unknown: 'Not on our list', suspicious: 'Be careful' };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const r = window.ShieldCore.checkLink(input.value, lists);
    out.hidden = false; out.className = 'shield-result v-' + r.verdict; out.replaceChildren();
    const h = document.createElement('p'); h.className = 'v-title';
    h.append(TITLE[r.verdict]);
    if (r.host) { const m = document.createElement('code'); m.textContent = r.host; h.append(' ', m); }
    const ul = document.createElement('ul');
    r.reasons.forEach((t) => { const li = document.createElement('li'); li.textContent = t; ul.append(li); });
    out.append(h, ul);
  });

  const boxes = Array.from(document.querySelectorAll('[data-check]'));
  const count = document.getElementById('check-count');
  boxes.forEach((b) => b.addEventListener('change', () => {
    const n = boxes.filter((x) => x.checked).length;
    count.textContent = n === boxes.length ? 'All checked. Go ahead with care.' : n + ' of ' + boxes.length + ' checked.';
  }));
})();
