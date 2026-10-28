'use strict';
/* About, FAQ, Contact, Terms, Privacy, 404 and the admin shell. */
const { esc } = require('../lib/util');

const crumbs = (ctx, name, path) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: ctx.base + '/' },
    { '@type': 'ListItem', position: 2, name, item: ctx.base + path }
  ]
});

const hero = (eyebrow, title, lead) => `
<section class="page-hero"><div class="wrap"><div class="py-14 md:py-20 max-w-3xl">
  <p class="label" style="color:var(--neon)">${eyebrow}</p>
  <h1 class="display mt-3" style="font-size:clamp(2rem,6vw,3.4rem);font-weight:900;line-height:1.05">${title}</h1>
  ${lead ? `<p class="mt-5 text-lg" style="color:var(--muted)">${lead}</p>` : ''}
</div></div></section>`;

/* ---------- About ---------- */
function about(ctx, db) {
  const body = `${hero('About', 'About ARMY Hub', 'A fan-made corner of the internet for people who love BTS and each other.')}
<section class="section" style="border-top:1px solid var(--line)"><div class="wrap">
  <div class="grid md:grid-cols-2 gap-10 lg:gap-16">
    <div class="prose-legal">
      <h2>What this site is</h2>
      <p>ARMY Hub is an unofficial fan project. It brings the seven members, the albums, the photo gallery, official videos and a wall of fan letters into one place, so fans can browse and search everything without hopping between apps.</p>
      <p>It is run by fans, for fans. It is <strong>not</strong> affiliated with, endorsed by or connected to BTS, BIGHIT MUSIC or HYBE.</p>
      <h2>What you can do here</h2>
      <ul>
        <li><a class="link" href="/#members">Meet the members</a> and read about their solo music.</li>
        <li><a class="link" href="/#music">Browse the albums</a> by type or year, and open them in the store or on a streaming service.</li>
        <li><a class="link" href="/#gallery">Look through the gallery</a> and open any photo full size.</li>
        <li><a class="link" href="/#videos">Watch official videos</a> and Run BTS episodes.</li>
        <li><a class="link" href="/#letters">Write a fan letter</a>. You can edit or delete it later with your private code.</li>
      </ul>
    </div>
    <div class="prose-legal">
      <h2>About BTS and ARMY</h2>
      <p>BTS (Bangtan Sonyeondan) is a seven-member South Korean group formed by Big Hit Entertainment, now part of HYBE. They debuted on 13 June 2013. Their fans are called ARMY.</p>
      <p>The members are RM, Jin, SUGA, j-hope, Jimin, V and Jung Kook.</p>
      <h2>Pictures and rights</h2>
      <p>Photographs and album artwork on this site belong to their owners (the artists, their label, photographers and publishers). They are shown here by the site owner for fan, non-commercial purposes, with the credit line shown in the gallery. If you own something shown here and want it credited differently or taken down, please <a class="link" href="/contact">tell us</a> and we will act quickly.</p>
      <p>Member profiles use widely published facts. For anything official, please use the <a class="link" href="https://bts.ibighit.com/eng/" target="_blank" rel="noopener noreferrer">official BTS website</a>.</p>
    </div>
  </div>
  <div class="mt-10 flex flex-wrap gap-3"><a class="btn btn-primary" href="/#members">Explore BTS</a><a class="btn btn-ghost" href="/contact">Contact us</a><a class="btn btn-ghost" href="/faq">Read the FAQ</a></div>
</div></section>`;
  return {
    title: 'About ARMY Hub: An Unofficial BTS Fan Site',
    description: 'ARMY Hub is a fan-made BTS site with member profiles, albums, a photo gallery, videos and fan letters. It is not affiliated with BTS or BIGHIT MUSIC.',
    path: '/about', body,
    jsonld: [crumbs(ctx, 'About', '/about')]
  };
}

/* ---------- FAQ ---------- */
function faq(ctx, db) {
  const paras = (t) => String(t).split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join('');
  const body = `${hero('Help', 'Frequently asked questions', 'Quick answers about the site, the shop and how to reach us.')}
<section class="section" style="border-top:1px solid var(--line)"><div class="wrap"><div class="max-w-3xl">
  <div class="faq">${db.faqs.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><div class="faq-a">${paras(f.a)}</div></details>`).join('')}</div>
  <div class="mt-10 shop-card"><h2 class="display text-xl font-bold">Still have a question?</h2><p style="color:var(--muted)">Send us a message and we will get back to you.</p><a class="btn btn-primary btn-sm mt-2 w-max" href="/contact">Contact us</a></div>
</div></div></section>`;
  return {
    title: 'FAQ: Questions About ARMY Hub and the Shop',
    description: 'Answers to common questions about ARMY Hub, the BTS fan site: whether it is official, where to buy albums and merch, how to send fan art and how to request a removal.',
    path: '/faq', body,
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: db.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
      crumbs(ctx, 'FAQ', '/faq')
    ]
  };
}

/* ---------- Contact ---------- */
function contact(ctx, db) {
  const s = db.s || db.settings;
  const mail = s.contactEmail ? `<p class="mt-6 text-sm" style="color:var(--muted)">You can also write to <strong style="color:var(--fg)">${esc(s.contactEmail)}</strong>.</p>` : '';
  const body = `${hero('Contact', 'Get in touch', 'Send us fan art, a correction, a removal request or a question. We read every message.')}
<section class="section" style="border-top:1px solid var(--line)"><div class="wrap"><div class="grid lg:grid-cols-[1.2fr_.8fr] gap-12">
  <form id="contact-form" class="grid gap-5 min-w-0" novalidate>
    <div class="field"><label for="c-name">Your name</label><input id="c-name" name="name" type="text" autocomplete="name" required maxlength="80"></div>
    <div class="field"><label for="c-email">Email address</label><input id="c-email" name="email" type="email" autocomplete="email" required maxlength="120"></div>
    <div class="field"><label for="c-subject">Topic</label>
      <select id="c-subject" name="subject">
        <option>General question</option><option>Fan art or photo submission</option><option>Report a broken link or mistake</option><option>Content removal request</option><option>Shop or order question</option>
      </select></div>
    <div class="field"><label for="c-message">Message</label><textarea id="c-message" name="message" rows="7" required minlength="10" maxlength="3000"></textarea><span class="hint"><span id="c-count">0</span> / 3000</span></div>
    <div class="hp" aria-hidden="true"><label for="c-website">Leave this field empty</label><input id="c-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
    <div class="flex flex-wrap items-center gap-4">
      <button class="btn btn-primary" type="submit" id="c-send">Send message</button>
      <p id="c-status" class="status" role="status" aria-live="polite" hidden></p>
    </div>
    <p class="text-sm" style="color:var(--muted)">By sending this form you agree to our <a class="link" href="/privacy">Privacy Policy</a>. If you are under 18, please ask a parent or guardian to send it for you.</p>
    <noscript><p class="status err">This form needs JavaScript. ${s.contactEmail ? `Please email ${esc(s.contactEmail)} instead.` : 'Please enable JavaScript to send a message.'}</p></noscript>
  </form>
  <aside class="min-w-0"><div class="shop-card">
    <h2 class="display text-xl font-bold">Before you write</h2>
    <ul class="grid gap-3 text-sm" style="color:var(--muted)">
      <li>Check the <a class="link" href="/faq">FAQ</a>. Most questions are answered there.</li>
      <li>We cannot answer questions about BTS themselves or pass messages to them. This is a fan site.</li>
      <li>For removals, include the page address and what should be taken down.</li>
    </ul>${mail}
  </div></aside>
</div></div></section>`;
  return {
    title: 'Contact ARMY Hub: Send Fan Art, Corrections or Questions',
    description: 'Contact the ARMY Hub team. Send fan art, report a broken link, ask a question about the shop or request content removal.',
    path: '/contact', body, scripts: ['/js/contact.js'],
    jsonld: [{ '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Contact ARMY Hub', url: ctx.base + '/contact' }, crumbs(ctx, 'Contact', '/contact')]
  };
}

/* ---------- Legal ---------- */
const longDate = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const who = (s) => esc(s.operatorName || 'the operator of this site');
const reach = (s) => (s.contactEmail ? `by email at <strong>${esc(s.contactEmail)}</strong> or through the <a class="link" href="/contact">contact form</a>` : 'through the <a class="link" href="/contact">contact form</a>');

function terms(ctx, db) {
  const s = db.settings;
  const body = `${hero('Legal', 'Terms of Use', `Last updated ${longDate(s.legalUpdated)}`)}
<section class="section" style="border-top:1px solid var(--line)"><div class="wrap"><article class="prose-legal">
<h2>1. About this site</h2>
<p>${esc(s.siteName)} (the "Site") is an unofficial, non-commercial fan project run by ${who(s)}. By using the Site you agree to these terms. If you do not agree, please do not use it.</p>

<h2>2. No affiliation</h2>
<p>The Site is not affiliated with, endorsed by, sponsored by or connected to BigHit Music, HYBE or BTS. "BTS", "ARMY", member names, album titles, logos and related marks belong to their respective owners. They appear here only to identify the artists and their works, for fan commentary and information.</p>

<h2>3. Content and copyright</h2>
<ul>
<li>Music, album artwork, videos and photographs of the artists belong to their copyright holders. Links to music and videos lead to the official or licensed services that host them.</li>
<li>Images that the Site operator uploads must be owned by the operator or used with permission. Placeholder artwork on the Site is original and is not an official image.</li>
<li>The design, code and original text of the Site belong to ${who(s)}. You may share links to the Site freely. Please do not copy it as a whole without asking.</li>
</ul>

<h2>4. Removal requests</h2>
<p>If you own content shown on the Site and want it removed or credited differently, contact us ${reach(s)} with the page address and a short description. We will review it promptly and remove content where the request is valid.</p>

<h2>5. Submissions and fan letters</h2>
<p>If you send us fan art, photos or other material through the contact form, you confirm that you created it or have permission to share it. We will not publish it without your agreement, and you can ask us to remove it later.</p>
<p>Fan letters are public once approved. By sending a letter you confirm that you wrote it, and you give ${who(s)} permission to display it on the Site, unchanged apart from fixing obvious formatting, for as long as it stays published. You keep ownership of your words. A person reads every new or edited letter before it appears. We may refuse or remove any letter, in particular one that contains web links, personal details (yours or anyone else's), hate, harassment, sexual content, threats, spam or claims about real people that are untrue or hurtful. You can edit or delete your letter at any time with the private edit code shown after you send it. Keep that code safe: anyone who has it can change or delete the letter, and we cannot recover it for you. Do not write anything you would not be happy to see published under your nickname.</p>

<h2>6. Acceptable use</h2>
<p>Do not use the Site to break the law, send spam or harassing messages through the contact form, try to gain access to parts of the Site that are not public, or disrupt how the Site works. We may block access for abuse.</p>

<h2>7. Shop, links and third parties</h2>
<p>The Site links to other websites, including streaming services, YouTube and online stores. We do not control those sites and are not responsible for their content or policies. Purchases are made on the store you are sent to, under that store's terms, prices, shipping and return policy. Some links may be affiliate or store links; the Site operator may earn a commission or revenue from purchases. Always check that a seller is licensed before you buy.</p>

<h2>8. Accuracy</h2>
<p>We try to keep release information, dates and links correct, but we cannot promise they are complete or current. Tell us if you notice a mistake.</p>

<h2>9. No warranty and limit of liability</h2>
<p>The Site is provided "as is" and "as available", without warranties of any kind. To the extent the law allows, ${who(s)} is not liable for any loss or damage arising from your use of the Site or from third-party sites you reach through it. Nothing in these terms limits rights you have under consumer law that cannot be excluded.</p>

<h2>10. Changes</h2>
<p>We may update these terms from time to time. The date at the top shows the latest version. Continued use of the Site after a change means you accept the updated terms.</p>

<h2>11. Governing law</h2>
<p>These terms are governed by the laws of ${esc(s.jurisdiction || 'India')}, and courts there have jurisdiction over disputes, without affecting any mandatory rights you have where you live.</p>

<h2>12. Contact</h2>
<p>Questions about these terms? Reach us ${reach(s)}. See also our <a class="link" href="/privacy">Privacy Policy</a>.</p>
</article></div></section>`;
  return {
    title: 'Terms of Use | ARMY Hub',
    description: 'Terms of Use for ARMY Hub, an unofficial BTS fan site: no affiliation, content and copyright, removal requests, shop links and liability.',
    path: '/terms', body, jsonld: [crumbs(ctx, 'Terms of Use', '/terms')]
  };
}

function privacy(ctx, db) {
  const s = db.settings;
  const body = `${hero('Legal', 'Privacy Policy', `Last updated ${longDate(s.legalUpdated)}`)}
<section class="section" style="border-top:1px solid var(--line)"><div class="wrap"><article class="prose-legal">
<p>This policy explains what personal information ${esc(s.siteName)} collects, why, and what you can do about it. The Site is run by ${who(s)}.</p>

<h2>1. What we collect</h2>
<ul>
<li><strong>Contact form.</strong> Your name, email address, the topic you choose and your message. We collect this only when you send the form.</li>
<li><strong>Fan letters.</strong> The nickname, optional country and letter text you write, the member you address, the date, and a random edit code (we keep only a scrambled "hash" of it, never the code itself). Approved letters are shown publicly on the home page with your nickname and country. We do not ask for your email or real name. Please do not put personal details in a letter.</li>
<li><strong>Technical data.</strong> When you load a page, our web server and hosting provider process your IP address and browser details to deliver the page and keep the Site secure. We also use your IP address in memory to limit repeated form submissions. We do not save it with your message.</li>
</ul>
<p>We do not ask you to create an account, and the Site does not use advertising or analytics trackers. The Site does not set cookies. It saves two things in your browser's local storage, on your own device: your light or dark mode choice, and, if you write a letter, that letter's edit code so you can edit it later. Neither is used to track you, and clearing your browser data removes them.</p>

<h2>2. Why we use it</h2>
<ul>
<li>To read and reply to your message, handle removal requests and publish fan submissions you agree to share.</li>
<li>To review, publish, edit and remove fan letters.</li>
<li>To keep the Site working and protect it from spam and abuse.</li>
</ul>

<h2>3. Third-party services</h2>
<p>Some features load content from other companies. When that happens, your browser connects to them directly and they may receive your IP address and device details.</p>
<ul>
<li><strong>Google Fonts</strong> supplies the typefaces used on every page.</li>
<li><strong>YouTube.</strong> Video previews may be loaded from YouTube's image servers. Video players, including the 25-second preview in the home banner, are loaded only after you click play, using YouTube's privacy-enhanced mode.</li>
<li><strong>Streaming services and stores</strong> (for example Spotify, Weverse Shop and Shopify stores). When you click an outbound link you leave this Site, and that service's own privacy policy applies.</li>
</ul>

<h2>4. How long we keep it</h2>
<p>We keep contact messages only as long as needed to respond and to deal with any follow-up, and delete them normally within 12 months. Removal requests may be kept longer so we can show that a request was handled.</p>
<p>Published letters stay on the Site until you or we delete them. You can delete yours at any time with its edit code, or ask us to through the contact form. We remove letters we decide not to publish.</p>

<h2>5. Sharing</h2>
<p>We do not sell your information. We share it only with service providers that host or run the Site and its email, or where the law requires it.</p>

<h2>6. Security</h2>
<p>Messages are stored on the server behind a password-protected admin area. No system is perfectly secure, so please do not send sensitive personal information through the form.</p>

<h2>7. Your choices and rights</h2>
<p>Depending on where you live, you may have the right to ask what we hold about you, to correct it, to have it deleted, or to withdraw consent. Contact us ${reach(s)} and we will respond within a reasonable time. If you are not satisfied, you can complain to the data protection authority where you live.</p>

<h2>8. Children</h2>
<p>The Site is a fan page and many fans are young. We do not knowingly collect personal information from children under 13, or under the age set by your local law. If you are under 18, please ask a parent or guardian to send a message for you. If you think a child has sent us personal information, tell us and we will delete it.</p>

<h2>9. International use</h2>
<p>The Site may be hosted outside the country where you live. By sending the form you understand that your message may be processed where our hosting provider operates.</p>

<h2>10. Changes</h2>
<p>We will update this page when our practices change. The date at the top shows the latest version.</p>

<h2>11. Contact</h2>
<p>Privacy questions? Reach us ${reach(s)}. See also our <a class="link" href="/terms">Terms of Use</a>.</p>
</article></div></section>`;
  return {
    title: 'Privacy Policy | ARMY Hub',
    description: 'How ARMY Hub handles personal information: what the contact form collects, third-party services such as Google Fonts and YouTube, retention and your rights.',
    path: '/privacy', body, jsonld: [crumbs(ctx, 'Privacy Policy', '/privacy')]
  };
}

/* ---------- 404 ---------- */
function notFound() {
  return {
    title: 'Page not found | ARMY Hub', description: 'This page does not exist.', path: '/404', noindex: true,
    body: `${hero('Error 404', 'We could not find that page', 'The link may be old or mistyped.')}
<section class="section" style="border-top:1px solid var(--line)"><div class="wrap flex flex-wrap gap-3"><a class="btn btn-primary" href="/">Back to home</a><a class="btn btn-ghost" href="/faq">Read the FAQ</a><a class="btn btn-ghost" href="/contact">Contact us</a></div></section>`
  };
}

/* ---------- Admin shell (the UI lives in public/js/admin.js) ---------- */
function adminShell(asset) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Admin | ARMY Hub</title><meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#0b0714"><script src="${asset('/js/theme.js')}"></script><link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;700&family=Unbounded:wght@500;700;900&display=swap">
<link rel="stylesheet" href="${asset('/css/site.css')}"></head>
<body><div class="wrap py-8"><div id="admin"><p style="color:var(--muted)">Loading admin&hellip;</p></div></div>
<script src="${asset('/js/admin.js')}" defer></script></body></html>`;
}

module.exports = { about, faq, contact, terms, privacy, notFound, adminShell };
