// Comment threads and the comment box, as the views that show them need them. Pure.

// The threads whose first comment matches, each with its replies and whether the person is replying to it.
export function threadsOf(book, screen, match) {
  return book.comments.filter(c => !c.threadId && match(c)).map(root => ({
    id: root.id, sliceId: root.sliceId || "", scenarioId: root.scenarioId || "", part: root.part || "",
    resolved: !!root.resolved, resolvedNow: !!root.resolvedNow,
    comments: [root, ...book.comments.filter(c => c.threadId === root.id)].map(c => ({
      id: c.id, ai: c.author === "ai", at: c.at || "", part: c.part ? c.part[0].toUpperCase() + c.part.slice(1) : "",
      text: c.text, problem: !!c.problem, draft: !!c.draft })),
    replying: !!(screen.compose && screen.compose.threadId === root.id) ? composerOf(book, screen) : null,
    locked: book.locked
  }));
}

// The open comment box: what it's for, its prompt and its button.
export function composerOf(book, screen) {
  const c = screen.compose;
  if (!c) return null;
  const problem = c.kind === "problem" && !c.threadId;
  const sl = problem && book.slices.find(s => s.id === c.sliceId);
  return {
    part: c.kind === "scenario" && !c.threadId,
    title: problem ? `What doesn't work in ${(sl && sl.name) || "this slice"}?` : "",
    placeholder: c.threadId ? "Reply…" : problem ? "What did you try, and what happened?" : "What's wrong, missing or unclear?",
    button: c.threadId ? "Reply" : problem ? "Report problem" : "Add comment"
  };
}
