// The Event Book: read the plan, leave feedback, save it as a round for the AI.
// One draw: replay the history once, then the tab's screen composes its views and components.
import * as S from "./store.js";
import { screen } from "./store.js";
import { replay } from "./replay.js";
import { listen } from "./actions.js";
import { drawArrows } from "./arrows.js";
import { header, bar, empty } from "./screens/frame.screen.js";
import { bookScreen } from "./screens/book.screen.js";
import { boardScreen } from "./screens/board.screen.js";
import { appScreen } from "./screens/app.screen.js";
import { lookScreen } from "./screens/look.screen.js";
import { exportScreen } from "./screens/export.screen.js";

const SCREENS = { book: bookScreen, board: boardScreen, app: appScreen, look: lookScreen, export: exportScreen };

function draw() {
  const el = document.getElementById("book");
  if (!S.hasPlan()) { el.innerHTML = empty(screen); return; }
  const book = replay(S.history());
  document.title = (book.app || "App") + " · Event Book";
  // Typing in the search box redraws the book: keep the cursor where it was.
  const act = document.activeElement, keep = act && act.id === "q" ? [act.selectionStart, act.selectionEnd] : null;
  el.innerHTML = header(book, screen) + SCREENS[screen.mode](book, screen) + bar(book, screen);
  if (keep) { const q = document.getElementById("q"); if (q) { q.focus(); q.setSelectionRange(keep[0], keep[1]); } }
  if (screen.mode === "board") requestAnimationFrame(drawArrows);
}

listen();
addEventListener("resize", () => { if (screen.mode === "board") drawArrows(); });
S.start(draw);
S.checkEveVersion();
