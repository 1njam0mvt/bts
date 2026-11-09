/* Home hero: ASCII Jungkook video behind the banner. It starts by itself (autoplay, muted, loop).
   JS only adds good manners: pause when off-screen / tab hidden, skip the download on Data Saver or tiny screens,
   respect the site's own "reduce motion" switch (/me), and give a Pause button.
   Debug: in DevTools run  document.querySelector('.hero-ascii').dataset.state  */
(() => {
    'use strict';
    const v = document.querySelector('.hero-ascii');
    if (!v) return;
    const btn = document.querySelector('.hero-ascii-toggle');
    const state = (s) => { v.dataset.state = s; };
    const c = navigator.connection || {};
    const siteCalm = document.documentElement.dataset.reduceMotion === 'true';

    const still = (why) => { v.pause(); v.removeAttribute('src'); v.load(); state('still: ' + why); };
    if (c.saveData) return still('Data Saver is on');
    if (window.innerWidth < 480) return still('small screen');
    if (siteCalm) return still('"Reduce motion" is on in /me');

    let visible = true, userPaused = false;
    const sync = () => {
        if (userPaused || !visible || document.hidden) { v.pause(); return; }
        const p = v.play();
        if (p && p.catch) p.catch((e) => state('blocked: ' + (e && e.name)));
    };
    v.muted = true;                                           // required for autoplay in every browser
    v.addEventListener('playing', () => state('playing'));
    v.addEventListener('error', () => state('error: /video/hero-ascii.mp4 failed to load'));
    v.addEventListener('canplay', sync);
    // If a browser still refused to autoplay, the first touch/click/scroll starts it.
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((ev) => window.addEventListener(ev, () => { if (v.paused && !userPaused && visible) sync(); }, { once: true, passive: true }));

    if ('IntersectionObserver' in window) {
        new IntersectionObserver((e) => { visible = e[0].isIntersecting; sync(); }, { threshold: 0.05 }).observe(v.parentElement);
    }
    document.addEventListener('visibilitychange', sync);

    if (btn) {
        btn.hidden = false;
        btn.addEventListener('click', () => {
            userPaused = !userPaused;
            btn.setAttribute('aria-pressed', String(userPaused));
            btn.textContent = userPaused ? 'Play' : 'Pause';
            btn.setAttribute('aria-label', userPaused ? 'Play background animation' : 'Pause background animation');
            sync();
        });
    }
    sync();
})();