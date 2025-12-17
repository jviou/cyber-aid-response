import express from "express";
import http from "http";
import fs from "fs";
import { promises as fsp } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 8080); // Default to 8080 in monolith

// Storage configuration
const STATE_DIR = process.env.CRISIS_STATE_DIR || __dirname;
const STATE_FILE_NAME = process.env.CRISIS_STATE_FILE || "session-v2.json";
const STATE_FILE = path.join(STATE_DIR, STATE_FILE_NAME);

// --- DEFAULT STATE ---
const DEFAULT_STATE = {
  meta: {
    title: "Nouvelle Session de Crise",
    mode: "exercise",
    severity: "Modérée",
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  contacts: [],
  journal: [],
  actions: [],
  decisions: [],
  communications: [],
  phases: [
    {
      "id": "P1",
      "title": "PHASE 1",
      "subtitle": "Alerter et endiguer - Mobiliser",
      "notes": "",
      "checklist": {
        "strategic": [
          { "id": "p1s1", "text": "Mobiliser la cellule de crise", "status": "todo" },
          { "id": "p1s2", "text": "Prise en compte de la fiche réflexe et 1ère action effectuée", "status": "todo" },
          { "id": "p1s3", "text": "État des lieux", "status": "todo" },
          { "id": "p1s4", "text": "Suivi des actions", "status": "todo" }
        ],
        "operational": [
          { "id": "p1o1", "text": "Prévenir prestataires sécurité", "status": "todo" },
          { "id": "p1o2", "text": "Fiche réflexe CYBER", "status": "todo" },
          { "id": "p1o3", "text": "Suivi des actions", "status": "todo" }
        ]
      },
      "injects": []
    },
    {
      "id": "P2",
      "title": "PHASE 2",
      "subtitle": "Comprendre l'attaque - Maintenir la confiance",
      "notes": "",
      "checklist": {
        "strategic": [
          { "id": "p2s1", "text": "Communication externe", "status": "todo" },
          { "id": "p2s2", "text": "Arbitrage applicatifs métiers", "status": "todo" },
          { "id": "p2s3", "text": "Mise en place du mode dégradé", "status": "todo" }
        ],
        "operational": [
          { "id": "p2o1", "text": "Identification de l'attaque", "status": "todo" },
          { "id": "p2o2", "text": "Vérification des sauvegardes saines", "status": "todo" },
          { "id": "p2o3", "text": "Solutions de contournement pour applications critiques", "status": "todo" }
        ]
      },
      "injects": []
    },
    {
      "id": "P3",
      "title": "PHASE 3",
      "subtitle": "Durcir et surveiller - Relancer les activités",
      "notes": "",
      "checklist": {
        "strategic": [
          { "id": "p3s1", "text": "Déclenchement du PRA", "status": "todo" },
          { "id": "p3s2", "text": "Prioriser les applications et services critiques à relancer", "status": "todo" },
          { "id": "p3s3", "text": "Validation de sortie de crise", "status": "todo" }
        ],
        "operational": [
          { "id": "p3o1", "text": "Activation du PRI", "status": "todo" },
          { "id": "p3o2", "text": "Reconstruction de l'infra", "status": "todo" },
          { "id": "p3o3", "text": "Évaluation des « dégâts »", "status": "todo" },
          { "id": "p3o4", "text": "Test pour validation sortie de crise", "status": "todo" }
        ]
      },
      "injects": []
    },
    {
      "id": "P4",
      "title": "PHASE 4",
      "subtitle": "Capitaliser - Tirer les leçons de la crise",
      "notes": "",
      "checklist": {
        "strategic": [
          { "id": "p4s1", "text": "Communiquer sur la sortie de crise", "status": "todo" },
          { "id": "p4s2", "text": "Plan d'action sur les tâches à mener", "status": "todo" },
          { "id": "p4s3", "text": "Retour d'expérience", "status": "todo" },
          { "id": "p4s4", "text": "Formation et sensibilisation utilisateur", "status": "todo" }
        ],
        "operational": []
      },
      "injects": []
    }
  ]
};

// State in memory
let currentSession = null;

// Ensure state dir and load session
await ensureStateDir();
await loadSession();

// --- Express App Setup ------------------------------------------------

const app = express();
const server = http.createServer(app);

// Serve static files from 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// JSON body parser for API
app.use(express.json());

// API Endpoints
app.get("/api/state", (req, res) => {
  const state = currentSession || DEFAULT_STATE;
  res.json({ state });
});

app.get("/api/export", (req, res) => {
  const state = currentSession || DEFAULT_STATE;
  res.setHeader("Content-Disposition", `attachment; filename="crisis-session-${new Date().toISOString()}.json"`);
  res.json(state);
});

// Health Check for Docker
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity in local monolithic mode
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send current state
  socket.emit("state-update", currentSession || DEFAULT_STATE);

  // Handle updates
  socket.on("client-update", async (newState) => {
    currentSession = newState;

    // Ensure meta exists and increment version
    if (!currentSession.meta) currentSession.meta = { ...DEFAULT_STATE.meta };
    const currentVersion = currentSession.meta.version || 0;
    currentSession.meta.version = currentVersion + 1;
    currentSession.meta.updatedAt = new Date().toISOString();

    await saveSession();
    io.emit("state-update", currentSession);
  });

  // Handle reset
  socket.on("reset-session", async () => {
    console.log("Resetting session requested by", socket.id);
    currentSession = JSON.parse(JSON.stringify(DEFAULT_STATE));
    currentSession.meta.createdAt = new Date().toISOString();
    currentSession.meta.updatedAt = new Date().toISOString();

    await saveSession();
    io.emit("state-update", currentSession);
  });

  // Handle import
  socket.on("import-state", async (importedState) => {
    console.log("Importing state from", socket.id);
    currentSession = importedState;
    if (!currentSession.meta) currentSession.meta = {};
    currentSession.meta.version = (currentSession.meta.version || 0) + 1;

    await saveSession();
    io.emit("state-update", currentSession);
  });
});

// Catch-all handler for SPA (Must be last)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Monolithic Server listening on http://0.0.0.0:${PORT}`);
});

// --- Persistence Functions ------------------------------------------------

async function ensureStateDir() {
  await fsp.mkdir(STATE_DIR, { recursive: true });
}

async function loadSession() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = await fsp.readFile(STATE_FILE, "utf8");
      const loaded = JSON.parse(raw);

      // Deep Validation
      let isValid = true;
      if (!loaded || !loaded.meta) isValid = false;
      if (!Array.isArray(loaded.phases)) isValid = false;
      if (isValid && loaded.phases.length > 0) {
        if (!loaded.phases[0].checklist) isValid = false;
      }

      if (!isValid) {
        console.warn("Loaded session invalid. Resetting to default.");
        currentSession = JSON.parse(JSON.stringify(DEFAULT_STATE));
        await saveSession();
      } else {
        currentSession = loaded;
        const rootArrays = ['contacts', 'journal', 'actions', 'decisions', 'communications'];
        for (const key of rootArrays) {
          if (!Array.isArray(currentSession[key])) currentSession[key] = [];
        }
        console.log("Session loaded.");
      }
    } else {
      console.log("No session file. Starting default.");
      currentSession = JSON.parse(JSON.stringify(DEFAULT_STATE));
      await saveSession();
    }
  } catch (err) {
    console.error("Error loading session:", err);
    currentSession = JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

async function saveSession() {
  if (!currentSession) return;
  try {
    await fsp.writeFile(STATE_FILE, JSON.stringify(currentSession, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving session:", err);
  }
}
