---
name: eve-refine
description: Read the person's Event Book feedback round and answer it by updating the plan, then serve the next round. Use when the person says "done", "done with feedback", "I left feedback", or "check my comments" while planning an EVE app.
---

# Answer a feedback round

1. **Find the round:** the newest file in `plan/feedback/` (`round-N.json`, N = `round` in `plan/model.json`; a `-2` suffix means they sent twice, so read both). If there isn't one, ask them to press **Done with feedback** in the book. If the book showed an error, check that `node eve/serve.mjs` is running. A downloaded file belongs in `plan/feedback/`.
2. **Apply each event in order** to `plan/model.json`:
   - `CommentAdded` with `problem: true`: they tried a built slice in the app and it doesn't do what they expected. With a `scenarioId`, it's that one scenario. Copy it into `comments` like any comment (keep `problem: true`), set the slice's `works` to false (and that scenario's `tried` to false), then **fix it test-first**: find the scenario that should have caught it, or add one that says what should happen (their words as the title). Run `node eve/test.mjs` and see it fail, fix the code until everything passes, and reply in the thread with what was wrong and what you changed (name the scenario). If what they expected isn't what the plan says, don't change the code: reply with the difference and offer a choice. A scenario added for a problem they reported keeps the slice's Refined tick: they asked for it.
   - `SliceWorks`: they tried that slice in the app and it works. Set its `works` to true. No answer needed.
   - `ScenarioTried`: they tried that one scenario in the app and it does what it says. Set `tried: true` on that scenario. No answer needed. (Once every scenario of a slice is tried, the book shows the slice as working.)
   - `CommentAdded`: copy it into `comments` (author "you", keep its `commentId` as `id` and its `sliceId`, `scenarioId`, `part`, `threadId`, `at`). Then **answer it**: add your own comment with `threadId` set to the root of that thread (author "ai"). If it asks for a change, make the change and say what you changed. If it's a question, answer it. If you disagree, say why and offer a choice.
   - `CommentResolved`: set `resolved: true` on that comment.
   - `ScenarioAdded`: add it to the slice's `scenarios` as `{ id: scenarioId, title: name, given, when, then }`. Keep their title. If it needs a new event or contradicts another scenario, add an `ai` comment on it saying so.
   - `SliceMarkedRefined` / `SliceRefinedCleared`: set that slice's `refined` to true / false.
   - `LookAndFeelSet`: copy its data into `look` in the plan, replacing what was there. It's what eve-design designs from. No answer needed unless something in it is unclear.
3. **Refined stays honest:** if you change a slice in a way they didn't ask for in this round (new fields, events or scenarios, changed wording of a rule), set its `refined` back to false and say why in an `ai` comment. Changes they asked for and then ticked keep their tick. Any change to a slice's code or scenarios also sets its `works` back to false, and any change to a scenario (its Given, When, Then or the code behind it) sets that scenario's `tried` back to false: they try it again.
4. **Next round:** add 1 to `round`, save the file, and check it still parses. The book picks up the new round by itself.
5. **Tell them** in at most five lines: what you changed, which slices still need a tick (by name), and "open the book, it shows round N".
6. **When every slice is refined** and there are no open questions, say: "Every slice is refined. Say **start building** when you're ready."
