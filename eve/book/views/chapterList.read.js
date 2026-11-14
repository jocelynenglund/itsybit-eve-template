import { foldedAsBuilt, shown } from "../facts.js";
// The chapters, and how each slice in them shows: an open card, a folded refined line, or a folded built line.
// A chapter where everything is built folds to one line while something else is new.
export function chapterList(book, screen) {
  const done = foldedAsBuilt(book);
  const plain = screen.filter === "all" && !String(screen.q || "").trim();
  const entry = (sl, allDone) => done.has(sl.id) && !allDone
    ? (screen.openDone.has(sl.id) ? { id: sl.id, as: "card", openedBuilt: true } : { id: sl.id, as: "built" })
    : book.refined[sl.id] && screen.folded.has(sl.id) ? { id: sl.id, as: "folded" } : { id: sl.id, as: "card", openedBuilt: false };
  const chapters = [];
  for (const name of book.chapters) {
    const list = book.slices.filter(s => s.chapter === name && shown(book, screen, s));
    if (!list.length) continue;
    const allDone = plain && list.every(s => done.has(s.id));
    const open = screen.openDone.has("ch:" + name);
    chapters.push({ name, built: allDone ? { count: list.length, open } : null, slices: allDone && !open ? [] : list.map(s => entry(s, allDone)) });
  }
  const orphans = book.slices.filter(s => !s.chapter && shown(book, screen, s));
  if (orphans.length) chapters.push({ name: "Other", built: null, slices: orphans.map(s => entry(s, false)) });
  const any = book.slices.some(s => shown(book, screen, s));
  const q = String(screen.q || "").trim();
  return { chapters, empty: any ? "" : q ? `Nothing matches “${q}”.` : "No slices here right now." };
}
