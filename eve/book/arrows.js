// The Board's arrows, drawn after the board is on screen by measuring where the stickies landed.
// Command → the events it causes; event → each view that reads it (the latest one to its left, else any).
export function drawArrows() {
  const board = document.getElementById("board"), svg = document.getElementById("arrows");
  if (!board || !svg) return;
  const b = board.getBoundingClientRect();
  const box = el => { const r = el.getBoundingClientRect(); return { l: r.left - b.left + board.scrollLeft, t: r.top - b.top, w: r.width, h: r.height }; };
  svg.setAttribute("width", board.scrollWidth); svg.setAttribute("height", board.scrollHeight);
  const paths = [];
  const events = [...board.querySelectorAll(".sticky.event")];
  for (const ev of events) {
    const from = board.querySelector(`[data-node="${ev.dataset.from}"]`); if (!from) continue;
    const a = box(from), c = box(ev);
    paths.push(`<path d="M${a.l + a.w / 2},${a.t + a.h} L${c.l + c.w / 2},${c.t - 4}" />`);
  }
  // Event → view arrows: spread their ends along each sticky's edge and give each its own height, so they don't bunch up.
  const links = [];
  for (const v of board.querySelectorAll("button.sticky.view, button.sticky.automation")) {
    const reads = (v.dataset.reads || "").split(" ").filter(Boolean); if (!reads.length) continue;
    const vb = box(v);
    for (const name of reads) {
      const cands = events.filter(e => e.dataset.ev === name);
      if (!cands.length) continue;
      const left = cands.filter(e => box(e).l < vb.l);
      links.push([(left.length ? left : cands).reduce((best, e) => (box(e).l > box(best).l ? e : best)), v]);
    }
  }
  const outs = new Map(), ins = new Map();
  for (const [e, v] of links) { outs.set(e, (outs.get(e) || 0) + 1); ins.set(v, (ins.get(v) || 0) + 1); }
  const seenOut = new Map(), seenIn = new Map();
  links.forEach(([e, v], i) => {
    const s = box(e), t = box(v);
    const io = seenOut.get(e) || 0, ii = seenIn.get(v) || 0; seenOut.set(e, io + 1); seenIn.set(v, ii + 1);
    const x1 = s.l + s.w * (0.25 + 0.6 * (io + 0.5) / outs.get(e)), y1 = s.t;
    const x2 = t.l + t.w * (0.2 + 0.6 * (ii + 0.5) / ins.get(v)), y2 = t.t + t.h + 4;
    const lift = 18 + (i % 4) * 12;
    paths.push(`<path d="M${x1},${y1} C${x1},${y1 - lift} ${x2},${y2 + lift} ${x2},${y2}" />`);
  });
  svg.innerHTML = `<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)"/></marker></defs>
    <g fill="none" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#ah)" opacity=".75">${paths.join("")}</g>`;
}
