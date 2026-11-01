import { command } from "../../lib/gwt.mjs";
import { decide } from "./decide.js";

const addTodo = command("AddTodo", decide, { chapter: "Todos" });

addTodo.scenario("Adds a todo")
  .given([])
  .when({ todoId: "t1", title: "Buy milk" })
  .then([{ type: "TodoAdded", data: { todoId: "t1", title: "Buy milk" } }]);

addTodo.scenario("Refuses an empty title")
  .given([])
  .when({ todoId: "t1", title: "   " })
  .rejected("Title is required");
