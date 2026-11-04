#!/usr/bin/env node
// Make a fresh copy of the template the person's own: run once, at the first plan.
//   node eve/init.mjs "Stockbox" "Keep track of the boxes I put into storage."
// Writes README.md about their app, and removes what only the template itself needs at the top level
// (its website page, its GitHub Pages workflow and its licence; EVE's licence stays in eve/LICENSE).
// Only removes files it recognises as the template's own. Does nothing once the app has a plan.
// eve/update.mjs uses makeItYours() too, to tidy copies made before this existed.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const isTemplateReadme = text => /^# (ItsyBIT EVE Template|itsybit EVE)\b/.test(text || "");

export function makeItYours(root, name = "My app", idea = "") {
  const at = p => path.join(root, p);
  const read = p => { try { return fs.readFileSync(at(p), "utf8"); } catch { return null; } };
  const done = [];
  const readme = `# ${name}

${idea ? idea + "\n\n" : ""}Built with the [ItsyBIT EVE Template](https://github.com/jocelynenglund/itsybit-eve-template): planned in an Event Book, built test-first.

## See it

Run \`node eve/serve.mjs\` (Node 18 or newer), then open:

- **The app:** http://localhost:4747/app/ (or the Event Book's App tab)
- **The plan (Event Book):** http://localhost:4747

## What's where

| | |
|---|---|
| \`app/\` | the app |
| \`plan/\` | its plan, your feedback rounds and the test results |
| \`design/\` | its design, once you've said "make it beautiful" |
| \`eve/\` | EVE itself. Tell your AI **update EVE** to get a newer one; it never touches the rest. |
`;
  if (read("README.md") === null || isTemplateReadme(read("README.md"))) { fs.writeFileSync(at("README.md"), readme); done.push("wrote README.md about your app"); }
  // The template's own top-level files, removed only when they're recognisably the template's.
  const own = {
    "LICENSE": t => t === read("eve/LICENSE"),
    ".nojekyll": t => t.trim() === "",
    "index.html": t => /<title>(ItsyBIT EVE Template|itsybit EVE)<\/title>/.test(t),
    ".github/workflows/pages.yml": t => t.includes("itsybit-eve-template"),
  };
  for (const [p, ours] of Object.entries(own)) {
    const t = read(p);
    if (t !== null && ours(t)) { fs.rmSync(at(p)); done.push(`removed ${p} (the template's own)`); }
  }
  for (const d of [".github/workflows", ".github"]) if (fs.existsSync(at(d)) && fs.readdirSync(at(d)).length === 0) fs.rmdirSync(at(d));
  return done;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  if (fs.existsSync(path.join(root, "plan/model.json"))) {
    console.log("This app already has a plan, so it's already yours. Nothing to do.");
  } else {
    const [name, idea] = process.argv.slice(2);
    const done = makeItYours(root, name, idea);
    console.log(done.length ? `Made it yours: ${done.join("; ")}. EVE's licence stays in eve/LICENSE.` : "Nothing to change: it's already yours.");
  }
}
