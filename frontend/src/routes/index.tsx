import { Button } from "@/components/ui/button";
import TokenService from "@/utils/TokenService";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

type ApiData = {
  data: string;
  user?: {
    name?: string;
    email?: string;
    id?: string | number;
  };
};

type Task = {
  _id: string;
  title: string;
  createdAt?: string;
};

function Index() {
  const navigate = useNavigate();
  const [apiData, setApiData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const host = window.location.hostname;

  const fetchTasks = () => {
    const token = TokenService.getToken();
    fetch(`http://${host}:8080/api/secure/tasks`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          TokenService.removeToken();
          navigate({ to: "/login" });
          return;
        }
        if (res.status === 403) {
          TokenService.removeToken();
          navigate({ to: "/error" });
          return;
        }
        const json = await res.json();
        setTasks(json);
      })
      .catch((err) => {
        console.error("Task fetch failed:", err);
        TokenService.removeToken();
        navigate({ to: "/login" });
      });
  };

  useEffect(() => {
    if (!TokenService.isLoggedIn()) {
      navigate({ to: "/login" });
      return;
    }

    const token = TokenService.getToken();

    // Fetch user profile
    fetch(`http://${host}:8080/api/data`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          TokenService.removeToken();
          navigate({ to: "/login" });
          return;
        }
        if (res.status === 403) {
          TokenService.removeToken();
          navigate({ to: "/error" });
          return;
        }
        const json = await res.json();
        setApiData(json);
      })
      .catch((err) => {
        console.error("API fetch failed:", err);
        TokenService.removeToken();
        navigate({ to: "/login" });
      })
      .finally(() => setLoading(false));

    fetchTasks();
  }, [ navigate]);

  const handleLogout = () => {
    TokenService.removeToken();
    navigate({ to: "/login" });
  };

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const token = TokenService.getToken();
    fetch(`http://${host}:8080/api/secure/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTask }),
    })
      .then(async (res) => {
        if (res.status === 401) {
          TokenService.removeToken();
          navigate({ to: "/login" });
          return;
        }
        if (res.status === 403) {
          TokenService.removeToken();
          navigate({ to: "/error" });
          return;
        }
        setNewTask("");
        fetchTasks();
      })
      .catch((err) => {
        console.error("Task add failed:", err);
        TokenService.removeToken();
        navigate({ to: "/login" });
      });
  };

  const handleDeleteTask = (id: string) => {
    const token = TokenService.getToken();
    fetch(`http://${host}:8080/api/secure/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          TokenService.removeToken();
          navigate({ to: "/login" });
          return;
        }
        if (res.status === 403) {
          TokenService.removeToken();
          navigate({ to: "/error" });
          return;
        }
        setTasks((prev) => prev.filter((task) => task._id !== id));
      })
      .catch((err) => {
        console.error("Task delete failed:", err);
        TokenService.removeToken();
        navigate({ to: "/login" });
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-black text-white p-4 flex justify-between">
        <h3 className="text-2xl font-bold">NearZero trust</h3>
        <Button type="button" onClick={handleLogout} variant="destructive">
          Sign out
        </Button>
      </nav>

      <div className="p-4 space-y-6 flex flex-col items-center">
        {/* Profile Section */}
        {loading ? (
          <p>Loading profile...</p>
        ) : apiData ? (
          <div className="mt-6 w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border">
            <div className="flex items-center p-6 space-x-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
                {apiData.user?.name?.[0] || "U"}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {apiData.user?.name}
                </h2>
                <p className="text-gray-500">{apiData.user?.email}</p>
              </div>
            </div>
            <div className="px-6 pb-6 space-y-2 text-gray-700">
              <p>
                <span className="font-medium">User ID:</span> {apiData.user?.id}
              </p>
              <p className="text-sm bg-gray-100 p-2 rounded-md">
                {apiData.data}
              </p>
            </div>
          </div>
        ) : (
          <p>Unable to fetch profile data.</p>
        )}

        {/* Tasks Section */}
        <div className="max-w-md w-full p-4 border rounded shadow bg-white text-center">
          <h3 className="text-lg font-semibold mb-4">My Tasks</h3>
          <div className="flex mb-4 space-x-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter new task"
              className="border px-2 py-1 rounded w-full"
            />
            <Button onClick={handleAddTask}>Add</Button>
          </div>
          {tasks.length > 0 ? (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task._id}
                  className="flex justify-between items-center border px-3 py-1 rounded"
                >
                  <span>{task.title}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTask(task._id)}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No tasks yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Index;
