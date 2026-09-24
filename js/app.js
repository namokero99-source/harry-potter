const SUPABASE_URL="https://jxcyscfonatnxjcjcssp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_HZKgtwr-WJRObvgR0CNnfQ_MbV4rQ-r";
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);

let products=[];
let cart=[];

const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat("th-TH",{style:"currency",currency:"THB"}).format(Number(n||0));

function normalizeImagePath(v,id){
  // Existing GitHub files are named 1.JPG ... 7.JPG.
  if(!v) return `/images/${id}.JPG`;
  if(/^https?:\/\//i.test(v)) return v;
  const filename=(v.split("/").pop()||`${id}.JPG`).replace(/\.(jpg|jpeg|png|webp)$/i, ".JPG");
  return `/images/${filename}`;
}

async function loadProducts(){
  const {data,error}=await supabaseClient.from("products").select("*").order("id");
  if(error){ console.error(error); return; }
  products=data||[];
  renderProducts();
}

function renderProducts(){
  const el=$("#products");
  if(!el) return;
  el.innerHTML=products.map(p=>`
    <article class="product-card">
      <img class="product-image" src="${normalizeImagePath(p.image_url,p.id)}"
           alt="${escapeHtml(p.title)}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="image-fallback">No image</div>
      <h3>${escapeHtml(p.title)}</h3>
      <p class="author">${escapeHtml(p.author||"")}</p>
      <p class="price">${money(p.price)}</p>
      <button onclick="addToCart(${p.id})">เพิ่มลงตะกร้า</button>
    </article>`).join("");
}

function escapeHtml(s){
  return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

window.addToCart=function(id){
  const p=products.find(x=>x.id===id);
  if(!p)return;
  const item=cart.find(x=>x.id===id);
  if(item)item.quantity++;
  else cart.push({id:p.id,title:p.title,price:Number(p.price),quantity:1});
  renderCart();
};

window.changeQty=function(id,delta){
  const item=cart.find(x=>x.id===id);
  if(!item)return;
  item.quantity+=delta;
  if(item.quantity<=0) cart=cart.filter(x=>x.id!==id);
  renderCart();
};

function renderCart(){
  const list=$("#cart-items"), count=$("#cart-count"), totalEl=$("#cart-total"), checkoutBtn=$("#checkout-btn");
  if(!list)return;
  const total=cart.reduce((s,x)=>s+x.price*x.quantity,0);
  if(count)count.textContent=cart.reduce((s,x)=>s+x.quantity,0);
  if(totalEl)totalEl.textContent=money(total);
  if(checkoutBtn)checkoutBtn.disabled=cart.length===0;
  list.innerHTML=cart.length?cart.map(x=>`
    <div class="cart-item">
      <div><strong>${escapeHtml(x.title)}</strong><small>${money(x.price)} × ${x.quantity}</small></div>
      <div class="qty">
        <button onclick="changeQty(${x.id},-1)">−</button>
        <span>${x.quantity}</span>
        <button onclick="changeQty(${x.id},1)">+</button>
      </div>
    </div>`).join(""):`<p class="empty-cart">ยังไม่มีสินค้าในตะกร้า</p>`;
}

window.openCheckout=function(){
  if(!cart.length)return alert("กรุณาเลือกสินค้าก่อน");
  $("#checkout-dialog")?.showModal();
};

window.closeCheckout=function(){
  $("#checkout-dialog")?.close();
};

async function submitOrder(e){
  e.preventDefault();
  if(!cart.length)return;
  const form=e.currentTarget;
  const payload={
    customer_name:form.customer_name.value.trim(),
    phone:form.phone.value.trim(),
    line_id:form.line_id.value.trim(),
    address:form.address.value.trim(),
    note:form.note.value.trim(),
    items:cart.map(x=>({product_id:x.id,quantity:x.quantity}))
  };
  const btn=form.querySelector("button[type=submit]");
  btn.disabled=true; btn.textContent="กำลังสร้างออเดอร์...";
  try{
    const res=await fetch("/api/create-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const data=await res.json();
    if(!res.ok||!data.success)throw new Error(data.error||"สร้างออเดอร์ไม่สำเร็จ");
    location.href=`/thank-you.html?order=${encodeURIComponent(data.order_number||"")}`;
  }catch(err){
    alert(err.message);
    btn.disabled=false; btn.textContent="ยืนยันสั่งซื้อ";
  }
}

document.addEventListener("DOMContentLoaded",()=>{
  loadProducts();
  renderCart();
  $("#checkout-form")?.addEventListener("submit",submitOrder);
  $("#checkout-btn")?.addEventListener("click",openCheckout);
  $("#close-dialog")?.addEventListener("click",closeCheckout);
});
