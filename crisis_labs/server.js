import express from "express";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import Database from "better-sqlite3";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;

fs.mkdirSync("./data", { recursive: true });
fs.mkdirSync("./uploads", { recursive: true });
fs.mkdirSync("./public", { recursive: true });

// DB
const db = new Database("./data/db.sqlite");
db.pragma("journal_mode = WAL");
const initSql = fs.readFileSync("./init.sql","utf8"); db.exec(initSql);

// Web
const app = express();
const httpServer = createServer(app);
const io = new IOServer(httpServer, { cors: { origin: "*" } });

app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static("uploads"));
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

// KV store très simple pour l'état global (remplace Supabase)
app.get("/api/app-state/global", (req,res)=>{
  const row = db.prepare("SELECT v FROM kv WHERE k='state'").get();
  res.json(row ? JSON.parse(row.v) : {});
});
app.put("/api/app-state/global", (req,res)=>{
  const payload = JSON.stringify(req.body||{});
  db.prepare("INSERT INTO kv(k,v) VALUES('state',?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").run(payload);
  io.emit("state:updated");
  res.json({ok:true});
});

// Fallback SPA (évite Cannot GET /dashboard)
app.get("*", (req,res)=>{
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

httpServer.listen(PORT, ()=> console.log(`OK  http://localhost:${PORT}`));
