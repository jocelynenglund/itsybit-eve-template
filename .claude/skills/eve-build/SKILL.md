---
name: eve-build
description: Build an EVE app from its refined plan, slice by slice and test-first, following sample/todo. Use when the person says "start building", "build it", or "build the app" after planning with the Event Book.
---

# Build the app

0. **Only refined plans.** If any slice in `plan/model.json` has `refined: false`, list those slices by name, say they need a tick in the book first, and stop.
1. **Set up `app/`** (only if it doesn't exist yet): copy `sample/todo/app/lib/` (store.js, gwt.mjs), `package.json`, `index.html`, `main.js` and `style.css` from `sample/todo/app/`. Change the title, the store key (`createStore("<app-id>")`) and the page content to this app. Delete the sample's slices from `main.js`.
2. **Only what isn't built.** Run `node eve/test.mjs` first. Leave slices whose scenarios all pass alone (only touch them to keep them green). Build the rest, plus the new scenarios of slices that changed.
3. **Order:** commands in the order of the events they produce (the order of `events` in the plan), then views, then automations.
4. **For each slice:**
   1. Make `app/slices/<slice id>/`. Write `<slice id>.test.mjs` with one test for every planned scenario, **same titles**, using `command(...)` or `view(...)` from `../../lib/gwt.mjs` (see `sample/todo/app/slices/*/*.test.mjs`). Fill in realistic example data.
   2. Write `decide.js` (or `project.js`) with the function body `throw new Error("not built yet")`. Run `node eve/test.mjs`. **Before writing any real code, read its output:** every scenario of this slice must be listed under `Failing:` marked `(not built yet)`. If one passes or fails for another reason, fix the test first. Say in one line that you saw them fail (e.g. "AddHabit: 4 failing, not built yet").
   3. Implement it until `node eve/test.mjs` shows this slice's scenarios passing. Keep `decide`/`project` pure.
   4. Wire it into `app/main.js` and `app/index.html` (a form or button for a command, a rendered list or panel for a view).
   5. If the folder is a git repo, commit this slice on its own: "Build <slice name>". One commit per slice, so each step can be undone.
5. **If a scenario looks wrong or impossible**, don't change it. Add an `ai` comment on it in `plan/model.json` (with `scenarioId`) explaining the problem and the choice they have, tell them to look at the book, and carry on with other slices. Their answer comes back as a feedback round (eve-refine). Then continue.
6. **The book shows the build:** the Event Book reads `plan/built.json` and turns each scenario green when its test passes, so run `node eve/test.mjs` after each slice.
7. **Finish:** `node eve/test.mjs` must report every planned scenario passing. Make sure `node eve/serve.mjs` is running. Then tell them: open http://localhost:4747/app/ to use the app, and http://localhost:4747 to see every scenario green. Mention anything you left out.
