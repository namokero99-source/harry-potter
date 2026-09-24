# Harry Potter Bookstore

## Pages
- `/` ร้านหนังสือ
- `/thank-you.html` หน้าขอบคุณหลังสั่งซื้อ
- `/admin.html` หน้า Admin แบบ public สำหรับโปรเจกต์ส่งครู

## Vercel Environment Variables
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `GOOGLE_SYNC_URL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `GOOGLE_SYNC_SECRET` (optional)

อย่าใส่ secret key หรือ Telegram token ใน frontend

## Images
ใส่ไฟล์รูปจริงไว้ที่ `images/`:
`1.jpg`, `2.jpg`, `3.jpg`, `4.jpg`, `5.jpg`, `6.jpg`, `7.jpg`

โค้ดรองรับทั้ง `/images/1.jpg`, `images/1.jpg` และ `1.jpg`

หมายเหตุ: Admin เปิดดูได้โดยไม่ต้อง Login เพราะเป็นโปรเจกต์ส่งครู ไม่ควรใช้รูปแบบนี้กับข้อมูลลูกค้าจริง
