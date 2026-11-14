// Shared plumbing for EVE's browser tests: a scratch copy of the sample, eve/serve.mjs on a free port, one browser.
// For EVE's maintainers only: `cd eve/dev && npm install && npm test`.
import { before, after } from "node:test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
export const EVE = path.resolve(here, "..");
const SAMPLE = path.join(EVE, "sample", "todo");

// A scratch copy of the sample. "built": as shipped (every slice refined, every scenario passes).
// "planning": nothing refined or built yet. edit(model) can change the plan further.
export function fixture(kind = "built", edit) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "eve-book-"));
  fs.cpSync(path.join(SAMPLE, "plan"), path.join(dir, "plan"), { recursive: true });
  fs.cpSync(path.join(SAMPLE, "app"), path.join(dir, "app"), { recursive: true });
  const file = path.join(dir, "plan", "model.json");
  const model = JSON.parse(fs.readFileSync(file, "utf8"));
  if (kind === "planning") {
    for (const s of model.slices) s.refined = false;
    fs.rmSync(path.join(dir, "plan", "built.json"), { force: true });
    fs.rmSync(path.join(dir, "app"), { recursive: true, force: true });
  }
  if (edit) edit(model);
  fs.writeFileSync(file, JSON.stringify(model, null, 2));
  return dir;
}

function serve(root) {
  return new Promise((resolve, reject) => {
    const port = 20000 + Math.floor(Math.random() * 20000);
    const p = spawn(process.execPath, [path.join(EVE, "serve.mjs"), root], { env: { ...process.env, PORT: String(port) } });
    let out = "";
    p.stdout.on("data", d => { out += d; if (out.includes("Event Book:")) resolve({ url: `http://localhost:${port}/`, stop: () => p.kill() }); if (out.includes("already in use")) reject(new Error("port in use")); });
    p.on("error", reject);
  });
}

let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser?.close(); });

export const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
export const DESK = { viewport: { width: 1280, height: 900 } };

// Open the book on a fixture. Returns { page, dir, url, errors, close, … helpers }.
export async function open(t, { kind = "built", edit, device = DESK, dir } = {}) {
  dir = dir || fixture(kind, edit);
  const srv = await serve(dir);
  const ctx = await browser.newContext(device);
  // Stay offline: no fonts, no "is there a newer EVE" check.
  await ctx.route(/^https:\/\/(fonts\.|api\.github\.com|raw\.githubusercontent\.com)/, r => r.abort());
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(srv.url);
  await page.waitForSelector("header.top, .empty");
  const close = async () => { await ctx.close(); srv.stop(); fs.rmSync(dir, { recursive: true, force: true }); };
  t.after(close);
  const ids = () => page.$$eval("article.slice", a => a.map(x => x.id.replace("slice-", "")));
  const bar = async () => (await page.textContent(".bar")).replace(/\s+/g, " ").trim();
  const draft = () => page.evaluate(() => Object.entries(localStorage).filter(([k]) => k.startsWith("eve-feedback:")).flatMap(([, v]) => JSON.parse(v).events));
  return { page, dir, url: srv.url, errors, ids, bar, draft, settle: (ms = 150) => page.waitForTimeout(ms) };
}
