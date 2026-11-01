#!/usr/bin/env node
// Serve the Event Book and the app, and save feedback from the book.
//   node eve/serve.mjs              (this folder's plan/ and app/)
//   node eve/serve.mjs sample/todo  (the sample)
// Then open http://localhost:4747 for the book and http://localhost:4747/app/ for the app.
// No packages needed: Node 18 or newer.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const eveDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] || ".");
const port = Number(process.env.PORT || 4747);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8"
};

function send(res, code, body, type = "text/plain; charset=utf-8") {
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

function serveFile(res, base, rel) {
  const file = path.resolve(base, "." + rel);
  if (file !== base && !file.startsWith(base + path.sep)) return send(res, 403, "Forbidden");
  let target = file;
  try {
    if (fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
    const body = fs.readFileSync(target);
    send(res, 200, body, types[path.extname(target)] || "application/octet-stream");
  } catch {
    send(res, 404, "Not found: " + rel);
  }
}

function saveFeedback(req, res) {
  let body = "";
  req.on("data", chunk => {
    body += chunk;
    if (body.length > 2_000_000) { send(res, 413, "Too large"); req.destroy(); }
  });
  req.on("end", () => {
    let data;
    try { data = JSON.parse(body); } catch { return send(res, 400, "That isn't JSON."); }
    const dir = path.join(root, "plan", "feedback");
    fs.mkdirSync(dir, { recursive: true });
    const round = Number.isInteger(data.round) ? data.round : 1;
    let name = `round-${round}.json`, n = 2;
    while (fs.existsSync(path.join(dir, name))) name = `round-${round}-${n++}.json`;
    fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2) + "\n");
    const saved = path.relative(root, path.join(dir, name)).split(path.sep).join("/");
    console.log(`Feedback saved: ${saved}. Tell your AI "done with feedback".`);
    send(res, 200, JSON.stringify({ saved }), types[".json"]);
  });
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const p = decodeURIComponent(url.pathname);
  if (req.method === "POST" && p === "/api/feedback") return saveFeedback(req, res);
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method not allowed");
  if (p === "/") { res.writeHead(302, { Location: "/eve/book.html" }); return res.end(); }
  if (p.startsWith("/eve/")) return serveFile(res, eveDir, p.slice(4));
  return serveFile(res, root, p);
}).on("error", err => {
  if (err.code !== "EADDRINUSE") throw err;
  console.log(`Port ${port} is already in use. If that's this Event Book, it's already running: http://localhost:${port}`);
  console.log(`To run another one, pick a port: PORT=4748 node eve/serve.mjs`);
  process.exit(0);
}).listen(port, "127.0.0.1", () => {
  console.log(`Event Book: http://localhost:${port}`);
  console.log(`The app:    http://localhost:${port}/app/`);
  console.log(`Serving ${path.relative(process.cwd(), root) || "."} (stop with Ctrl+C)`);
});
