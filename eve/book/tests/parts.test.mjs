// Each component, drawn from its view: it marks its root with data-component and shows what its view says.
// Run: node --test eve/book   (nothing to install)
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { replay } from "../replay.js";
import * as F from "../parts/frame.parts.js";
import * as B from "../parts/book.parts.js";
import { EventModelBoard, NewRoundHint } from "../parts/board.parts.js";
import { AppFrame } from "../parts/app.parts.js";
import { LookCard } from "../parts/look.parts.js";
import { ExportNote } from "../parts/export.parts.js";
import { bookBrand } from "../views/bookBrand.read.js";
import { tabSwitch } from "../views/tabSwitch.read.js";
import { progressPills } from "../views/progressPills.read.js";
import { feedbackBar } from "../views/feedbackBar.read.js";
import { emptyBook } from "../views/emptyBook.read.js";
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
import { newRoundHint } from "../views/newRoundHint.read.js";
import { appFrame } from "../views/appFrame.read.js";
import { lookCard } from "../views/lookCard.read.js";

const SAMPLE = new URL("../../sample/todo/plan/", import.meta.url);
const model = JSON.parse(fs.readFileSync(new URL("model.json", SAMPLE), "utf8"));
const built = JSON.parse(fs.readFileSync(new URL("built.json", SAMPLE), "utf8"));
const book = replay([{ type: "PlanLoaded", data: model }, { type: "TestsRan", data: built }, { type: "CommentAdded", data: { commentId: "c-9", sliceId: "todo-list", text: "Newest first?", problem: true } }]);
const S = (patch = {}) => ({ root: "../", mode: "book", filter: "all", q: "", compose: null, addFor: null, form: null, lookForm: null,
  openDone: new Set(), openSc: new Set(), folded: new Set(), appWidth: "phone", appExists: true, saving: false, message: "",
  newRound: true, loadError: "nope", eveUpdate: "", eveNotes: [], eveUpdated: null, ...patch });
const root = (html, name) => assert.match(html.trimStart(), new RegExp(`^<[a-z]+[^>]*data-component="${name}"`), `${name} marks its root`);
const draws = (name, html, ...texts) => test(`${name} draws its view`, () => {
  root(html, name);
  for (const t of texts) assert.ok(html.includes(t), `${name} shows ${t}`);
});

draws("BookBrand", F.BookBrand(bookBrand(book)), "Todo · Event Book", "Round 3");
draws("TabSwitch", F.TabSwitch(tabSwitch(book, S())), 'data-mode="export"', 'aria-pressed="true">Book');
draws("ProgressPills", F.ProgressPills(progressPills(book, S())), "1 of 1 new slice refined", "3 built", "10 of 10 scenarios pass", "Open the app");
draws("FeedbackBar", F.FeedbackBar(feedbackBar(book, S())), "1 problem", 'data-act="done"');
draws("EmptyBook", F.EmptyBook(emptyBook(S())), "No plan yet", "nope");
draws("BookNotices", B.BookNotices(bookNotices(S())), "A new round is ready", 'data-act="reload"');
draws("BookIntro", B.BookIntro(bookIntro(book, S())), "Built.", "Every planned scenario passes");
draws("GeneralComments", B.GeneralComments(generalComments(book, S())), "Add a general comment");
draws("SearchBox", B.SearchBox(searchBox(S({ q: "milk" }))), 'id="q"', 'value="milk"');
draws("FilterSwitch", B.FilterSwitch(filterSwitch(book, S())), "Ready to build", 'data-f="built"');
const planning = replay([{ type: "PlanLoaded", data: { ...model, slices: model.slices.map(s => ({ ...s, refined: true })) } }]);
draws("FoldAllButton", B.FoldAllButton(foldAll(planning, S())), "Fold the 4 refined slices");
draws("ChapterList", B.ChapterList(chapterList(book, S()), e => `<i>${e.id}:${e.as}</i>`), "<h2>Todos</h2>", "add-todo:built", "todo-list:card");
draws("SliceCard", B.SliceCard(sliceCard(book, S(), "todo-list")), "TodoList", "problem reported", "Newest first?", "Shows a completed todo as done");
test("SliceCard offers a tick on each scenario to try", () => { const h = B.SliceCard(sliceCard(book, S(), "add-todo")); for (const t of ['data-act="tried"', 'data-scenario="add-todo-2"', "✓ tried"]) assert.ok(h.includes(t), t); });
draws("FoldedSliceRow", B.FoldedSliceRow(foldedSlice(book, "add-todo")), "AddTodo", "2 scenarios", "checked");
draws("BuiltSliceRow", B.BuiltSliceRow(builtSlice(book, "add-todo")), "AddTodo", "Built", "▸ show");
draws("EventModelBoard", EventModelBoard(eventModelBoard(book)), "Todo List", 'data-reads="TodoAdded TodoCompleted TodoRemoved"', "✓ built");
draws("NewRoundHint", NewRoundHint(newRoundHint(S())), "Show the new round");
draws("AppFrame", AppFrame(appFrame(S())), '<iframe class="appframe phone" src="../app/"');
draws("LookCard", LookCard(lookCard(book, S())), "Look and feel", "Fill in");
draws("ExportNote", ExportNote(), "Download for eventmodelers");

test("components with nothing to show draw nothing", () => {
  assert.equal(B.FoldAllButton(null), "");
  assert.equal(B.BookNotices(bookNotices(S({ newRound: false }))), "");
  assert.equal(NewRoundHint({ show: false }), "");
});
test("text from the plan is escaped", () => {
  const evil = replay([{ type: "PlanLoaded", data: { ...model, app: "<script>x</script>" } }]);
  assert.ok(!F.BookBrand(bookBrand(evil)).includes("<script>"));
});
