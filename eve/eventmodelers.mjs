#!/usr/bin/env node
// Export an EVE plan to eventmodelers.ai (EM-Studio by Nebulit): a canvas file you import there.
//   node eve/eventmodelers.mjs              writes plan/eventmodelers.json
//   node eve/eventmodelers.mjs sample/todo  the same for the sample
// The Event Book's Export button uses toCanvas() from this file too.
//
// Each chapter becomes a timeline, each slice a column: commands and views (read models) in the
// Interaction row, the events they cause or read in the Swimlane row(s), and the slice's
// Given/When/Then scenarios as a specification in the Spec Lane. Comments are not exported.
// The canvas format follows Nebulit's own export (timeline / sticky_note / spec_node nodes).

const COL_WIDTH = 450, ROW_HEIGHT = 320, TIMELINE_X = 562.3915405273438, TIMELINE_Y = 393.146728515625, CHAPTER_Y_STEP = 2000;
const STAMP = "2026-01-01T00:00:00.000Z";
const id = () => (globalThis.crypto && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16); }));
const hash = () => Math.random().toString(16).slice(2, 8);
const META = { command: "COMMAND", event: "EVENT", readmodel: "READMODEL" };
const field = name => ({ name, type: /(^id$|Id$)/.test(name) ? "UUID" : "String", cardinality: "Single", subfields: [] });

// One chapter of the plan → rows, columns, items and edges (positions in a grid).
function chapterLayout(model, chapter, slices) {
  const eventFields = new Map((model.events || []).map(e => [e.name, e.fields || []]));
  const rows = [{ type: "actor", label: "Actor" }, { type: "interaction", label: "Interaction" }, { type: "swimlane", label: "Swimlane" }, { type: "spec", label: "Spec Lane" }];
  const items = [], edges = [], taken = new Set();
  const swimRows = () => rows.map((r, i) => (r.type === "swimlane" ? i : -1)).filter(i => i >= 0);
  const fix = (shiftFrom) => { for (const it of items) if (it.row >= shiftFrom) it.row++; taken.clear(); for (const it of items) taken.add(`${it.row}:${it.col}`); };
  // Put an event in the first free swimlane row of a column, adding a lane when they're all full.
  const placeEvent = (name, col) => {
    let row = swimRows().find(r => !taken.has(`${r}:${col}`));
    if (row === undefined) { row = Math.max(...swimRows()) + 1; fix(row); rows.splice(row, 0, { type: "swimlane" }); }
    const it = { key: id(), type: "event", title: name, row, col, fields: (eventFields.get(name) || []).map(field) };
    items.push(it); taken.add(`${row}:${col}`); return it;
  };
  const latest = new Map(); // event name → the newest item for it, so far left to right
  const ref = (it, examples) => ({ item: it, examples });
  slices.forEach((sl, col) => {
    const kind = sl.type === "view" ? "readmodel" : "command";
    const top = { key: id(), type: kind, title: sl.name, row: 1, col, fields: (sl.fields || []).map(field) };
    items.push(top); taken.add(`1:${col}`);
    // What it reads: an edge from the latest earlier event, or a copy of the event in this column.
    for (const name of sl.reads || []) {
      const src = latest.get(name) || placeEvent(name, col);
      latest.set(name, latest.get(name) || src);
      edges.push({ from: src, to: top });
    }
    if (kind === "command") for (const name of sl.produces || []) { const ev = placeEvent(name, col); edges.push({ from: top, to: ev }); latest.set(name, ev); }
    // Scenarios: one specification per slice, in the Spec Lane under it.
    const find = name => latest.get(name) || placeEvent(name, col);
    const scenarios = (sl.scenarios || []).map(sc => {
      const out = { id: id(), title: sc.title || "", expectError: false, expectEmptyList: false, examples: [],
        given: (sc.given || []).map(g => ref(find(g.type))), when: [], then: [] };
      const t = sc.then || {};
      if (kind === "command") out.when = [ref(top)];
      if (t.rejected != null) { out.expectError = true; out.errorDescription = String(t.rejected); }
      else if (t.events) out.then = t.events.map(e => ref(find(e.type)));
      else if (t.view != null) { out.then = [ref(top)]; if (t.value) out.description = String(t.value); }
      return out;
    });
    if (scenarios.length) {
      const specRow = rows.findIndex(r => r.type === "spec");
      items.push({ key: id(), type: "scenario", row: specRow, col, scenarios });
      taken.add(`${specRow}:${col}`);
    }
  });
  // The spec lane may have moved down when lanes were added: re-anchor scenarios to it.
  const specRow = rows.findIndex(r => r.type === "spec");
  for (const it of items) if (it.type === "scenario") it.row = specRow;
  return { title: chapter, rows, cols: slices.length, items, edges, sliceNames: slices.map(s => s.name) };
}

function handles(a, b) { return b.row > a.row ? ["source-bottom", "target-top"] : b.row < a.row ? ["source-top", "target-bottom"] : ["source-right", "target-left"]; }

function buildChapter(ch, baseY) {
  const timeline = id();
  const rows = ch.rows.map(r => ({ id: id(), type: r.type, height: ROW_HEIGHT, ...(r.label ? { label: r.label } : {}) }));
  const cols = Array.from({ length: ch.cols }, () => ({ id: id(), width: COL_WIDTH }));
  const nodeId = new Map(ch.items.map(it => [it, id()]));
  const nodes = [{ id: timeline, type: "timeline", position: { x: TIMELINE_X, y: baseY }, data: {}, modifiedAt: STAMP }];
  for (const it of ch.items) nodes.push(it.type === "scenario"
    ? { id: nodeId.get(it), type: "spec_node", data: {}, parentId: timeline, modifiedAt: STAMP }
    : { id: nodeId.get(it), type: "sticky_note", data: { metaHash: hash() }, parentId: timeline, zIndex: 9999, modifiedAt: STAMP });
  const at = new Map(ch.items.map(it => [`${it.row}:${it.col}`, it]));
  const cells = [];
  rows.forEach((row, r) => cols.forEach((col, c) => {
    const it = at.get(`${r}:${c}`);
    cells.push(it ? { id: id(), rowId: row.id, colId: col.id, type: "content", nodeType: it.type === "scenario" ? "spec" : it.type, nodeId: nodeId.get(it) }
      : { id: id(), rowId: row.id, colId: col.id, type: "empty" });
  }));
  const edges = ch.edges.map(e => {
    const [sh, th] = handles(e.from, e.to), s = nodeId.get(e.from), t = nodeId.get(e.to);
    return { id: id(), source: s, target: t, start: { item: s }, end: { item: t }, sourceHandle: sh, targetHandle: th, connector: true, type: "default", animated: true,
      style: { stroke: "#7291aa", strokeWidth: 3, startStrokeCap: "none", endStrokeCap: "arrow", strokeStyle: "normal", strokeColor: "#7291aa", opacity: 1 },
      markerEnd: { type: "arrowclosed" }, zIndex: 500, data: {}, x: 0, y: 0, position: { x: 0, y: 0 }, modifiedAt: STAMP, captions: [], selected: false };
  });
  const metadata = { [timeline]: { meta: { title: ch.title, type: "CHAPTER", timelineData: { rows, columns: cols, cells } } } };
  const scenarioRef = r => ({ id: nodeId.get(r.item), title: r.item.title, type: META[r.item.type], fields: (r.item.fields || []).map(f => ({ name: f.name })) });
  for (const it of ch.items) {
    metadata[nodeId.get(it)] = { meta: it.type === "scenario"
      ? { type: "SCENARIO", givenWhenThenScenario: { scenarios: it.scenarios.map(sc => ({ ...sc, given: sc.given.map(scenarioRef), when: sc.when.map(scenarioRef), then: sc.then.map(scenarioRef) })) } }
      : { type: META[it.type], title: it.title, context: "INTERNAL", compact: true, ...(it.fields.length ? { fields: it.fields } : {}),
          ...(it.type === "readmodel" ? { createsAggregate: false, listElement: false, todoListElement: false } : {}) } };
  }
  ch.sliceNames.forEach((name, c) => {
    const b = id();
    nodes.push({ id: b, type: "slice_border", position: { x: 0, y: 0 }, data: { type: "SLICE_BORDER", colId: cols[c].id, title: name }, parentId: timeline, hidden: true, modifiedAt: STAMP });
    metadata[b] = { meta: { type: "SLICE_BORDER", title: name } };
  });
  return { nodes, edges, metadata };
}

// The whole plan → one eventmodelers board, a timeline per chapter.
export function toCanvas(model) {
  const slices = model.slices || [];
  const names = [...new Set([...(model.chapters || []).map(c => c.name), ...slices.map(s => s.chapter || "Other")])];
  const chapters = names.map(n => [n, slices.filter(s => (s.chapter || "Other") === n)]).filter(([, l]) => l.length);
  const board = id(), nodes = [], edges = [], metadata = {};
  chapters.forEach(([name, list], i) => {
    const out = buildChapter(chapterLayout(model, name, list), TIMELINE_Y + i * CHAPTER_Y_STEP);
    nodes.push(...out.nodes); edges.push(...out.edges); Object.assign(metadata, out.metadata);
  });
  return { boards: { [board]: { name: model.app || "EVE app" } }, nodes: { [board]: { nodes, edges } }, metadata: { [board]: metadata }, images: { [board]: {} }, nodeSnapshots: { [board]: {} } };
}

// Command line: node eve/eventmodelers.mjs [folder]
if (typeof process !== "undefined" && process.argv && import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1] || "").href) {
  const fs = await import("node:fs"), path = await import("node:path");
  const root = path.resolve(process.argv[2] || ".");
  const planPath = path.join(root, "plan", "model.json");
  if (!fs.existsSync(planPath)) { console.error("No plan yet (plan/model.json). Plan the app first."); process.exit(1); }
  const out = path.join(root, "plan", "eventmodelers.json");
  fs.writeFileSync(out, JSON.stringify(toCanvas(JSON.parse(fs.readFileSync(planPath, "utf8"))), null, 2));
  console.log(`Wrote ${path.relative(process.cwd(), out)}. Import it at https://eventmodelers.ai (EM-Studio).`);
}
