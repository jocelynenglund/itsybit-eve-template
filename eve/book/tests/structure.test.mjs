// The Event Book's shape, checked: views are pure and each feeds one component; components only draw;
// screens only compose; every view and component is used on a screen.
// Run: node --test eve/book   (nothing to install)
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = p => fs.readFileSync(path.join(dir, p), "utf8");
const list = d => fs.readdirSync(path.join(dir, d)).map(f => d + "/" + f);
const imports = src => [...src.matchAll(/^import .* from "([^"]+)";/gm)].map(m => m[1]);
const views = list("views"), parts = list("parts"), screens = list("screens");
const PURE = ["replay.js", "facts.js", "threads.js", "html.js", ...views, ...parts];

test("views, components, the replay and the facts touch no page, storage, network, clock or chance", () => {
  for (const f of PURE) assert.doesNotMatch(read(f).replace(/\/\/.*$/gm, ""), /\b(document|window|localStorage|sessionStorage|fetch|location|Date\.now|new Date|Math\.random)\b/, f);
});

test("a view is named after its file and reads only the book's facts", () => {
  for (const f of views) {
    const name = path.basename(f, ".read.js");
    assert.match(f, /\.read\.js$/, f);
    assert.match(read(f), new RegExp(`export function ${name}\\(`), `${f} exports ${name}`);
    for (const i of imports(read(f))) assert.ok(["../facts.js", "../threads.js"].includes(i), `${f} imports ${i}`);
  }
});

test("components import nothing but the HTML escape", () => {
  for (const f of parts) {
    assert.match(f, /\.parts\.js$/, f);
    for (const i of imports(read(f))) assert.equal(i, "../html.js", `${f} imports ${i}`);
  }
});

test("screens only compose views into components: no store, no state, no controls of their own", () => {
  for (const f of screens) {
    const src = read(f);
    for (const i of imports(src)) assert.match(i, /^\.\.\/(views\/\w+\.read\.js|parts\/\w+\.parts\.js)$/, `${f} imports ${i}`);
    assert.doesNotMatch(src, /<(button|input|select|textarea|form)\b|data-act=/, `${f} draws a control itself`);
  }
});

// Component(view(…)) pairs in the screens.
const pairs = screens.flatMap(f => [...read(f).matchAll(/\b([A-Z]\w+)\((\w+)\(/g)].map(m => ({ comp: m[1], view: m[2], f })));
const viewNames = views.map(f => path.basename(f, ".read.js"));

test("each view feeds exactly one component, on a screen", () => {
  for (const v of viewNames) {
    const used = pairs.filter(p => p.view === v);
    assert.equal(used.length, 1, `${v} is drawn by ${used.length} components (${used.map(p => p.comp).join(", ") || "none: delete it or use it"})`);
  }
});

test("each component draws from one view, and every component is used", () => {
  const exported = parts.flatMap(f => [...read(f).matchAll(/^export const (\w+)/gm)].map(m => ({ name: m[1], f })));
  const screensSrc = screens.map(read).join("\n");
  for (const { name, f } of exported) {
    const views_ = new Set(pairs.filter(p => p.comp === name).map(p => p.view));
    assert.ok(views_.size <= 1, `${name} draws from ${[...views_].join(", ")}`);
    const onScreen = new RegExp(`\\b${name}\\(`).test(screensSrc);
    const asItem = (read(f).match(new RegExp(`\\b${name}\\b`, "g")) || []).length > 1; // defined, and drawn by another part
    assert.ok(onScreen || asItem, `${name} is never drawn: delete it or put it on a screen`);
  }
});
