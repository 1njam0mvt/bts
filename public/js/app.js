/* Site behaviour. All content is already in the HTML (server-rendered); this adds
   search, filters, the lightbox, click-to-play videos, the mobile menu and the hero glow. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Mobile menu ---------- */
  const btn = $('#menu-btn'), menu = $('#mobile-menu');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      const open = menu.hidden;
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('a', menu).forEach((a) => a.addEventListener('click', () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }));
  }

  /* ---------- Search + filters (home page only) ---------- */
  const home = $('#album-grid');
  const inputs = $$('input[name="q"]');
  const state = { q: '', album: 'all', year: 'all', video: 'all', gallery: 'all' };

  function apply() {
    const q = state.q.trim().toLowerCase();
    const run = (sel, type, empty, year = 'all') => {
      let shown = 0;
      $$(sel).forEach((el) => {
        const ok = (type === 'all' || el.dataset.type === type) && (year === 'all' || el.dataset.year === year) && (!q || el.dataset.text.includes(q));
        el.hidden = !ok;
        if (ok) shown++;
      });
      $(empty).hidden = shown > 0;
    };
    run('.member', 'all', '#member-empty');
    run('.album', state.album, '#album-empty', state.year);
    run('.shot', state.gallery, '#gallery-empty');
    run('.video', state.video, '#video-empty');
  }

  if (home) {
    inputs.forEach((inp) => {
      inp.addEventListener('input', () => {
        state.q = inp.value;
        inputs.forEach((o) => { if (o !== inp) o.value = inp.value; });
        apply();
      });
      inp.form.addEventListener('submit', (e) => { e.preventDefault(); location.hash = '#music'; });
    });
    const initial = new URLSearchParams(location.search).get('q');
    if (initial) { state.q = initial; inputs.forEach((i) => (i.value = initial)); apply(); }

    const chipGroup = (sel, key) => {
      const g = $(sel);
      g.addEventListener('click', (e) => {
        const b = e.target.closest('.chip');
        if (!b) return;
        state[key] = b.dataset.type;
        $$('.chip', g).forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
        apply();
      });
    };
    chipGroup('#music-filters', 'album');
    const yearSel = $('#album-year');
    if (yearSel) yearSel.addEventListener('change', () => { state.year = yearSel.value; apply(); });
    chipGroup('#video-filters', 'video');
    chipGroup('#gallery-filters', 'gallery');

    /* Highlight the nav link for the section in view */
    const links = $$('nav[aria-label="Primary"] .nav-link');
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((l) => {
        const h = l.getAttribute('href');
        l.setAttribute('aria-current', String(h === '/#' + en.target.id || (h === '/' && en.target.id === 'home')));
      });
    }), { rootMargin: '-40% 0px -55% 0px' });
    $$('section[id]').forEach((s) => io.observe(s));
  }

  /* ---------- Debut-day counter (13 June 2013, UTC) ---------- */
  const dd = $('#debut-days');
  if (dd) dd.textContent = 'D+' + (Math.floor((Date.now() - Date.UTC(2013, 5, 13)) / 86400000) + 1).toLocaleString('en-US');

  /* ---------- Member profiles (native <dialog>): card click, #m-<id> deep links, previous / next ---------- */
  const mdlgs = $$('dialog.mdlg');
  if (mdlgs.length) {
    const lock = (on) => { document.body.style.overflow = on ? 'hidden' : ''; };
    const openM = (id, opener) => {
      const d = document.getElementById(id);
      if (!d || !d.matches('dialog.mdlg')) return;
      $$('dialog.mdlg[open]').forEach((o) => { if (o !== d) o.close(); });
      if (opener) d._opener = opener;
      if (!d.open) d.showModal();
      lock(true);
      try { history.replaceState(null, '', '#' + id); } catch (e) { /* ignore */ }
    };
    mdlgs.forEach((d) => {
      d.addEventListener('click', (e) => { if (e.target === d) d.close(); });          // click on the dim backdrop
      $('[data-close]', d).addEventListener('click', () => d.close());
      $$('[data-go]', d).forEach((b) => b.addEventListener('click', () => openM(b.dataset.go, d._opener)));
      d.addEventListener('close', () => {
        if (!$('dialog.mdlg[open]')) {
          lock(false);
          try { if (/^#m-/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search + '#members'); } catch (e) { /* ignore */ }
          if (d._opener) d._opener.focus();
        }
      });
    });
    $$('[data-open]').forEach((b) => b.addEventListener('click', () => openM(b.dataset.open, b)));
    const fromHash = () => { if (/^#m-/.test(location.hash)) openM(location.hash.slice(1)); };
    addEventListener('hashchange', fromHash);
    fromHash();
  }

  /* ---------- Lightbox ---------- */
  const dlg = $('#lightbox');
  if (dlg) {
    const img = $('#lb-img'), cap = $('#lb-caption'), count = $('#lb-count');
    let list = [], pos = 0, opener = null;
    const show = () => {
      const b = list[pos];
      img.src = b.dataset.full; img.alt = b.dataset.caption; cap.textContent = b.dataset.caption;
      count.textContent = `${pos + 1} / ${list.length}`;
    };
    const step = (d) => { pos = (pos + d + list.length) % list.length; show(); };
    $('#gallery-grid').addEventListener('click', (e) => {
      const b = e.target.closest('.shot');
      if (!b) return;
      list = $$('.shot').filter((x) => !x.hidden);
      pos = Math.max(0, list.indexOf(b)); opener = b;
      show(); dlg.showModal(); document.body.style.overflow = 'hidden';
    });
    dlg.addEventListener('close', () => { document.body.style.overflow = ''; if (opener) opener.focus(); });
    dlg.addEventListener('click', (e) => { if (e.target === dlg || /lb-(stage|inner)/.test(e.target.className)) dlg.close(); });
    dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
    $('#lb-close').addEventListener('click', () => dlg.close());
    $('#lb-prev').addEventListener('click', () => step(-1));
    $('#lb-next').addEventListener('click', () => step(1));
  }

  /* ---------- Click-to-play videos: nothing loads from YouTube until asked ---------- */
  const vg = $('#video-grid');
  if (vg) vg.addEventListener('click', (e) => {
    const b = e.target.closest('[data-embed]');
    if (!b) return;
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(b.dataset.embed)}?autoplay=1&rel=0`;
    f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.title = b.getAttribute('aria-label') || 'Video player';
    const box = document.createElement('div');
    box.className = 'thumb';
    box.appendChild(f);
    b.replaceWith(box);
  });

  /* ---------- Hero stars: a few twinkling points over the galaxy ---------- */
  const canvas = $('#lightsea');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w, h, stars = [], raf = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(110, Math.round((w * h) / 9000));
      stars = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, r: 0.5 + Math.random() * 1.3, p: Math.random() * 6.28, s: 0.4 + Math.random() * 1.2, big: Math.random() < 0.08 }));
    };
    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (const d of stars) {
        const a = reduce ? 0.6 : 0.25 + 0.65 * (0.5 + 0.5 * Math.sin((t / 1000) * d.s + d.p));
        ctx.fillStyle = `rgba(245,243,255,${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283); ctx.fill();
        if (d.big) {                                   // a soft lavender glow on a few brighter stars
          const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 7);
          g.addColorStop(0, `rgba(196,181,253,${(a * 0.5).toFixed(3)})`); g.addColorStop(1, 'rgba(196,181,253,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 7, 0, 6.283); ctx.fill();
        }
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    resize(); draw(0);
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (reduce) draw(0); }, 150); });
    // Stop drawing while the hero is off screen.
    if (!reduce && 'IntersectionObserver' in window) new IntersectionObserver(([en]) => { cancelAnimationFrame(raf); if (en.isIntersecting) raf = requestAnimationFrame(draw); }).observe(canvas);
  }

  /* ---------- Light / dark theme toggle ---------- */
  const root = document.documentElement;
  const themeBtn = $('#theme-btn');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const setTheme = (t, save) => {
    root.setAttribute('data-theme', t);
    if (metaTheme) metaTheme.setAttribute('content', t === 'light' ? '#f7f5fc' : '#0b0714');
    if (themeBtn) themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    if (save) { try { localStorage.setItem('armyhub.theme', t); } catch (e) { /* storage blocked */ } }
  };
  if (themeBtn) {
    setTheme(root.getAttribute('data-theme') || 'dark', false);
    themeBtn.addEventListener('click', () => setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true));
  }
  if (window.matchMedia) matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    let saved = null; try { saved = localStorage.getItem('armyhub.theme'); } catch (err) { /* ignore */ }
    if (!saved) setTheme(e.matches ? 'light' : 'dark', false);          // follow the device until the visitor chooses
  });

  /* ---------- Images: fade in when loaded; on error try data-fallback="url1 url2", then a neutral placeholder ---------- */
  const PLACEHOLDER = '/img/placeholder.svg';
  $$('img').forEach((img) => {
    const list = (img.dataset.fallback || '').split(' ').filter(Boolean);
    const loaded = () => img.classList.add('is-loaded');
    const fail = () => {
      const n = list.shift();
      if (n) { img.src = n; return; }
      if (!img.src.endsWith(PLACEHOLDER)) { img.removeAttribute('srcset'); img.src = PLACEHOLDER; } else loaded();
    };
    img.addEventListener('load', loaded);
    img.addEventListener('error', fail);
    if (img.complete) { if (img.naturalWidth === 0) fail(); else loaded(); }
  });

  /* ---------- Animated preview players (home banner and latest release). Only one plays at a time. ---------- */
  const players = [];
  $$('.preview').forEach((pv) => {
    const id = pv.dataset.yt, start = +pv.dataset.start || 0, secs = +pv.dataset.seconds || 50;
    const frame = $('.preview-frame', pv), btn = $('.pv-play', pv), txt = $('.pv-play-text', pv), fill = $('.pv-fill', pv), time = $('.pv-time', pv);
    const fmt = (n) => Math.floor(Math.max(0, n) / 60) + ':' + String(Math.max(0, n) % 60).padStart(2, '0');
    let timer = null, tick = null, iframe = null, stopBtn = null;
    const stop = () => {
      clearTimeout(timer); clearInterval(tick);
      if (iframe) iframe.remove();
      if (stopBtn) stopBtn.remove();
      iframe = stopBtn = null;
      pv.classList.remove('playing'); fill.classList.remove('run');
      time.textContent = fmt(secs); btn.hidden = false; txt.textContent = `Replay ${secs}s preview`;
    };
    players.push(stop);
    btn.addEventListener('click', () => {
      players.forEach((p) => { if (p !== stop) p(); });
      btn.hidden = true;
      iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&start=${start}&end=${start + secs}&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0`;
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.title = 'Preview of the official music video';
      frame.appendChild(iframe);
      stopBtn = document.createElement('button');
      stopBtn.type = 'button'; stopBtn.className = 'pv-stop'; stopBtn.textContent = 'Stop';
      stopBtn.addEventListener('click', stop);
      frame.appendChild(stopBtn);
      pv.classList.add('playing');
      void fill.offsetWidth; fill.classList.add('run');                 // restart the progress bar
      let left = secs; time.textContent = fmt(left);
      tick = setInterval(() => { left--; time.textContent = fmt(left); }, 1000);
      timer = setTimeout(stop, secs * 1000 + 800);                      // YouTube stops at `end`; this restores the poster
    });
  });
})();