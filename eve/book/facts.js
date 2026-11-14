// Small facts about the book that several views need. Pure functions of the replayed book.

export const kindOf = sl => sl.type === "view" ? "view" : sl.type === "automation" ? "automation" : "command";
export const kindLabel = { command: "Command", view: "View", automation: "Automation" };
export const words = n => String(n || "").replace(/([a-z0-9])([A-Z])/g, "$1 $2");

// The test result for one planned scenario, or undefined when it has no test yet.
export const result = (book, sl, sc) => book.results.get(sl.name + "\u0000" + sc.title);

// Every planned scenario of the slice has a passing test.
export function allPass(book, sl) {
  const scen = sl.scenarios || [];
  return book.tested && scen.length > 0 && scen.every(sc => { const r = result(book, sl, sc); return r && r.passing; });
}

// The person tried this scenario in the app and it did what it says (or said the whole slice works).
export const isTried = (book, sl, sc) => book.tried.has(sl.id + "/" + sc.id) || !!book.works[sl.id];
export const allTried = (book, sl) => (sl.scenarios || []).length > 0 && (sl.scenarios || []).every(sc => isTried(book, sl, sc));
// Built, and some scenario hasn't been tried in the app yet.
export const toTry = (book, sl) => isDone(book, sl) && !allTried(book, sl);

export const openProblem = (book, sl) => book.comments.some(c => c.sliceId === sl.id && c.problem && !c.resolved);

// Built: refined, every planned scenario passes, and nothing new from the person touches it.
export function isDone(book, sl) {
  if (!book.refined[sl.id] || !allPass(book, sl)) return false;
  if (book.added.some(a => a.sliceId === sl.id)) return false;
  return !book.comments.some(c => c.sliceId === sl.id && (c.draft || (c.problem && !c.resolved)));
}

// Built slices fold away only while something else is new; a finished book shows everything.
export function foldedAsBuilt(book) {
  const done = new Set(book.slices.filter(s => isDone(book, s)).map(s => s.id));
  return done.size === book.slices.length ? new Set() : done;
}

// Every slice is in one state: to refine (not ticked yet), ready (ticked, not built), built.
export const stateOf = (book, sl) => isDone(book, sl) ? "built" : book.refined[sl.id] ? "ready" : "refine";

// Search: every word typed appears somewhere in the slice: name, events, fields, scenarios, refusals.
export function matches(sl, q) {
  const ws = String(q || "").toLowerCase().split(/\s+/).filter(Boolean);
  if (!ws.length) return true;
  const hay = [sl.name, words(sl.name), sl.chapter, sl.description, ...(sl.produces || []), ...(sl.reads || []), ...(sl.fields || []),
    ...(sl.scenarios || []).flatMap(sc => [sc.title, sc.when, ...(sc.given || []).map(g => g.type || g), ...((sc.then || {}).events || []).map(e => e.type || e), (sc.then || {}).rejected, (sc.then || {}).view, typeof (sc.then || {}).value === "string" ? sc.then.value : ""])]
    .filter(Boolean).join(" ").toLowerCase();
  return ws.every(w => hay.includes(w));
}

export const shown = (book, screen, sl) => (screen.filter === "all" || (screen.filter === "totry" ? toTry(book, sl) : stateOf(book, sl) === screen.filter)) && matches(sl, screen.q);

// How many planned scenarios pass.
export function testTotals(book) {
  let total = 0, passing = 0;
  for (const sl of book.slices) for (const sc of sl.scenarios || []) { total++; const r = result(book, sl, sc); if (r && r.passing) passing++; }
  return { total: book.tested ? total : 0, passing, any: book.tested };
}
