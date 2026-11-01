// RemoveTodo: someone clears a todo away.
export function decide(history, { todoId }) {
  let exists = false;
  for (const e of history) {
    if (e.data?.todoId !== todoId) continue;
    if (e.type === "TodoAdded") exists = true;
    if (e.type === "TodoRemoved") exists = false;
  }
  if (!exists) return { rejected: "That todo doesn't exist" };
  return { events: [{ type: "TodoRemoved", data: { todoId } }] };
}
