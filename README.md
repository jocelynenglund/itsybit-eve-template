# itsybit EVE

**E**vent modeling · **V**ertical slices · **E**vent sourcing

A starting point for building an app with your AI assistant. You and the AI agree on a plan first, in an **Event Book** you can comment on. Then the AI builds it slice by slice, tests first, and you open the finished app in your browser.

**See it:** [the sample's Event Book](https://jocelynenglund.github.io/itsybit-eve-template/eve/book.html?root=../sample/todo/) · [the sample app](https://jocelynenglund.github.io/itsybit-eve-template/sample/todo/app/)

## How it goes

1. **Make your own copy:** press **Use this template** on GitHub (it can be private), then clone your copy. Or download the zip. Open your AI assistant in it: Claude Code, Cursor, Codex or anything that reads `AGENTS.md`.
2. Say **"let's plan a todo app"** (or your idea). The AI writes `plan/model.json` and starts the Event Book at http://localhost:4747.
3. **In the Event Book**, read each slice: what someone can do or see, with Given / When / Then examples. Comment on a slice, a scenario, or one line of it. Add scenarios you're missing. Tick **Refined** when a slice is right. Press **Done with feedback**.
4. Tell the AI **"done"**. It reads your round (`plan/feedback/round-N.json`), answers every comment, updates the plan, and the book shows the next round. Repeat until every slice is refined.
5. Say **"start building"**. The AI builds each slice like `sample/todo/`: tests from your scenarios first, then the code. The book turns each scenario green as its test passes.
6. Open **http://localhost:4747/app/**. That's your app.

You need [Node](https://nodejs.org) 18 or newer. There's nothing to install.

## Getting newer versions of EVE

When EVE gets better, your Event Book says so. Tell your AI **"update EVE"**, or run `node eve/update.mjs` yourself. It replaces EVE's own files (`eve/`, the `eve-*` skills, `AGENTS.md`, `sample/`) with the newest ones and never touches your `plan/` or `app/`. It works however you made your copy, git or not. `node eve/update.mjs --check` only says whether there's a newer one.

## What's here

| Path | What it is |
|---|---|
| `AGENTS.md` | How the AI works in this repo: the loop, the plan format, the code rules. `CLAUDE.md` loads it for Claude Code. |
| `.claude/skills/` | `eve-plan`, `eve-refine`, `eve-build`: the step-by-step for each phase. Plain markdown, so other assistants can follow them too. |
| `eve/book.html` | The Event Book. |
| `eve/serve.mjs` | Serves the book and your app, and saves your feedback rounds. `node eve/serve.mjs` |
| `eve/update.mjs` | Updates the EVE tools to the newest version, leaving your plan and app alone. `node eve/update.mjs` |
| `eve/test.mjs` | Runs your app's tests, writes `plan/built.json`, and says how many planned scenarios pass. `node eve/test.mjs` |
| `sample/todo/` | A small app planned and built this way: its plan, its feedback threads and its code. Try `node eve/serve.mjs sample/todo`. |
| `plan/`, `app/` | Where your plan and your app go. |

## The shape of an EVE app

- The only thing stored is a list of **events**: facts like `TodoAdded`. Everything on screen is worked out from them.
- Each thing a person can do is a **command slice**: a folder with a pure `decide(history, command)` that returns new events or refuses with a reason, plus its tests.
- Each thing a person can see is a **view slice**: a pure `project(history)`, plus its tests.
- Every test is one of the Given / When / Then scenarios you agreed in the Event Book, with the same title. That's how the book knows what's built.

The Event Book's files use the same names as the full Event Book app (`CommentAdded`, `ScenarioAdded`, `SliceMarkedRefined`, and Given/When/Then scenario exports), but you don't need anything beyond this repo.

## For maintainers

Bump `eve/version.json` (a date: `2026-11-01`, or `2026-11-01.2` for a second release that day) whenever `eve/`, the `eve-*` skills, `AGENTS.md` or `sample/` change. That's how people's Event Books know there's a newer EVE. `eve/update.mjs` downloads `main`, so keep `main` working, and keep reading old `plan/model.json` files.

## License

MIT
