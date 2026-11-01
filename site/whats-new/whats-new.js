// What's new: the site's changelog, from git. site/whats-new.sh writes whats-new.json
// at deploy time; this shows a bottom-right pill while this device hasn't read the
// newest entry, and a panel of recent changes when tapped. Reading it retires the pill
// until the next deploy. No-ops when whats-new.json is absent (local dev).
(function () {
  const SRC = "whats-new.json";
  const SEEN_KEY = "whatsnew_seen_sha";

  function el(tag, attrs = {}, kids = []) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) k.startsWith("on") ? n.addEventListener(k.slice(2), v) : n.setAttribute(k, v);
    for (const k of [].concat(kids)) n.append(k);
    return n;
  }

  async function load() {
    try {
      const r = await fetch(SRC, { cache: "no-cache" });
      if (!r.ok) return [];
      const d = await r.json();
      return Array.isArray(d) ? d : [];
    } catch (_) { return []; }
  }

  function fmtDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function mount(items) {
    if (!items.length) return;
    const newest = items[0].sha;
    if (localStorage.getItem(SEEN_KEY) === newest) return;
    let panel = null;

    const pill = el("button", { type: "button", class: "wn-pill", "aria-label": "What's new" }, [
      el("span", { "aria-hidden": "true" }, "✨"),
      el("span", {}, "What's new"),
      el("span", { class: "wn-pill__dot", "aria-hidden": "true" }),
    ]);

    function onEsc(e) { if (e.key === "Escape") close(); }
    function close() {
      if (!panel) return;
      panel.classList.remove("wn-panel--open");
      const p = panel; panel = null;
      setTimeout(() => p.remove(), 180);
      document.removeEventListener("keydown", onEsc);
    }
    function open() {
      localStorage.setItem(SEEN_KEY, newest);
      pill.remove();
      const x = el("button", { type: "button", class: "wn-panel__x", "aria-label": "Close", onclick: close }, "✕");
      panel = el("div", { class: "wn-panel", role: "dialog", "aria-modal": "true", "aria-label": "What's new" }, [
        el("div", { class: "wn-panel__scrim", onclick: close }),
        el("div", { class: "wn-panel__sheet" }, [
          el("div", { class: "wn-panel__head" }, [el("span", { class: "wn-panel__title" }, "What's new"), x]),
          el("div", { class: "wn-panel__list" }, items.map(it =>
            el("div", { class: "wn-item" }, [
              el("div", { class: "wn-item__date" }, fmtDate(it.date)),
              el("div", { class: "wn-item__title" }, it.title),
            ]))),
        ]),
      ]);
      document.body.append(panel);
      requestAnimationFrame(() => panel.classList.add("wn-panel--open"));
      document.addEventListener("keydown", onEsc);
      x.focus();
    }

    pill.addEventListener("click", open);
    document.body.append(pill);
  }

  document.addEventListener("DOMContentLoaded", async () => mount(await load()));
})();
