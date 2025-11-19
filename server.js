// server.js – minimalist static file server without external dependencies
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const indexFile = path.join(publicDir, "index.html");
const port = Number(process.env.PORT || 8080);

const MIME_TYPES = {
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript",
  ".json": "application/json",
  ".map": "application/json",
  ".manifest": "application/manifest+json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = http.createServer(async (req, res) => {
  if (!req?.url) {
    res.writeHead(400);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    let filePath = safeResolve(publicDir, url.pathname);

    if (filePath) {
      let stats = await tryStat(filePath);
      if (stats?.isDirectory()) {
        filePath = path.join(filePath, "index.html");
        stats = await tryStat(filePath);
      }

      if (stats?.isFile()) {
        return streamFile(res, filePath, req.method === "HEAD");
      }
    }

    return streamFile(res, indexFile, req.method === "HEAD");
  } catch (error) {
    console.error("Static server error", error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    }
    res.end("Internal server error");
  }
});

function safeResolve(baseDir, requestPath) {
  const decoded = decodeURIComponent(requestPath);
  const resolved = path.resolve(baseDir, "." + decoded);
  if (!resolved.startsWith(baseDir)) {
    return null;
  }
  return resolved;
}

async function tryStat(targetPath) {
  try {
    return await fs.promises.stat(targetPath);
  } catch {
    return null;
  }
}

function streamFile(res, filePath, headOnly = false) {
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  if (headOnly) {
    res.writeHead(200, { "Content-Type": contentType });
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);

  stream.on("open", () => {
    res.writeHead(200, { "Content-Type": contentType });
    stream.pipe(res);
  });

  stream.on("error", (error) => {
    console.error("File stream error", error);
    if (!res.headersSent) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    }
    res.end("Not found");
  });
}

server.listen(port, "0.0.0.0", () => {
  console.log(`Crisis Labs front listening on http://0.0.0.0:${port}`);
});
