/* /stories: category filter and the "share your story" form (POST /api/stories). */
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);

  const filters = $('#story-filters'), grid = $('#story-grid'), empty = $('#story-empty');
  if (filters && grid) {
    filters.addEventListener('click', (e) => {
      const b = e.target.closest('.chip'); if (!b) return;
      filters.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      let n = 0;
      grid.querySelectorAll('.story').forEach((li) => { const show = b.dataset.type === 'all' || li.dataset.cat === b.dataset.type; li.hidden = !show; if (show) n++; });
      if (empty) empty.hidden = n > 0;
    });
  }

  const form = $('#story-form');
  if (!form) return;
  const status = $('#st-status'), send = $('#st-send'), body = $('#st-body'), count = $('#st-count');
  const opened = Date.now();
  body.addEventListener('input', () => { count.textContent = body.value.length; });
  const say = (t, ok) => { status.hidden = false; status.textContent = t; status.className = 'status ' + (ok ? 'ok' : 'err'); };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (String(d.body || '').trim().length < 40) return say('Please write at least 40 characters.', false);
    if (!$('#st-consent').checked) return say('Please tick the consent box so we can read and publish your story.', false);
    send.disabled = true; say('Sending…', true);
    try {
      const r = await fetch('/api/stories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: d.category, body: d.body, consent: true, website: d.website || '', elapsed: Date.now() - opened })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Something went wrong. Please try again.');
      form.reset(); count.textContent = '0';
      say('Thank you. A person reads every story before it appears, and you can ask for it to be removed any time.', true);
    } catch (err) { say(err.message, false); }
    finally { send.disabled = false; }
  });
})();
