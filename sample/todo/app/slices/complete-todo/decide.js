// CompleteTodo: someone ticks a todo off.
export function decide(history, { todoId }) {
  let exists = false, done = false;
  for (const e of history) {
    if (e.data?.todoId !== todoId) continue;
    if (e.type === "TodoAdded") exists = true;
    if (e.type === "TodoCompleted") done = true;
    if (e.type === "TodoRemoved") exists = false;
  }
  if (!exists) return { rejected: "That todo doesn't exist" };
  if (done) return { rejected: "That todo is already done" };
  return { events: [{ type: "TodoCompleted", data: { todoId } }] };
}
