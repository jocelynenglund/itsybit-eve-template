// The App tab: the app the plan turned into, in a phone- or laptop-sized frame.
import { esc } from "../html.js";

export const AppFrame = v => v.state === "checking"
  ? `<main data-component="AppFrame"><div class="wrap stack"><p class="muted">Looking for your app…</p></div></main>`
  : v.state === "missing"
  ? `<main data-component="AppFrame"><div class="wrap stack"><div class="note"><p><strong>Your app appears here once it's built.</strong> When every slice is refined, tell your AI <b>start building</b>.</p></div></div></main>`
  : `<main class="board-main" data-component="AppFrame">
    <div class="appbar"><span class="seg" role="group" aria-label="Size">${[["phone", "Phone"], ["laptop", "Laptop"]].map(([w, l]) => `<button data-act="app-width" data-w="${w}" aria-pressed="${v.width === w}">${l}</button>`).join("")}</span>
      <a class="pill link" href="${esc(v.url)}" target="_blank" rel="noopener">Open it in its own tab ↗</a></div>
    <iframe class="appframe ${v.width}" src="${esc(v.url)}" title="Your app"></iframe></main>`;
