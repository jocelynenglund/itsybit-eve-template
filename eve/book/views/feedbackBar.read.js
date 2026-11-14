// The bar at the bottom: what this round's feedback holds so far, and Done with feedback.
export function feedbackBar(book, screen) {
  if (book.locked) return { locked: true, saved: book.sent };
  const c = { comments: 0, scenarios: 0, ticks: 0, resolved: 0, look: 0, works: 0, tried: 0, problems: 0 };
  for (const e of book.feedback) {
    if (e.type === "CommentAdded" && e.data.problem) c.problems++;
    else if (e.type === "CommentAdded") c.comments++;
    else if (e.type === "SliceWorks") c.works++;
    else if (e.type === "ScenarioTried") c.tried++;
    else if (e.type === "ScenarioAdded") c.scenarios++;
    else if (e.type === "CommentResolved") c.resolved++;
    else if (e.type === "LookAndFeelSet") c.look = 1;
    else c.ticks++;
  }
  const parts = [];
  const n = (k, one, many = one + "s") => c[k] && parts.push(c[k] + " " + (c[k] > 1 ? many : one));
  n("comments", "comment"); n("scenarios", "new scenario"); n("ticks", "Refined change");
  if (c.resolved) parts.push(c.resolved + " resolved");
  if (c.works) parts.push(c.works + " tried and working");
  n("tried", "scenario tried", "scenarios tried");
  n("problems", "problem");
  if (c.look) parts.push("look and feel");
  return { locked: false, parts, saving: !!screen.saving, canSend: parts.length > 0 && !screen.saving };
}
