// The Board tab: the plan as an event model, time running left to right.
import { newRoundHint } from "../views/newRoundHint.read.js";
import { eventModelBoard } from "../views/eventModelBoard.read.js";
import { EventModelBoard, NewRoundHint } from "../parts/board.parts.js";

export const boardScreen = (book, screen) => `<main class="board-main">
      ${NewRoundHint(newRoundHint(screen))}
      <p class="board-hint">The plan as an event model: time runs left to right. Commands and views on top, the events they cause and read below. Tap a sticky to open it in the book.</p>
      ${EventModelBoard(eventModelBoard(book))}
      <p class="board-hint">Event Modeling is <a href="https://eventmodeling.org/about/" target="_blank" rel="noopener">Adam Dymitruk</a>'s method; this board follows it.</p></main>`;
