const SUPABASE_URL="https://jxcyscfonatnxjcjcssp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_HZKgtwr-WJRObvgR0CNnfQ_MbV4rQ-r";
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const listEl=document.getElementById("orders-list"),summaryEl=document.getElementById("admin-summary"),refreshBtn=document.getElementById("refresh-btn");
const money=v=>`฿${Number(v||0).toLocaleString("th-TH",{minimumFractionDigits:2})}`;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const date=v=>new Date(v).toLocaleString("th-TH",{dateStyle:"medium",timeStyle:"short"});
async function loadOrders(){listEl.innerHTML='<p class="muted">กำลังโหลดออร์เดอร์...</p>';const{data:orders,error}=await supabaseClient.from("orders").select("*, order_items(*)").order("created_at",{ascending:false});
if(error){listEl.innerHTML=`<p class="error">โหลดออร์เดอร์ไม่สำเร็จ: ${esc(error.message)}</p>`;summaryEl.textContent="เกิดข้อผิดพลาด";return}
const rows=orders||[],sales=rows.reduce((s,o)=>s+Number(o.total||0),0);summaryEl.innerHTML=`<strong>${rows.length}</strong> ออร์เดอร์ &nbsp; | &nbsp; ยอดรวม <strong>${money(sales)}</strong>`;
if(!rows.length){listEl.innerHTML='<div class="summary-box">ยังไม่มีออร์เดอร์</div>';return}
listEl.innerHTML=rows.map(o=>{const items=(o.order_items||[]).map(i=>`<div class="order-item-row"><span>${esc(i.product_name)} × ${Number(i.quantity)}</span><strong>${money(i.subtotal)}</strong></div>`).join("");
return`<article class="order-card"><div class="order-head"><div><strong>${esc(o.order_number)}</strong><br><span class="muted">${date(o.created_at)}</span></div><span class="status">${esc(o.status||"NEW")}</span></div><div class="order-body"><div class="order-meta"><div><strong>ลูกค้า:</strong><br>${esc(o.customer_name||"-")}</div><div><strong>เบอร์:</strong><br>${esc(o.phone||"-")}</div><div><strong>Line:</strong><br>${esc(o.line_id||"-")}</div><div><strong>ช่องทาง:</strong><br>${esc(o.channel||"-")}</div></div><strong>รายการสินค้า</strong><div class="order-items">${items||'<span class="muted">ไม่มีรายการ</span>'}</div><div class="order-total"><span>Total</span><span>${money(o.total)}</span></div>${o.address?`<p><strong>ที่อยู่:</strong> ${esc(o.address)}</p>`:""}${o.note?`<p><strong>หมายเหตุ:</strong> ${esc(o.note)}</p>`:""}</div></article>`}).join("")}
refreshBtn.addEventListener("click",loadOrders);loadOrders();