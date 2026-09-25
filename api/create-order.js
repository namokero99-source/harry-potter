import { createClient } from "@supabase/supabase-js";
export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).json({success:false,error:"Method not allowed"});
try{
const{customer_name,phone,line_id,address,note,items,channel}=req.body||{};
if(!customer_name||!Array.isArray(items)||!items.length)return res.status(400).json({success:false,error:"ข้อมูลออร์เดอร์ไม่ครบ"});
const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SECRET_KEY);
const ids=items.map(i=>Number(i.product_id)).filter(Number.isFinite);
const{data:products,error:pe}=await supabase.from("products").select("id,title,price").in("id",ids);if(pe)throw pe;
const map=new Map((products||[]).map(p=>[Number(p.id),p])),normalized=[];
for(const i of items){const p=map.get(Number(i.product_id)),q=Number(i.quantity);if(!p||!Number.isInteger(q)||q<=0)return res.status(400).json({success:false,error:"รายการสินค้าไม่ถูกต้อง"});normalized.push({product_id:p.id,product_name:p.title,quantity:q,unit_price:Number(p.price),subtotal:Number(p.price)*q})}
const orderChannel=channel==="POS"?"POS":"ONLINE";
const total=normalized.reduce((s,i)=>s+i.subtotal,0),orderNumber=`${orderChannel==="POS"?"HP-POS":"HP"}-${Date.now().toString().slice(-8)}`;
const{data:order,error:oe}=await supabase.from("orders").insert({order_number:orderNumber,channel:orderChannel,customer_name,phone:phone||null,line_id:line_id||null,address:address||null,total,status:"NEW",note:note||null}).select("id,order_number,created_at").single();if(oe)throw oe;
const{error:ie}=await supabase.from("order_items").insert(normalized.map(i=>({...i,order_id:order.id})));if(ie)throw ie;
const itemText=normalized.map(i=>`${i.product_name} x ${i.quantity}`).join(", ");
const sync={datetime:new Date(order.created_at).toLocaleString("th-TH"),customer_name,contact:[phone,line_id].filter(Boolean).join(" / "),items:itemText,total,note:[address?`ที่อยู่: ${address}`:"",note||""].filter(Boolean).join(" | ")};
if(process.env.GOOGLE_SYNC_URL)try{await fetch(process.env.GOOGLE_SYNC_URL,{method:"POST",headers:{"Content-Type":"application/json",...(process.env.GOOGLE_SYNC_SECRET?{"X-Sync-Secret":process.env.GOOGLE_SYNC_SECRET}:{})},body:JSON.stringify(sync)})}catch(e){console.error("Google sync failed",e)}
if(process.env.TELEGRAM_BOT_TOKEN&&process.env.TELEGRAM_CHAT_ID)try{await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:process.env.TELEGRAM_CHAT_ID,text:`🪄 ${orderChannel} ORDER ${orderNumber}\nลูกค้า: ${customer_name}\nติดต่อ: ${[phone,line_id].filter(Boolean).join(" / ")||"-"}\nรายการ: ${itemText}\nยอดรวม: ฿${total.toFixed(2)}\nหมายเหตุ: ${note||"-"}`})})}catch(e){console.error("Telegram failed",e)}
return res.status(200).json({success:true,order_number:order.order_number});
}catch(e){console.error(e);return res.status(500).json({success:false,error:e?.message||"เกิดข้อผิดพลาดในระบบ"})}}
