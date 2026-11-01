---
name: eve-plan
description: Plan a new app the EVE way (event modeling, vertical slices, event sourcing) and serve its Event Book for feedback. Use when the person says "let's plan <an app>", "plan a todo app", "I want to build …", or describes an app idea.
---

# Plan an app

1. **Ask, briefly.** At most three short questions in one message: who uses it, the few things they do in it, and anything it must refuse. If the idea is already clear, or they say "you decide", skip this and decide.
2. **Write `plan/model.json`** in the exact shape of `sample/todo/plan/model.json` (see AGENTS.md → The plan format):
   - `round: 1`, every slice `refined: false`, `comments: []` to start.
   - 3 to 7 slices. Events in the order they usually happen.
   - Every command: happy case first (Given nothing, or the fewest events it needs), then one scenario per refusal with the reason the person will see.
   - Every view: at least one scenario saying in plain words what it shows.
   - For each decision they might disagree with, add an `ai` comment on that slice (author "ai", short, ends with a question when you want an answer).
3. **Check it:** run `node -e "JSON.parse(require('fs').readFileSync('plan/model.json','utf8'))"`. Every event is produced by a command, every command's first scenario is a happy case, and scenario ids are unique.
4. **Serve the book:** if http://localhost:4747 doesn't answer, start `node eve/serve.mjs` in the background and leave it running.
5. **Tell them**, in about four lines:
   - Open http://localhost:4747.
   - Comment on anything, add scenarios they're missing, and tick **Refined** on each slice that's right.
   - Press **Done with feedback**, then tell you "done".
