# Kickoff

Paste this to your AI coding assistant in the project folder.

---

You're building **Plant Swap**, an event-sourced app made of vertical slices. Read `CLAUDE.md` first and follow it.

1. Set up an empty TypeScript + Node (Vitest) project with a test runner, the event types from `docs/model.json`, and an event store that is an append-only file, data/events.jsonl (one JSON event per line). Show me one passing test, then commit.
2. Build these slices one at a time, in this order:
   1. ListPlant (command), spec in `docs/slices/ListPlant.md`
   2. RequestSwap (command), spec in `docs/slices/RequestSwap.md`
   3. AcceptSwap (command), spec in `docs/slices/AcceptSwap.md`
   4. DeclineSwap (command), spec in `docs/slices/DeclineSwap.md`
   5. ConfirmHandover (command), spec in `docs/slices/ConfirmHandover.md`
   6. AvailablePlants (view), spec in `docs/slices/AvailablePlants.md`
   7. MySwapRequests (view), spec in `docs/slices/MySwapRequests.md`
3. For each slice: write its scenarios as tests, run them and show me they fail, write the code until they pass, wire up its endpoint, run every test, commit.
4. After each slice, update `docs/progress.js` as `CLAUDE.md` describes, and tell me in one line what someone can now do in the app. I follow along in `docs/event-book.html`.

When a scenario looks wrong, or a slice seems to need an event, field or rule that isn't in the model, stop: post it in `docs/progress.js` with `needs: true` and ask me here too.
