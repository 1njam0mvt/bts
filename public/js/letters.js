/* Fan letters: write, edit, rewrite and delete. No accounts: each letter has a private edit code.
   Codes for letters written on this device are kept in localStorage so "My letters" works automatically. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const form = $('#letter-form');
  if (!form) return;

  const KEY = 'armyhub.letters';
  const mem = { list: [] };                                          // fallback when localStorage is blocked
  const saved = {
    get() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return mem.list; } },
    set(v) { mem.list = v; try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };

  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const status = $('#l-status'), send = $('#l-send'), cancel = $('#l-cancel'), title = $('#letter-title');
  const msg = $('#l-message'), count = $('#l-count');
  let editing = null, opened = Date.now();

  const say = (node, text, ok) => { node.hidden = !text; node.textContent = text || ''; node.className = (node.classList.contains('status') ? 'status ' + (ok ? 'ok' : 'err') : node.className); };
  async function api(method, url, body) {
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'Something went wrong. Please try again.');
    return j;
  }
  msg.addEventListener('input', () => { count.textContent = msg.value.length; });

  /* Frame: the writing page takes the chosen look straight away. */
  const paper = $('#paper'), tpl = $('#l-template');
  const setFrame = (id) => {
    const r = form.querySelector(`input[name="frame"][value="${id}"]`) || form.querySelector('input[name="frame"][value="classic"]');
    if (r) r.checked = true;
    paper.className = 'paper fr-' + (r ? r.value : 'classic');
  };
  form.addEventListener('change', (e) => { if (e.target.name === 'frame') setFrame(e.target.value); });
  form.addEventListener('reset', () => setTimeout(() => setFrame('classic'), 0));
  tpl.addEventListener('change', () => {
    if (!tpl.value) return;
    if (msg.value.trim() && !confirm('Replace what you have written with this template?')) { tpl.value = ''; return; }
    msg.value = tpl.value; count.textContent = msg.value.length; msg.focus();
    const i = msg.value.indexOf('['); if (i > -1) msg.setSelectionRange(i, msg.value.indexOf(']', i) + 1);   // jump to the first [blank]
    tpl.value = '';
  });

  function reset() {
    editing = null; form.reset(); count.textContent = '0';
    title.textContent = 'Write your letter'; send.textContent = 'Send letter'; cancel.hidden = true; say(status, '');
    form.hidden = false; $('#l-done').hidden = true; opened = Date.now();
  }
  function startEdit(letter, code) {
    editing = { id: letter.id, code };
    form.hidden = false; $('#l-done').hidden = true;
    $('#l-nick').value = letter.nickname; $('#l-country').value = letter.country || ''; $('#l-to').value = letter.to; msg.value = letter.message; setFrame(letter.frame || 'classic');
    count.textContent = msg.value.length;
    title.textContent = 'Edit your letter'; send.textContent = 'Save changes'; cancel.hidden = false; say(status, '');
    $('#letter-card').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('#l-message').focus({ preventScroll: true });
  }
  cancel.addEventListener('click', reset);
  $('#l-another').addEventListener('click', reset);

  /* ---------- My letters (this device) ---------- */
  async function renderMine() {
    const box = $('#my-letters-box'), list = $('#my-letters');
    const items = saved.get();
    list.replaceChildren();
    const keep = [];
    for (const it of items) {
      try {
        const { letter } = await api('POST', '/api/letters/lookup', { code: it.code });
        keep.push(it);
        const card = el('article', 'letter mine fr-' + (letter.frame || 'classic'));
        const top = el('div', 'flex flex-wrap items-center justify-between gap-2');
        top.append(el('p', 'letter-to', 'Dear ' + letter.to + ','), el('span', 'badge ' + (letter.status === 'approved' ? 'live' : 'wait'), letter.status === 'approved' ? 'On the wall' : 'Waiting for approval'));
        const actions = el('div', 'flex gap-2 flex-wrap');
        const edit = el('button', 'chip', 'Edit'); edit.type = 'button'; edit.addEventListener('click', () => startEdit(letter, it.code));
        const del = el('button', 'chip', 'Delete'); del.type = 'button';
        del.addEventListener('click', async () => {
          if (!del.dataset.sure) { del.dataset.sure = '1'; del.textContent = 'Click again to delete'; return; }
          try { await api('DELETE', '/api/letters/' + letter.id, { code: it.code }); saved.set(saved.get().filter((x) => x.id !== letter.id)); if (editing && editing.id === letter.id) reset(); renderMine(); }
          catch (e) { del.textContent = e.message; }
        });
        actions.append(edit, del);
        card.append(top, el('p', 'letter-body', letter.message), actions);
        list.append(card);
      } catch (e) {
        if (/No letter found/.test(e.message)) continue;           // deleted elsewhere: forget it
        keep.push(it);
      }
    }
    if (keep.length !== items.length) saved.set(keep);
    box.hidden = list.children.length === 0;
  }

  /* ---------- Send or save ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.nickname.trim()) return say(status, 'Please choose a nickname.', false);
    if (d.message.trim().length < 20) return say(status, 'Please write at least 20 characters.', false);
    send.disabled = true; say(status, 'Sending…', true);
    try {
      if (editing) {
        const r = await api('PUT', '/api/letters/' + editing.id, { ...d, code: editing.code });
        reset();
        say(status, r.status === 'approved' ? 'Saved. Your letter is updated.' : 'Saved. Your changed letter will appear on the wall after it is checked again.', true);
        renderMine();
      } else {
        const r = await api('POST', '/api/letters', { ...d, elapsed: Date.now() - opened });
        saved.set(saved.get().concat([{ id: r.id, code: r.code }]));
        form.hidden = true; $('#l-done').hidden = false;
        $('#l-code').textContent = r.code;
        $('#l-done-text').textContent = r.status === 'approved' ? 'Your letter is now on the wall.' : 'A person will read it first. It usually appears within a day or two. You can edit or delete it below at any time.';
        renderMine();
      }
    } catch (err) { say(status, err.message, false); }
    finally { send.disabled = false; }
  });

  $('#l-copy').addEventListener('click', async () => {
    const t = $('#l-code').textContent, b = $('#l-copy');
    try { await navigator.clipboard.writeText(t); b.textContent = 'Copied'; }
    catch (e) { const r = document.createRange(); r.selectNodeContents($('#l-code')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Press copy on your device'; }
  });

  /* ---------- Edit with a code (another device) ---------- */
  $('#l-find').addEventListener('click', async () => {
    const st = $('#l-find-status'), code = $('#l-lookup').value.trim();
    if (!code) { st.textContent = 'Enter your edit code.'; return; }
    st.textContent = 'Looking…';
    try {
      const { letter } = await api('POST', '/api/letters/lookup', { code });
      const list = saved.get();
      if (!list.some((x) => x.id === letter.id)) saved.set(list.concat([{ id: letter.id, code: code.toUpperCase().replace(/[^A-Z0-9]/g, '') }]));
      st.textContent = 'Found it.'; $('#l-lookup').value = '';
      await renderMine(); startEdit(letter, code.toUpperCase().replace(/[^A-Z0-9]/g, ''));
    } catch (e) { st.textContent = e.message; }
  });

  /* ---------- Show more letters ---------- */
  const wall = $('#letters-wall'), moreBtn = $('#letters-more');
  moreBtn.addEventListener('click', async () => {
    moreBtn.disabled = true;
    try {
      const r = await api('GET', '/api/letters/more?offset=' + (wall.dataset.next || 0));
      wall.insertAdjacentHTML('beforeend', r.html);                  // server-escaped HTML
      wall.dataset.next = r.next == null ? '' : r.next;
      if (r.next == null) moreBtn.hidden = true;
    } catch (e) { moreBtn.textContent = e.message; }
    finally { moreBtn.disabled = false; }
  });

  renderMine();
})();