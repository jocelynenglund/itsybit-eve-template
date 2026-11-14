// The book's state: the plan and test results as last read, this round's feedback, and what's on screen.
// The only module that touches the network or the browser's storage. Everything it holds becomes the history
// replay() reads (history()), or the screen state the views read (screen).

const POLL_MS = 4000;
const params = new URLSearchParams(location.search);
const ROOT = params.get("root") || "../";
const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };

let model = null, modelText = "", builtJson = null, builtText = "";
let draft = { events: [], sent: "" };
let onChange = () => {};

export const screen = {
  root: ROOT, mode: store("eve-mode") === "board" ? "board" : "book", filter: "all", q: "",
  compose: null, addFor: null, form: null, lookForm: null,
  openDone: new Set(), openSc: new Set(), folded: new Set(),
  appWidth: "phone", appExists: null, saving: false, message: "", newRound: false, loadError: "",
  eveUpdate: "", eveNotes: [], eveUpdated: null
};

export const hasPlan = () => !!model;
export const history = () => [
  { type: "PlanLoaded", data: model },
  ...(builtJson ? [{ type: "TestsRan", data: builtJson }] : []),
  ...draft.events,
  ...(draft.sent ? [{ type: "FeedbackSent", data: { saved: draft.sent } }] : [])
];
export const isBusy = () => !!(screen.compose || screen.addFor || screen.lookForm);
export const locked = () => !!draft.sent;
export const changed = () => onChange();

/* ---------- reading the plan and the test results ---------- */
async function fetchText(path) {
  const res = await fetch(ROOT + path + "?t=" + Date.now(), { cache: "no-store" });
  if (!res.ok) throw new Error(res.status + " " + path);
  return res.text();
}
export async function load(first) {
  try {
    const text = await fetchText("plan/model.json");
    if (text !== modelText) {
      const next = JSON.parse(text);
      const roundChanged = model && next.round !== model.round;
      if (first || !isBusy()) { model = next; modelText = text; loadDraft(); loadFolded(); if (roundChanged) screen.message = "Round " + model.round + " is here. Your AI has answered."; }
      else if (roundChanged) screen.newRound = true;
    }
    screen.loadError = "";
  } catch (e) { if (first) screen.loadError = String(e.message || e); }
  try {
    const text = await fetchText("plan/built.json");
    if (text !== builtText) { builtText = text; builtJson = JSON.parse(text); }
  } catch (e) { /* not built yet */ }
  if (first || (!isBusy() && screen.mode !== "app")) onChange(); // the App tab keeps its frame: redrawing would reload the app
}
export function start(draw) {
  onChange = draw;
  load(true);
  setInterval(() => load(false), POLL_MS);
}
export function reload() { screen.newRound = false; screen.compose = null; screen.addFor = null; modelText = ""; return load(true); }

/* ---------- this round's feedback (kept in this browser until it's sent) ---------- */
const draftKey = () => "eve-feedback:" + (model.app || "app") + ":" + model.round;
function loadDraft() { try { draft = JSON.parse(store(draftKey())) || { events: [], sent: "" }; } catch (e) { draft = { events: [], sent: "" }; } }
const saveDraft = () => store(draftKey(), JSON.stringify(draft));
export function stamp() { const d = new Date(), p = n => String(n).padStart(2, "0"); return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes()); }
export const uid = prefix => prefix + "-" + Math.random().toString(36).slice(2, 8);
export function give(type, data) { draft.events.push({ type, data, at: stamp() }); saveDraft(); onChange(); }
export function takeBack(match) { draft.events = draft.events.filter(e => !match(e)); saveDraft(); onChange(); }
export const given = match => draft.events.find(match);
export const plan = () => model;

export async function send() {
  const payload = { app: model.app, round: model.round, createdAt: new Date().toISOString(), events: draft.events };
  screen.saving = true; onChange();
  let saved = "";
  try {
    const res = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) saved = (await res.json()).saved;
  } catch (e) { /* no server: fall back to a download */ }
  if (!saved) {
    const name = "round-" + model.round + ".json";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    saved = "plan/feedback/" + name + " (downloaded: move it into plan/feedback/)";
  }
  draft.sent = saved; screen.saving = false; saveDraft(); onChange();
}

/* ---------- what the person folded, and which tab they were on (this browser only) ---------- */
const foldKey = () => "eve-folded:" + (model.app || "app");
function loadFolded() { try { screen.folded = new Set(JSON.parse(store(foldKey())) || []); } catch (e) { screen.folded = new Set(); } }
export function fold(id, on) { on ? screen.folded.add(id) : screen.folded.delete(id); store(foldKey(), JSON.stringify([...screen.folded])); }
export function rememberTab(mode) { if (mode === "book" || mode === "board") store("eve-mode", mode); }

/* ---------- is there a newer EVE? ---------- */
// "2026-11-01.10" is newer than "2026-11-01.9": compare the date, then the release number.
const key = v => { const m = /^(\d{4}-\d{2}-\d{2})(?:\.(\d+))?/.exec(v || ""); return m ? [m[1], +(m[2] || 1)] : ["", 0]; };
const newer = (a, b) => { const x = key(a), y = key(b); return x[0] !== y[0] ? x[0] > y[0] : x[1] > y[1]; };
// After "update EVE": say once what's new, from this copy's own release notes. A first visit just remembers the version.
function showUpdatedNotes(local) {
  const seen = store("eve-seen-version"), mine = local.version || "";
  if (!seen) { store("eve-seen-version", mine); return; }
  if (!newer(mine, seen)) return;
  screen.eveUpdated = { version: mine, notes: (local.releases || []).filter(r => newer(r.version, seen)).flatMap(r => r.notes || []).slice(0, 8) };
  onChange();
}
export function updateSeen() { store("eve-seen-version", screen.eveUpdated.version); screen.eveUpdated = null; }
// Only when running on someone's own machine; quiet when offline.
export async function checkEveVersion() {
  if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;
  try {
    const local = await (await fetch("version.json", { cache: "no-store" })).json();
    const mine = local.version || "";
    showUpdatedNotes(local);
    // GitHub's API serves the file fresh (60 requests an hour per network); its raw file server can lag minutes behind.
    const api = "https://api.github.com/repos/jocelynenglund/itsybit-eve-template/contents/eve/version.json";
    const raw = "https://raw.githubusercontent.com/jocelynenglund/itsybit-eve-template/main/eve/version.json";
    let res = await fetch(api, { headers: { Accept: "application/vnd.github.raw+json" }, cache: "no-store" }).catch(() => null);
    if (!res || !res.ok) res = await fetch(raw, { cache: "no-store" });
    const remote = await res.json(), latest = remote.version || "";
    if (newer(latest, mine)) {
      screen.eveUpdate = mine ? `You have ${mine}; the newest is ${latest}` : `The newest is ${latest}`;
      screen.eveNotes = (remote.releases || []).filter(r => !mine || newer(r.version, mine)).flatMap(r => r.notes || []).slice(0, 6);
      onChange();
    }
  } catch (e) { /* offline, or an older copy without version.json */ }
}

export async function checkApp() {
  try { const r = await fetch(ROOT + "app/index.html", { method: "HEAD", cache: "no-store" }); screen.appExists = r.ok; }
  catch (e) { screen.appExists = false; }
  onChange();
}
