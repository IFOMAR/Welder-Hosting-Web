async function getUser(){
  const res = await fetch("/api/user");
  return res.json();
}

async function getPoints(){
  const res = await fetch("/api/points");
  const data = await res.json();
  document.getElementById("points").textContent = data.points;
}

document.getElementById("earnBtn").onclick = async ()=>{
  document.getElementById("earnBtn").disabled = true;
  document.getElementById("earnBtn").textContent = "انتظر 5 ثواني...";
  setTimeout(async ()=>{
    await fetch("/api/earn",{method:"POST"});
    getPoints();
    document.getElementById("earnBtn").disabled = false;
    document.getElementById("earnBtn").textContent = "ابدأ مهمة + 10 نقاط (انتظر 5 ثواني)";
  },5000);
};

getUser().then(u=>{
  if(u.loggedIn){
    document.getElementById("loginBtn").style.display="none";
    document.getElementById("logoutBtn").style.display="inline-block";
    getPoints();
  }else{
    document.getElementById("loginBtn").onclick=()=>window.location="/auth/discord";
  }
});

document.getElementById("logoutBtn").onclick=()=>window.location="/logout";

document.getElementById("serverType").onchange=()=>{
  const type = document.getElementById("serverType").value;
  document.getElementById("botLang").style.display = type=="bot"?"inline-block":"none";
};

document.getElementById("buyBtn").onclick=async()=>{
  const type = document.getElementById("serverType").value;
  const lang = type=="bot"?document.getElementById("botLang").value:null;
  const price = Number(document.getElementById("priceInput").value);
  if(!price){alert("أدخل السعر");return;}
  const res = await fetch("/api/purchase",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({type,lang,price})
  });
  const data = await res.json();
  alert(data.msg || (data.ok?"تم الشراء":"فشل الشراء"));
  getPoints();
  renderPurchases();
};

async function renderPurchases(){
  const res = await fetch("/api/purchases");
  const data = await res.json();
  const ul = document.getElementById("purchasesList");
  ul.innerHTML="";
  data.purchases.forEach(p=>{
    const li=document.createElement("li");
    li.textContent = `${p.type}${p.lang?" - "+p.lang:""} — السعر: ${p.price} نقطة`;
    ul.appendChild(li);
  });
}
renderPurchases();
