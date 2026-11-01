// AddTodo: someone writes down something to do.
export function decide(history, { todoId, title }) {
  const text = String(title ?? "").trim();
  if (!text) return { rejected: "Title is required" };
  if (history.some(e => e.type === "TodoAdded" && e.data.todoId === todoId)) return { rejected: "That todo already exists" };
  return { events: [{ type: "TodoAdded", data: { todoId, title: text } }] };
}
