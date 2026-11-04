// TodoList: what's on the list right now, oldest first.
export function project(history) {
  const todos = new Map();
  for (const e of history) {
    if (e.type === "TodoAdded") todos.set(e.data.todoId, { todoId: e.data.todoId, title: e.data.title, done: false });
    if (e.type === "TodoCompleted" && todos.has(e.data.todoId)) todos.get(e.data.todoId).done = true;
    if (e.type === "TodoRemoved") todos.delete(e.data.todoId);
  }
  return [...todos.values()];
}
