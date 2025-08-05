import LoginPage from "~/Login/LoginPage";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "description", content: "Welcome to NzTrust" },
  ];
}

export default function Home() {
  return <LoginPage />;
}
