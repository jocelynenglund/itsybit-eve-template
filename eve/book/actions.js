// What the person does: taps, ticks, typing and forms, turned into feedback events or screen changes.
// The only module that reads the page's forms.
import * as S from "./store.js";
import { screen } from "./store.js";
import { replay } from "./replay.js";
import { kindOf } from "./facts.js";

const $ = id => document.getElementById(id);
const focus = id => { const el = $(id); if (el) el.focus(); };
const val = id => { const el = $(id); return el ? el.value : ""; };
const blankLook = () => ({ moods: [], colours: [], theme: "", type: "", likes: "", device: "", where: "", notes: "" });
const scrollToSlice = id => { const t = $("slice-" + id); if (t) scrollTo({ top: t.getBoundingClientRect().top + scrollY - 110 }); };

function readForm() {
  const f = screen.form; if (!f) return;
  f.title = val("add-title"); f.reason = val("add-reason"); f.shows = val("add-shows"); f.event = val("add-event");
  const r = document.querySelector('input[name="add-outcome"]:checked'); if (r) f.outcome = r.value;
}
function readLookForm() {
  const f = screen.lookForm; if (!f) return;
  const r = name => { const el = document.querySelector(`input[name="${name}"]:checked`); return el ? el.value : ""; };
  f.colours = f.colours.map((c, i) => val("look-colour-" + i) || c);
  f.theme = r("look-theme"); f.type = r("look-type"); f.device = r("look-device");
  f.likes = val("look-likes"); f.where = val("look-where"); f.notes = val("look-notes");
}
async function downloadForEventmodelers() {
  try {
    const model = S.plan();
    const { toCanvas } = await import("../eventmodelers.mjs");
    const blob = new Blob([JSON.stringify(toCanvas(model), null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${(model.app || "eve-app").replace(/[^\w-]+/g, "-")}-eventmodelers-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  } catch (e) { screen.message = "Couldn't make the export file: " + e.message; S.changed(); }
}

const taps = {
  compose: el => { screen.compose = { kind: el.dataset.kind, sliceId: el.dataset.slice || undefined, scenarioId: el.dataset.scenario || undefined }; screen.addFor = null; S.changed(); focus("cm-text"); },
  reply: el => { screen.compose = { kind: "reply", threadId: el.dataset.thread, sliceId: el.dataset.slice || undefined, scenarioId: el.dataset.scenario || undefined, part: el.dataset.part || undefined }; screen.addFor = null; S.changed(); focus("cm-text"); },
  cancel: () => { screen.compose = null; screen.addFor = null; S.changed(); },
  resolve: el => S.give("CommentResolved", { commentId: el.dataset.id }),
  "drop-comment": el => S.takeBack(e => e.type === "CommentAdded" && e.data.commentId === el.dataset.id),
  "drop-scenario": el => S.takeBack(e => e.type === "ScenarioAdded" && e.data.scenarioId === el.dataset.id),
  "add-open": el => { screen.addFor = el.dataset.slice; screen.compose = null; screen.form = { title: "", given: [], outcome: "event", event: "", reason: "", shows: "" }; S.changed(); focus("add-title"); },
  "add-given": el => { readForm(); screen.form.given.push(el.dataset.event); S.changed(); },
  "add-given-clear": () => { readForm(); screen.form.given = []; S.changed(); },
  done: () => S.send(),
  "look-open": () => { const L = replay(S.history()).look; screen.lookForm = { ...blankLook(), ...(L || {}), moods: [...((L && L.moods) || [])], colours: [...((L && L.colours) || [])] }; screen.compose = null; screen.addFor = null; S.changed(); },
  "look-cancel": () => { screen.lookForm = null; S.changed(); },
  "look-mood": el => { readLookForm(); const m = el.dataset.mood, ms = screen.lookForm.moods; ms.includes(m) ? ms.splice(ms.indexOf(m), 1) : ms.push(m); S.changed(); },
  "look-colour-add": () => { readLookForm(); screen.lookForm.colours.push("#3f76db"); S.changed(); focus("look-colour-" + (screen.lookForm.colours.length - 1)); },
  "look-colour-drop": el => { readLookForm(); screen.lookForm.colours.splice(+el.dataset.i, 1); S.changed(); },
  "eve-seen": () => { S.updateSeen(); S.changed(); },
  "app-width": el => { screen.appWidth = el.dataset.w; S.changed(); },
  "export-em": () => downloadForEventmodelers(),
  mode: el => {
    screen.mode = el.dataset.mode;
    // The Look tab opens straight on the form while nothing has been filled in yet.
    if (screen.mode === "look" && !screen.lookForm && !S.locked() && !replay(S.history()).look) screen.lookForm = blankLook();
    if (screen.mode === "app" && screen.appExists === null) S.checkApp();
    S.rememberTab(screen.mode); S.changed(); scrollTo(0, 0);
  },
  goto: el => {
    const sl = (S.plan().slices || []).find(s => s.id === el.dataset.slice); if (!sl) return;
    screen.mode = "book"; screen.filter = "all"; screen.q = ""; S.rememberTab("book");
    screen.openDone.add(sl.id); if (sl.chapter) screen.openDone.add("ch:" + sl.chapter); S.fold(sl.id, false);
    S.changed(); scrollToSlice(sl.id);
  },
  fold: el => { const id = el.dataset.slice; S.fold(id, !screen.folded.has(id)); S.changed(); const t = $("slice-" + id); if (t && t.getBoundingClientRect().top < 90) scrollToSlice(id); },
  tried: el => { const { slice, scenario } = el.dataset, mine = e => e.type === "ScenarioTried" && e.data.sliceId === slice && e.data.scenarioId === scenario; S.given(mine) ? S.takeBack(mine) : S.give("ScenarioTried", { sliceId: slice, scenarioId: scenario }); },
  works: el => { const id = el.dataset.slice, mine = e => e.type === "SliceWorks" && e.data.sliceId === id; S.given(mine) ? S.takeBack(mine) : S.give("SliceWorks", { sliceId: id }); },
  "sc-open": el => { const k = el.dataset.key; screen.openSc.has(k) ? screen.openSc.delete(k) : screen.openSc.add(k); S.changed(); },
  filter: el => { screen.filter = el.dataset.f; S.changed(); },
  "fold-all": el => { const book = replay(S.history()); for (const s of book.slices) if (book.refined[s.id]) S.fold(s.id, el.dataset.on === "1"); S.changed(); },
  "toggle-done": el => { const k = el.dataset.key; screen.openDone.has(k) ? screen.openDone.delete(k) : screen.openDone.add(k); S.changed(); },
  reload: () => S.reload()
};

export function listen() {
  document.addEventListener("click", ev => {
    const el = ev.target.closest("[data-act]");
    if (!el || el.dataset.act === "refine") return;
    ev.preventDefault();
    const tap = taps[el.dataset.act]; if (tap) tap(el);
  });
  document.addEventListener("input", ev => { if (ev.target.id === "q") { screen.q = ev.target.value; S.changed(); } });
  document.addEventListener("keydown", ev => { if (ev.target.id === "q" && ev.key === "Escape" && screen.q) { screen.q = ""; S.changed(); } });
  // Ticking Refined folds the slice to one line; unticking opens it. Keep its row where it was on screen.
  document.addEventListener("change", ev => {
    const el = ev.target;
    if (el.dataset.act !== "refine") return;
    const id = el.dataset.slice;
    S.fold(id, el.checked);
    const art = $("slice-" + id), before = art ? art.getBoundingClientRect().top : null;
    requestAnimationFrame(() => { const now = $("slice-" + id); if (now && before != null) scrollBy(0, now.getBoundingClientRect().top - before); });
    const mine = e => (e.type === "SliceMarkedRefined" || e.type === "SliceRefinedCleared") && e.data.sliceId === id;
    if (S.given(mine)) S.takeBack(mine); else S.give(el.checked ? "SliceMarkedRefined" : "SliceRefinedCleared", { sliceId: id });
  });
  document.addEventListener("submit", ev => {
    ev.preventDefault();
    const form = ev.target.dataset.form;
    if (form === "comment") {
      const text = val("cm-text").trim();
      if (!text) return;
      const c = screen.compose, part = val("cm-part");
      const data = { commentId: S.uid("c"), text, nickname: "you", at: S.stamp() };
      if (c.sliceId) data.sliceId = c.sliceId;
      if (c.scenarioId) data.scenarioId = c.scenarioId;
      if (part) data.part = part;
      if (c.part) data.part = c.part;
      if (c.threadId) data.threadId = c.threadId;
      screen.compose = null;
      if (c.kind === "problem") { data.problem = true; S.takeBack(e => (e.type === "SliceWorks" && e.data.sliceId === c.sliceId) || (e.type === "ScenarioTried" && e.data.sliceId === c.sliceId && (!c.scenarioId || e.data.scenarioId === c.scenarioId))); }
      S.give("CommentAdded", data);
    } else if (form === "look") {
      readLookForm();
      const f = screen.lookForm, data = { ...f, likes: f.likes.trim(), where: f.where.trim(), notes: f.notes.trim() };
      screen.lookForm = null;
      S.takeBack(e => e.type === "LookAndFeelSet");
      S.give("LookAndFeelSet", data);
    } else if (form === "scenario") {
      readForm();
      const f = screen.form, sl = S.plan().slices.find(s => s.id === screen.addFor), k = kindOf(sl);
      if (!f.title.trim()) return focus("add-title");
      const then = k === "view" ? { view: sl.name, value: f.shows.trim() }
        : f.outcome === "rejected" ? { rejected: f.reason.trim() } : { events: [{ type: f.event || (sl.produces || [])[0] }] };
      screen.addFor = null;
      S.give("ScenarioAdded", { scenarioId: S.uid("s"), sliceId: sl.id, name: f.title.trim(), given: f.given.map(t => ({ type: t })), when: sl.name, then });
    }
  });
  // Fold the header after scrolling a little; open it again near the top. The gap between the two stops it flickering.
  addEventListener("scroll", () => {
    const y = scrollY, on = document.body.classList.contains("scrolled");
    if (!on && y > 80) document.body.classList.add("scrolled");
    else if (on && y < 16) document.body.classList.remove("scrolled");
  }, { passive: true });
}
