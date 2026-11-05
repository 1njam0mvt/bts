/* ARMY Hub: mounts the 3D circular carousel (public/js/carousel-core.js) on the home page.
   React is only downloaded when the section is about to scroll into view. */
(() => {
    'use strict';
    const root = document.querySelector('.bts-car');
    if (!root) return;
    const mount = root.querySelector('#bts-mount');
    const stage = root.querySelector('#bts-stage');
    const story = root.querySelector('#bts-story');
    const ALL = JSON.parse(root.dataset.items || '[]');
    const FALLBACK = '/img/placeholder.svg';
    const small = matchMedia('(max-width: 640px)');
    const state = { filter: 'all', autoplay: 'drift', direction: 'left', width: 0 };
    let items = [], active = 0, rootReact = null, loaded = false;

    const loadScript = (src) => new Promise((ok, fail) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => fail(new Error('Could not load ' + src)); document.head.appendChild(s); });
    // Phones get the 480 px copy; larger screens get the full-size file.
    const pick = (it) => (small.matches && it.srcSm ? it.srcSm : it.src);
    const probe = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(true); i.onerror = () => ok(false); i.src = src; });

    async function prepare() {
        const list = ALL.filter((it) => state.filter === 'all' || it.kind === state.filter);
        const out = await Promise.all(list.map(async (it) => {
            let src = pick(it);
            if (!(await probe(src))) { console.warn('Carousel image failed, using placeholder:', src); src = FALLBACK; }
            return { src, alt: it.alt, title: it.title, subtitle: it.subtitle, position: it.position, href: it.href, cta: it.cta };
        }));
        return out;
    }

    const cardWidth = () => { const w = stage.clientWidth; return w < 480 ? 190 : w < 820 ? 230 : 280; };

    function draw() {
        if (!rootReact || !items.length) return;
        const R = window.React;
        rootReact.render(R.createElement(window.CircularCarousel, {
            items, preset: 'cylinder', intro: 'rise', cardWidth: cardWidth(), aspectRatio: 1.25, gap: 24,
            autoplay: state.autoplay, direction: state.direction, speed: 12, captions: true, fadeColor: '#0f0820', cornerRadius: 14, innerShade: 0.6,
            onChange: (i) => { active = i; paintStory(); },
            onItemClick: (it, i) => { if (i === active && it && it.href) location.hash = it.href; }
        }));
    }

    function paintStory() {
        const it = items[active];
        story.textContent = '';
        if (it && it.href) {
            const a = document.createElement('a'); a.href = it.href; a.textContent = it.cta || 'Read their story';
            story.append(a);
        } else if (it) { story.textContent = it.alt; }
    }

    const keyOnRing = (key) => { const el = mount.querySelector('.circular-carousel'); if (!el) return; el.focus({ preventScroll: true }); el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })); };

    async function start() {
        if (loaded) return; loaded = true;
        try {
            await loadScript(root.dataset.react); await loadScript(root.dataset.reactDom); await loadScript(root.dataset.core);
            items = await prepare();
            rootReact = window.ReactDOM.createRoot(mount);
            draw(); paintStory();
            root.classList.remove('no-react');
        } catch (e) { console.error(e); root.classList.add('no-react'); mount.hidden = true; }
    }

    /* controls */
    root.querySelector('[data-car="prev"]').addEventListener('click', () => keyOnRing('ArrowLeft'));
    root.querySelector('[data-car="next"]').addEventListener('click', () => keyOnRing('ArrowRight'));
    const play = root.querySelector('[data-car="play"]');
    play.addEventListener('click', () => {
        state.autoplay = state.autoplay === 'off' ? 'drift' : 'off';
        play.setAttribute('aria-pressed', String(state.autoplay === 'off')); play.textContent = state.autoplay === 'off' ? 'Play' : 'Pause'; draw();
    });
    const dir = root.querySelector('[data-car="dir"]');
    dir.addEventListener('click', () => { state.direction = state.direction === 'left' ? 'right' : 'left'; dir.textContent = state.direction === 'left' ? 'Direction: left' : 'Direction: right'; draw(); });
    root.querySelectorAll('[data-car-filter]').forEach((b) => b.addEventListener('click', async () => {
        state.filter = b.dataset.carFilter; active = 0;
        root.querySelectorAll('[data-car-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        if (!loaded) return;
        items = await prepare(); draw(); paintStory();
    }));

    /* responsive: redraw when the card size or the phone/desktop image set changes */
    let lastSmall = small.matches, t = 0;
    new ResizeObserver(() => {
        clearTimeout(t); t = setTimeout(async () => {
            if (!loaded || !rootReact) return;
            if (small.matches !== lastSmall) { lastSmall = small.matches; items = await prepare(); }
            draw();
        }, 150);
    }).observe(stage);

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '500px 0px' });
        io.observe(root);
    } else start();
})();