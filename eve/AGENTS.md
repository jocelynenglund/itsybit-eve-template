# ItsyBIT EVE Template: how to work in this app

You are helping a person turn an idea into a working app, the EVE way:
**E**vent modeling (plan the app as events, commands and views; it's Adam Dymitruk's method, see eventmodeling.org), **V**ertical slices (one folder per thing a person can do or see), **E**vent sourcing (the only stored state is a list of events).

The person may not be a programmer. Talk about what the app does, not about code. Keep messages short.

## The loop

| They say | You do | Detailed steps |
|---|---|---|
| "let's plan a todo app" (any app idea) | Write `plan/model.json`, start the Event Book, tell them to open it | `.claude/skills/eve-plan/SKILL.md` |
| "done", "done with feedback" | Read their feedback round, answer every comment, update the plan, serve the next round | `.claude/skills/eve-refine/SKILL.md` |
| "now add reminders" (a new feature for an app that's already planned or built) | Add the new slices to `plan/model.json` (keep the rest), serve the next round | `.claude/skills/eve-plan/SKILL.md` |
| "make it beautiful" (or "design it", or they name a design tool) | Turn the plan into a design brief (`node eve/brief.mjs`), send it to their design tool, restyle the app from what comes back | `.claude/skills/eve-design/SKILL.md` |
| "export to eventmodelers" (or they want to work with a team) | Run `node eve/eventmodelers.mjs`; tell them to import `plan/eventmodelers.json` at https://eventmodelers.ai (EM-Studio). Or point them at the Event Book's Export button | (none) |
| "update EVE" | Run `node eve/update.mjs`, then `node eve/test.mjs`. Tell them what's new from the notes it prints, in a line or two, and that their app still passes. If it's a git repo, commit it as "Update EVE" | (none) |
| "start building" | Build every slice test-first, following `eve/sample/todo/` | `.claude/skills/eve-build/SKILL.md` |

The person refines in rounds until **every slice is ticked Refined**. Only they tick Refined. You never set `refined: true` yourself: a slice is refined when their feedback says so (`SliceMarkedRefined`).

## Files

Everything at the top level belongs to the person; everything EVE is in `eve/`.

```
README.md                  their app's readme (eve/init.mjs writes it at the first plan)
AGENTS.md                  their notes about this app; points here
plan/model.json            the plan: chapters, events, slices, scenarios, comments (you write it)
plan/feedback/round-N.json what the person sent from the Event Book (you read it, never edit it)
plan/built.json            test results, written by `node eve/test.mjs` (never write it by hand)
plan/design-brief.md       the plan as a brief for a design tool, written by `node eve/brief.mjs`
design/                    what came back from their design tool (HTML, CSS, images), or your style guide
app/                       the app you build
eve/                       EVE itself: the Event Book, the tools (serve, test, brief, eventmodelers, update, init),
                           these rules, the sample, the website. Don't change it: updates replace it.
eve/sample/todo/           the reference: a small app planned and built this way. Copy its shapes.
```

Commands (Node 18 or newer, nothing to install):

- `node eve/serve.mjs` serves the Event Book at http://localhost:4747 and the app at http://localhost:4747/app/. Run it in the background and leave it running.
- `node eve/test.mjs` runs the app's tests, writes `plan/built.json`, and says how many planned scenarios pass.
- `node eve/brief.mjs` writes `plan/design-brief.md`: the screens, actions, messages and example content, for a design tool.
- `node eve/eventmodelers.mjs` writes `plan/eventmodelers.json`, the plan as a board to import at eventmodelers.ai.
- `node eve/update.mjs` updates EVE (`eve/` and the eve-* skills) to the newest version. It never touches `app/`, `plan/` or anything else at the top level. `--check` only says whether there's a newer one.
- `node eve/serve.mjs eve/sample/todo` and `node eve/test.mjs eve/sample/todo` do the same for the sample.

## The plan format

Follow `eve/sample/todo/plan/model.json` exactly. In short:

- `app`, `idea`, `round` (starts at 1, goes up by one each time you answer feedback), `chapters` [{name}], `events` [{name, fields}].
- `slices`: each has `id` (kebab-case), `name` (PascalCase), `type` (`command` | `view` | `automation`), `chapter`, `fields`, `produces` (commands) or `reads` (views), `refined`, and `scenarios`.
- A scenario: `{ id, title, given: [{type}], when: <slice name>, then }`. `then` is `{ events: [{type}] }`, `{ rejected: "reason" }` or `{ view: <name>, value: "what it shows, in words" }`.
- `look` (optional): what the app should feel like, filled in on the Event Book's Look and feel card: `{ moods: [], colours: ["#hex"], theme ("light"|"dark"|"both"|""), type, likes, device ("phone"|"laptop"|"both"|""), where, notes }`. You copy it from the feedback round; eve-design and `node eve/brief.mjs` use it.
- `comments`: `{ id, sliceId?, scenarioId?, part? ("given"|"when"|"then"), threadId? (the comment it answers), author ("you"|"ai"), text, at, resolved? }`. No `sliceId` means a general comment.

## Rules for the plan

- Events are facts in the past tense (`TodoAdded`). Commands are requests (`AddTodo`). Views are what someone looks at (`TodoList`).
- Every command's **first scenario is its happy case**: Given nothing (or the fewest events it needs) → When the command → Then its event. Then one scenario per way it can be refused, each with the reason the person will see.
- Every view has at least one scenario. Every event is produced by a command and shown by a view (or you say in a comment why not).
- Keep a first plan small: 3 to 7 slices. More can come in later rounds.
- When you made a decision the person might disagree with, say so in an `ai` comment on that slice.

## Rules for the code

Copy the shapes in `eve/sample/todo/app/`:

- `app/lib/store.js` keeps events in the browser (localStorage). `app/lib/gwt.mjs` is the test helper. Copy both unchanged.
- One folder per slice: `app/slices/<id>/`. A command slice has `decide.js` exporting `decide(history, command)` that returns `{ events: [...] }` or `{ rejected: "reason" }`. A view slice has `project.js` exporting `project(history)`.
- `decide` and `project` are pure: no storage, no DOM, no clock, no random ids inside them. Pass ids and times in through the command.
- Each slice has `<id>.test.mjs` with **one test per planned scenario, using the same title** as `plan/model.json`. That's how the Event Book shows what is built.
- `app/main.js` only wires buttons and forms to slices with `run(store, decide, command)` and draws views. `app/index.html` loads it.
- Test first: write the slice's tests, run `node eve/test.mjs` and see them fail, then write the code until they pass.
- Never change a planned scenario to make a test pass.
- The look lives in `app/style.css`, `app/index.html` and the drawing part of `app/main.js`. If `design/` has a design, follow it there (see eve-design). If one looks wrong, ask (see eve-build).
