/* "Choose your door" (home page). Saves the choice in this browser (ArmyStore) and takes the visitor to a tailored view. */
(() => {
  'use strict';
  const S = window.ArmyStore;
  const grid = document.querySelector('[data-doors]');
  if (!S || !grid) return;
  let doors = [];
  try { doors = JSON.parse(grid.dataset.doors); } catch (e) { return; }
  const byId = (id) => doors.find((d) => d.id === id) || null;
  const buttons = Array.from(grid.querySelectorAll('[data-door]'));
  const last = document.getElementById('door-last');
  const reduce = () => S.get().layout.reduceMotion || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  function paint() {
    const cur = S.get().door;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.door === cur)));
    const b = buttons.find((x) => x.dataset.door === cur);
    if (!last) return;
    last.replaceChildren();
    if (!b) { last.hidden = true; return; }
    last.hidden = false;
    last.append('Last time you came in through ');
    const strong = document.createElement('strong'); strong.textContent = b.querySelector('.door-title').textContent; last.append(strong, '. ');
    const again = document.createElement('button'); again.type = 'button'; again.className = 'link'; again.textContent = 'Go there again'; again.addEventListener('click', () => go(cur)); last.append(again);
  }

  function go(id) {
    let d = byId(id);
    if (!d) return;
    S.set((s) => { s.door = id; return s; });                    // remembered, no account needed
    if (id === 'surprise') { const real = doors.filter((x) => x.id !== 'surprise'); d = real[Math.floor(Math.random() * real.length)]; }
    paint();
    if (d.href.indexOf('/#') === 0) {                            // a section on this page
      const target = document.getElementById(d.href.slice(2));
      if (d.chip) { const chip = document.querySelector(d.chip[0] + ' .chip[data-type="' + d.chip[1] + '"]'); if (chip) chip.click(); }
      if (target) {
        target.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' });
        if (!reduce()) { target.classList.add('door-flash'); setTimeout(() => target.classList.remove('door-flash'), 1400); }
        history.replaceState(null, '', d.href.slice(1));
      }
    } else location.href = d.href;                               // another page (cross-fade comes from CSS @view-transition)
  }

  grid.addEventListener('click', (e) => { const b = e.target.closest('[data-door]'); if (b) go(b.dataset.door); });
  S.subscribe(paint);
  paint();
})();
