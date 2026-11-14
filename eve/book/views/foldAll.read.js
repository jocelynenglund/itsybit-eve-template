import { foldedAsBuilt } from "../facts.js";
// Fold or show every refined slice at once (built ones fold by themselves). Only worth it for two or more.
export function foldAll(book, screen) {
  const done = foldedAsBuilt(book);
  const ref = book.slices.filter(s => book.refined[s.id] && !done.has(s.id));
  if (ref.length < 2) return null;
  const open = ref.some(s => !screen.folded.has(s.id));
  return { fold: open, text: open ? `▾ Fold the ${ref.length} refined slices` : `▸ Show the ${ref.length} refined slices` };
}
