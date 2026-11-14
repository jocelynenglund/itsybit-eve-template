import { stateOf, toTry } from "../facts.js";
// The state filters, with how many slices are in each. "To try": built slices with a scenario not tried in the app yet.
const FILTERS = [["all", "All"], ["refine", "To refine"], ["ready", "Ready to build"], ["built", "Built"], ["totry", "To try"]];
export function filterSwitch(book, screen) {
  const n = { all: book.slices.length, refine: 0, ready: 0, built: 0, totry: 0 };
  for (const s of book.slices) { n[stateOf(book, s)]++; if (toTry(book, s)) n.totry++; }
  return FILTERS.map(([f, label]) => ({ f, label, n: n[f], on: screen.filter === f }));
}
