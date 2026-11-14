// Which tabs there are and which one is open. Look gets a dot while this round changes it.
const TABS = [["book", "Book"], ["board", "Board"], ["app", "App"], ["look", "Look"], ["export", "Export"]];
export function tabSwitch(book, screen) {
  return TABS.map(([mode, label]) => ({ mode, label, on: screen.mode === mode, dot: mode === "look" && book.lookNew }));
}
