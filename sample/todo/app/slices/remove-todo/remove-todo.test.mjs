import { command } from "../../lib/gwt.mjs";
import { decide } from "./decide.js";

const removeTodo = command("RemoveTodo", decide, { chapter: "Todos" });

removeTodo.scenario("Removes a todo")
  .given([{ type: "TodoAdded", data: { todoId: "t1", title: "Buy milk" } }])
  .when({ todoId: "t1" })
  .then([{ type: "TodoRemoved", data: { todoId: "t1" } }]);

removeTodo.scenario("Refuses a todo that doesn't exist")
  .given([])
  .when({ todoId: "t1" })
  .rejected("That todo doesn't exist");
