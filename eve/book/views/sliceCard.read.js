import { kindOf, kindLabel, result, allPass, openProblem, isTried, allTried } from "../facts.js";
import { threadsOf, composerOf } from "../threads.js";
// One slice, open: what it does, its tick, its tests, its scenarios and comments, and what can be done with it.
// openedBuilt: a built slice the person opened from its folded line (it folds back with "▾ hide").
export function sliceCard(book, screen, sliceId, openedBuilt = false) {
  const sl = book.slices.find(s => s.id === sliceId), kind = kindOf(sl), scen = sl.scenarios || [];
  const on = !!book.refined[sl.id], locked = book.locked, compose = screen.compose;

  let badge = null;
  if (book.tested) {
    const res = scen.map(sc => result(book, sl, sc));
    const pass = res.filter(r => r && r.passing).length, fail = res.filter(r => r && !r.passing).length;
    badge = pass === scen.length && scen.length ? { cls: "pass", text: "Built" }
      : fail ? { cls: "fail", text: `${pass}/${scen.length} pass` }
      : pass ? { cls: "", text: `${pass}/${scen.length} pass` } : { cls: "", text: "Not built" };
  }

  // Tried it in the app? Only for a slice whose every scenario passes.
  let tried = null;
  const built = allPass(book, sl);
  if (built) {
    const worksNow = book.feedback.some(e => e.type === "SliceWorks" && e.data.sliceId === sl.id);
    const writing = !!(compose && compose.kind === "problem" && compose.sliceId === sl.id && !compose.scenarioId);
    tried = openProblem(book, sl) ? { problem: true }
      : { problem: false, works: (book.works[sl.id] && !worksNow) || (!worksNow && allTried(book, sl)) ? "badge" : locked ? "" : "button", worksNow, canReport: !locked,
          composer: writing ? composerOf(book, screen) : null };
  }

  const scenario = (sc, isNew) => {
    const r = isNew ? null : result(book, sl, sc);
    const key = sl.id + "/" + sc.id;
    const talk = !isNew && (book.comments.some(c => c.scenarioId === sc.id && !c.threadId && !c.resolved) || book.comments.some(c => c.scenarioId === sc.id && c.draft));
    const writing = !!(compose && compose.scenarioId === sc.id);
    const foldable = !isNew && !!r && r.passing && !talk && !writing;
    const t = sc.then || {};
    // Tried in the app? For each passing scenario of a built slice: done (from the plan), ticked this round, or still to try.
    const triedNow = book.feedback.some(e => e.type === "ScenarioTried" && e.data.sliceId === sl.id && e.data.scenarioId === sc.id);
    const tryIt = built && !isNew && r && r.passing && !talk
      ? { state: triedNow ? "now" : isTried(book, sl, sc) ? "done" : "todo", canTick: !locked, canReport: !locked } : null;
    return {
      key, id: sc.id, title: sc.title, isNew: !!isNew, tried: tryIt,
      dot: r ? (r.passing ? "pass" : "fail") : "", dotTitle: r ? (r.passing ? "test passes" : "test fails") : "no test yet",
      foldable, folded: foldable && !screen.openSc.has(key),
      given: (sc.given || []).map(g => g.type || g),
      when: kind === "view" ? { opens: sl.name } : { command: sc.when || sl.name },
      then: t.rejected != null ? { refused: t.rejected } : t.events ? { events: t.events.map(e => e.type || e) }
        : t.view ? { shows: typeof t.value === "string" ? t.value : JSON.stringify(t.value) } : { nothing: true },
      error: r && !r.passing && r.error ? r.error : "",
      threads: isNew ? [] : threadsOf(book, screen, c => c.scenarioId === sc.id),
      composer: !isNew && compose && (compose.kind === "scenario" || compose.kind === "problem") && compose.scenarioId === sc.id && !compose.threadId ? composerOf(book, screen) : null,
      canComment: !locked && !isNew, canRemove: !locked && !!isNew, sliceId: sl.id
    };
  };

  const writingSlice = !!(compose && compose.kind === "slice" && !compose.threadId && compose.sliceId === sl.id && !compose.scenarioId);
  const adding = screen.addFor === sl.id && screen.form;
  return {
    id: sl.id, kind, label: kindLabel[kind], name: sl.name, refined: on, locked,
    flow: kind === "view" ? { from: sl.reads || [] } : { to: sl.produces || [] },
    badge, hide: openedBuilt, canFold: !openedBuilt && on, tried,
    fields: sl.fields && sl.fields.length ? { label: kind === "view" ? "Shows" : "Needs", list: sl.fields } : null,
    description: sl.description || "",
    threads: threadsOf(book, screen, t => t.sliceId === sl.id && !t.scenarioId),
    composer: writingSlice ? composerOf(book, screen) : null, canComment: !locked && !writingSlice,
    scenarios: [...scen.map(sc => scenario(sc, false)),
      ...book.added.filter(a => a.sliceId === sl.id).map(a => scenario({ id: a.scenarioId, title: a.name, given: a.given, when: a.when, then: a.then }, true))],
    addForm: !locked && adding ? { sliceId: sl.id, name: sl.name, view: kind === "view", events: book.events, produces: sl.produces || book.events, ...screen.form } : null,
    canAdd: !locked && !adding
  };
}
