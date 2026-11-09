/* Home hero: ASCII Jungkook video behind the banner.
   The poster (a still frame) always shows. The video itself only loads and plays when that is welcome:
   no reduced-motion, no Data Saver, not a tiny screen. It pauses when scrolled away or the tab is hidden.
   Debug: in DevTools run  document.querySelector('.hero-ascii').dataset.state  */
(() => {
    'use strict';
    const v = document.querySelector('.hero-ascii');
    if (!v) return;
    const state = (s) => { v.dataset.state = s; };
    v.classList.add('is-on');                       // the poster is visible right away

    const c = navigator.connection || {};
    const calm = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.dataset.reduceMotion === 'true';
    if (calm) return state('still: reduced motion is on (OS or /me setting)');
    if (c.saveData) return state('still: Data Saver is on');
    if (/(^|-)2g$/.test(c.effectiveType || '')) return state('still: slow connection');
    if (window.innerWidth < 480) return state('still: small screen');

    let visible = true, started = false;
    const sync = () => {
        if (!started) return;
        if (visible && !document.hidden) { const p = v.play(); if (p && p.catch) p.catch((e) => state('blocked: ' + (e && e.name))); } else v.pause();
    };
    v.addEventListener('playing', () => state('playing'));
    v.addEventListener('error', () => state('error: video file failed to load (check /video/hero-ascii.mp4)'));
    const start = () => { state('loading'); v.src = v.dataset.src; v.muted = true; started = true; v.load(); sync(); };

    if ('IntersectionObserver' in window) {
        new IntersectionObserver((e) => { visible = e[0].isIntersecting; sync(); }, { threshold: 0.05 }).observe(v.parentElement);
    }
    document.addEventListener('visibilitychange', sync);
    (window.requestIdleCallback || ((f) => setTimeout(f, 800)))(start);
})();