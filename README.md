# Harry Potter Bookstore — v2
Supabase-connected catalog and guest checkout.

Put covers in `images/1.jpg` through `images/7.jpg`.
Never commit a Supabase secret key. Only the publishable key belongs in browser code.

Next: move order creation to a Vercel serverless API, then connect Google Apps Script and Telegram server-side.


## Vercel Environment Variables
Set these in Vercel Project Settings → Environment Variables:
- SUPABASE_URL
- SUPABASE_SECRET_KEY
- GOOGLE_SYNC_URL
- GOOGLE_SYNC_SECRET (optional for the current Apps Script unless you add validation)
- TELEGRAM_BOT_TOKEN
- TELEGRAM_CHAT_ID

Do not put any secret key or Telegram token in frontend files or GitHub.
