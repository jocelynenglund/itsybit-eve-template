// The Event Book, end to end: what a person sees and does on each tab. These pin today's behaviour so the
// book's insides can change safely. For EVE's maintainers: `cd eve/dev && npm install && npm test`.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { open, PHONE } from "./helpers.mjs";

const newSlice = m => {
  m.events.push({ name: "TodoRenamed", fields: ["todoId", "title"] });
  m.slices.push({ id: "rename-todo", name: "RenameTodo", type: "command", chapter: "Todos", fields: ["todoId", "title"], produces: ["TodoRenamed"], refined: false,
    scenarios: [{ id: "rename-todo-1", title: "Renames a todo", given: [{ type: "TodoAdded" }], when: "RenameTodo", then: { events: [{ type: "TodoRenamed" }] } }] });
};

test("a built book: header, counts, and every passing scenario on one line", async t => {
  const b = await open(t);
  assert.match(await b.page.textContent("h1"), /Todo · Event Book/);
  const head = (await b.page.textContent("header.top")).replace(/\s+/g, " ");
  assert.match(head, /Round 3/);
  assert.match(head, /4 of 4 slices refined/);
  assert.match(head, /10 of 10 scenarios pass/);
  assert.match(head, /Open the app/);
  assert.match(await b.page.textContent("main"), /Built\.\s*Every planned scenario passes/);
  assert.deepEqual(await b.ids(), ["add-todo", "complete-todo", "remove-todo", "todo-list"]);
  assert.equal(await b.page.locator(".sc-row").count(), 10, "every scenario passes, so each is one line");
  assert.equal(await b.page.locator(".gwt").count(), 0);
  await b.page.click('.sc-row[data-key="add-todo/add-todo-2"]');
  assert.equal(await b.page.locator(".gwt").count(), 1, "tapping a line opens its Given/When/Then");
  assert.match(await b.page.textContent("#slice-add-todo"), /refused\s*“Title is required”/);
  assert.match(await b.bar(), /No feedback yet this round/);
  assert.equal(await b.page.title(), "Todo · Event Book");
  assert.deepEqual(b.errors, []);
});

test("tabs: Board draws the model, a sticky opens its slice in the book; App, Look and Export", async t => {
  const b = await open(t);
  await b.page.click("[data-mode=board]");
  assert.equal(await b.page.locator("button.sticky").count(), 4, "one sticky per slice");
  assert.equal(await b.page.locator(".sticky.event").count(), 3);
  assert.match(await b.page.textContent(".bch-name"), /Todos/);
  await b.page.waitForFunction(() => document.querySelectorAll("#arrows path").length >= 7);
  assert.match(await b.page.textContent("button.sticky.view"), /Todo List[\s\S]*built/);
  await b.page.reload(); await b.page.waitForSelector("header.top");
  assert.equal(await b.page.getAttribute("[data-mode=board]", "aria-pressed"), "true", "the Board tab is remembered");
  await b.page.click('button.sticky[data-slice="remove-todo"]');
  assert.equal(await b.page.getAttribute("[data-mode=book]", "aria-pressed"), "true");
  assert.ok(await b.page.locator("#slice-remove-todo").isVisible());

  await b.page.click("[data-mode=app]");
  await b.page.waitForSelector("iframe.appframe");
  assert.match(await b.page.getAttribute("iframe.appframe", "src"), /app\/$/);
  await b.page.click("[data-act=app-width][data-w=laptop]");
  assert.match(await b.page.getAttribute("iframe.appframe", "class"), /laptop/);

  await b.page.click("[data-mode=look]");
  assert.ok(await b.page.locator("form[data-form=look]").isVisible(), "with no look yet, Look opens on the form");
  await b.page.click("[data-mode=export]");
  assert.ok(await b.page.locator("[data-act=export-em]").isVisible());
  assert.deepEqual(b.errors, []);
});

test("App tab before anything is built says so", async t => {
  const b = await open(t, { kind: "planning" });
  await b.page.click("[data-mode=app]");
  await b.page.waitForSelector("text=Your app appears here once it's built");
  assert.deepEqual(b.errors, []);
});

test("planning: filters by state with counts, and search", async t => {
  const b = await open(t, { kind: "planning", edit: m => { m.slices[1].refined = true; } });
  const counts = await b.page.$$eval("[data-act=filter]", bs => bs.map(x => x.textContent.replace(/\s+/g, " ").trim()));
  assert.deepEqual(counts, ["All 4", "To refine 3", "Ready to build 1", "Built 0", "To try 0"]);
  await b.page.click("[data-act=filter][data-f=ready]");
  assert.deepEqual(await b.ids(), ["complete-todo"]);
  await b.page.click("[data-act=filter][data-f=built]");
  assert.deepEqual(await b.ids(), []);
  assert.match(await b.page.textContent("main"), /No slices here right now/);
  await b.page.click("[data-act=filter][data-f=all]");

  await b.page.click("#q");
  await b.page.keyboard.type("removed");
  assert.deepEqual(await b.ids(), ["remove-todo", "todo-list"], "matches events a view reads");
  assert.equal(await b.page.evaluate(() => document.activeElement.id), "q", "typing keeps the cursor in the box");
  await b.page.keyboard.type(" leaves");
  assert.deepEqual(await b.ids(), ["todo-list"], "every word must match (scenario titles count)");
  await b.page.fill("#q", "nothing like it"); await b.page.dispatchEvent("#q", "input");
  assert.match(await b.page.textContent("main"), /Nothing matches “nothing like it”/);
  await b.page.press("#q", "Escape");
  assert.equal(await b.page.inputValue("#q"), "");
  assert.equal((await b.ids()).length, 4);
  await b.page.fill("#q", "empty"); await b.page.dispatchEvent("#q", "input");
  await b.page.click("[data-act=filter][data-f=refine]");
  assert.deepEqual(await b.ids(), ["add-todo"], "search and filter together");
  assert.deepEqual(b.errors, []);
});

test("ticking Refined folds a slice; unticking opens it; folds are remembered; fold all", async t => {
  const b = await open(t, { kind: "planning" });
  await b.page.check("input[data-act=refine][data-slice=add-todo]");
  await b.settle();
  assert.equal(await b.page.locator("#slice-add-todo .fold-row").count(), 1, "folded to one line");
  assert.ok(await b.page.isChecked("#slice-add-todo input[data-act=refine]"), "its tick stays on the line");
  assert.match(await b.bar(), /1 Refined change/);
  await b.page.reload(); await b.page.waitForSelector("header.top");
  assert.equal(await b.page.locator("#slice-add-todo .fold-row").count(), 1, "still folded after a reload");
  await b.page.click("#slice-add-todo .fold-row");
  assert.equal(await b.page.locator("#slice-add-todo .fold-row").count(), 0, "a tap opens it");
  await b.page.click("#slice-add-todo [data-act=fold]");
  assert.equal(await b.page.locator("#slice-add-todo .fold-row").count(), 1, "▾ fold folds it again");
  await b.page.uncheck("#slice-add-todo input[data-act=refine]");
  await b.settle();
  assert.equal(await b.page.locator("#slice-add-todo .fold-row").count(), 0, "unticking opens it");
  assert.match(await b.bar(), /No feedback yet/, "tick then untick in the same round cancels out");

  await b.page.check("input[data-act=refine][data-slice=add-todo]"); await b.settle();
  await b.page.check("input[data-act=refine][data-slice=todo-list]"); await b.settle();
  await b.page.click("[data-act=fold-all]");
  assert.equal(await b.page.textContent("[data-act=fold-all]"), "▾ Fold the 2 refined slices");
  assert.equal(await b.page.locator(".fold-row").count(), 0, "both open after Show");
  assert.deepEqual(b.errors, []);
});

test("comments: on a slice, a scenario, a reply and a resolve go into the round; Remove takes one back", async t => {
  const b = await open(t, { kind: "planning" });
  await b.page.click('#slice-add-todo [data-act=compose][data-kind=slice]');
  await b.page.fill("#cm-text", "Should titles be unique?");
  await b.page.click("form[data-form=comment] button[type=submit]");
  assert.match(await b.page.textContent("#slice-add-todo"), /Should titles be unique\?/);
  assert.match(await b.page.textContent("#slice-add-todo .cm.draft"), /You/);
  assert.match(await b.bar(), /1 comment/);

  await b.page.click('[data-act=compose][data-kind=scenario][data-scenario="complete-todo-1"]');
  await b.page.selectOption("#cm-part", "then");
  await b.page.fill("#cm-text", "And the time it was done?");
  await b.page.click("form[data-form=comment] button[type=submit]");
  assert.match(await b.page.textContent("#slice-complete-todo"), /on Then[\s\S]*And the time it was done\?/);

  await b.page.click('#slice-complete-todo [data-act=reply][data-thread="c-1"]');
  await b.page.fill("#cm-text", "Thanks");
  await b.page.click("form[data-form=comment] button[type=submit]");
  assert.match(await b.bar(), /3 comments/);

  assert.equal(await b.page.locator('[data-act=resolve][data-id="c-3"]').count(), 0, "a resolved thread has no Resolve button");
  await b.page.click("#slice-add-todo .cm.draft [data-act=drop-comment]");
  assert.match(await b.bar(), /2 comments/);
  const ev = await b.draft();
  assert.deepEqual(ev.map(e => e.type), ["CommentAdded", "CommentAdded"]);
  assert.equal(ev[0].data.scenarioId, "complete-todo-1");
  assert.equal(ev[0].data.part, "then");
  assert.equal(ev[1].data.threadId, "c-1");
  assert.deepEqual(b.errors, []);
});

test("resolving an open thread", async t => {
  const b = await open(t, { kind: "planning", edit: m => { m.comments.push({ id: "c-9", sliceId: "todo-list", author: "ai", text: "Open question", at: "2026-11-14" }); } });
  await b.page.click('[data-act=resolve][data-id="c-9"]');
  assert.match(await b.page.textContent("#slice-todo-list"), /Resolved \(not sent yet\)/);
  assert.match(await b.bar(), /1 resolved/);
  assert.deepEqual(b.errors, []);
});

test("adding a scenario: a refusal on a command, a view's 'shows'", async t => {
  const b = await open(t, { kind: "planning" });
  await b.page.click('[data-act=add-open][data-slice="add-todo"]');
  await b.page.fill("#add-title", "Refuses a title over 200 characters");
  await b.page.click('[data-act=add-given][data-event="TodoAdded"]');
  await b.page.check('input[name="add-outcome"][value="rejected"]');
  await b.page.fill("#add-reason", "Keep it short");
  await b.page.click("form[data-form=scenario] button[type=submit]");
  assert.match(await b.page.textContent("#slice-add-todo"), /Refuses a title over 200 characters\s*New/);
  await b.page.click('[data-act=add-open][data-slice="todo-list"]');
  await b.page.fill("#add-title", "Shows newest first");
  await b.page.fill("#add-shows", "the newest todo at the top");
  await b.page.click("form[data-form=scenario] button[type=submit]");
  assert.match(await b.bar(), /2 new scenarios/);
  const [cmd, view] = await b.draft();
  assert.deepEqual({ ...cmd.data, scenarioId: "x" }, { scenarioId: "x", sliceId: "add-todo", name: "Refuses a title over 200 characters", given: [{ type: "TodoAdded" }], when: "AddTodo", then: { rejected: "Keep it short" } });
  assert.deepEqual(view.data.then, { view: "TodoList", value: "the newest todo at the top" });
  await b.page.click('#slice-add-todo [data-act=drop-scenario]');
  assert.match(await b.bar(), /1 new scenario/);
  assert.deepEqual(b.errors, []);
});

test("built slices: Works, and Doesn't work with what happened", async t => {
  const b = await open(t, { device: PHONE });
  await b.page.click('#slice-add-todo [data-act=works]');
  assert.match(await b.bar(), /1 tried and working/);
  await b.page.click('#slice-add-todo [data-act=works]');
  assert.match(await b.bar(), /No feedback yet/, "a second tap takes it back");
  await b.page.click('#slice-add-todo [data-act=works]');
  await b.page.click('#slice-complete-todo [data-kind=problem]');
  assert.match(await b.page.textContent("form[data-form=comment]"), /What doesn't work in CompleteTodo\?/);
  await b.page.fill("#cm-text", "It came back after a reload");
  await b.page.click("form[data-form=comment] button[type=submit]");
  assert.match(await b.bar(), /1 tried and working · 1 problem/);
  assert.match(await b.page.textContent("#slice-complete-todo"), /problem reported[\s\S]*problem\s*It came back after a reload/);
  assert.equal(await b.page.locator("#slice-complete-todo [data-act=works]").count(), 0);
  const ev = await b.draft();
  assert.deepEqual(ev.map(e => [e.type, e.data.sliceId, !!e.data.problem]), [["SliceWorks", "add-todo", false], ["CommentAdded", "complete-todo", true]]);
  assert.deepEqual(b.errors, []);
});

test("a slice the person said works shows it, folded or open", async t => {
  const b = await open(t, { edit: m => { m.slices[0].works = true; newSlice(m); } });
  assert.match(await b.page.textContent("#slice-add-todo"), /Built\s*✓ Works/, "folded built row");
  await b.page.click("#slice-add-todo .done-row");
  assert.match(await b.page.textContent("#slice-add-todo .tried"), /✓ Works/);
  assert.equal(await b.page.locator("#slice-add-todo [data-act=works]").count(), 0);
  assert.deepEqual(b.errors, []);
});

test("a new feature on a built app: built slices fold away, the new one is open", async t => {
  const b = await open(t, { edit: newSlice });
  assert.match(await b.page.textContent("main"), /The new slices are open below/);
  assert.equal(await b.page.locator("article.slice.done").count(), 4);
  assert.match(await b.page.textContent("#slice-add-todo"), /AddTodo\s*Built\s*▸ show/);
  assert.equal(await b.page.locator("#slice-rename-todo .gwt").count(), 1);
  const head = (await b.page.textContent("header.top")).replace(/\s+/g, " ");
  assert.match(head, /0 of 1 new slice refined/);
  assert.match(head, /4 built/);
  await b.page.click("#slice-add-todo .done-row");
  assert.match(await b.page.textContent("#slice-add-todo"), /▾ hide/);
  assert.deepEqual(b.errors, []);
});

test("a chapter where everything is built folds to one line while something else is new", async t => {
  const b = await open(t, { edit: m => { newSlice(m); m.chapters.push({ name: "Later" }); m.slices.at(-1).chapter = "Later"; } });
  assert.match(await b.page.textContent(".chapter.done-ch"), /Todos · 4 built\s*▸ show/);
  assert.deepEqual(await b.ids(), ["rename-todo"]);
  await b.page.click(".chapter.done-ch .done-row");
  assert.equal((await b.ids()).length, 5);
  assert.deepEqual(b.errors, []);
});

test("Done with feedback saves the round to plan/feedback and locks the book", async t => {
  const b = await open(t, { kind: "planning" });
  assert.ok(await b.page.isDisabled("[data-act=done]"), "nothing to send yet");
  await b.page.check("input[data-act=refine][data-slice=add-todo]"); await b.settle();
  await b.page.click("[data-act=done]");
  await b.page.waitForSelector("text=Saved");
  assert.match(await b.bar(), /Saved plan\/feedback\/round-3\.json/);
  const saved = JSON.parse(fs.readFileSync(path.join(b.dir, "plan", "feedback", "round-3.json"), "utf8"));
  assert.equal(saved.app, "Todo"); assert.equal(saved.round, 3);
  assert.deepEqual(saved.events.map(e => e.type), ["SliceMarkedRefined"]);
  assert.ok(await b.page.isDisabled("input[data-act=refine][data-slice=add-todo]"), "locked until the next round");
  assert.equal(await b.page.locator("[data-act=add-open]").count(), 0);
  assert.deepEqual(b.errors, []);
});

test("a new round from the AI shows up by itself", async t => {
  const b = await open(t, { kind: "planning" });
  const file = path.join(b.dir, "plan", "model.json");
  const m = JSON.parse(fs.readFileSync(file, "utf8")); m.round = 4; m.idea = "Round four's idea";
  fs.writeFileSync(file, JSON.stringify(m));
  await b.page.waitForSelector("text=Round 4 is here", { timeout: 9000 });
  assert.match(await b.page.textContent("header.top"), /Round 4 · Round four's idea/);
  assert.deepEqual(b.errors, []);
});

test("a new round while typing waits for 'Show the new round'", async t => {
  const b = await open(t, { kind: "planning" });
  await b.page.click('#slice-add-todo [data-act=compose][data-kind=slice]');
  await b.page.fill("#cm-text", "half a thought");
  const file = path.join(b.dir, "plan", "model.json");
  const m = JSON.parse(fs.readFileSync(file, "utf8")); m.round = 4;
  fs.writeFileSync(file, JSON.stringify(m));
  await b.page.waitForTimeout(5000); // a poll comes and goes
  assert.equal(await b.page.inputValue("#cm-text"), "half a thought", "what they were typing is untouched");
  assert.match(await b.page.textContent("header.top"), /Round 3/, "the old round stays while they type");
  await b.page.click("form[data-form=comment] button[type=submit]");
  await b.page.waitForSelector("text=A new round is ready");
  await b.page.click("[data-act=reload]");
  await b.page.waitForSelector("text=Round 4");
  assert.deepEqual(b.errors, []);
});

test("Look and feel: fill it in, it's summarised and goes into the round", async t => {
  const b = await open(t, { kind: "planning" });
  await b.page.click("[data-mode=look]");
  await b.page.click('[data-act=look-mood][data-mood="Calm"]');
  await b.page.click('[data-act=look-mood][data-mood="Playful"]');
  await b.page.click("[data-act=look-colour-add]");
  await b.page.check('input[name="look-theme"][value="dark"]');
  await b.page.check('input[name="look-device"][value="phone"]');
  await b.page.fill("#look-where", "on the sofa");
  await b.page.fill("#look-notes", "big buttons");
  await b.page.click("form[data-form=look] button[type=submit]");
  const card = (await b.page.textContent("section.look")).replace(/\s+/g, " ");
  assert.match(card, /Calm, Playful · +· Dark · Mostly on a phone, on the sofa \(not sent yet\)\s*big buttons/);
  assert.equal(await b.page.locator("section.look .dot-sw").count(), 1, "the colour as a swatch");
  assert.match(await b.bar(), /look and feel/);
  assert.match(await b.page.textContent("[data-mode=look]"), /•/, "the tab says there's something new");
  const [e] = await b.draft();
  assert.equal(e.type, "LookAndFeelSet");
  assert.deepEqual([e.data.moods, e.data.colours.length, e.data.theme, e.data.device], [["Calm", "Playful"], 1, "dark", "phone"]);
  await b.page.click("[data-act=look-open]");
  assert.ok(await b.page.isChecked('input[name="look-theme"][value="dark"]'), "Change opens it filled in");
  assert.deepEqual(b.errors, []);
});

test("no plan yet", async t => {
  const b = await open(t, { kind: "planning" });
  fs.rmSync(path.join(b.dir, "plan", "model.json"));
  await b.page.reload();
  await b.page.waitForSelector(".empty");
  assert.match(await b.page.textContent(".empty"), /No plan yet[\s\S]*let's plan a todo app/);
  assert.deepEqual(b.errors, []);
});

test("phone: the header folds while scrolling", async t => {
  const b = await open(t, { kind: "planning", device: PHONE });
  await b.page.evaluate(() => scrollTo(0, 600)); await b.settle(250);
  assert.ok(await b.page.evaluate(() => document.body.classList.contains("scrolled")));
  await b.page.evaluate(() => scrollTo(0, 0)); await b.settle(250);
  assert.ok(!(await b.page.evaluate(() => document.body.classList.contains("scrolled"))));
  assert.ok(await b.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "no sideways scroll");
  assert.deepEqual(b.errors, []);
});

test("built slices: tick each scenario tried in the app, or say one doesn't work", async t => {
  const b = await open(t);
  const filter = async f => (await b.page.textContent(`[data-act=filter][data-f=${f}]`)).replace(/\s+/g, " ").trim();
  assert.equal(await filter("totry"), "To try 4");
  await b.page.click('.sc[data-key="add-todo/add-todo-1"] [data-act=tried]');
  await b.page.click('.sc[data-key="add-todo/add-todo-2"] [data-act=tried]');
  assert.match(await b.bar(), /2 scenarios tried/);
  assert.equal(await filter("totry"), "To try 3", "every scenario of AddTodo is tried");
  assert.match(await b.page.textContent("#slice-add-todo .tried"), /✓ Works/, "so the slice works");
  await b.page.click('.sc[data-key="add-todo/add-todo-2"] [data-act=tried]');
  assert.match(await b.bar(), /1 scenario tried/, "a second tap takes it back");

  await b.page.click('.sc[data-key="complete-todo/complete-todo-3"] .sc-row');
  await b.page.click('.sc[data-key="complete-todo/complete-todo-3"] [data-kind=problem]');
  assert.match(await b.page.textContent("form[data-form=comment]"), /What doesn't work in “Refuses a todo that is already done”\?/);
  await b.page.fill("#cm-text", "I could tick it twice");
  await b.page.click("form[data-form=comment] button[type=submit]");
  assert.match(await b.bar(), /1 scenario tried · 1 problem/);
  const ev = await b.draft();
  assert.deepEqual(ev.map(e => [e.type, e.data.scenarioId, !!e.data.problem]), [["ScenarioTried", "add-todo-1", false], ["CommentAdded", "complete-todo-3", true]]);
  await b.page.click("[data-act=filter][data-f=totry]");
  assert.deepEqual(await b.ids(), ["add-todo", "remove-todo", "todo-list"], "CompleteTodo has a problem, so it isn't built until it's fixed");
  assert.deepEqual(b.errors, []);
});
