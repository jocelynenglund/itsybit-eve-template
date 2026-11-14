import { stateOf } from "../facts.js";
// The state filters, with how many slices are in each.
const FILTERS = [["all", "All"], ["refine", "To refine"], ["ready", "Ready to build"], ["built", "Built"]];
export function filterSwitch(book, screen) {
  const n = { all: book.slices.length, refine: 0, ready: 0, built: 0 };
  for (const s of book.slices) n[stateOf(book, s)]++;
  return FILTERS.map(([f, label]) => ({ f, label, n: n[f], on: screen.filter === f }));
}
