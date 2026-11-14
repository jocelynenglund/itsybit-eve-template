// Parts on every tab: the header (name, tabs, progress) and the feedback bar. Each draws its one view.
import { esc } from "../html.js";

const LOGO = `<svg viewBox="0 0 140 120"><rect x="5" y="5" width="90" height="110" rx="16" fill="#9B2335"/><circle cx="50" cy="42" r="22" fill="none" stroke="#fff" stroke-width="8"/><line x1="30" y1="92" x2="70" y2="92" stroke="#fff" stroke-width="8" stroke-linecap="round"/><circle cx="121" cy="27" r="11" style="fill:var(--command)"/><circle cx="121" cy="60" r="11" style="fill:var(--event)"/><circle cx="121" cy="93" r="11" style="fill:var(--view)"/></svg>`;

export const BookBrand = v => `<div class="brand" data-component="BookBrand"><div class="mark" aria-hidden="true" title="itsyBIT EVE">${LOGO}</div>
  <div><h1>${esc(v.title)}</h1><small title="${esc(v.idea)}">Round ${esc(v.round)}${v.idea ? " · " + esc(v.idea) : ""}</small></div></div>`;

export const TabSwitch = tabs => `<span class="seg" role="tablist" aria-label="View" data-component="TabSwitch">${tabs.map(t =>
  `<button role="tab" data-act="mode" data-mode="${t.mode}" aria-selected="${t.on}" aria-pressed="${t.on}">${t.label}${t.dot ? " •" : ""}</button>`).join("")}</span>`;

export const ProgressPills = v => `<span data-component="ProgressPills" style="display:contents">${v.pills.map(p =>
  `<span class="pill ${p.ok ? "ok" : ""}">${esc(p.text)}</span>`).join("")}${v.appLink ? `<a class="pill link" href="${esc(v.appLink)}">Open the app</a>` : ""}</span>`;

export const FeedbackBar = v => v.locked
  ? `<div class="bar" data-component="FeedbackBar"><div class="wrap"><span>Saved <code>${esc(v.saved)}</code>. Tell your AI: <b>done with feedback</b>. This page shows the next round when it's ready.</span></div></div>`
  : `<div class="bar" data-component="FeedbackBar"><div class="wrap">
    <span class="muted">${v.parts.length ? "Your feedback this round: " + v.parts.join(" · ") : "No feedback yet this round."}</span>
    <button class="btn primary" data-act="done" ${v.canSend ? "" : "disabled"}>${v.saving ? "Saving…" : "Done with feedback"}</button>
  </div></div>`;

export const EmptyBook = v => `<main data-component="EmptyBook"><div class="wrap"><div class="empty">
    <h1>No plan yet</h1>
    ${v.loadError ? `<p class="muted">Couldn't read <code>${esc(v.root)}plan/model.json</code> (${esc(v.loadError)}).</p>` : ""}
    <p>Ask your AI: <b>let's plan a todo app</b> (or whatever you want to build). It writes the plan and this page shows it.</p>
    <p class="muted">Opened this file straight from disk? Start the book with <code>node eve/serve.mjs</code> and open <code>http://localhost:4747</code>.</p>
  </div></div></main>`;
