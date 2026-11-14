// Given / When / Then for the Event Book's views, with EVE's own helper: given the book's events
// (the plan loaded, the tests run, this round's feedback), each view shows exactly this.
// Run: node --test eve/book   (nothing to install)
import fs from "node:fs";
import { view } from "../../sample/todo/app/lib/gwt.mjs";
import { replay } from "../replay.js";
import { bookBrand } from "../views/bookBrand.read.js";
import { tabSwitch } from "../views/tabSwitch.read.js";
import { progressPills } from "../views/progressPills.read.js";
import { bookNotices } from "../views/bookNotices.read.js";
import { bookIntro } from "../views/bookIntro.read.js";
import { generalComments } from "../views/generalComments.read.js";
import { searchBox } from "../views/searchBox.read.js";
import { filterSwitch } from "../views/filterSwitch.read.js";
import { foldAll } from "../views/foldAll.read.js";
import { chapterList } from "../views/chapterList.read.js";
import { sliceCard } from "../views/sliceCard.read.js";
import { foldedSlice } from "../views/foldedSlice.read.js";
import { builtSlice } from "../views/builtSlice.read.js";
import { eventModelBoard } from "../views/eventModelBoard.read.js";
import { appFrame } from "../views/appFrame.read.js";
import { lookCard } from "../views/lookCard.read.js";
import { feedbackBar } from "../views/feedbackBar.read.js";
import { emptyBook } from "../views/emptyBook.read.js";
import { newRoundHint } from "../views/newRoundHint.read.js";

const SAMPLE = new URL("../../sample/todo/plan/", import.meta.url);
const sample = JSON.parse(fs.readFileSync(new URL("model.json", SAMPLE), "utf8"));
const results = JSON.parse(fs.readFileSync(new URL("built.json", SAMPLE), "utf8"));

// The sample plan, as the AI wrote it ("built": as shipped) or before anything was refined ("planning").
const plan = (kind = "planning", edit) => {
  const m = structuredClone(sample);
  if (kind === "planning") for (const s of m.slices) s.refined = false;
  if (edit) edit(m);
  return { type: "PlanLoaded", data: m };
};
const testsRan = { type: "TestsRan", data: results };
const tick = sliceId => ({ type: "SliceMarkedRefined", data: { sliceId } });
const comment = (data) => ({ type: "CommentAdded", data: { commentId: "c-new", text: "Hm?", at: "2026-11-14 10:00", ...data } });
const newSlice = m => {
  m.events.push({ name: "TodoRenamed" });
  m.slices.push({ id: "rename-todo", name: "RenameTodo", type: "command", chapter: "Todos", produces: ["TodoRenamed"], refined: false,
    scenarios: [{ id: "rename-todo-1", title: "Renames a todo", given: [], when: "RenameTodo", then: { events: [{ type: "TodoRenamed" }] } }] });
};
const S = (patch = {}) => ({ root: "../", mode: "book", filter: "all", q: "", compose: null, addFor: null, form: null, lookForm: null,
  openDone: new Set(), openSc: new Set(), folded: new Set(), appWidth: "phone", appExists: null, saving: false, message: "",
  newRound: false, loadError: "", eveUpdate: "", eveNotes: [], eveUpdated: null, ...patch });
// A view of the replayed book, with the screen state a scenario needs.
const of = (name, fn) => ({ scenario: (title, screen = S()) => view(name, h => fn(replay(h), screen), { chapter: "Event Book" }).scenario(title) });

const brand = of("BookBrand", b => bookBrand(b));
brand.scenario("Shows the app, the round and the idea").given([plan()])
  .shows({ title: "Todo · Event Book", round: 3, idea: sample.idea });

const tabs = of("TabSwitch", tabSwitch);
tabs.scenario("Shows the five tabs with the open one pressed", S({ mode: "board" })).given([plan()])
  .shows([["book", "Book"], ["board", "Board"], ["app", "App"], ["look", "Look"], ["export", "Export"]].map(([mode, label]) => ({ mode, label, on: mode === "board", dot: false })));
tabs.scenario("Puts a dot on Look while this round changes it").given([plan(), { type: "LookAndFeelSet", data: { moods: ["Calm"], colours: [] } }])
  .shows([["book", "Book"], ["board", "Board"], ["app", "App"], ["look", "Look"], ["export", "Export"]].map(([mode, label]) => ({ mode, label, on: mode === "book", dot: mode === "look" })));

const pills = of("ProgressPills", progressPills);
pills.scenario("Counts refined slices while planning").given([plan(), tick("add-todo")])
  .shows({ pills: [{ text: "1 of 4 slices refined", ok: false }], appLink: null });
pills.scenario("Counts passing scenarios and links the app once built").given([plan("built"), testsRan])
  .shows({ pills: [{ text: "4 of 4 slices refined", ok: true }, { text: "10 of 10 scenarios pass", ok: true }], appLink: "../app/" });
pills.scenario("Counts only the new slices on a built app").given([plan("built", newSlice), testsRan])
  .shows({ pills: [{ text: "0 of 1 new slice refined", ok: false }, { text: "4 built", ok: true }, { text: "10 of 11 scenarios pass", ok: false }], appLink: "../app/" });

const notices = of("BookNotices", (b, s) => bookNotices(s));
notices.scenario("Shows nothing on a quiet day").given([plan()])
  .shows({ newRound: false, message: "", updated: null, newer: null });
notices.scenario("Says a new round is waiting and that EVE was updated", S({ newRound: true, eveUpdated: { version: "2026-11-14", notes: ["Search"] } })).given([plan()])
  .shows({ newRound: true, message: "", updated: { version: "2026-11-14", notes: ["Search"] }, newer: null });

const intro = of("BookIntro", bookIntro);
intro.scenario("Asks the person to read, comment and tick while planning").given([plan()]).shows({ kind: "read", appLink: "../app/" });
intro.scenario("Says start building when every slice is refined").given([plan("built")]).shows({ kind: "refined", appLink: "../app/" });
intro.scenario("Says built when every scenario passes").given([plan("built"), testsRan]).shows({ kind: "built", appLink: "../app/" });
intro.scenario("Points at the new slices on a built app").given([plan("built", newSlice), testsRan]).shows({ kind: "follow-up", appLink: "../app/" });
intro.scenario("Says start building once the new slices are refined").given([plan("built", m => { newSlice(m); m.slices.at(-1).refined = true; }), testsRan]).shows({ kind: "new-refined", appLink: "../app/" });

const general = of("GeneralComments", generalComments);
general.scenario("Offers a general comment when there are none").given([plan()]).shows({ threads: [], composer: null, canAdd: true });
general.scenario("Shows a general comment and the box while replying to it", S({ compose: { kind: "reply", threadId: "c-new" } })).given([plan(), comment({})])
  .shows({ threads: [{ id: "c-new", sliceId: "", scenarioId: "", part: "", resolved: false, resolvedNow: false, locked: false,
    comments: [{ id: "c-new", ai: false, at: "2026-11-14 10:00", part: "", text: "Hm?", problem: false, draft: true }],
    replying: { part: false, title: "", placeholder: "Reply…", button: "Reply" } }], composer: null, canAdd: true });

const search = of("SearchBox", (b, s) => searchBox(s));
search.scenario("Shows what's typed", S({ q: "overlap" })).given([plan()]).shows({ q: "overlap" });

const filters = of("FilterSwitch", filterSwitch);
const counts = (on, all, refine, ready, built) => [["all", "All", all], ["refine", "To refine", refine], ["ready", "Ready to build", ready], ["built", "Built", built]].map(([f, label, n]) => ({ f, label, n, on: f === on }));
filters.scenario("Counts every slice as to refine at first").given([plan()]).shows(counts("all", 4, 4, 0, 0));
filters.scenario("Moves a ticked slice to ready to build", S({ filter: "ready" })).given([plan(), tick("add-todo")]).shows(counts("ready", 4, 3, 1, 0));
filters.scenario("Counts built slices once their scenarios pass").given([plan("built", newSlice), testsRan]).shows(counts("all", 5, 1, 0, 4));

const fold = of("FoldAllButton", foldAll);
fold.scenario("Offers to fold two refined slices").given([plan(), tick("add-todo"), tick("todo-list")]).shows({ fold: true, text: "▾ Fold the 2 refined slices" });
fold.scenario("Offers to show them once they're folded", S({ folded: new Set(["add-todo", "todo-list"]) })).given([plan(), tick("add-todo"), tick("todo-list")]).shows({ fold: false, text: "▸ Show the 2 refined slices" });
fold.scenario("Stays away for a single refined slice").given([plan(), tick("add-todo")]).shows(null);

const chapters = of("ChapterList", chapterList);
const card = id => ({ id, as: "card", openedBuilt: false });
chapters.scenario("Shows every slice open while planning").given([plan()])
  .shows({ chapters: [{ name: "Todos", built: null, slices: ["add-todo", "complete-todo", "remove-todo", "todo-list"].map(card) }], empty: "" });
chapters.scenario("Folds a refined slice the person folded", S({ folded: new Set(["add-todo"]) })).given([plan(), tick("add-todo")])
  .shows({ chapters: [{ name: "Todos", built: null, slices: [{ id: "add-todo", as: "folded" }, ...["complete-todo", "remove-todo", "todo-list"].map(card)] }], empty: "" });
chapters.scenario("Folds built slices while a new one is open").given([plan("built", newSlice), testsRan])
  .shows({ chapters: [{ name: "Todos", built: null, slices: [...["add-todo", "complete-todo", "remove-todo", "todo-list"].map(id => ({ id, as: "built" })), card("rename-todo")] }], empty: "" });
chapters.scenario("Folds a chapter where everything is built").given([plan("built", m => { newSlice(m); m.chapters.push({ name: "Later" }); m.slices.at(-1).chapter = "Later"; }), testsRan])
  .shows({ chapters: [{ name: "Todos", built: { count: 4, open: false }, slices: [] }, { name: "Later", built: null, slices: [card("rename-todo")] }], empty: "" });
chapters.scenario("Shows only what matches the search", S({ q: "removed leaves" })).given([plan()])
  .shows({ chapters: [{ name: "Todos", built: null, slices: [card("todo-list")] }], empty: "" });
chapters.scenario("Says when nothing matches", S({ q: "zebra" })).given([plan()]).shows({ chapters: [], empty: "Nothing matches “zebra”." });

const slice = (name, id, openedBuilt) => of(name, (b, s) => sliceCard(b, s, id, openedBuilt));
const sc = (key, extra) => ({ key, sliceId: key.split("/")[0], ...extra });
const addTodo = slice("SliceCard", "add-todo");
const pick = (v, keys) => Object.fromEntries(keys.map(k => [k, v[k]]));
const addTodoTop = of("SliceCard", (b, s) => pick(sliceCard(b, s, "add-todo"), ["id", "kind", "label", "name", "refined", "flow", "badge", "canFold", "tried", "fields", "canComment", "canAdd"]));
addTodoTop.scenario("Shows a command, what it needs and what it causes").given([plan()])
  .shows({ id: "add-todo", kind: "command", label: "Command", name: "AddTodo", refined: false, flow: { to: ["TodoAdded"] }, badge: null, canFold: false, tried: null,
    fields: { label: "Needs", list: ["todoId", "title"] }, canComment: true, canAdd: true });
addTodoTop.scenario("Offers to fold once it's ticked, and asks if a built slice works").given([plan("built"), testsRan])
  .shows({ id: "add-todo", kind: "command", label: "Command", name: "AddTodo", refined: true, flow: { to: ["TodoAdded"] }, badge: { cls: "pass", text: "Built" }, canFold: true,
    tried: { problem: false, works: "button", worksNow: false, canReport: true, composer: null }, fields: { label: "Needs", list: ["todoId", "title"] }, canComment: true, canAdd: true });
addTodoTop.scenario("Says a problem is reported").given([plan("built"), testsRan, comment({ sliceId: "add-todo", problem: true })])
  .shows({ id: "add-todo", kind: "command", label: "Command", name: "AddTodo", refined: true, flow: { to: ["TodoAdded"] }, badge: { cls: "pass", text: "Built" }, canFold: true,
    tried: { problem: true }, fields: { label: "Needs", list: ["todoId", "title"] }, canComment: true, canAdd: true });
const scenarios = of("SliceCard", (b, s) => sliceCard(b, s, "add-todo").scenarios.map(x => pick(x, ["key", "title", "isNew", "dot", "folded", "given", "when", "then"])));
scenarios.scenario("Shows each scenario's Given, When and Then while planning").given([plan()])
  .shows([{ key: "add-todo/add-todo-1", title: "Adds a todo", isNew: false, dot: "", folded: false, given: [], when: { command: "AddTodo" }, then: { events: ["TodoAdded"] } },
    { key: "add-todo/add-todo-2", title: "Refuses an empty title", isNew: false, dot: "", folded: false, given: [], when: { command: "AddTodo" }, then: { refused: "Title is required" } }]);
scenarios.scenario("Folds a passing scenario to one line until it's opened", S({ openSc: new Set(["add-todo/add-todo-2"]) })).given([plan("built"), testsRan])
  .shows([{ key: "add-todo/add-todo-1", title: "Adds a todo", isNew: false, dot: "pass", folded: true, given: [], when: { command: "AddTodo" }, then: { events: ["TodoAdded"] } },
    { key: "add-todo/add-todo-2", title: "Refuses an empty title", isNew: false, dot: "pass", folded: false, given: [], when: { command: "AddTodo" }, then: { refused: "Title is required" } }]);
scenarios.scenario("Adds the person's new scenario at the end").given([plan(), { type: "ScenarioAdded", data: { scenarioId: "s-1", sliceId: "add-todo", name: "Refuses a long title", given: [], when: "AddTodo", then: { rejected: "Too long" } } }])
  .shows([{ key: "add-todo/add-todo-1", title: "Adds a todo", isNew: false, dot: "", folded: false, given: [], when: { command: "AddTodo" }, then: { events: ["TodoAdded"] } },
    { key: "add-todo/add-todo-2", title: "Refuses an empty title", isNew: false, dot: "", folded: false, given: [], when: { command: "AddTodo" }, then: { refused: "Title is required" } },
    { key: "add-todo/s-1", title: "Refuses a long title", isNew: true, dot: "", folded: false, given: [], when: { command: "AddTodo" }, then: { refused: "Too long" } }]);
const listCard = of("SliceCard", (b, s) => pick(sliceCard(b, s, "todo-list"), ["kind", "flow", "fields"]));
listCard.scenario("Shows a view, what it shows and the events it reads").given([plan()])
  .shows({ kind: "view", flow: { from: ["TodoAdded", "TodoCompleted", "TodoRemoved"] }, fields: { label: "Shows", list: ["todoId", "title", "done"] } });

const folded = of("FoldedSliceRow", b => foldedSlice(b, "add-todo"));
folded.scenario("Shows the slice in one line with its scenario count").given([plan(), tick("add-todo")])
  .shows({ id: "add-todo", kind: "command", label: "Command", name: "AddTodo", scenarios: 2, unsent: 0, locked: false });
folded.scenario("Counts feedback on it not sent yet").given([plan(), tick("add-todo"), comment({ sliceId: "add-todo" })])
  .shows({ id: "add-todo", kind: "command", label: "Command", name: "AddTodo", scenarios: 2, unsent: 1, locked: false });

const builtRow = of("BuiltSliceRow", b => builtSlice(b, "add-todo"));
builtRow.scenario("Shows a built slice in one line").given([plan("built"), testsRan]).shows({ id: "add-todo", kind: "command", label: "Command", name: "AddTodo", works: false });
builtRow.scenario("Says it works once the person said so").given([plan("built", m => { m.slices[0].works = true; }), testsRan]).shows({ id: "add-todo", kind: "command", label: "Command", name: "AddTodo", works: true });

const board = of("EventModelBoard", b => eventModelBoard(b));
const col = (id, kind, label, title, status, reads, events) => ({ id, kind, label, title, status, reads, events });
const notRefined = { cls: "", text: "not refined" };
board.scenario("Draws a column per slice: the command or view on top, its events below").given([plan()])
  .shows({ groups: [{ name: "Todos", cols: [
    col("add-todo", "command", "Command", "Add Todo", notRefined, [], [{ name: "TodoAdded", title: "Todo Added" }]),
    col("complete-todo", "command", "Command", "Complete Todo", notRefined, [], [{ name: "TodoCompleted", title: "Todo Completed" }]),
    col("remove-todo", "command", "Command", "Remove Todo", notRefined, [], [{ name: "TodoRemoved", title: "Todo Removed" }]),
    col("todo-list", "view", "View", "Todo List", notRefined, ["TodoAdded", "TodoCompleted", "TodoRemoved"], [])] }] });
const boardStatus = of("EventModelBoard", b => eventModelBoard(b).groups[0].cols.map(c => c.status.text));
boardStatus.scenario("Marks refined and built stickies").given([plan(), tick("add-todo")]).shows(["refined", "not refined", "not refined", "not refined"]);
boardStatus.scenario("Marks built stickies").given([plan("built"), testsRan]).shows(["✓ built", "✓ built", "✓ built", "✓ built"]);

const app = of("AppFrame", (b, s) => appFrame(s));
app.scenario("Shows the app at phone size", S({ appExists: true })).given([plan()]).shows({ state: "ready", url: "../app/", width: "phone" });
app.scenario("Says the app appears once it's built", S({ appExists: false })).given([plan()]).shows({ state: "missing", url: "../app/", width: "phone" });

const look = of("LookCard", lookCard);
look.scenario("Invites the person to fill it in").given([plan()]).shows({ form: null, summary: [], isNew: false, notes: "", canChange: true });
look.scenario("Sums up what the person picked").given([plan(), { type: "LookAndFeelSet", data: { moods: ["Calm"], colours: ["#123456"], theme: "dark", type: "", likes: "Notion", device: "phone", where: "sofa", notes: "big buttons" } }])
  .shows({ form: null, summary: [{ text: "Calm" }, { colours: ["#123456"] }, { text: "Dark" }, { text: "Mostly on a phone, sofa" }, { text: "like Notion" }], isNew: true, notes: "big buttons", canChange: true });

const bar = of("FeedbackBar", feedbackBar);
bar.scenario("Says there's no feedback yet").given([plan()]).shows({ locked: false, parts: [], saving: false, canSend: false });
bar.scenario("Counts each kind of feedback").given([plan("built"), testsRan, tick("add-todo"), comment({ sliceId: "add-todo" }), comment({ sliceId: "remove-todo", problem: true }), { type: "SliceWorks", data: { sliceId: "todo-list" } }])
  .shows({ locked: false, parts: ["1 comment", "1 Refined change", "1 tried and working", "1 problem"], saving: false, canSend: true });
bar.scenario("Says where the round was saved").given([plan(), tick("add-todo"), { type: "FeedbackSent", data: { saved: "plan/feedback/round-3.json" } }])
  .shows({ locked: true, saved: "plan/feedback/round-3.json" });

const empty = of("EmptyBook", (b, s) => emptyBook(s));
empty.scenario("Says why there's no plan to show", S({ loadError: "404 plan/model.json" })).given([plan()]).shows({ loadError: "404 plan/model.json", root: "../" });

const hint = of("NewRoundHint", (b, s) => newRoundHint(s));
hint.scenario("Offers the new round on the Board", S({ newRound: true })).given([plan()]).shows({ show: true });
