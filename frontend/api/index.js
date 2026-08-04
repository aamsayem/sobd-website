/**
 * Vercel serverless entry point for TanStack Start SSR (ESM version).
 *
 * TanStack Start's dist/server/server.js exports a Web-standard `fetch` handler.
 * This adapter bridges Vercel's Node.js (req, res) to the Web fetch API.
 */

import { createReadStream, existsSync, statSync } from "fs";
import { join, extname, resolve } from "path";
import { fileURLToPath } from "url";
import { Buffer } from "buffer";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const clientDir = resolve(__dirname, "../dist/client");

// Lazy-load the SSR server bundle once
let _serverPromise;
function getServer() {
  if (!_serverPromise) {
    _serverPromise = import("../dist/server/server.js");
  }
  return _serverPromise;
}

const MIME_TYPES = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".json": "application/json",
  ".map": "application/json",
};

/**
 * Try to serve a static file from dist/client. Returns true if served.
 */
function serveStatic(req, res) {
  const urlPath = req.url.split("?")[0];
  const filePath = join(clientDir, urlPath);

  // Security: prevent path traversal
  if (!filePath.startsWith(clientDir)) return false;

  try {
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const ext = extname(filePath).toLowerCase();
      res.setHeader("Content-Type", MIME_TYPES[ext] || "application/octet-stream");
      if (urlPath.startsWith("/assets/")) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
      createReadStream(filePath).pipe(res);
      return true;
    }
  } catch {
    // Fall through to SSR
  }
  return false;
}

/**
 * Convert Node.js IncomingMessage → Web Request
 */
async function nodeToWebRequest(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const url = `${proto}://${host}${req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => headers.append(key, v));
    } else {
      headers.set(key, value);
    }
  }

  const method = req.method || "GET";
  const hasBody = !["GET", "HEAD", "OPTIONS"].includes(method);

  let body;
  if (hasBody) {
    body = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => resolve(Buffer.concat(chunks)));
      req.on("error", reject);
    });
  }

  return new Request(url, { method, headers, body: hasBody ? body : undefined });
}

/**
 * Write Web Response → Node.js ServerResponse
 */
async function webResponseToNode(webRes, res) {
  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => res.setHeader(key, value));

  if (webRes.body) {
    const reader = webRes.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
}

/**
 * Main Vercel serverless handler
 */
export default async function handler(req, res) {
  try {
    // Serve static client assets directly (avoids SSR overhead for JS/CSS)
    if (serveStatic(req, res)) return;

    // All other requests → SSR
    const mod = await getServer();
    const server = mod.default;

    const webRequest = await nodeToWebRequest(req);
    const webResponse = await server.fetch(webRequest, process.env, {
      waitUntil: () => {},
      passThroughOnException: () => {},
    });
    await webResponseToNode(webResponse, res);
  } catch (err) {
    console.error("[SSR Error]", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
