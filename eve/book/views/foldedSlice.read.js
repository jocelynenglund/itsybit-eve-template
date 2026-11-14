import { kindOf, kindLabel } from "../facts.js";
// A refined slice folded to one line: what it is, how many scenarios, anything not sent yet, and its tick.
export function foldedSlice(book, sliceId) {
  const sl = book.slices.find(s => s.id === sliceId), kind = kindOf(sl);
  const unsent = book.comments.filter(c => c.sliceId === sl.id && c.draft).length + book.added.filter(a => a.sliceId === sl.id).length;
  return { id: sl.id, kind, label: kindLabel[kind], name: sl.name, scenarios: (sl.scenarios || []).length, unsent, locked: book.locked };
}
