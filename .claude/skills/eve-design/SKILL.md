---
name: eve-design
description: Make an EVE app beautiful. Turn the plan into a design brief, send it to the person's design tool, and restyle the app from what comes back without changing what it does. Use when the person says "make it beautiful", "design it", "make it look nice", "style the app", or names a design tool.
---

# Design the app

Any time after the slices are refined. It's easiest once the app is built (there's something to look at), but it works before too: the design waits in `design/` and eve-build uses it.

1. **Write the brief.** Run `node eve/brief.mjs`. It writes `plan/design-brief.md` from the plan: one screen per chapter, what someone can do and see there, every message they can get, and example content from the scenarios.
2. **Add their taste.** Ask once, in one short message: an app or site whose look they like, colours or a mood, and where it gets used (on a phone in the garage? on a laptop at work?). Put the answers at the top of the brief under `## Look and feel`. If they say "you decide", decide, write it there and tell them what you picked.
3. **Send it to their design tool.**
   - **You have a design tool connected** (tools for Claude Design, Figma, Canva or similar): send the brief there yourself, attach screenshots of the app if it's built, make the first design, and give them the link to look at and change.
   - **They have a design tool you can't reach:** tell them to open `plan/design-brief.md`, paste it into their tool (for example Claude Design, Figma Make, v0, Lovable or Stitch) and work there until they like it. Then export the HTML and CSS, or images, into `design/` in this folder and tell you **"the design is ready"**.
   - **No design tool:** offer to design it yourself. Write `design/style-guide.html` from the brief (colours, fonts, buttons, inputs, lists, messages, one screen as an example), tell them to open http://localhost:4747/design/style-guide.html, and change it until they're happy.
4. **Apply it.** Change only how the app looks: `app/style.css`, `app/index.html`, and the drawing part of `app/main.js`. Never change `decide.js`, `project.js`, the tests or the plan. Put the colours, fonts and spacing as CSS variables at the top of `style.css`. Keep every action, field and message the brief lists, and keep it usable: readable contrast, visible focus, labels on inputs, big enough tap targets. Images go in `app/assets/`.
5. **Check it.** `node eve/test.mjs` must still pass everything. Open the app, try each action, including one that gets refused so its message shows. If the folder is a git repo, commit: "Design: <what changed>".
6. **Tell them:** open http://localhost:4747/app/, and say in a line what you couldn't match.

**The design shows something the plan doesn't have** (a new button, a filter, a screen)? Don't build it. List those things and offer to add them to the plan as new slices (eve-plan, adding to an app that's already planned). They go through the Event Book like everything else.
