const SUPABASE_URL="https://jxcyscfonatnxjcjcssp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_HZKgtwr-WJRObvgR0CNnfQ_MbV4rQ-r";
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
let products=[],cart=[];
const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat("th-TH",{style:"currency",currency:"THB"}).format(Number(n||0));
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
async function loadProducts(){
 const {data,error}=await supabaseClient.from("products").select("*").order("id");
 if(error){$("#pos-products").innerHTML=`<p>โหลดสินค้าไม่สำเร็จ: ${esc(error.message)}</p>`;return;}
 products=data||[];renderProducts();renderCart();
}
function renderProducts(){
 $("#pos-products").innerHTML=products.map(p=>{
  const q=cart.find(x=>x.id===p.id)?.quantity||0;
  return `<article class="pos-card"><h3>${esc(p.title)}</h3><div class="pos-price">${money(p.price)}</div><div class="pos-controls"><button type="button" onclick="changeQty(${p.id},-1)">−</button><span>${q}</span><button type="button" onclick="changeQty(${p.id},1)">+</button></div></article>`;
 }).join("");
}
window.changeQty=function(id,delta){
 const p=products.find(x=>x.id===id);if(!p)return;
 let item=cart.find(x=>x.id===id);
 if(!item&&delta>0){item={id:p.id,title:p.title,price:Number(p.price),quantity:0};cart.push(item);}
 if(item)item.quantity+=delta;
 cart=cart.filter(x=>x.quantity>0);renderProducts();renderCart();
};
function renderCart(){
 const total=cart.reduce((s,x)=>s+x.price*x.quantity,0);
 $("#pos-items").innerHTML=cart.length?cart.map(x=>`<div class="pos-item"><span>${esc(x.title)} × ${x.quantity}</span><strong>${money(x.price*x.quantity)}</strong></div>`).join(""):`<p>ยังไม่มีสินค้า</p>`;
 $("#pos-total").textContent=money(total);$("#pos-submit").disabled=!cart.length;
}
async function submitSale(){
 if(!cart.length)return;
 const btn=$("#pos-submit"),status=$("#pos-status");
 btn.disabled=true;btn.textContent="กำลังบันทึก...";status.textContent="";
 try{
  const payload={channel:"POS",customer_name:$("#pos-customer").value.trim()||"Walk-in",phone:$("#pos-phone").value.trim(),line_id:"",address:"",note:$("#pos-note").value.trim(),items:cart.map(x=>({product_id:x.id,quantity:x.quantity}))};
  const res=await fetch("/api/create-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||!data.success)throw new Error(data.error||"บันทึกการขายไม่สำเร็จ");
  status.textContent=`ขายสำเร็จ: ${data.order_number}`;cart=[];$("#pos-customer").value="";$("#pos-phone").value="";$("#pos-note").value="";renderProducts();renderCart();
 }catch(e){status.textContent=e.message||"เกิดข้อผิดพลาด";btn.disabled=false;}
 finally{if(!cart.length)btn.textContent="ยืนยันการขาย";else btn.disabled=false;}
}
document.addEventListener("DOMContentLoaded",()=>{$("#pos-submit").addEventListener("click",submitSale);loadProducts();});
