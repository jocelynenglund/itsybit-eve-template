#!/usr/bin/env node
// Turn the plan into a design brief that any design tool can take: the screens, what someone can do
// and see on each, the messages they can get, and example content from the scenarios.
//   node eve/brief.mjs              writes plan/design-brief.md
//   node eve/brief.mjs sample/todo  the same for the sample

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] || ".");
const planPath = path.join(root, "plan", "model.json");
if (!fs.existsSync(planPath)) { console.error(`No plan yet (${path.relative(process.cwd(), planPath)}). Plan the app first.`); process.exit(1); }
const model = JSON.parse(fs.readFileSync(planPath, "utf8"));

// "AddTodo" → "Add todo", "boxId" → "box id"
const words = s => String(s).replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ").toLowerCase().replace(/^./, c => c.toUpperCase());
const isId = f => /(^id$|Id$|_id$)/.test(f);
const slices = model.slices || [];
const eventFields = new Map((model.events || []).map(e => [e.name, e.fields || []]));
const chapters = [...new Set([...(model.chapters || []).map(c => c.name), ...slices.map(s => s.chapter || "Other")])];

const out = [];
out.push(`# Design brief: ${model.app || "my app"}`, "");
if (model.idea) out.push(`> ${model.idea}`, "");
out.push(
  "## For the designer",
  "",
  "This app already works: it was planned as an event model and built test-first. Design how it looks and feels, not what it does.",
  "",
  "- Keep every action, every field someone fills in and every message listed below. Name things the way this brief does; you may shorten labels.",
  "- One screen per section below is a good start. Combine or split them if it reads better, but keep everything reachable.",
  "- Mobile first, and it must also work on a laptop. Readable contrast, visible focus, big enough tap targets.",
  "- Show the messages where they happen (next to the action that was refused), in the person's own words as written here.",
  "- Use the example content below so the screens look real.",
  "- **Deliver:** a style guide (colours, fonts, spacing, the look of buttons, inputs, lists and messages) and the screens, as plain HTML and CSS if your tool can export it, otherwise as images.",
  ""
);

for (const ch of chapters) {
  const list = slices.filter(s => (s.chapter || "Other") === ch);
  if (!list.length) continue;
  out.push(`## Screen: ${ch}`, "");
  const cmds = list.filter(s => s.type !== "view" && s.type !== "automation");
  const views = list.filter(s => s.type === "view");
  const autos = list.filter(s => s.type === "automation");
  if (cmds.length) {
    out.push("**What someone can do here**", "");
    for (const s of cmds) {
      const inputs = (s.fields || []).filter(f => !isId(f)).map(words);
      // An id is picked from the screen when the events this command needs already carry it; otherwise the app makes it.
      const happy = (s.scenarios || []).find(sc => sc.then && sc.then.events) || {};
      const known = new Set((happy.given || []).flatMap(g => (eventFields.get(g.type) || [])));
      const picked = (s.fields || []).filter(f => isId(f) && known.has(f)).map(f => words(f.replace(/_?[Ii]d$/, "")).toLowerCase()).filter(Boolean);
      let line = `- **${words(s.name)}**`;
      if (inputs.length) line += `: fills in ${inputs.map(f => f.toLowerCase()).join(", ")}`;
      if (picked.length) line += `${inputs.length ? "," : ":"} on a ${picked.join(" and ")} they pick from the screen`;
      out.push(line + ".");
      if (s.description) out.push(`  ${s.description}`);
      const refusals = (s.scenarios || []).map(sc => sc.then && sc.then.rejected).filter(Boolean);
      if (refusals.length) out.push(`  Messages when it can't be done: ${refusals.map(r => `"${r}"`).join(", ")}.`);
    }
    out.push("");
  }
  if (views.length) {
    out.push("**What they see**", "");
    for (const s of views) {
      const shows = (s.fields || []).filter(f => !isId(f)).map(f => words(f).toLowerCase());
      out.push(`- **${words(s.name)}**${shows.length ? `: shows ${shows.join(", ")}` : ""}.`);
      if (s.description) out.push(`  ${s.description}`);
      for (const sc of s.scenarios || []) if (sc.then && sc.then.value) out.push(`  - ${sc.title}: ${sc.then.value}`);
    }
    out.push("");
  }
  if (autos.length) {
    out.push("**Happens by itself** (show its result, there's no button)", "");
    for (const s of autos) out.push(`- **${words(s.name)}**${s.description ? `: ${s.description}` : ""}`);
    out.push("");
  }
}

if ((model.events || []).length) {
  out.push("## The story, in the order things usually happen", "", (model.events || []).map(e => words(e.name)).join(" → "), "");
}

const file = path.join(root, "plan", "design-brief.md");
fs.writeFileSync(file, out.join("\n"));
console.log(`Wrote ${path.relative(process.cwd(), file) || file}`);
