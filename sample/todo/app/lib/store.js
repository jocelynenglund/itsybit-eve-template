// The app's only state: an append-only list of events, kept in this browser.
export function createStore(key) {
  let events = [];
  try { events = JSON.parse(localStorage.getItem(key)) || []; } catch { events = []; }
  const listeners = new Set();
  return {
    all: () => events.slice(),
    append(newEvents) {
      const at = new Date().toISOString();
      events = events.concat(newEvents.map(e => ({ ...e, at })));
      try { localStorage.setItem(key, JSON.stringify(events)); } catch { /* storage full or blocked: keep going in memory */ }
      listeners.forEach(fn => fn(events));
    },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  };
}

// The adapter: load history, ask the slice, append what it decided.
export function run(store, decide, command) {
  const decision = decide(store.all(), command);
  if (decision.events) store.append(decision.events);
  return decision;
}
