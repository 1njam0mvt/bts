'use strict';
/* Guide pages for the main search topics: /what-is-bts-army, /bts-army-india, /bts-army-usa.
   Answer-first (AEO), dated and sourced (E-E-A-T), with Article + FAQPage + BreadcrumbList JSON-LD. */
const { esc } = require('../lib/util');
const seo = require('../lib/seo');

const crumbs = (ctx, name, path) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: ctx.base + '/' },
    { '@type': 'ListItem', position: 2, name, item: ctx.base + path }
  ]
});
const fmt = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Shared by the home page: a visible FAQ block whose JSON-LD is built from the very same list. */
function faqBlock(list) {
  return `<div class="faq">${list.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><div class="faq-a"><p>${esc(a)}</p></div></details>`).join('')}</div>`;
}
const faqLd = (list) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });

function guide(key) {
  const g = seo.PAGES[key];
  return (ctx, db) => {
    const s = db.settings;
    const others = Object.entries(seo.PAGES).filter(([k]) => k !== key);
    const body = `<section class="page-hero"><div class="wrap"><div class="py-14 md:py-20 max-w-3xl">
  <p class="label" style="color:var(--neon)">${esc(g.eyebrow)}</p>
  <h1 class="display mt-3" style="font-size:clamp(2rem,6vw,3.4rem);font-weight:900;line-height:1.05">${esc(g.h1)}</h1>
  <p class="mt-5 text-lg" style="color:var(--muted)">${esc(g.lead)}</p>
</div></div></section>
<section class="section" style="border-top:1px solid var(--line)"><div class="wrap"><div class="max-w-3xl">
  <div class="shop-card" id="short-answer"><p class="label" style="color:var(--violet-hi)">Short answer</p><p class="mt-2 text-lg">${esc(g.answer)}</p></div>
  <article class="prose-legal mt-8">
    ${g.sections.map((x) => `<h2>${esc(x.h)}</h2>${x.p.map((p) => `<p>${p}</p>`).join('')}`).join('\n    ')}
    <h2>Frequently asked questions</h2>
  </article>
  ${faqBlock(g.faq)}
  <div class="prose-legal mt-10">
    <h2>Sources</h2>
    <ul>${g.sources.map((x) => `<li><a class="link" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.title)}</a></li>`).join('')}</ul>
    <p>Last reviewed ${fmt(seo.REVIEWED)}. Spotted a mistake? <a class="link" href="/contact">Tell us</a> and we will correct it. ${esc(s.siteName)} is an unofficial fan project, not affiliated with BTS, BIGHIT MUSIC or HYBE.</p>
  </div>
  <nav class="mt-8 flex flex-wrap gap-3" aria-label="More guides">${others.map(([, o]) => `<a class="btn btn-ghost" href="${o.path}">${esc(o.short)}</a>`).join('')}<a class="btn btn-primary" href="/#members">Explore BTS</a></nav>
</div></div></section>`;
    const url = ctx.base + g.path;
    return {
      title: g.title, description: g.description, path: g.path, body,
      jsonld: [
        {
          '@context': 'https://schema.org', '@type': 'Article', headline: g.h1, description: g.description, url, mainEntityOfPage: url, inLanguage: 'en',
          datePublished: seo.REVIEWED, dateModified: seo.REVIEWED, about: { '@type': 'MusicGroup', name: 'BTS' }, keywords: seo.KEYWORDS.join(', '),
          author: { '@type': 'Organization', name: s.siteName, url: ctx.base + '/' }, publisher: { '@type': 'Organization', name: s.siteName, url: ctx.base + '/', logo: { '@type': 'ImageObject', url: ctx.base + '/icon-512.png', width: 512, height: 512 } },
          citation: g.sources.map((x) => x.url)
        },
        faqLd(g.faq),
        crumbs(ctx, g.short, g.path)
      ]
    };
  };
}

module.exports = { army: guide('army'), india: guide('india'), usa: guide('usa'), faqBlock, faqLd };
