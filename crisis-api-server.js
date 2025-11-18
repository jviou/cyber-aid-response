// crisis-api-server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 4000;
const STATE_FILE = path.join(__dirname, "crisis-state.json");

app.use(cors()); // autorise tous les front (IP:8080, localhost, etc.)
app.use(express.json({ limit: "1mb" }));

function loadAllSessions() {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return { sessions: {} };
  }
}

function saveAllSessions(data) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2), "utf8");
}

// GET /api/state?sessionId=xxx
app.get("/api/state", (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  const all = loadAllSessions();
  const state = all.sessions[sessionId] || null;
  res.json({ state });
});

// POST /api/state  { sessionId, state }
app.post("/api/state", (req, res) => {
  const { sessionId, state } = req.body;
  if (!sessionId || !state) {
    return res.status(400).json({ error: "sessionId and state are required" });
  }

  const all = loadAllSessions();
  all.sessions[sessionId] = state;
  saveAllSessions(all);

  res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Crisis API server listening on http://0.0.0.0:${PORT}`);
});
