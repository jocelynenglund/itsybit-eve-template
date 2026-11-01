---
name: eve-refine
description: Read the person's Event Book feedback round and answer it by updating the plan, then serve the next round. Use when the person says "done", "done with feedback", "I left feedback", or "check my comments" while planning an EVE app.
---

# Answer a feedback round

1. **Find the round:** the newest file in `plan/feedback/` (`round-N.json`, N = `round` in `plan/model.json`; a `-2` suffix means they sent twice, so read both). If there isn't one, ask them to press **Done with feedback** in the book. If the book showed an error, check that `node eve/serve.mjs` is running. A downloaded file belongs in `plan/feedback/`.
2. **Apply each event in order** to `plan/model.json`:
   - `CommentAdded`: copy it into `comments` (author "you", keep its `commentId` as `id` and its `sliceId`, `scenarioId`, `part`, `threadId`, `at`). Then **answer it**: add your own comment with `threadId` set to the root of that thread (author "ai"). If it asks for a change, make the change and say what you changed. If it's a question, answer it. If you disagree, say why and offer a choice.
   - `CommentResolved`: set `resolved: true` on that comment.
   - `ScenarioAdded`: add it to the slice's `scenarios` as `{ id: scenarioId, title: name, given, when, then }`. Keep their title. If it needs a new event or contradicts another scenario, add an `ai` comment on it saying so.
   - `SliceMarkedRefined` / `SliceRefinedCleared`: set that slice's `refined` to true / false.
3. **Refined stays honest:** if you change a slice in a way they didn't ask for in this round (new fields, events or scenarios, changed wording of a rule), set its `refined` back to false and say why in an `ai` comment. Changes they asked for and then ticked keep their tick.
4. **Next round:** add 1 to `round`, save the file, and check it still parses. The book picks up the new round by itself.
5. **Tell them** in at most five lines: what you changed, which slices still need a tick (by name), and "open the book, it shows round N".
6. **When every slice is refined** and there are no open questions, say: "Every slice is refined. Say **start building** when you're ready."
