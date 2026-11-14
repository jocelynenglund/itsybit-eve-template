import { foldedAsBuilt, testTotals } from "../facts.js";
// How far along the plan is: slices refined, scenarios passing, and a way into the app once something is built.
export function progressPills(book, screen) {
  const slices = book.slices, done = foldedAsBuilt(book);
  const open = slices.filter(s => !done.has(s.id));
  const allRefined = slices.length > 0 && slices.every(s => book.refined[s.id]);
  const pills = [];
  if (done.size && open.length) {
    const n = open.filter(s => book.refined[s.id]).length;
    pills.push({ text: `${n} of ${open.length} new ${open.length === 1 ? "slice" : "slices"} refined`, ok: allRefined });
    pills.push({ text: `${done.size} built`, ok: true });
  } else pills.push({ text: `${slices.filter(s => book.refined[s.id]).length} of ${slices.length} slices refined`, ok: allRefined });
  const t = testTotals(book);
  if (t.total) pills.push({ text: `${t.passing} of ${t.total} scenarios pass`, ok: t.passing === t.total });
  return { pills, appLink: t.any ? screen.root + "app/" : null };
}
