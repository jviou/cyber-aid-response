import http from "http";
import fs from "fs";
import { promises as fsp } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 4000);

// Dossier et fichier de stockage
const STATE_DIR = process.env.CRISIS_STATE_DIR || __dirname;
const STATE_FILE_NAME = process.env.CRISIS_STATE_FILE || "crisis-state.json";
const STATE_FILE = path.join(STATE_DIR, STATE_FILE_NAME);

// S'assure que le répertoire et le fichier existent
await ensureStateDir();

// --- Serveur HTTP principal --------------------------------------------------

const server = http.createServer(async (req, res) => {
  if (!req?.url || !req?.method) {
    return sendJson(res, 400, { error: "Invalid request" });
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    sendOptions(res);
    return;
  }

  try {
    // Récupérer l'état d'une session
    if (req.method === "GET" && url.pathname === "/api/state") {
      const sessionId = url.searchParams.get("sessionId");
      if (!sessionId) {
        return sendJson(res, 400, { error: "sessionId is required" });
      }
      const state = await readState(sessionId);
      return sendJson(res, 200, { state });
    }

    // Enregistrer / mettre à jour l'état d'une session
    if (req.method === "POST" && url.pathname === "/api/state") {
      const body = await readJsonBody(req);
      const sessionId = body?.sessionId;
      const state = body?.state;

      if (!sessionId || typeof state === "undefined") {
        return sendJson(res, 400, { error: "sessionId and state are required" });
      }

      await writeState(sessionId, state);
      return sendJson(res, 200, { ok: true });
    }

    // Supprimer l'état d'une session
    if (req.method === "DELETE" && url.pathname.startsWith("/api/state/")) {
      const sessionId = decodeURIComponent(
        url.pathname.replace("/api/state/", "")
      );
      if (!sessionId) {
        return sendJson(res, 400, { error: "sessionId is required" });
      }
      await deleteState(sessionId);
      return sendJson(res, 200, { ok: true });
    }

    // Route inconnue
    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    console.error("API error", error);
    sendJson(res, 500, { error: "Internal server error" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Crisis API server listening on http://0.0.0.0:${PORT}`);
});

// --- Fonctions de persistance ------------------------------------------------

async function ensureStateDir() {
  await fsp.mkdir(STATE_DIR, { recursive: true });

  if (!fs.existsSync(STATE_FILE)) {
    const initial = JSON.stringify({ sessions: {} }, null, 2);
    await fsp.writeFile(STATE_FILE, initial, "utf8");
  }
}

async function loadAllSessions() {
  try {
    const raw = await fsp.readFile(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return { sessions: {} };
    }

    if (!parsed.sessions || typeof parsed.sessions !== "object") {
      return { sessions: {} };
    }

    return parsed;
  } catch {
    return { sessions: {} };
  }
}

async function saveAllSessions(data) {
  await fsp.writeFile(STATE_FILE, JSON.stringify(data, null, 2), "utf8");
}

async function readState(sessionId: string) {
  const all = await loadAllSessions();
  return all.sessions?.[sessionId] || null;
}

async function writeState(sessionId: string, state: unknown) {
  const all = await loadAllSessions();
  all.sessions = all.sessions || {};
  all.sessions[sessionId] = state;
  await saveAllSessions(all);
}

async function deleteState(sessionId: string) {
  const all = await loadAllSessions();
  if (all.sessions?.[sessionId]) {
    delete all.sessions[sessionId];
    await saveAllSessions(all);
  }
}

// --- Utilitaires HTTP --------------------------------------------------------

function readJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function sendJson(
  res: http.ServerResponse,
  statusCode: number,
  payload: unknown
) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

function sendOptions(res: http.ServerResponse) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end();
}
