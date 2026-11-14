import { kindOf, kindLabel } from "../facts.js";
// A built slice folded to one line, and whether the person said it works.
export function builtSlice(book, sliceId) {
  const sl = book.slices.find(s => s.id === sliceId), kind = kindOf(sl);
  return { id: sl.id, kind, label: kindLabel[kind], name: sl.name, works: !!book.works[sl.id] };
}
