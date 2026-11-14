import { foldedAsBuilt, testTotals } from "../facts.js";
// What the person should do now, in one note.
//   follow-up   a new feature: new slices to read, built ones folded away
//   new-refined the new slices are refined: start building
//   built       every planned scenario passes
//   building    some tests exist
//   refined     every slice is refined: start building
//   read        the first rounds: read, comment, tick
export function bookIntro(book, screen) {
  const slices = book.slices, done = foldedAsBuilt(book);
  const followUp = done.size > 0 && slices.some(s => !done.has(s.id));
  const allRefined = slices.length > 0 && slices.every(s => book.refined[s.id]);
  const t = testTotals(book), quiet = book.feedback.length === 0;
  const kind = followUp && !allRefined ? "follow-up"
    : followUp && allRefined && quiet && t.passing < t.total ? "new-refined"
    : t.total && t.passing === t.total && allRefined ? "built"
    : t.any ? "building"
    : allRefined && quiet ? "refined"
    : "read";
  return { kind, appLink: screen.root + "app/" };
}
