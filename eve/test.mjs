#!/usr/bin/env node
// Run an EVE app's Given/When/Then tests and record what is built.
//   node eve/test.mjs            (the app in this folder: app/ and plan/)
//   node eve/test.mjs sample/todo
// Writes plan/built.json, which the Event Book reads to show what is built,
// and checks every scenario in plan/model.json has a passing test with the same title.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(process.argv[2] || ".");
const appDir = path.join(root, "app");
const planDir = path.join(root, "plan");
const builtDir = path.join(planDir, ".built");

function findTests(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return d.name === "node_modules" ? [] : findTests(p);
    return d.name.endsWith(".test.mjs") ? [p] : [];
  });
}

const model = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(planDir, "model.json"), "utf8")); } catch { return null; }
})();

const files = findTests(appDir);
fs.rmSync(builtDir, { recursive: true, force: true });

let status = 0;
if (files.length) {
  const run = spawnSync(process.execPath, ["--test", ...files.map(f => path.relative(root, f))], {
    cwd: root, stdio: "inherit", env: { ...process.env, EVE_BUILT_DIR: builtDir }
  });
  status = run.status ?? 1;
} else {
  console.log("No tests yet (looked for app/**/*.test.mjs).");
}

const scenarios = fs.existsSync(builtDir)
  ? fs.readdirSync(builtDir).flatMap(f => JSON.parse(fs.readFileSync(path.join(builtDir, f), "utf8")))
  : [];
fs.rmSync(builtDir, { recursive: true, force: true });

const byFile = new Map();
for (const s of scenarios) {
  const file = s.spec?.file || "";
  if (!byFile.has(file)) byFile.set(file, []);
  byFile.get(file).push(s);
}
const built = {
  app: model?.app || path.basename(root),
  createdAt: new Date().toISOString(),
  files: [...byFile].map(([file, list]) => ({ file, scenarios: list }))
};
fs.mkdirSync(planDir, { recursive: true });
fs.writeFileSync(path.join(planDir, "built.json"), JSON.stringify(built, null, 2) + "\n");

if (model) {
  const key = (slice, title) => `${slice}\u0000${title}`;
  const results = new Map(scenarios.map(s => [key(s.slice, s.title), s]));
  let passing = 0, total = 0;
  const missing = [], failing = [];
  for (const sl of model.slices || []) for (const sc of sl.scenarios || []) {
    total++;
    const r = results.get(key(sl.name, sc.title));
    if (!r) missing.push(`${sl.name}: ${sc.title}`);
    else if (!r.passing) failing.push(`${sl.name}: ${sc.title}`);
    else passing++;
  }
  console.log(`\nEVE: ${passing} of ${total} planned scenarios pass.`);
  if (failing.length) console.log("Failing:\n  " + failing.join("\n  "));
  if (missing.length) console.log("No test yet:\n  " + missing.join("\n  "));
  if (passing < total && status === 0) status = 1;
}
console.log(`Wrote ${path.relative(process.cwd(), path.join(planDir, "built.json")) || "plan/built.json"}`);
process.exit(status);
