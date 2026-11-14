import { kindOf, kindLabel, words, allPass } from "../facts.js";
// The plan as a traditional event model: chapters left to right, a column per slice,
// its command or view on top and the events it causes below.
export function eventModelBoard(book) {
  const status = sl => allPass(book, sl) ? { cls: "built", text: "✓ built" } : book.refined[sl.id] ? { cls: "refined", text: "refined" } : { cls: "", text: "not refined" };
  const col = sl => {
    const kind = kindOf(sl);
    return { id: sl.id, kind, label: kindLabel[kind], title: words(sl.name), status: status(sl), reads: sl.reads || [],
      events: kind === "view" ? [] : (sl.produces || []).map(e => ({ name: e, title: words(e) })) };
  };
  const groups = book.chapters.map(name => ({ name, cols: book.slices.filter(s => s.chapter === name).map(col) }));
  const orphans = book.slices.filter(s => !s.chapter);
  if (orphans.length) groups.push({ name: "Other", cols: orphans.map(col) });
  return { groups: groups.filter(g => g.cols.length) };
}
