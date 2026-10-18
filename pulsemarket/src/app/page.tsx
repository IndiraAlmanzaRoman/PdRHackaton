import { redirect } from "next/navigation";

// The proxy sends unauthenticated visitors from /dashboard to /login.
export default function Home() {
  redirect("/dashboard");
}
