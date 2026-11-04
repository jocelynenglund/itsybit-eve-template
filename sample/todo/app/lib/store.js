// The app's only state: an append-only list of events, kept in this browser (localStorage).
// Every read goes back to storage, so a tab that has been open a while still decides with the
// events other tabs wrote, and appends after them instead of writing its old list over them.
// Other tabs are told through the 'storage' event and redraw by themselves.
export function createStore(key, storage = globalThis.localStorage) {
  let memory = []; // only used when storage is missing or blocked
  const read = () => {
    if (!storage) return memory;
    try { const saved = storage.getItem(key); memory = saved == null ? [] : JSON.parse(saved) || []; } catch { /* unreadable: keep what we had */ }
    return memory;
  };
  read();
  const listeners = new Set();
  const notify = () => { const events = memory.slice(); listeners.forEach(fn => fn(events)); };
  if (typeof addEventListener === "function") addEventListener("storage", e => { if (e.key === key) { read(); notify(); } });
  return {
    all: () => read().slice(),
    append(newEvents) {
      const at = new Date().toISOString();
      memory = read().concat(newEvents.map(e => ({ ...e, at })));
      try { storage && storage.setItem(key, JSON.stringify(memory)); } catch { /* storage full or blocked: keep going in memory */ }
      notify();
    },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  };
}

// The adapter: load history (fresh from storage, so other tabs' events count), ask the slice,
// append what it decided. Synchronous, so nothing can slip in between deciding and saving.
export function run(store, decide, command) {
  const decision = decide(store.all(), command);
  if (decision.events) store.append(decision.events);
  return decision;
}
