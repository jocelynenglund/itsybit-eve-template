// Wiring only: each button sends one command to its slice; the list is the TodoList view.
import { createStore, run } from "./lib/store.js";
import { decide as addTodo } from "./slices/add-todo/decide.js";
import { decide as completeTodo } from "./slices/complete-todo/decide.js";
import { decide as removeTodo } from "./slices/remove-todo/decide.js";
import { project as todoList } from "./slices/todo-list/project.js";

const store = createStore("eve-sample-todo");
const $ = id => document.getElementById(id);

function send(decide, command) {
  const d = run(store, decide, command);
  $("refusal").textContent = d.rejected || "";
  return d;
}

$("add").addEventListener("submit", ev => {
  ev.preventDefault();
  const d = send(addTodo, { todoId: crypto.randomUUID(), title: $("title").value });
  if (!d.rejected) $("title").value = "";
  $("title").focus();
});

$("list").addEventListener("click", ev => {
  const btn = ev.target.closest("button[data-act]");
  if (!btn) return;
  const todoId = btn.closest("li").dataset.id;
  send(btn.dataset.act === "complete" ? completeTodo : removeTodo, { todoId });
});

$("log-pill").addEventListener("click", () => {
  const open = $("log").hidden;
  $("log").hidden = !open;
  $("log-pill").setAttribute("aria-expanded", String(open));
});

function render(events) {
  const todos = todoList(events);
  $("list").innerHTML = "";
  for (const t of todos) {
    const li = document.createElement("li");
    li.dataset.id = t.todoId;
    li.className = t.done ? "done" : "";
    const title = document.createElement("span");
    title.textContent = t.title;
    li.append(title);
    if (!t.done) li.append(button("complete", "Done", t.title));
    li.append(button("remove", "Remove", t.title));
    $("list").append(li);
  }
  $("empty").hidden = todos.length > 0;
  $("log-count").textContent = events.length;
  $("log-list").innerHTML = events.slice().reverse()
    .map(e => `<li><b>${e.type}</b> ${escape(JSON.stringify(e.data))}</li>`).join("");
}

function button(act, label, title) {
  const b = document.createElement("button");
  b.dataset.act = act;
  b.textContent = label;
  b.setAttribute("aria-label", `${label}: ${title}`);
  return b;
}

function escape(s) { return s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }

store.subscribe(render);
render(store.all());
