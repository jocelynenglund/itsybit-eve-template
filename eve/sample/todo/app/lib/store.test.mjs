// The store keeps every tab's events: a tab that has been open a while must not write its old
// list over newer events, and must decide with them. (Not a planned scenario: a test of the store.)
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore, run } from "./store.js";

const fakeStorage = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) }; };

// One spot left: sign up while there's room, otherwise go on the waitlist.
const decide = (history, cmd) => {
  const taken = history.filter(e => e.type === "SignedUp").length;
  return { events: [{ type: taken < 1 ? "SignedUp" : "Waitlisted", data: { name: cmd.name } }] };
};

test("Store: a stale tab keeps the other tab's events and decides with them", () => {
  const shared = fakeStorage();
  const tabA = createStore("signups", shared);
  const tabB = createStore("signups", shared); // opened at the same time, before anyone signed up
  run(tabA, decide, { name: "Ana" });
  const d = run(tabB, decide, { name: "Ben" });
  assert.equal(d.events[0].type, "Waitlisted", "B must see Ana's sign-up when deciding");
  const saved = JSON.parse(shared.getItem("signups")).map(e => `${e.type} ${e.data.name}`);
  assert.deepEqual(saved, ["SignedUp Ana", "Waitlisted Ben"], "Ana's event must survive B's append");
  assert.deepEqual(tabA.all().map(e => e.data.name), ["Ana", "Ben"], "A sees B's event too");
});

test("Store: works in memory when there is no storage", () => {
  const s = createStore("x", null);
  s.append([{ type: "Hello" }]);
  assert.equal(s.all().length, 1);
});
