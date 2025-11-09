import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import config from "./config.json" assert { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// إعداد الجلسات
app.use(session({
  secret: "welder_secret",
  resave: false,
  saveUninitialized: false
}));

// Passport إعداد
app.use(passport.initialize());
app.use(passport.session());

// Discord Strategy
passport.use(new DiscordStrategy({
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    scope: ["identify"]
  },
  (accessToken, refreshToken, profile, done) => done(null, profile)
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// ملفات المستخدمين
const usersFile = path.join(__dirname, "data", "users.json");
fs.ensureFileSync(usersFile);
if (!fs.existsSync(usersFile)) fs.writeJSONSync(usersFile, {});

// واجهة الموقع
app.use(express.static("public"));

// تسجيل الدخول / تسجيل الخروج
app.get("/auth/discord", passport.authenticate("discord"));
app.get("/auth/discord/callback", passport.authenticate("discord", { failureRedirect: "/" }), (req,res)=>res.redirect("/"));
app.get("/logout", (req,res)=>{
  req.logout(()=>{});
  res.redirect("/");
});

// بيانات المستخدم
app.get("/api/user", (req,res)=>{
  if(!req.user) return res.json({loggedIn:false});
  res.json({loggedIn:true, user:req.user});
});

// نقاط المستخدم
app.get("/api/points", async (req,res)=>{
  if(!req.user) return res.json({points:0});
  const db = await fs.readJSON(usersFile);
  const id = req.user.id;
  res.json({points: db[id]?.points || 0});
});

// اكسب نقاط (مهام 5 ثواني)
app.post("/api/earn", async (req,res)=>{
  if(!req.user) return res.status(401).end();
  const db = await fs.readJSON(usersFile);
  const id = req.user.id;
  if(!db[id]) db[id]={points:0,purchases:[]};
  db[id].points += 10; // نقاط رخيصة جدًا
  await fs.writeJSON(usersFile, db);
  res.json({ok:true, points: db[id].points});
});

// شراء خطة
app.post("/api/purchase", async (req,res)=>{
  if(!req.user) return res.status(401).end();
  const {type, lang, price} = req.body;
  const db = await fs.readJSON(usersFile);
  const id = req.user.id;
  if(!db[id]) db[id]={points:0,purchases:[]};

  if(db[id].points < price) return res.json({ok:false, msg:"رصيدك غير كافٍ"});

  db[id].points -= price;
  db[id].purchases.push({type, lang, price, date:new Date().toISOString()});
  await fs.writeJSON(usersFile, db);
  res.json({ok:true, points:db[id].points});
});

app.get("/api/purchases", async (req,res)=>{
  if(!req.user) return res.status(401).end();
  const db = await fs.readJSON(usersFile);
  const id = req.user.id;
  res.json({purchases: db[id]?.purchases || []});
});

// تشغيل السيرفر
app.listen(8080, ()=>console.log("✅ Welder Hosting Server running on port 8080"));
