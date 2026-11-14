# The Event Book's code

`eve/book.html` loads `main.js`. Nothing to build or install.

The book is event-sourced, like the apps it plans. What it reads is a list of events: the plan loaded
(`plan/model.json`), the tests run (`plan/built.json`), then this round's feedback as the person gives it.

| File | What it does |
|---|---|
| `replay.js` | Folds that history into the book: one object every view reads. Pure. |
| `views/<name>.read.js` | One view per question the screen asks ("how many slices in each state?"), named for it. Pure. Each feeds exactly one component. |
| `parts/<tab>.parts.js` | The components: each draws its one view as HTML, marks its root `data-component`, and imports nothing but `html.js`. |
| `screens/<tab>.screen.js` | Each tab: composes views into components. No state, no controls of its own. |
| `facts.js`, `threads.js` | Small pure helpers the views share. |
| `store.js` | The only module that touches the network or the browser's storage: the plan as last read, this round's feedback, what's on screen. |
| `actions.js` | What the person does (taps, ticks, forms), turned into feedback events or screen changes. |
| `main.js`, `arrows.js` | One draw: replay once, draw the open tab. The Board's arrows are measured after. |

Tests (`node --test "eve/book/tests/*.test.mjs"`, nothing to install):
`views.test.mjs` gives each view Given/When/Then scenarios with EVE's own helper, `parts.test.mjs` draws each
component from its view, and `structure.test.mjs` keeps the rules above true. The browser tests are in `eve/dev/`.
