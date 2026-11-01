import { command } from "../../lib/gwt.mjs";
import { decide } from "./decide.js";

const completeTodo = command("CompleteTodo", decide, { chapter: "Todos" });
const added = { type: "TodoAdded", data: { todoId: "t1", title: "Buy milk" } };

completeTodo.scenario("Completes an open todo")
  .given([added])
  .when({ todoId: "t1" })
  .then([{ type: "TodoCompleted", data: { todoId: "t1" } }]);

completeTodo.scenario("Refuses a todo that doesn't exist")
  .given([])
  .when({ todoId: "t1" })
  .rejected("That todo doesn't exist");

completeTodo.scenario("Refuses a todo that is already done")
  .given([added, { type: "TodoCompleted", data: { todoId: "t1" } }])
  .when({ todoId: "t1" })
  .rejected("That todo is already done");
