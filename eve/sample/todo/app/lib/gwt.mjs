// Given / When / Then for EVE slices, on top of node:test.
//
//   const add = command("AddTodo", decide);
//   add.scenario("Adds a todo").given([]).when({ todoId: "t1", title: "Buy milk" })
//      .then([{ type: "TodoAdded", data: { todoId: "t1", title: "Buy milk" } }]);
//   add.scenario("Refuses an empty title").given([]).when({ todoId: "t1", title: " " })
//      .rejected("Title is required");
//
//   const list = view("TodoList", project);
//   list.scenario("Shows an open todo").given([...]).shows([...]);
//
// A command's decide(history, command) returns { events: [...] } or { rejected: "reason" }.
// A view's project(history) returns what the screen shows.
// Scenario titles must match the titles in plan/model.json: the Event Book matches them up.
// When EVE_BUILT_DIR is set (node eve/test.mjs sets it), every result is written there.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const results = [];
let hooked = false;

function record(result) {
  results.push(result);
  const dir = process.env.EVE_BUILT_DIR;
  if (hooked || !dir) return;
  hooked = true;
  process.on("exit", () => {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${process.pid}-${Date.now()}.json`), JSON.stringify(results));
  });
}

function specFile() {
  const self = fileURLToPath(import.meta.url);
  for (const line of new Error().stack.split("\n")) {
    const m = line.match(/(file:\/\/[^\s)]+?):\d+:\d+/);
    if (!m) continue;
    const file = fileURLToPath(m[1]);
    if (file !== self) return path.relative(process.cwd(), file).split(path.sep).join("/");
  }
  return "";
}

function matchesEvents(actual, expected) {
  assert.ok(Array.isArray(actual), "decide returned no events");
  assert.deepEqual(actual.map(e => e.type), expected.map(e => e.type), "event types differ");
  expected.forEach((e, i) => {
    if (e.data !== undefined) assert.deepEqual(actual[i].data, e.data, `data of ${e.type} differs`);
  });
}

function register(meta, run) {
  const file = specFile();
  test(`${meta.slice}: ${meta.title}`, () => {
    try {
      run();
      record({ ...meta, spec: { file }, passing: true });
    } catch (err) {
      record({ ...meta, spec: { file }, passing: false, error: String(err && err.message || err) });
      throw err;
    }
  });
}

export function command(name, decide, { chapter } = {}) {
  return {
    scenario(title) {
      let given = [], input;
      const meta = () => ({ chapter, slice: name, title, given, when: name, whenData: input });
      const step = {
        given(events = []) { given = events; return step; },
        when(command) { input = command; return step; },
        then(events) {
          register({ ...meta(), then: { events } }, () => {
            const d = decide(given, input);
            assert.ok(d && !d.rejected, `refused: ${d && d.rejected}`);
            matchesEvents(d.events, events);
          });
        },
        rejected(reason) {
          register({ ...meta(), then: { rejected: reason } }, () => {
            const d = decide(given, input);
            assert.equal(d && d.rejected, reason, "expected a refusal with this reason");
          });
        }
      };
      return step;
    }
  };
}

export function view(name, project, { chapter } = {}) {
  return {
    scenario(title) {
      let given = [];
      const step = {
        given(events = []) { given = events; return step; },
        shows(expected) {
          register({ chapter, slice: name, title, given, when: name, then: { view: name, value: expected } }, () => {
            assert.deepEqual(project(given), expected);
          });
        }
      };
      return step;
    }
  };
}
