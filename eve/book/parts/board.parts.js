// The Board tab: the plan as a traditional event model. Arrows are drawn after, by measuring (arrows.js).
import { esc } from "../html.js";

const column = c => `<div class="bcol" data-key="${esc(c.id)}">
      <div class="blane top"><button class="sticky ${c.kind}" data-act="goto" data-slice="${esc(c.id)}" data-node="s:${esc(c.id)}" data-reads="${esc(c.reads.join(" "))}"><small>${c.label}</small>${esc(c.title)}<span class="st ${c.status.cls}">${c.status.text}</span></button></div>
      <div class="blane">${c.events.length ? c.events.map(e => `<div class="sticky event" data-node="e:${esc(c.id)}:${esc(e.name)}" data-ev="${esc(e.name)}" data-from="s:${esc(c.id)}"><small>Event</small>${esc(e.title)}</div>`).join("") : `<div class="bempty"></div>`}</div>
    </div>`;

export const EventModelBoard = v => `<div class="board" id="board" data-component="EventModelBoard"><svg class="arrows" id="arrows" aria-hidden="true"></svg><div class="bwrap">
    <div class="blabels"><span></span><span>Commands · views</span><span>Events</span></div>
    ${v.groups.map(g => `<section class="bch"><div class="bch-name">${esc(g.name)}</div><div class="bcols">${g.cols.map(column).join("")}</div></section>`).join("")}
  </div></div>`;

export const NewRoundHint = v => v.show ? `<div class="board-hint" data-component="NewRoundHint"><button class="btn primary" data-act="reload">Show the new round</button></div>` : "";
