// Parts of the Book tab. Each top-level part draws its one view; Thread, Comment, Composer, ScenarioCard,
// TriedRow and AddScenarioForm are items of the part whose view they're drawn from.
import { esc } from "../html.js";

export const BookNotices = v => !(v.newRound || v.message || v.updated || v.newer) ? "" : `<div data-component="BookNotices" class="stack">
  ${v.newRound ? `<div class="note new"><strong>A new round is ready.</strong><div class="row"><button class="btn primary" data-act="reload">Show the new round</button><span class="muted">Finish what you're typing first; it's saved.</span></div></div>` : ""}
  ${v.message ? `<div class="note new" role="status">${esc(v.message)}</div>` : ""}
  ${v.updated ? `<div class="note new" role="status"><p><strong>EVE was updated.</strong> <span class="muted">You now have ${esc(v.updated.version)}.</span></p>${v.updated.notes.length ? `<ul class="eve-notes">${v.updated.notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}<div><button class="btn" data-act="eve-seen">Got it</button></div></div>` : ""}
  ${v.newer ? `<div class="note new"><p><strong>A newer EVE is out.</strong> <span class="muted">${esc(v.newer.text)}.</span></p>${v.newer.notes.length ? `<ul class="eve-notes">${v.newer.notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}<p>Tell your AI: <b>update EVE</b>. It updates the tools and leaves your plan and app alone.</p></div>` : ""}
</div>`;

const INTRO = {
  "follow-up": () => `<div class="note"><p>The new slices are open below; the ones already built are folded away (tap one to open it). Comment on the new ones, add the scenarios you're missing, and tick <b>Refined</b> when a slice is right. Then press <b>Done with feedback</b> and tell your AI <b>done</b>.</p></div>`,
  "new-refined": () => `<div class="note go"><strong>The new slices are refined.</strong><p>Tell your AI: <b>start building</b>.</p></div>`,
  built: v => `<div class="note go"><strong>Built.</strong><p>Every planned scenario passes. <a href="${esc(v.appLink)}">Open the app</a>.</p></div>`,
  building: () => `<div class="note"><strong>Building.</strong><p>Green dots are scenarios with a passing test. This page updates by itself as your AI works.</p></div>`,
  refined: () => `<div class="note go"><strong>Every slice is refined.</strong><p>Tell your AI: <b>start building</b>.</p></div>`,
  read: () => `<div class="note"><p>Read each slice. Comment on anything that looks wrong, add the scenarios you're missing, and tick <b>Refined</b> when a slice is right. Then press <b>Done with feedback</b> and tell your AI <b>done</b>.</p></div>`
};
export const BookIntro = v => `<div data-component="BookIntro" data-key="${v.kind}">${INTRO[v.kind](v)}</div>`;

export const Comment = c => `<div class="cm ${c.ai ? "ai" : ""} ${c.draft ? "draft" : ""}">
    <span class="who"><b>${c.ai ? "AI" : "You"}</b>${c.at ? " · " + esc(c.at) : ""}${c.part ? " · on " + esc(c.part) : ""}</span>
    <span>${c.problem ? `<span class="refuse">problem</span> ` : ""}${esc(c.text)} ${c.draft && !c.locked ? `<button class="btn quiet" data-act="drop-comment" data-id="${esc(c.id)}">Remove</button>` : ""}</span></div>`;

export const Composer = c => `<form class="composer" data-form="comment">
    ${c.part ? `<label class="f" for="cm-part">About<select id="cm-part"><option value="">the whole scenario</option><option value="given">Given</option><option value="when">When</option><option value="then">Then</option></select></label>` : ""}
    <label class="sr" for="cm-text">Comment</label>
    ${c.title ? `<strong>${esc(c.title)}</strong>` : ""}
    <textarea id="cm-text" placeholder="${esc(c.placeholder)}" required></textarea>
    <div class="row"><button class="btn primary" type="submit">${esc(c.button)}</button><button class="btn quiet" type="button" data-act="cancel">Cancel</button></div>
  </form>`;

export const Thread = t => `<div class="thread ${t.resolved ? "resolved" : ""}" data-key="${esc(t.id)}">
      ${t.comments.map(c => Comment({ ...c, locked: t.locked })).join("")}
      ${t.locked ? "" : t.replying ? Composer(t.replying) : `<div class="row">
        <button class="btn quiet" data-act="reply" data-thread="${esc(t.id)}" data-slice="${esc(t.sliceId)}" data-scenario="${esc(t.scenarioId)}" data-part="${esc(t.part)}">Reply</button>
        ${t.resolved ? `<span class="muted">Resolved${t.resolvedNow ? " (not sent yet)" : ""}</span>` : `<button class="btn quiet" data-act="resolve" data-id="${esc(t.id)}">Resolve</button>`}</div>`}
    </div>`;

export const GeneralComments = v => `<div data-component="GeneralComments" class="stack">
  ${v.threads.length ? `<h3>General comments</h3>${v.threads.map(Thread).join("")}` : ""}
  ${v.composer ? Composer(v.composer) : v.canAdd ? `<div><button class="btn quiet" data-act="compose" data-kind="board" data-slice="">Add a general comment</button></div>` : ""}
</div>`;

export const SearchBox = v => `<div class="search" data-component="SearchBox"><label class="sr" for="q">Search</label><input type="search" id="q" placeholder="Search slices, events, scenarios…" value="${esc(v.q)}" autocomplete="off"></div>`;

export const FilterSwitch = fs => `<span class="seg filter" role="group" aria-label="Show" data-component="FilterSwitch">${fs.map(f =>
  `<button data-act="filter" data-f="${f.f}" aria-pressed="${f.on}">${f.label} <span class="n">${f.n}</span></button>`).join("")}</span>`;

export const FoldAllButton = v => v ? `<div data-component="FoldAllButton"><button class="btn quiet" data-act="fold-all" data-on="${v.fold ? 1 : 0}">${v.text}</button></div>` : "";

// The chapters; slot(entry) draws each slice (a SliceCard, FoldedSliceRow or BuiltSliceRow, chosen by the screen).
export const ChapterList = (v, slot) => `<div data-component="ChapterList" class="stack">${v.chapters.map(ch => {
  if (ch.built && !ch.built.open) return `<section class="chapter done-ch" data-key="${esc(ch.name)}"><h2><button class="done-row" data-act="toggle-done" data-key="${esc("ch:" + ch.name)}" aria-expanded="false">${esc(ch.name)} <span class="muted">· ${ch.built.count} built</span><span class="chev">▸ show</span></button></h2></section>`;
  const head = ch.built ? `<h2><button class="done-row" data-act="toggle-done" data-key="${esc("ch:" + ch.name)}" aria-expanded="true">${esc(ch.name)} <span class="muted">· ${ch.built.count} built</span><span class="chev">▾ hide</span></button></h2>` : `<h2>${esc(ch.name)}</h2>`;
  return `<section class="chapter ${ch.built ? "done-ch" : ""}" data-key="${esc(ch.name)}">${head}${ch.slices.map(slot).join("")}</section>`;
}).join("")}${v.empty ? `<p class="muted">${esc(v.empty)}</p>` : ""}</div>`;

export const BuiltSliceRow = v => `<article class="slice ${v.kind} done" id="slice-${esc(v.id)}" data-component="BuiltSliceRow" data-key="${esc(v.id)}"><button class="done-row" data-act="toggle-done" data-key="${esc(v.id)}" aria-expanded="false">
    <span class="tag ${v.kind}">${v.label}</span><span class="mono name">${esc(v.name)}</span><span class="badge pass">Built</span>${v.works ? `<span class="badge pass">✓ Works</span>` : ""}<span class="chev">▸ show</span></button></article>`;

export const FoldedSliceRow = v => `<article class="slice ${v.kind} done is-refined" id="slice-${esc(v.id)}" data-component="FoldedSliceRow" data-key="${esc(v.id)}"><div class="row">
    <button class="done-row fold-row" data-act="fold" data-slice="${esc(v.id)}" aria-expanded="false"><span class="tag ${v.kind}">${v.label}</span><span class="name">${esc(v.name)}</span><span class="muted">${v.scenarios} scenarios${v.unsent ? ` · ${v.unsent} not sent yet` : ""}</span><span class="chev">▸ show</span></button>
    <label class="refined on"><input type="checkbox" data-act="refine" data-slice="${esc(v.id)}" checked ${v.locked ? "disabled" : ""}>Refined</label></div></article>`;

const ev = e => `<span class="ev">${esc(e)}</span>`;

// Tried in the app: a tick for a passing scenario of a built slice.
const TryTick = (s) => !s.tried ? "" : s.tried.state === "done"
  ? `<span class="badge pass tick">✓ tried</span>`
  : s.tried.canTick ? `<button class="btn tick ${s.tried.state === "now" ? "on" : ""}" data-act="tried" data-slice="${esc(s.sliceId)}" data-scenario="${esc(s.id)}" aria-pressed="${s.tried.state === "now"}" title="I tried this in the app and it does what it says">✓ tried${s.tried.state === "now" ? " (not sent yet)" : ""}</button>` : "";

export const ScenarioCard = s => {
  if (s.folded) return `<div class="sc" data-key="${esc(s.key)}"><div class="row sc-line"><button class="done-row sc-row" data-act="sc-open" data-key="${esc(s.key)}" aria-expanded="false"><span class="dot pass" title="test passes"></span><span class="name">${esc(s.title)}</span><span class="chev">▸ show</span></button>${TryTick(s)}</div></div>`;
  const then = s.then.refused != null ? `<span class="refuse">refused</span> “${esc(s.then.refused)}”`
    : s.then.events ? s.then.events.map(ev).join(" ") : s.then.shows != null ? `shows ${esc(s.then.shows)}` : `<span class="muted">nothing</span>`;
  return `<div class="sc" data-key="${esc(s.key)}">
    <div class="sc-title"><strong><span class="dot ${s.dot}" title="${s.dotTitle}"></span>${esc(s.title)} ${s.isNew ? `<span class="tag new">New</span>` : ""}</strong>
      <span class="row">${TryTick(s)}${s.tried && s.tried.canReport && s.tried.state !== "done" ? `<button class="btn quiet" data-act="compose" data-kind="problem" data-slice="${esc(s.sliceId)}" data-scenario="${esc(s.id)}">Doesn't work</button>` : ""}${s.foldable ? `<button class="btn quiet" data-act="sc-open" data-key="${esc(s.key)}" aria-expanded="true">▾ fold</button>` : ""}${s.canRemove ? `<button class="btn quiet" data-act="drop-scenario" data-id="${esc(s.id)}">Remove</button>` : s.canComment ? `<button class="btn quiet" data-act="compose" data-kind="scenario" data-slice="${esc(s.sliceId)}" data-scenario="${esc(s.id)}">Comment</button>` : ""}</span></div>
    <div class="gwt"><span class="k">Given</span><div class="v">${s.given.length ? s.given.map(ev).join(" ") : `<span class="muted">nothing</span>`}</div>
      <span class="k">When</span><div class="v">${s.when.opens ? `someone opens <code>${esc(s.when.opens)}</code>` : `<code>${esc(s.when.command)}</code>`}</div>
      <span class="k">Then</span><div class="v">${then}</div></div>
    ${s.error ? `<p class="muted">Test says: ${esc(s.error)}</p>` : ""}
    ${s.threads.map(Thread).join("")}
    ${s.composer ? Composer(s.composer) : ""}
  </div>`;
};

export const TriedRow = (t, id) => t.problem
  ? `<div class="row tried"><span class="refuse">problem reported</span><span class="muted">Your AI fixes it after you send this round.</span></div>`
  : `<div class="row tried"><span class="muted">Tried it in the app?</span>${
      t.works === "badge" ? `<span class="badge pass">✓ Works</span>`
      : t.works === "button" ? `<button class="btn ${t.worksNow ? "on" : ""}" data-act="works" data-slice="${esc(id)}" aria-pressed="${t.worksNow}">✓ Works${t.worksNow ? " (not sent yet)" : ""}</button>` : ""}${
      t.canReport ? `<button class="btn" data-act="compose" data-kind="problem" data-slice="${esc(id)}">Doesn't work</button>` : ""}</div>
    ${t.composer ? Composer(t.composer) : ""}`;

export const AddScenarioForm = f => {
  const thenPart = f.view
    ? `<label class="f" for="add-shows">Then it shows<input type="text" id="add-shows" placeholder="e.g. only the open todos" value="${esc(f.shows)}"></label>`
    : `<div class="f">Then<div class="row">
        <label><input type="radio" name="add-outcome" value="event" ${f.outcome === "event" ? "checked" : ""}> it produces</label>
        <select id="add-event" aria-label="Event produced">${f.produces.map(e => `<option ${f.event === e ? "selected" : ""}>${esc(e)}</option>`).join("")}</select></div>
        <div class="row"><label><input type="radio" name="add-outcome" value="rejected" ${f.outcome === "rejected" ? "checked" : ""}> it's refused, because</label>
        <input type="text" id="add-reason" style="flex:1;min-width:180px" placeholder="the reason the person sees" value="${esc(f.reason)}"></div></div>`;
  return `<form class="composer" data-form="scenario">
    <strong>New scenario for ${esc(f.name)}</strong>
    <label class="f" for="add-title">Title<input type="text" id="add-title" placeholder="e.g. Refuses a todo that is already done" value="${esc(f.title)}" required></label>
    <div class="f">Given (tap what has already happened, in order)<div class="chips">${f.events.map(e => `<button type="button" class="chip" data-act="add-given" data-event="${esc(e)}" aria-pressed="false">${esc(e)}</button>`).join("")}</div>
      <p class="muted" id="add-given-list">${f.given.length ? "Given: " + f.given.map(esc).join(", ") + ` <button type="button" class="btn quiet" data-act="add-given-clear">Clear</button>` : "Given: nothing yet"}</p></div>
    <p class="muted">When: ${f.view ? "someone opens " : ""}<code>${esc(f.name)}</code></p>
    ${thenPart}
    <div class="row"><button class="btn primary" type="submit">Add scenario</button><button class="btn quiet" type="button" data-act="cancel">Cancel</button></div>
  </form>`;
};

export const SliceCard = v => `<article class="slice ${v.kind} ${v.refined ? "is-refined" : ""}" id="slice-${esc(v.id)}" data-component="SliceCard" data-key="${esc(v.id)}">
    <div class="row spread">
      <div class="row"><span class="tag ${v.kind}">${v.label}</span><h3 class="mono">${esc(v.name)}</h3>${v.flow.from
        ? `<span class="muted">from</span> ${v.flow.from.map(ev).join(" ")}` : `<span class="muted">→</span> ${v.flow.to.map(ev).join(" ")}`}</div>
      <div class="row">${v.badge ? `<span class="badge ${v.badge.cls}">${v.badge.text}</span>` : ""}${v.hide
        ? `<button class="btn quiet" data-act="toggle-done" data-key="${esc(v.id)}" aria-expanded="true">▾ hide</button>`
        : v.canFold ? `<button class="btn quiet" data-act="fold" data-slice="${esc(v.id)}" aria-expanded="true">▾ fold</button>` : ""}
        <label class="refined ${v.refined ? "on" : ""}"><input type="checkbox" data-act="refine" data-slice="${esc(v.id)}" ${v.refined ? "checked" : ""} ${v.locked ? "disabled" : ""}>Refined</label></div>
    </div>
    ${v.tried ? TriedRow(v.tried, v.id) : ""}
    ${v.fields ? `<p class="muted">${v.fields.label}: ${v.fields.list.map(esc).join(", ")}</p>` : ""}
    ${v.description ? `<p>${esc(v.description)}</p>` : ""}
    ${v.threads.map(Thread).join("")}
    ${v.composer ? Composer(v.composer) : v.canComment ? `<div><button class="btn quiet" data-act="compose" data-kind="slice" data-slice="${esc(v.id)}">Comment on this slice</button></div>` : ""}
    ${v.scenarios.map(ScenarioCard).join("")}
    ${v.addForm ? AddScenarioForm(v.addForm) : v.canAdd ? `<div><button class="btn quiet" data-act="add-open" data-slice="${esc(v.id)}">+ Add a scenario</button></div>` : ""}
  </article>`;
