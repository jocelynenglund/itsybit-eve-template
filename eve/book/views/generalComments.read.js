import { threadsOf, composerOf } from "../threads.js";
// Comments about the whole plan (not one slice), and the box to add one.
export function generalComments(book, screen) {
  const c = screen.compose;
  const writing = !!(c && c.kind === "board" && !c.threadId);
  return {
    threads: threadsOf(book, screen, t => !t.sliceId),
    composer: writing ? composerOf(book, screen) : null,
    canAdd: !book.locked && !writing
  };
}
