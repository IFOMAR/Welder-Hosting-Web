// ======== خطط Minecraft =========
const minecraftPlans = [
  { name:"Free", ram:"2GB", cpu:"100", disk:"5GB", players:"20", price:0 },
  { name:"Starter", ram:"3GB", cpu:"150", disk:"10GB", players:"40", price:25 },
  { name:"Advanced", ram:"4.5GB", cpu:"250", disk:"15GB", players:"70", price:35 },
  { name:"Pro", ram:"6GB", cpu:"300", disk:"20GB", players:"100", price:40 },
  { name:"Elite", ram:"8GB", cpu:"400", disk:"30GB", players:"150", price:50 },
  { name:"Ultra", ram:"12GB", cpu:"500", disk:"35GB", players:"225", price:60 },
  { name:"Titan", ram:"16GB", cpu:"600", disk:"40GB", players:"300", price:95 },
  { name:"Omega", ram:"32GB", cpu:"800", disk:"50GB", players:"600", price:145 }
];

// ======== خطط Bot Hosting =========
const botPlans = [
  { name:"Starter", ram:"256MB", cpu:"20%", storage:"1024MB", duration:"30 Days", price:30 },
  { name:"Starter+", ram:"512MB", cpu:"25%", storage:"2048MB", duration:"30 Days", price:60 },
  { name:"Advanced", ram:"1024MB", cpu:"50%", storage:"3072MB", duration:"30 Days", price:75 },
  { name:"Advanced+", ram:"2048MB", cpu:"100%", storage:"4096MB", duration:"30 Days", price:110 },
  { name:"Pro", ram:"4096MB", cpu:"150%", storage:"6124MB", duration:"30 Days", price:150 }
];

// ======== تحديث رصيد النقاط ========
async function getPoints(){
  const res = await fetch("/api/points");
  const data = await res.json();
  document.getElementById("points").textContent = data.points;
}

// ======== مهمة كسب النقاط 5 ثواني ========
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

// ======== تسجيل الدخول والخروج ========
async function getUser(){
  const res = await fetch("/api/user");
  const data = await res.json();
  if(data.loggedIn){
    document.getElementById("loginBtn").style.display="none";
    document.getElementById("logoutBtn").style.display="inline-block";
    getPoints();
  } else {
    document.getElementById("loginBtn").onclick=()=>window.location="/auth/discord";
  }
}

document.getElementById("logoutBtn").onclick=()=>window.location="/logout";
getUser();

// ======== عرض خطط Minecraft =========
const mcContainer = document.createElement("div");
mcContainer.innerHTML = "<h3>خطط Minecraft</h3>";
minecraftPlans.forEach(plan=>{
  const card = document.createElement("div");
  card.className="planCard";
  card.innerHTML=`
    <h4>${plan.name} - ${plan.price} نقطة</h4>
    <p>RAM: ${plan.ram} | CPU: ${plan.cpu} | Disk: ${plan.disk} | Max Players: ${plan.players}</p>
    <button onclick="buyPlan('minecraft','${plan.name}',${plan.price})">شراء</button>
  `;
  mcContainer.appendChild(card);
});
document.body.appendChild(mcContainer);

// ======== عرض خطط Bot Hosting =========
const botContainer = document.createElement("div");
botContainer.innerHTML = "<h3>خطط Bot Hosting</h3>";
botPlans.forEach(plan=>{
  const card = document.createElement("div");
  card.className="planCard";
  card.innerHTML=`
    <h4>${plan.name} - ${plan.price} نقطة</h4>
    <p>RAM: ${plan.ram} | CPU: ${plan.cpu} | Storage: ${plan.storage} | Duration: ${plan.duration}</p>
    <select id="langSelect-${plan.name}">
      <option value="nodejs">Node.js</option>
      <option value="python">Python</option>
      <option value="javascript">JavaScript</option>
      <option value="lua">Lua</option>
    </select>
    <button onclick="buyPlan('bot','${plan.name}',${plan.price})">شراء</button>
  `;
  botContainer.appendChild(card);
});
document.body.appendChild(botContainer);

// ======== شراء خطة =========
async function buyPlan(type,name,price){
  let lang = null;
  if(type==="bot") lang = document.getElementById(`langSelect-${name}`).value;

  const res = await fetch("/api/purchase",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({type,lang,price})
  });
  const data = await res.json();
  alert(data.msg || (data.ok?"تم الشراء ✅":"فشل الشراء ❌"));
  getPoints();
  renderPurchases();
}

// ======== عرض مشتريات المستخدم =========
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
