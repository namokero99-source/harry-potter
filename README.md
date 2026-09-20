# Harry Potter Bookstore

Static bookstore landing/catalog site built with HTML, CSS, and Vanilla JavaScript.

## Structure

- `index.html` — landing page + 7-book catalog
- `images/1.*` through `images/7.*` — put your book cover images here
- `css/style.css` — all styling
- `js/app.js` — catalog, cart, and UI logic
- `api/` — reserved for later Vercel serverless functions
- `pos/` — reserved for the later Supabase POS
- `.gitignore` — keeps local secrets and unnecessary files out of Git

## Images

Add exactly one image for each book using one of these names:

- `images/1.jpg`
- `images/2.jpg`
- `images/3.jpg`
- `images/4.jpg`
- `images/5.jpg`
- `images/6.jpg`
- `images/7.jpg`

PNG/WebP also work if you change the extension in `js/app.js`.

The current site has fallback artwork, so the page still works before images are uploaded.

## Current scope

This first version is intentionally frontend-only. Do not put Supabase service keys, Telegram bot tokens, Google credentials, or other secrets into this folder yet.

Later we will connect:

1. Supabase
2. Guest checkout
3. POS
4. Google Sheets
5. Telegram notifications

The code and folder structure are prepared for those steps.
