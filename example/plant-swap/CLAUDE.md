# Plant Swap: how to build it

Neighbours list houseplant cuttings they can spare and swap them with each other. Someone offers one of their own plants for a cutting they like; the owner accepts or declines, and they mark the swap done once the plants have changed hands.

Stack: TypeScript + Node (Vitest). Events are stored in an append-only file, data/events.jsonl (one JSON event per line).

## The shape of the code

- **Event-sourced.** The only state stored is an append-only list of events. Everything else is worked out from it. Never update or delete an event: a correction is a new event.
- **Vertical slices.** One folder per slice. A slice owns its command or view, its rules, its tests and its endpoint. No shared service or repository layer; shared code is limited to the event types and the event store adapter.
- **Plain data.** Events, commands and views are plain types. Events are facts in the past tense (PlantListed); commands are requests (ListPlant).
- **Pure rules.** Each command slice has one pure function that reads the history and either returns new events or refuses with a reason. No database, network or clock inside it: pass `now` in as an argument when a rule needs the time.
- **Pure views.** Each view slice has one pure function that folds the history into what the screen shows.
- **Thin endpoints.** The endpoint is the only place with I/O: load the events, call the function, append what it returns (or send back the refusal).

For example, `src/slices/list-plant/`:

```ts
export function decide(history: DomainEvent[], command: ListPlant): Decision
```

```ts
export function project(history: DomainEvent[]): AvailablePlantsView
```

## How to work

1. The model comes first. `docs/model.json` lists every event, command and view; `docs/slices/` has one spec per slice. If a slice needs an event that isn't in the model, stop and ask before adding it.
2. One slice at a time, in the order in `KICKOFF.md`.
3. Test first. Turn each Given/When/Then in the slice's spec into a test, run it and see it fail for the right reason, then write the code. Happy case first, then each refusal.
4. A slice is done when all its scenarios pass and the endpoint works. Never change a scenario to make a test pass; ask instead.
5. Tests of `decide` and `project` need no database, server or mocks: given a list of events, check the result.

A test has this shape (`a` builds example events and commands):

```ts
test("ListPlant: happy case", () => {
  const history = [];
  const decision = decide(history, a.listPlant());
  expect(decision).toMatchObject({ events: [{ type: "PlantListed" }] });
});
```

## Reporting back: the Event Book

`docs/event-book.html` is the plan, frozen. The person opens it in a browser to see how the build is going. Never edit it, and don't edit `docs/model.json` without asking.

You report by editing **`docs/progress.js`**, and only that file:

- When you start a slice, set its `status` to `building`. When all its scenarios pass, set it to `done`.
- After every test run, set `scenarios` to `pass` / `fail` / `todo`, one per scenario, in the order of the slice's spec.
- Give each slice a one-line `note` in plain words: what works now, or what's in the way.
- Add a message to `messages` (`{ "at": "YYYY-MM-DD HH:MM", "slice": "…", "text": "…", "needs": false }`) after each slice. When you need a decision, an answer or an action from the person, set `needs: true`, set the slice to `blocked`, and say exactly what you need.
- Update `updatedAt` every time, and keep the file valid JavaScript.
