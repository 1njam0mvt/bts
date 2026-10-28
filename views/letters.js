'use strict';
/* Fan Letters: the public wall (server-rendered, approved letters only) and the writing form. */
const { esc } = require('../lib/util');

const TO = ['BTS', 'RM', 'Jin', 'SUGA', 'j-hope', 'Jimin', 'V', 'Jung Kook', 'ARMY'];
const PAGE = 12;

const fmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

function letterCard(l) {
  return `
<article class="letter">
  <p class="letter-to">Dear ${esc(l.to)},</p>
  <p class="letter-body">${esc(l.message)}</p>
  <p class="letter-from"><span>With love, ${esc(l.nickname)}${l.country ? ` &middot; ${esc(l.country)}` : ''}</span><time datetime="${esc(l.createdAt.slice(0, 10))}">${esc(fmt(l.createdAt))}</time></p>
</article>`;
}

const approved = (db) => db.letters.filter((l) => l.status === 'approved').sort((a, b) => b.createdAt.localeCompare(a.createdAt));

function more(db, offset) {
  const list = approved(db);
  return { html: list.slice(offset, offset + PAGE).map(letterCard).join(''), next: offset + PAGE < list.length ? offset + PAGE : null };
}

function section(db) {
  const list = approved(db);
  const first = list.slice(0, PAGE);
  return `
<section id="letters" class="section"><div class="wrap">
  <div class="section-head">
    <div><p class="label" style="color:var(--violet-hi)">Fan Letters</p><h2 class="section-title mt-2">Letters to BTS &amp; ARMY</h2></div>
    <p class="text-sm max-w-sm" style="color:var(--muted)">Write to the members or to fellow ARMY. A person reads every letter before it appears. You can edit or delete yours any time.</p>
  </div>
  <div class="grid lg:grid-cols-[.9fr_1.1fr] gap-10 items-start">
    <div class="grid gap-6 min-w-0">
      <div class="adm-card" id="letter-card">
        <h3 class="display text-lg font-bold" id="letter-title">Write your letter</h3>
        <form id="letter-form" class="grid gap-4 mt-4" novalidate>
          <div class="grid sm:grid-cols-2 gap-4 items-start">
            <div class="field"><label for="l-nick">Nickname</label><input id="l-nick" name="nickname" type="text" maxlength="40" autocomplete="nickname" required><span class="hint" style="justify-self:start">Shown publicly. No real name needed.</span></div>
            <div class="field"><label for="l-country">Country (optional)</label><input id="l-country" name="country" type="text" maxlength="40" autocomplete="country-name"></div>
          </div>
          <div class="field"><label for="l-to">Dear&hellip;</label><select id="l-to" name="to">${TO.map((t) => `<option>${esc(t)}</option>`).join('')}</select></div>
          <div class="field"><label for="l-message">Your letter</label><textarea id="l-message" name="message" rows="8" minlength="20" maxlength="1200" required></textarea><span class="hint"><span id="l-count">0</span> / 1200</span></div>
          <div class="hp" aria-hidden="true"><label for="l-website">Leave this field empty</label><input id="l-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
          <div class="flex flex-wrap items-center gap-3">
            <button class="btn btn-primary btn-sm" type="submit" id="l-send">Send letter</button>
            <button class="btn btn-ghost btn-sm" type="button" id="l-cancel" hidden>Cancel editing</button>
          </div>
          <p id="l-status" class="status" role="status" aria-live="polite" hidden></p>
          <p class="text-xs" style="color:var(--muted)">No web links, emails or phone numbers please. By sending you agree to the <a class="link" href="/terms">Terms</a> and <a class="link" href="/privacy">Privacy Policy</a>. Under 18? Ask a parent or guardian first.</p>
        </form>
        <div id="l-done" hidden class="grid gap-3 mt-4">
          <p class="font-bold">Thank you. Your letter was sent.</p>
          <p class="text-sm" style="color:var(--muted)" id="l-done-text"></p>
          <p class="label" style="color:var(--violet-hi)">Your private edit code</p>
          <div class="code-box" id="l-code"></div>
          <div class="flex gap-2 flex-wrap"><button class="btn btn-ghost btn-sm" type="button" id="l-copy">Copy code</button><button class="btn btn-ghost btn-sm" type="button" id="l-another">Write another</button></div>
          <p class="text-xs" style="color:var(--muted)">Save this code. It lets you edit or delete this letter from any device. It is stored hashed on our server, so we cannot recover it for you.</p>
        </div>
      </div>

      <div id="my-letters-box" hidden class="grid gap-3"><p class="label" style="color:var(--violet-hi)">My letters on this device</p><div id="my-letters" class="grid gap-3"></div></div>

      <details class="adm-card">
        <summary class="font-bold cursor-pointer">Edit a letter with a code</summary>
        <div class="grid gap-3 mt-4">
          <div class="field"><label for="l-lookup">Edit code</label><input id="l-lookup" type="text" maxlength="20" autocomplete="off" spellcheck="false"></div>
          <div class="flex gap-3 items-center flex-wrap"><button class="btn btn-ghost btn-sm" type="button" id="l-find">Find my letter</button><span id="l-find-status" class="text-sm" style="color:var(--muted)" role="status"></span></div>
        </div>
      </details>
    </div>

    <div class="min-w-0">
      <div id="letters-wall" class="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" data-next="${list.length > PAGE ? PAGE : ''}">${first.map(letterCard).join('')}</div>
      <div id="letters-empty" class="empty"${first.length ? ' hidden' : ''}>No letters yet. Be the first to write one.</div>
      <div class="mt-6 text-center"><button class="btn btn-ghost btn-sm" type="button" id="letters-more"${list.length > PAGE ? '' : ' hidden'}>Show more letters</button></div>
    </div>
  </div>
</div></section>`;
}

module.exports = { section, more, letterCard, TO, PAGE };
