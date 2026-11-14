// The Event Book is event-sourced too. What it reads is a list of events:
//   PlanLoaded { model }      plan/model.json, as the AI last wrote it
//   TestsRan { files, … }     plan/built.json, from `node eve/test.mjs` (absent until something is built)
//   then this round's feedback, as the person gives it: CommentAdded, CommentResolved, ScenarioAdded,
//   SliceMarkedRefined, SliceRefinedCleared, SliceWorks, ScenarioTried, LookAndFeelSet
//   FeedbackSent { saved }    the round went to plan/feedback/ (the book is locked until the next round)
// replay(history) folds them into "the book": one object every view reads. Pure: no DOM, no storage, no clock.

const FEEDBACK = new Set(["CommentAdded", "CommentResolved", "ScenarioAdded", "SliceMarkedRefined", "SliceRefinedCleared", "SliceWorks", "ScenarioTried", "LookAndFeelSet"]);

export function replay(history) {
  let model = null, built = null, sent = "";
  const feedback = [];
  for (const e of history) {
    if (e.type === "PlanLoaded") model = e.data;
    else if (e.type === "TestsRan") built = e.data;
    else if (e.type === "FeedbackSent") sent = e.data.saved;
    else if (FEEDBACK.has(e.type)) feedback.push(e);
  }
  if (!model) return null;

  const slices = model.slices || [];
  const chapters = (model.chapters || []).map(c => c.name);
  for (const s of slices) if (s.chapter && !chapters.includes(s.chapter)) chapters.push(s.chapter);

  const results = new Map();
  for (const f of (built && built.files) || []) for (const s of f.scenarios || []) results.set(s.slice + "\u0000" + s.title, s);

  const comments = (model.comments || []).map(c => ({ ...c }));
  const added = [], refined = {}, works = {}, tried = new Set();
  for (const sl of slices) { refined[sl.id] = !!sl.refined; works[sl.id] = !!sl.works; for (const sc of sl.scenarios || []) if (sc.tried) tried.add(sl.id + "/" + sc.id); }
  let look = model.look || null, lookNew = false;
  for (const e of feedback) {
    const d = e.data;
    if (e.type === "LookAndFeelSet") { look = d; lookNew = true; }
    if (e.type === "CommentAdded") comments.push({ id: d.commentId, sliceId: d.sliceId, scenarioId: d.scenarioId, part: d.part, threadId: d.threadId, author: "you", text: d.text, at: d.at, problem: !!d.problem, draft: true });
    if (e.type === "CommentResolved") { const c = comments.find(x => x.id === d.commentId); if (c) { c.resolved = true; c.resolvedNow = true; } }
    if (e.type === "ScenarioAdded") added.push(d);
    if (e.type === "SliceMarkedRefined") refined[d.sliceId] = true;
    if (e.type === "SliceRefinedCleared") refined[d.sliceId] = false;
    if (e.type === "SliceWorks") works[d.sliceId] = true;
    if (e.type === "ScenarioTried") tried.add(d.sliceId + "/" + d.scenarioId);
  }
  return {
    app: model.app || "", idea: model.idea || "", round: model.round || 1,
    events: (model.events || []).map(e => e.name), chapters, slices,
    tested: results.size > 0, results,
    comments, added, refined, works, tried, look, lookNew,
    feedback, sent, locked: !!sent
  };
}
