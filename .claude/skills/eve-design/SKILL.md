---
name: eve-design
description: Make an EVE app beautiful. Turn the plan and their Look and feel into a design brief, get three directions from their design tool (or make them), and restyle the app from the one they pick without changing what it does. Use when the person says "make it beautiful", "design it", "make it look nice", "style the app", or names a design tool.
---

# Design the app

Any time after the slices are refined. It's easiest once the app is built (there's something to look at), but it works before too: the design waits in `design/` and eve-build uses it.

1. **Their look and feel.** If the newest round in `plan/feedback/` has a `LookAndFeelSet` you haven't applied, apply it (eve-refine). If `look` in `plan/model.json` is still empty, tell them: open http://localhost:4747, fill in **Look and feel** at the top, press **Done with feedback**, and say "make it beautiful" again. If they'd rather just tell you, ask once in one short message (a mood, colours, apps they like the look of, where it gets used) and write their answers into `look` yourself. "You decide" is fine: decide, write it into `look`, and say what you picked.
2. **Write the brief.** Run `node eve/brief.mjs`. It writes `plan/design-brief.md` from the plan: their look and feel, one screen per chapter, what someone can do and see there, every message they can get, example content from the scenarios, and the request for **three directions** first.
3. **Get three directions.**
   - **You have a design tool connected** (tools for Claude Design, Figma, Canva or similar): send it the brief, attach screenshots of the app if it's built, ask for the three directions, and give them the link to compare.
   - **They have a design tool you can't reach:** tell them to open `plan/design-brief.md` and paste it into their tool (for example Claude Design, Figma Make, v0, Lovable or Stitch). When they've picked a direction and worked on it until they like it, they export the HTML and CSS, or images, into `design/` and tell you **"the design is ready"**.
   - **No design tool:** make the three directions yourself: `design/direction-1.html`, `-2`, `-3`, each a style guide (colours, lettering, buttons, inputs, list, a refused message) and one key screen with the example content, clearly different from each other but all fitting their look and feel. Tell them to open http://localhost:4747/design/direction-1.html (and 2, 3) and pick one, or mix ("2's colours with 1's lettering").
4. **Finish the one they picked.** Keep the chosen direction in `design/` (delete the others or leave them, say which). Change it until they're happy.
5. **Apply it.** Change only how the app looks: `app/style.css`, `app/index.html`, and the drawing part of `app/main.js`. Never change `decide.js`, `project.js`, the tests or the plan. Put the colours, fonts and spacing as CSS variables at the top of `style.css`. Keep every action, field and message the brief lists, and keep it usable: readable contrast, visible focus, labels on inputs, big enough tap targets. Images go in `app/assets/`.
6. **Check it.** `node eve/test.mjs` must still pass everything. Open the app, try each action, including one that gets refused so its message shows. If the folder is a git repo, commit: "Design: <what changed>".
7. **Tell them:** open http://localhost:4747/app/, and say in a line what you couldn't match.

**The design shows something the plan doesn't have** (a new button, a filter, a screen)? Don't build it. List those things and offer to add them to the plan as new slices (eve-plan, adding to an app that's already planned). They go through the Event Book like everything else.
