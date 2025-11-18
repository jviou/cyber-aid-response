// server.js – petit serveur Express pour servir le build Vite

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Servir les fichiers statiques générés par Vite (copiés dans ./public)
app.use(express.static(path.join(__dirname, "public")));

// Fallback SPA : toutes les routes renvoient index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Crisis Labs front listening on http://localhost:${port}`);
});
