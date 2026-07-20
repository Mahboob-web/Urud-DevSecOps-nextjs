# Deploying Speak in Urdu to Hostinger

A complete, in-order walkthrough — from the project on your computer to the
live site on Hostinger, with bookings actually being saved somewhere. Follow
it top to bottom; don't skip ahead.

**Before you start, have ready:** your Hostinger login, and your domain
(`speakinurdu.com`) already added to your Hostinger hosting plan. Budget
about 30 minutes the first time.

---

## Step 1 — Build the site

This turns your project's source code into the small set of plain files a
web server can actually serve.

1. Open a terminal in the project folder.
2. Run:
   ```
   npm run build
   ```
3. This does four things automatically (you'll see each one print in the
   terminal): builds the app, builds a temporary server-only copy of it,
   uses that copy to pre-render every page (home, courses, pricing, each
   course, etc.) into its own real HTML file with the correct title and
   description already baked in, then deletes the temporary server-only
   copy again. This is what makes each page show up correctly in Google
   search results and when shared on social media, instead of every page
   looking identical to search engines. (The blog is different — see Step
   8a — its pages are generated live by PHP from the database on every
   visit, not baked in at build time, so new posts don't need a rebuild.)
4. When it finishes, you'll have a new folder called `dist/`. Everything
   inside `dist/` is your entire website — that's the only folder you
   upload. You never upload `src/`, `node_modules/`, or anything else.
   Besides `index.html`, `dist/` will now also contain folders like
   `courses/`, `pricing/` (one real HTML file per page), the blog's PHP
   files (`blog.php`, `blog-post.php`, `blog-lib.php`, `blog-layout.php`,
   `blog-icons.php`, `sitemap.php`), plus `robots.txt`, `manifest.json`,
   `social-share.png`, `site.css`, and a hidden `.htaccess` file — all of
   these need to be uploaded too, see the note about hidden files in Step 6.

Leave this terminal window open — you'll rebuild again any time you make a
future change.

---

## Step 2 — Create the database (so bookings get saved)

Skip this and the site still works, but every booking/contact/newsletter
submission will only exist as an email — nothing saved, nothing to browse
later. Do this now while you're already in setup mode.

1. Log into **Hostinger hPanel**.
2. Go to **Databases → Databases**.
3. Click **Create New Database**.
4. Give it a name, e.g. `speakinurdu` (Hostinger will automatically prefix it,
   turning it into something like `u123456789_speakinurdu` — that's normal).
5. Hostinger will also have you create a **database user** and **password**
   at the same time. Write down all three: the full database name, the
   username, and the password. You'll need them in Step 3.
6. Make sure that user has **All Privileges** on the database (Hostinger
   usually ties this together automatically when you create both at once).

Now create the actual tables:

7. Still on the **Databases** page, find the database you just made and
   click **phpMyAdmin** next to it.
8. In phpMyAdmin, click the **SQL** tab near the top.
9. On your computer, open `schema.sql` (in the project's root folder), select
   all the text, and copy it.
10. Paste it into the big text box in phpMyAdmin and click **Go**.
11. Check the left sidebar — you should now see three new tables:
    `bookings`, `contacts`, `newsletter_signups`. That's the whole database
    set up.

**Already ran this before and the booking form now includes a phone
number?** `schema.sql` includes an `ALTER TABLE` near the top that adds the
`phone` column to an existing `bookings` table — paste the file in again
and run it the same way; it won't touch your existing data or duplicate
the tables.

---

## Step 3 — Connect the site to the database

`public/db.php` is where your real database password lives, so it's
gitignored (never committed) — you're expected to create it yourself from
the template.

1. If `public/db.php` doesn't exist yet, copy `public/db.php.example` and
   rename the copy to `public/db.php` (same folder).
2. Open `public/db.php` in your code editor and replace the four placeholder
   values with the real ones from Step 2:
   ```php
   const DB_HOST = "localhost";
   const DB_NAME = "u123456789_speakinurdu";   // your real database name
   const DB_USER = "u123456789_dbuser";        // your real database username
   const DB_PASS = "the-password-you-set";
   ```
   `DB_HOST` stays `"localhost"` — that's correct for Hostinger shared
   hosting, don't change it.

   **Never put your real password in `db.php.example` or in this guide** —
   both are meant to be committed to git / shared. Real credentials belong
   only in `public/db.php`, which git ignores.
3. Save the file.
4. **Re-run `npm run build`** so this change is included in `dist/`. If you
   already built in Step 1 before editing this file, you must build again —
   otherwise the old placeholder values ship instead of your real ones.

---

## Step 4 — Create the email inbox

The forms also try to email you at `info@speakinurdu.com` in addition to
saving to the database. For that email to actually arrive:

1. hPanel → **Emails → Email Accounts**.
2. Create the mailbox `info@speakinurdu.com` with a password of your choice.
3. That's it — no further configuration needed, `mail()` on Hostinger uses
   this automatically once the mailbox exists.

If you skip this step, submissions still get saved to the database in Step
2 — you just won't get an email notification.

---

## Step 5 — Set up the admin dashboard

This gives you a password-protected page at `yoursite.com/admin.php` to
browse and search every booking, contact message, and newsletter signup —
and export any of them as CSV. It reads from the same database as Step 2.

1. `public/admin-config.php` is where the dashboard's login password lives,
   so like `db.php`, it's gitignored — you're expected to create it
   yourself from the template.
2. If `public/admin-config.php` doesn't exist yet, copy
   `public/admin-config.php.example` and rename the copy to
   `public/admin-config.php` (same folder).
3. Open it and set a real password:
   ```php
   const ADMIN_PASSWORD = "change-this-password";
   ```
   Pick something you'll actually remember — this is the only thing standing
   between the public internet and your students' contact details, so don't
   leave the default in place.
4. Save the file, then **re-run `npm run build`** (same reason as Step 3 —
   whatever's in the file when you build is what ships).

Once it's deployed (Step 6), visit `yoursite.com/admin.php`, log in with
that password, and you'll see three tabs: Bookings, Contact Messages, and
Newsletter. Each has a search box and an **Export CSV** button.

---

## Step 6 — Upload the site to Hostinger

1. hPanel → **Files → File Manager**.
2. Navigate into `public_html` (this is the folder Hostinger serves your
   domain from). If there are old placeholder files in here from Hostinger's
   default setup, you can delete them.
3. **Important — show hidden files first.** `dist/` now includes a file
   called `.htaccess` (it controls HTTPS redirects and clean page URLs —
   without it, pages like `/courses` won't load correctly). Files starting
   with a dot are hidden by default in Windows/Mac and sometimes in zip
   tools, so:
   - On Windows: File Explorer → **View** → tick **Hidden items** before
     you zip or select the folder.
   - On Mac: press `Cmd+Shift+.` in Finder to reveal it.
4. Click **Upload** and select **every file and folder inside your local
   `dist/` folder** — not the `dist` folder itself, its *contents*
   (`index.html`, `.htaccess`, `robots.txt`, `manifest.json`,
   `social-share.png`, `favicon.png`, `site.css`, `logo-full-white.png`,
   `book-trial.php`, `contact.php`, `db.php`, `newsletter.php`, `admin.php`,
   `admin-post-edit.php`, `admin-config.php`, `blog.php`, `blog-post.php`,
   `blog-lib.php`, `blog-layout.php`, `blog-icons.php`, `sitemap.php`,
   `capi.php`, `track-event.php`, and `capi-config.php` (only if you've set
   up Step 8b — otherwise it won't exist yet, that's fine), the `assets`
   folder, and the per-page folders like `courses/`, `pricing/`, `about/`,
   `contact/`, `payment/` should all end up directly inside `public_html`,
   not nested inside a `dist` subfolder).

   **Faster alternative:** on your computer, select everything inside
   `dist/` (with hidden files visible) and compress it into a single
   `.zip`. Upload just that zip into `public_html`, then right-click it in
   File Manager and choose **Extract**. Delete the zip afterward. Hostinger's
   File Manager upload/extract preserves dotfiles like `.htaccess`
   correctly even if your local zip tool almost skipped it — double check
   with Step 5 below either way.
5. Double check: in File Manager, `public_html` should now directly contain
   `index.html`, `.htaccess`, `robots.txt`, `manifest.json`, `site.css`,
   `book-trial.php`, `contact.php`, `db.php`, `newsletter.php`, `admin.php`,
   `admin-post-edit.php`, `admin-config.php`, `blog.php`, `blog-post.php`,
   `blog-lib.php`, `blog-layout.php`, `blog-icons.php`, `sitemap.php`,
   `capi.php`, `track-event.php`, `favicon.png`, `social-share.png`, an
   `assets` folder, and the per-page folders — all at the same level, not
   buried in subfolders. The PHP files need to sit right next to
   `index.html` or they won't find each other. If you don't see
   `.htaccess` listed, turn on **Settings → Show Hidden Files** in File
   Manager itself and re-upload it.

---

## Step 7 — Test it

1. Visit your domain in a browser, as plain `http://speakinurdu.com` (not
   `https`) — it should automatically redirect to `https://speakinurdu.com`
   with the padlock showing. That redirect is handled by the `.htaccess`
   file from Step 6; if it doesn't happen, re-check that `.htaccess` made
   it into `public_html` (Hostinger issues the free SSL certificate itself,
   usually within a few minutes of the domain being added — hPanel →
   **SSL** to check its status if the padlock is missing entirely).
2. Click a few links in the main menu (Courses, Pricing, Blog) and confirm
   the address bar shows a real path like `speakinurdu.com/courses`, and
   that reloading the page on one of those URLs still works (this confirms
   the pre-rendering and `.htaccess` clean-URL rule from Step 1 are both
   working correctly).
3. Click **Book a Free Trial**, fill out the form, and submit it.
4. Go back to phpMyAdmin (hPanel → Databases → phpMyAdmin) and open the
   `bookings` table — your test submission should be sitting there as a new
   row.
5. Check the `info@speakinurdu.com` inbox for the notification email too.
6. Try the contact form and the newsletter signup in the footer the same way.
7. Visit `yoursite.com/admin.php`, log in with the password from Step 5, and
   confirm your test submissions show up in each tab.

If the booking shows up in the database but no email arrived, that's a
mailbox problem (double-check Step 4) — the important part (the data) is
still safe either way.

---

## Step 8 — Tell Google about the site

The site serves `sitemap.xml` dynamically — it's always current, including
any blog posts published from the dashboard, with no rebuild needed.
Submitting it to Google speeds up how quickly new/changed pages get
indexed, and lets you see indexing progress directly instead of guessing
from search results.

1. Go to [Google Search Console](https://search.google.com/search-console)
   and sign in with the Google account you want to manage this site with.
2. Click **Add property**, and choose **Domain** (not "URL prefix") when
   asked which type — it verifies `speakinurdu.com` across `www`/non-`www`
   and http/https all at once, so you only ever do this step once. Enter
   `speakinurdu.com` and continue.
3. Google shows a DNS TXT record to verify ownership, e.g.
   `google-site-verification=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`.
   Add it in Hostinger:
   - hPanel → **Domains** → click `speakinurdu.com` → **DNS / Nameservers**
     → **DNS Zone Editor**.
   - **Add Record** → Type `TXT`, Name/Host `@`, Value: paste the exact
     string Google gave you, TTL default.
   - Save, then go back to Search Console and click **Verify**. DNS is
     usually live within minutes on Hostinger, but can take a few hours —
     if verification fails immediately, wait and try again before assuming
     something's wrong.
   (If the domain's DNS is managed somewhere other than Hostinger —
   GoDaddy, Namecheap, Cloudflare — add the same TXT record there instead.)
4. Once verified, in the left sidebar click **Sitemaps**.
5. Under "Add a new sitemap", type `sitemap.xml` and click **Submit**.
6. Give it a few hours to a few days. Come back to the **Sitemaps** page to
   see how many pages Google has discovered vs. indexed, and check the
   **Pages** report in the sidebar for anything marked "Excluded" with a
   reason — that's the direct way to track indexing progress, instead of
   guessing from a `site:speakinurdu.com` search.

---

## Step 8a — Writing and managing blog posts

Once Steps 2–6 are done (database + admin password set up, site uploaded),
the client can write and publish blog posts entirely from the browser —
**no rebuild, no re-upload, no developer needed.** A published post is live
at its own address (e.g. `speakinurdu.com/blog/my-post-title`) the instant
it's saved.

1. Go to `yoursite.com/admin.php` and log in (same password as the rest of
   the dashboard).
2. Click the **Blog Posts** tab, then **+ New Post**.
3. Fill in:
   - **Title** — the headline.
   - **URL slug** — leave it blank and it fills itself in from the title.
   - **Category** — pick one of the seven existing categories.
   - **Short excerpt** — one or two sentences, shown in blog listings and
     search results.
   - **Cover photo** — optional but recommended, JPG/PNG/WEBP up to 5 MB.
   - **Article body** — the write-up. Click "Formatting help" inside the
     editor for the handful of special lines available (headings, bullet
     lists, a highlighted tip box, and Urdu word/verse examples) — regular
     paragraphs just need a blank line between them, nothing else to learn.
   - **Published** — leave checked to make it live immediately, or uncheck
     to save as a draft only visible in the dashboard.
4. Click **Publish post** (or **Save changes** when editing). Done — the
   post is live.

From the **Blog Posts** list you can also **Edit**, **Unpublish** (takes it
off the live site without deleting it), or **Delete** any post (this also
removes its uploaded cover photo).

**If uploading a cover photo fails with a size error**, Hostinger's PHP
config may cap uploads below 5 MB by default — hPanel → **Advanced → PHP
Configuration** → raise `upload_max_filesize` and `post_max_size`.

---

## Step 8b — Meta Conversions API (server-side ad tracking)

The site already has the Meta Pixel (browser-side tracking) built in. The
problem with browser-only tracking: ad blockers and browser privacy
features (increasingly common — Chrome, Safari, and Firefox all ship some
form of this now) can silently prevent the pixel from ever reaching Meta,
with no visible error to the visitor or to you. The **Conversions API**
sends the same events directly from this server to Meta instead, which
nothing on the visitor's browser can block. Both run side by side — Meta
automatically merges matching events from the two so nothing gets
double-counted.

This step is optional but recommended — the site works fine without it,
you just lose some tracking to ad blockers. It takes about 5 minutes.

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager2)
   and select your pixel (Data Sources → your pixel, ID `27401886419482144`
   unless you've since changed it — see `index.html` / `public/blog-layout.php`
   to check the current one).
2. Click the **Settings** tab, scroll to **Conversions API**, and click
   **Generate access token**. Copy the long token it gives you — this acts
   like a password, so don't share it or commit it anywhere public.
3. On your computer, copy `public/capi-config.php.example` to
   `public/capi-config.php` (same folder, new filename — same pattern as
   `db.php` and `admin-config.php`).
4. Open `public/capi-config.php` and paste your token in:
   ```php
   const PIXEL_ID = "27401886419482144";
   const CAPI_ACCESS_TOKEN = "paste-your-real-token-here";
   ```
5. `npm run build`, then upload `dist/` to `public_html` as usual —
   `capi-config.php` is gitignored (never committed) so make sure it's
   actually part of what you upload this time, same as `db.php`.
6. Test it: Events Manager → **Test Events** tab, browse the live site
   (submit the trial form, contact form, newsletter signup, view a course
   or blog post). Each event should appear twice in Test Events — once
   tagged "Browser" and once "Server" — with the same event name and a
   green "Deduplicated" indicator once both arrive. That confirms both
   sides are working and Meta is correctly merging them into one.

**What's tracked, and where:**

| Event | Browser (Pixel) | Server (CAPI) |
|---|---|---|
| `PageView` | Every page load + in-app navigation | Every in-app navigation (`track-event.php`) |
| `ViewContent` (course/blog post) | Yes | Yes — blog posts direct from PHP, courses via `track-event.php` |
| `InitiateCheckout` (trial modal opens) | Yes | Yes, via `track-event.php` |
| `Lead` (trial booked) | Yes | Yes, directly from `book-trial.php` |
| `Contact` (contact form sent) | Yes | Yes, directly from `contact.php` |
| `Subscribe` (newsletter signup) | Yes | Yes, directly from `newsletter.php` |

If `capi-config.php` is missing or the token is left blank, every CAPI call
silently does nothing — the site keeps working exactly as before, forms
still submit, the browser pixel still fires. Nothing breaks either way.

---

## Updating the site later

Whenever you make changes to the code:

1. `npm run build` again.
2. Upload the new contents of `dist/` to `public_html`, overwriting the old
   files.

You only need to repeat Steps 2–5 (database, `db.php` credentials, email
mailbox, admin password) if you're setting up on a *new* Hostinger account —
not on every update.

**Blog posts are the one exception** — see Step 8a. Writing, editing, or
deleting a post from `/admin.php` needs none of this; it's live immediately
because it's stored in the database and rendered fresh on every visit,
not baked into the files you build and upload.

---

## If something's not working

- **Site doesn't load at all**: make sure `index.html` is directly inside
  `public_html`, not inside a `dist` or nested folder.
- **Forms show an error / bookings don't save**: check hPanel → **Advanced →
  PHP Configuration** or **Files → Error Logs**. Every database failure is
  logged there with a clear message — it's almost always a typo in one of
  the four values in `db.php`.
- **No email arrives but the database has the entry**: the
  `info@speakinurdu.com` mailbox either doesn't exist yet (Step 4) or
  Hostinger's mail delivery is having an off day — the booking itself is
  safe in the database regardless.
- **Can't log into `/admin.php`**: the password is only ever stored in
  `public/admin-config.php` — open that file (locally, or via File Manager
  on Hostinger) to check or reset it. There's no "forgot password" flow by
  design, since there's no second admin account to reset it for you.
- **`/blog` shows "No posts in this category yet" even after publishing
  one, or a blog page looks broken/unstyled**: make sure `schema.sql` was
  run all the way through (Step 2) — it includes the `posts` table, and
  re-running the whole file is always safe. Also confirm `blog.php`,
  `blog-post.php`, `blog-lib.php`, `blog-layout.php`, `blog-icons.php`,
  `sitemap.php`, and `.htaccess` all made it into `public_html` (Step 6).
