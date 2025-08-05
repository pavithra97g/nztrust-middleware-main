import LoginPage from "~/Login/LoginPage";
import type { Route } from "./+types/home";
import TodoPage from "~/Todo/TodoPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Welcome to Dashboard!" },
  ];
}

export default function Dashboard() {
  return <TodoPage />;
}
