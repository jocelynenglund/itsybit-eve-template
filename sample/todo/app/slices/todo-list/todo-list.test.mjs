import { view } from "../../lib/gwt.mjs";
import { project } from "./project.js";

const todoList = view("TodoList", project, { chapter: "Todos" });
const milk = { type: "TodoAdded", data: { todoId: "t1", title: "Buy milk" } };
const bread = { type: "TodoAdded", data: { todoId: "t2", title: "Bake bread" } };

todoList.scenario("Shows an added todo as open")
  .given([milk])
  .shows([{ todoId: "t1", title: "Buy milk", done: false }]);

todoList.scenario("Shows a completed todo as done")
  .given([milk, { type: "TodoCompleted", data: { todoId: "t1" } }])
  .shows([{ todoId: "t1", title: "Buy milk", done: true }]);

todoList.scenario("Leaves out a removed todo")
  .given([milk, bread, { type: "TodoRemoved", data: { todoId: "t1" } }])
  .shows([{ todoId: "t2", title: "Bake bread", done: false }]);
