# ARMY Hub

An unofficial BTS fan site with a real backend. Node.js + Express, server-rendered pages, Tailwind CSS (compiled), vanilla JS, and a password-protected admin panel for images and content. No database server needed.

## What is included

| Area | Details |
|---|---|
| Pages | Home (galaxy hero, latest release with 25-second preview, **Meet BTS** member profiles, discography with type and year filters, photo gallery with category filters and lightbox, **ARMY Memories** timeline, videos, fan letters, shop), **About**, FAQ, Contact, Terms of Use, Privacy Policy, 404 |
| Theme | Dark and light mode, toggle at the top right of every page. Remembers the choice, follows the device until you pick, no flash on load |
| Fan Letters | Visitors write, edit, rewrite and delete their own letters with a private edit code (no accounts). Every new or edited letter waits for your approval in `/admin` > Letters |
| Icons | `favicon.ico` (16/32/48), SVG, Apple touch icon, Android/PWA icons (including maskable) and `site.webmanifest`. Regenerate with `npm run icons` |
| Backend | Express server, JSON file storage, contact API, admin API |
| Admin panel | `/admin`: manage albums, gallery, videos, shop, FAQs, messages and settings. Upload images from your phone or computer |
| Images | Upload is validated, EXIF stripped (removes GPS data), resized and converted to WebP with a thumbnail. Starter images are included so nothing is blank |
| SEO | Server-rendered content, unique titles and descriptions, canonical URLs, Open Graph and Twitter cards, JSON-LD (WebSite, ItemList/MusicAlbum, FAQPage, ContactPage, BreadcrumbList), `sitemap.xml` with image entries, `robots.txt`, alt text and image dimensions on every image |
| Security | Strict Content-Security-Policy, rate limiting, honeypot and timing spam checks on the contact form, CSRF protection on the admin API, validated URLs and image paths, timing-safe password check |

## Run it locally

```bash
npm install
npm run build        # compiles Tailwind to public/css/site.css (already built)
npm start            # http://localhost:3000
```

In development the server prints a one-time admin password. To choose your own, copy `.env.example` to `.env` and set `ADMIN_PASSWORD`.

Open `http://localhost:3000/admin` and sign in with user `admin`.

## Images: what is included and how to change it

The photos you supplied are already in the site, in `public/img/fan/` (WebP, resized, with thumbnails):

| Image | Where it is used | File |
|---|---|---|
| Group photo on the lake | Hero, gallery (Concept) | `hero-group.webp` |
| Purple galaxy | Hero background | `galaxy.webp` |
| Chandelier hall group photo | Gallery (Concept), memories | `group-chandelier.webp` |
| Seven member portraits | Meet BTS cards and profiles, gallery (Members) | `member-rm.webp`, `member-jin.webp`, `member-suga.webp`, `member-jhope.webp`, `member-jimin.webp`, `member-v.webp`, `member-jungkook.webp` |
| 6 album covers (Proof, BE, Wings, Love Yourself: Tear, Map of the Soul: 7, Persona) | Albums, cover gallery | `album-*.webp` |
| Concert, group and group-hug photos | Gallery (Concert, Group) | `gallery-*.webp` |
| Link preview card | Shared links | `og.png` |

- **To swap a photo**, replace the file with a new WebP/JPG renamed to the same name (keep each `-thumb.webp` about 480 px wide). Member photos are not in the admin, they are the `member-*.webp` files.
- **Gallery** photos are managed in `/admin` > Gallery (upload, category, caption, credit).
- **Low resolution:** the album covers and the three concert/group photos were cut from screenshots, so they are small (about 240 to 300 px originally) and look soft when opened large. Upload sharper versions in `/admin` > Albums / Gallery when you have them.
- **Covers still missing** (ARIRANG, Normal, Hooligan, Swim, Butter, Dynamite, Love Yourself: Answer, Dark & Wild, 2 Cool 4 Skool) show generated placeholder art. On first start, a server with internet fetches them from Apple's public iTunes catalogue. Or run `/admin` > Albums > **Get missing covers**. Covers you already have are never overwritten unless you choose "Replace every cover".
- **Rights:** official photos and covers belong to HYBE/BIGHIT MUSIC, photographers and publishers. The site shows a credit line ("Supplied by the site owner") and a removal-request route. You are responsible for having the right to publish what you add. Respond quickly to takedown requests.
- Video thumbnails and the hero preview load from YouTube once online.

Uploads are validated, stripped of location data, resized and converted to WebP with a thumbnail.

## Members and memories

Edit `lib/members.js`: stage name, real name, role, birth date and place, a short bio and the solo releases for all seven members, plus the ARMY Memories timeline. Only add facts you can verify (the official site is `https://bts.ibighit.com/eng/`).

## Videos and the hero preview

- `/admin` > Videos: paste a YouTube link. The ID is extracted, the video plays on the site and the real thumbnail loads. Without a link, the card opens a YouTube search so it never dead-ends.
- Videos in the starter data were checked against YouTube to be uploads by the official channels (HYBE LABELS, BANGTANTV, Run BTS). "Hooligan" and "Body to Body" have no confirmed official link yet, so they open a YouTube search. Paste the exact link to turn them into playable cards.
- Hero preview: `/admin` > Settings. Set the YouTube link, the start second (the starter value 55 is a guess, so open the video and pick the chorus) and the title. It plays exactly 25 seconds and loads only after a click.

## Fan Letters

- Letters go live only after you approve them (`/admin` > Letters). A setting can publish immediately instead, but a wall with no review attracts spam.
- Links, emails and phone numbers are rejected. New letters are limited to 3 per hour per visitor, and 500 pending letters at most.
- The edit code is shown once and only its hash is stored, so you cannot recover it for a fan. They can still delete their letter by asking you through Contact.

## Connect Shopify

In `/admin` > **Settings**, set **Shopify store URL** (for example `https://my-shop.myshopify.com`). Then for each album set **Shopify product handle** (the end of the product URL, `/products/arirang` gives `arirang`) or paste a **Full Shopify link**. Shop collections use collection handles the same way. Until a store is set, buttons fall back to the streaming link or the Weverse Shop, so nothing dead-ends.

## Deploy

Needs Node 18+ and a **persistent disk** (for `data/` and `uploads/`). Free tiers that wipe the disk on restart will lose your uploads and messages.

1. Copy `.env.example` to `.env` and fill it in. `SITE_URL` (your real address) and `ADMIN_PASSWORD` are required in production.
2. Set `TRUST_PROXY=true` when behind Nginx, Cloudflare, Render or Railway.
3. Point `DATA_DIR` and `UPLOAD_DIR` at the persistent disk.
4. `npm install --omit=dev && npm start`. Keep it running with `pm2 start server.js --name armyhub` or your host's process manager.
5. Put HTTPS in front (Nginx + Let's Encrypt, Cloudflare, or your host's built-in TLS).

**Back up** `data/db.json` and the `uploads/` folder regularly. That is everything.

## SEO checklist after launch

- Set `SITE_URL`. Canonicals, sitemap and social cards depend on it.
- Add the site to Google Search Console and submit `https://your-site/sitemap.xml`.
- Keep image captions descriptive (they become the alt text). Image alt text comes from titles and captions.
- Test link previews with a sharing debugger. The default card is `public/img/seed/og.png` (1200x630); replace it with your own.
- Add your real contact email and operator name in Settings. They appear in Terms and Privacy.
- Open `/admin` > Albums and press **Get missing covers** if the covers did not import on first start.
- Read the pending letters in `/admin` > Letters regularly.

## Email notifications (optional)

Contact messages always appear in `/admin` > Messages. To also get them by email, set the `SMTP_*` and `CONTACT_TO` variables in `.env`.

## Editing the code

- Content and settings: `/admin`.
- Page markup: `views/` (`home.js`, `pages.js`, `layout.js`). Member and timeline text: `lib/members.js`.
- Styles: `src/input.css` (colour and font tokens at the top), then run `npm run build`.
- Behaviour: `public/js/app.js`.
- Starter content: `data/seed.json`. It is copied to `data/db.json` on first run. Delete `db.json` to reset.

## Legal pages

The Terms and Privacy pages are written to match what this site actually does (contact form, fan letters, Google Fonts, YouTube, outbound links, theme and letter code kept in local storage, no cookies or analytics). If you add analytics, ads, accounts or a payment flow, update the Privacy Policy. They are templates, not legal advice. Have a lawyer review them, especially if you sell merchandise.

## Fan-site rules of thumb

- Keep the "not affiliated" notice visible.
- Sell only licensed merchandise in your Shopify store.
- Respond quickly to removal requests (the Contact form has a topic for it).
