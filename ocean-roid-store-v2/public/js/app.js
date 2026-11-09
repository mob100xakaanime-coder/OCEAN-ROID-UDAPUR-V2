var cart = {}, filter = "all";
var $ = function(s){return document.querySelector(s)};
var rs = function(n){return "\u20b9" + n};

try{var saved = JSON.parse(localStorage.getItem("or_cart")||"{}"); if(saved && typeof saved==="object") cart = saved;}catch(e){}
function persist(){try{localStorage.setItem("or_cart",JSON.stringify(cart))}catch(e){}}

function art(p){
  var h = Math.round(80 + (p.h-6)*6.5), w = Math.round(h*p.w/p.h);
  if(p.t==="mag") return '<div class="mag'+(p.red?' red':'')+'" style="width:'+w+'px;height:'+h+'px"><div class="ph"></div></div>';
  var cap = p.t==="sp" ? '<div class="cap"><i></i><i></i><i></i></div>' : '<div class="cap"></div>';
  return '<div class="pol'+(p.t==="sp"?' sp':'')+'" style="width:'+w+'px;height:'+h+'px"><div class="ph"></div>'+cap+'</div>';
}
function drawGrid(){
  $("#grid").innerHTML = P.filter(function(p){return filter==="all"||(filter==="mag"?p.t==="mag":p.t!=="mag")}).map(function(p){
    return '<article class="card"><div class="art" aria-hidden="true">'+art(p)+'</div><div class="info"><h3>'+p.n+'</h3>'+
    '<div class="meta">'+p.w+' \u00d7 '+p.h+' cm \u00b7 '+p.q+' \u00b7 '+p.f+'</div><p>'+p.d+'</p>'+
    '<div class="buy"><span class="price">'+rs(p.p)+'</span><button class="add" data-id="'+p.id+'">Add to cart</button></div></div></article>';
  }).join("");
}
function items(){return P.filter(function(p){return cart[p.id]>0})}
function total(){return items().reduce(function(s,p){return s+p.p*cart[p.id]},0)}
function count(){return items().reduce(function(s,p){return s+cart[p.id]},0)}

function drawCart(){
  $("#count").textContent = count();
  var it = items(), db = $("#db");
  if(!it.length){db.innerHTML='<div class="empty">Your cart is empty. Add a print or magazine to start your order.</div>';return}
  var keep = {};["nm","ph","ct","ad","nt"].forEach(function(k){var e=$("#"+k);if(e)keep[k]=e.value});
  db.innerHTML = it.map(function(p){
    return '<div class="li"><div><strong>'+p.n+'</strong><small>'+p.q+' \u00b7 '+p.f+'</small><div class="qty"><button data-m="'+p.id+'" aria-label="Remove one">\u2212</button><span>'+cart[p.id]+'</span><button data-a="'+p.id+'" aria-label="Add one">+</button></div></div><strong>'+rs(p.p*cart[p.id])+'</strong></div>';
  }).join("") +
  '<div class="tot"><span>Items total</span><span>'+rs(total())+'</span></div>'+
  '<p class="note">Delivery is free to confirm in Udaipur. For other cities, the courier charge is confirmed on WhatsApp before you pay.</p>'+
  '<label for="nm">Your name</label><input id="nm" autocomplete="name">'+
  '<label for="ph">Phone number</label><input id="ph" type="tel" autocomplete="tel">'+
  '<label for="ct">City</label><input id="ct" autocomplete="address-level2">'+
  '<label for="ad">Full delivery address</label><textarea id="ad" autocomplete="street-address"></textarea>'+
  '<label for="nt">Note (song names, finish, occasion)</label><textarea id="nt"></textarea>'+
  '<div class="err" id="err" role="alert"></div>'+
  '<a class="go" id="go" href="#" target="_blank" rel="noopener">Send order on WhatsApp</a>';
  Object.keys(keep).forEach(function(k){$("#"+k).value=keep[k]});
}
function msg(){
  var v = function(k){return ($("#"+k)||{}).value||""};
  var lines = items().map(function(p){return "\u2022 "+p.n+" ("+p.q+", "+p.f+") x "+cart[p.id]+" = "+rs(p.p*cart[p.id])});
  return "Hi Ocean Roid! I\u2019d like to place this order:\n\n"+lines.join("\n")+"\n\nItems total: "+rs(total())+
   "\n\nName: "+v("nm")+"\nPhone: "+v("ph")+"\nCity: "+v("ct")+"\nAddress: "+v("ad")+(v("nt")?"\nNote: "+v("nt"):"")+
   "\n\nI will send my photos in this chat.";
}
function openCart(on){
  $("#drawer").classList.toggle("on",on);$("#ov").classList.toggle("on",on);
  $("#drawer").setAttribute("aria-hidden",on?"false":"true");
  if(on)drawCart();
}

/* Sends the order to your backend (only when USE_BACKEND is true). The server recalculates prices itself. */
function sendOrder(){
  var v=function(k){return $("#"+k).value.trim()};
  var body={customer:{name:v("nm"),phone:v("ph"),city:v("ct"),address:v("ad"),note:v("nt")},
    items:items().map(function(p){return {id:p.id,qty:cart[p.id]}})};
  try{fetch(API_BASE+"/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),keepalive:true}).catch(function(){})}catch(e){}
}

document.addEventListener("click",function(e){
  var t = e.target;
  if(t.matches(".add")){var id=t.dataset.id;cart[id]=(cart[id]||0)+1;persist();$("#count").textContent=count();t.textContent="Added";setTimeout(function(){t.textContent="Add to cart"},900)}
  else if(t.matches(".tab")){filter=t.dataset.f;document.querySelectorAll(".tab").forEach(function(b){b.setAttribute("aria-pressed",b===t?"true":"false")});drawGrid()}
  else if(t.dataset.a){cart[t.dataset.a]++;persist();drawCart()}
  else if(t.dataset.m){cart[t.dataset.m]--;persist();drawCart()}
  else if(t.id==="open")openCart(true);
  else if(t.id==="close"||t.id==="ov")openCart(false);
  else if(t.id==="go"){
    var v=function(k){return $("#"+k).value.trim()};
    if(!v("nm")||v("ph").length<8||!v("ct")||!v("ad")){e.preventDefault();$("#err").textContent="Please fill in your name, phone number, city and address.";return}
    t.href="https://wa.me/"+WA_NUMBER+"?text="+encodeURIComponent(msg());
    if(USE_BACKEND) sendOrder();
  }
});
document.addEventListener("keydown",function(e){if(e.key==="Escape")openCart(false)});

$("#wa2").href = "https://wa.me/"+WA_NUMBER;
$("#ig").href = "https://instagram.com/"+IG_USER;
drawGrid();drawCart();
if(USE_BACKEND){
  fetch(API_BASE+"/api/products").then(function(r){return r.json()}).then(function(list){
    if(Array.isArray(list)&&list.length){P=list;drawGrid();drawCart()}
  }).catch(function(){});
}
