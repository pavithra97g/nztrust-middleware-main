import { useState } from "react";

export default function TodoPage() {
  const [todos, setTodos] = useState<string[]>([]);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([...todos, newTodo.trim()]);
    setNewTodo("");
  };

  const removeTodo = (index: number) => {
    const updatedTodos = todos.filter((_, i) => i !== index);
    setTodos(updatedTodos);
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Todo
        </h1>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Enter a new task..."
              className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-2 text-sm dark:text-white"
            />
            <button
              onClick={addTodo}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          <ul className="space-y-2">
            {todos.length === 0 && (
              <li className="text-gray-500 dark:text-gray-400 text-sm">
                No tasks added yet.
              </li>
            )}
            {todos.map((todo, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md"
              >
                <span className="text-gray-800 dark:text-white">{todo}</span>
                <button
                  onClick={() => removeTodo(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
