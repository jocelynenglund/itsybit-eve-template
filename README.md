# itsybit EVE

**E**vent modeling · **V**ertical slices · **E**vent sourcing

Vibe coding works better when the AI has a plan it can't drift from. itsybit EVE is a small, browser-only tool that turns an app idea into that plan, then hands it to your AI coding assistant (Claude Code, Cursor, anything) as a starter pack.

## How it works

1. **Idea.** Describe the app, then pick a stack (TypeScript, C# or Python) and an event store (a JSON Lines file or a SQLite table).
2. **Events.** List what can happen, as facts in the past tense: `PlantListed`, `SwapRequested`.
3. **Slices.** Add the command that causes each event and the views that show them. Each slice becomes its own folder.
4. **Scenarios.** Write Given / When / Then for every slice: the happy case first, then each refusal. Each one becomes a test before any code is written.
5. **Starter pack.** Copy the whole pack and paste it into your assistant in an empty folder.

## What's in the starter pack

| File | What it's for |
|---|---|
| `KICKOFF.md` | The prompt you paste: set up the project, then build one slice at a time, tests first. |
| `CLAUDE.md` | The rules: pure `decide(history, command)` and `project(history)` functions, one folder per slice, events never changed. |
| `docs/model.json` | The whole model: events, slices and scenarios. |
| `docs/slices/*.md` | One spec per slice, with its scenarios. |
| `docs/event-book.html` | **The Event Book.** Your plan, frozen. Open it in a browser to follow the build. |
| `docs/progress.js` | The only file the assistant writes to report back: slice status, pass/fail per scenario, notes, and messages. A message marked `needs: true` shows as **Needs you**. |

See [`example/plant-swap/`](example/plant-swap/) for a complete pack.

## Run it

It's one HTML file with no build step. Open `index.html` in a browser, or use the hosted copy on GitHub Pages. Your model stays in your browser (localStorage), stored as a log of events.

## License

MIT
