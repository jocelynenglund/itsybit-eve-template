// The Look tab: how the app should look and feel. LookForm is an item of LookCard.
import { esc } from "../html.js";

const radio = (name, opts, cur) => opts.map(([v, l]) => `<label><input type="radio" name="${name}" value="${esc(v)}" ${cur === v ? "checked" : ""}> ${esc(l)}</label>`).join("");

export const LookForm = f => `<form class="look" data-form="look" aria-label="Look and feel">
    <strong>Look and feel</strong>
    <div class="f"><span class="muted">How should it feel? Pick any.</span><div class="chips">${f.moods.map(m => `<button type="button" class="chip" data-act="look-mood" data-mood="${esc(m.name)}" aria-pressed="${m.on}">${esc(m.name)}</button>`).join("")}</div></div>
    <div class="f"><span class="muted">Colours you like (up to 4)</span><div class="swatches">
      ${f.colours.map((c, i) => `<span class="swatch"><input type="color" id="look-colour-${i}" value="${esc(c)}" aria-label="Colour ${i + 1}"><button type="button" class="btn quiet" data-act="look-colour-drop" data-i="${i}" aria-label="Remove colour ${i + 1}">✕</button></span>`).join("")}
      ${f.canAddColour ? `<button type="button" class="btn quiet" data-act="look-colour-add">+ Add a colour</button>` : ""}</div></div>
    <div class="f"><span class="muted">Light or dark</span><div class="row">${radio("look-theme", f.themes, f.theme)}</div></div>
    <div class="f"><span class="muted">Lettering</span><div class="row">${radio("look-type", f.types, f.type)}</div></div>
    <label class="f" for="look-likes">Apps or sites whose look you like<input type="text" id="look-likes" placeholder="e.g. Notion, the IKEA app, a link" value="${esc(f.likes)}"></label>
    <div class="f"><span class="muted">Where it gets used</span><div class="row">${radio("look-device", f.devices, f.device)}</div>
      <input type="text" id="look-where" placeholder="e.g. in a cold storage room, one hand full" value="${esc(f.where)}" aria-label="Where it gets used"></div>
    <label class="f" for="look-notes">Anything else<textarea id="look-notes" placeholder="e.g. big buttons, nothing too cute">${esc(f.notes)}</textarea></label>
    <div class="row"><button class="btn primary" type="submit">Save look and feel</button><button class="btn quiet" type="button" data-act="look-cancel">Cancel</button></div>
  </form>`;

const bit = b => b.colours ? b.colours.map(c => `<span class="dot-sw" style="background:${esc(c)}" title="${esc(c)}"></span>`).join(" ") : esc(b.text);

export const LookCard = v => `<div data-component="LookCard" class="stack">
  <p class="muted">How your app should look and feel. Your AI designs from this when you say <b>make it beautiful</b>. It's sent with your feedback round.</p>
  ${v.form ? LookForm(v.form) : `<section class="look" aria-label="Look and feel">
    <div class="row spread"><strong>Look and feel</strong>${v.canChange ? `<button class="btn quiet" data-act="look-open">${v.summary.length ? "Change" : "Fill in"}</button>` : ""}</div>
    ${v.summary.length ? `<p>${v.summary.map(bit).join(" · ")}${v.isNew ? ` <span class="muted">(not sent yet)</span>` : ""}</p>${v.notes ? `<p class="muted">${esc(v.notes)}</p>` : ""}`
      : `<p class="muted">How should your app feel? Your AI designs from this when you say <b>make it beautiful</b>. Fill it in any time.</p>`}
  </section>`}
</div>`;
