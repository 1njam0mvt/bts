/* Home hero: ASCII Jungkook video behind the banner.
   Loads only when it is welcome: no reduced-motion, no Data Saver, not a tiny screen. Pauses when scrolled away or the tab is hidden. */
(() => {
    'use strict';
    const v = document.querySelector('.hero-ascii');
    if (!v) return;
    const c = navigator.connection || {};
    const calm = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.dataset.reduceMotion === 'true';
    if (calm || c.saveData || /(^|-)2g$/.test(c.effectiveType || '') || window.innerWidth < 480) { v.remove(); return; }

    let visible = true, started = false;
    const sync = () => {
        if (!started) return;
        if (visible && !document.hidden) { const p = v.play(); if (p && p.catch) p.catch(() => { }); } else v.pause();
    };
    v.addEventListener('playing', () => v.classList.add('is-on'), { once: true });
    v.addEventListener('error', () => v.remove());
    const start = () => { v.src = v.dataset.src; v.muted = true; started = true; v.load(); sync(); };

    if ('IntersectionObserver' in window) {
        new IntersectionObserver((e) => { visible = e[0].isIntersecting; sync(); }, { threshold: 0.05 }).observe(v.parentElement);
    }
    document.addEventListener('visibilitychange', sync);
    // Wait until the page is idle so the video never competes with the first paint.
    (window.requestIdleCallback || ((f) => setTimeout(f, 800)))(start);
})();