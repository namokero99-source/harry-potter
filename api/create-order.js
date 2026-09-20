import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { customer_name, phone, line_id, address, note, items } = req.body || {};

    if (!customer_name || !phone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing required order information" });
    }

    const ids = [...new Set(items.map(x => Number(x.product_id)).filter(Number.isInteger))];
    if (!ids.length) return res.status(400).json({ error: "Invalid products" });

    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id,title,price")
      .in("id", ids);

    if (productError) throw productError;

    const byId = new Map(products.map(p => [p.id, p]));
    const orderItems = [];

    for (const item of items) {
      const product = byId.get(Number(item.product_id));
      const quantity = Number(item.quantity);

      if (!product || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: "Invalid order item" });
      }

      orderItems.push({
        product_id: product.id,
        product_name: product.title,
        quantity,
        unit_price: Number(product.price),
        subtotal: Number(product.price) * quantity
      });
    }

    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const orderNumber = `WEB-${Date.now()}`;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        channel: "ONLINE",
        customer_name,
        phone,
        line_id: line_id || null,
        address: address || null,
        total,
        status: "NEW",
        note: note || null
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const { error: itemError } = await supabase
      .from("order_items")
      .insert(orderItems.map(item => ({ ...item, order_id: order.id })));

    if (itemError) throw itemError;

    const itemText = orderItems
      .map(item => `${item.product_name} × ${item.quantity}`)
      .join(", ");

    // Google Sheet reporting
    if (process.env.GOOGLE_SYNC_URL) {
      await fetch(process.env.GOOGLE_SYNC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.GOOGLE_SYNC_SECRET
            ? { "X-Sync-Secret": process.env.GOOGLE_SYNC_SECRET }
            : {})
        },
        body: JSON.stringify({
          datetime: new Date().toISOString(),
          customer_name,
          contact: phone || line_id || "",
          items: itemText,
          total,
          note: note || ""
        })
      }).catch(err => console.error("Google sync failed:", err));
    }

    // Telegram notification
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const message =
`🛒 New Order

Order: ${orderNumber}
Customer: ${customer_name}
Phone/Line: ${phone || line_id || "-"}
Items: ${itemText}
Total: ฿${total.toLocaleString("en-US")}
Note: ${note || "-"}`;

      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message
          })
        }
      ).catch(err => console.error("Telegram failed:", err));
    }

    return res.status(201).json({
      success: true,
      order_number: orderNumber,
      total
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not create order" });
  }
}