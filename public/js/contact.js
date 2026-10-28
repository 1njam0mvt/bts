/* Contact form: client-side checks, then POST /api/contact. The server validates again. */
(() => {
  'use strict';
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('c-status');
  const send = document.getElementById('c-send');
  const msg = document.getElementById('c-message');
  const count = document.getElementById('c-count');
  const opened = Date.now();

  msg.addEventListener('input', () => { count.textContent = msg.value.length; });

  const say = (text, ok) => { status.hidden = false; status.textContent = text; status.className = 'status ' + (ok ? 'ok' : 'err'); };
  const mark = (el, bad) => el.setAttribute('aria-invalid', String(bad));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const bad = {
      name: !d.name.trim(),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()),
      message: d.message.trim().length < 10
    };
    ['name', 'email', 'message'].forEach((k) => mark(form.elements[k], bad[k]));
    if (bad.name || bad.email || bad.message) {
      say(bad.name ? 'Please enter your name.' : bad.email ? 'Please enter a valid email address.' : 'Please write at least 10 characters.', false);
      return;
    }
    send.disabled = true;
    say('Sending…', true);
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...d, elapsed: Date.now() - opened })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Something went wrong. Please try again.');
      form.reset(); count.textContent = '0';
      say('Thank you. Your message was sent and we will reply by email.', true);
    } catch (err) {
      say(err.message, false);
    } finally {
      send.disabled = false;
    }
  });
})();
