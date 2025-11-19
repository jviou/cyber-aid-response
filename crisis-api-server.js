import http from "http";
import { promises as fsp } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 4000);
const STATE_DIR = process.env.CRISIS_STATE_DIR || path.join(__dirname, "state-data");

await ensureStateDir();

const server = http.createServer(async (req, res) => {
  if (!req?.url || !req?.method) {
    return sendJson(res, 400, { error: "Invalid request" });
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    sendOptions(res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, { status: "ok" });
  }

  try {
    if (req.method === "GET" && url.pathname === "/api/state") {
      const sessionId = url.searchParams.get("sessionId");
      if (!sessionId) {
        return sendJson(res, 400, { error: "sessionId is required" });
      }
      const state = await readState(sessionId);
      return sendJson(res, 200, { state });
    }

    if (req.method === "POST" && url.pathname === "/api/state") {
      const body = await readJsonBody(req);
      const sessionId = body?.sessionId;
      const state = body?.state;
      if (!sessionId || typeof state === "undefined") {
        return sendJson(res, 400, { error: "sessionId and state are required" });
      }
      await writeState(sessionId, state);
      return sendJson(res, 200, { success: true });
    }

    if (req.method === "DELETE" && url.pathname.startsWith("/api/state/")) {
      const sessionId = decodeURIComponent(url.pathname.replace("/api/state/", ""));
      if (!sessionId) {
        return sendJson(res, 400, { error: "sessionId is required" });
      }
      await deleteState(sessionId);
      return sendJson(res, 200, { success: true });
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    console.error("API error", error);
    sendJson(res, 500, { error: "Internal server error" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Crisis API server listening on http://0.0.0.0:${PORT}`);
});

async function ensureStateDir() {
  await fsp.mkdir(STATE_DIR, { recursive: true });
}

function getSessionFilePath(sessionId) {
  const safeId = sessionId.replace(/[^a-zA-Z0-9-_]/g, "_");
  return path.join(STATE_DIR, `${safeId}.json`);
}

async function readState(sessionId) {
  const filePath = getSessionFilePath(sessionId);
  try {
    const raw = await fsp.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function writeState(sessionId, state) {
  const filePath = getSessionFilePath(sessionId);
  await fsp.writeFile(filePath, JSON.stringify(state, null, 2), "utf8");
}

async function deleteState(sessionId) {
  const filePath = getSessionFilePath(sessionId);
  try {
    await fsp.unlink(filePath);
  } catch (error) {
    if (!error || typeof error !== "object" || !("code" in error) || error.code !== "ENOENT") {
      throw error;
    }
  }
}

function readJsonBody(req) {
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

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

function sendOptions(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end();
}
