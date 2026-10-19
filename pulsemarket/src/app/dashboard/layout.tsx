import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { signOutAction } from "../login/actions";

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* The session is request-time data: it must be read inside Suspense. */}
      <Suspense fallback={<ShellSkeleton />}>
        <AuthenticatedShell>{children}</AuthenticatedShell>
      </Suspense>
    </div>
  );
}

// Defense in depth: the proxy already blocks unauthenticated requests, but the
// layout re-checks the session so the pages never render without one.
async function AuthenticatedShell({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const displayName = session.user.name ?? session.user.email ?? "Usuario";

  return (
    <>
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-6">
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            PulseMarket
          </span>
          <nav aria-label="Principal" className="flex items-center gap-4 text-sm">
            <Link
              href="/dashboard"
              data-testid="nav-dashboard"
              className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Resumen
            </Link>
            <Link
              href="/dashboard/kanban"
              data-testid="nav-kanban"
              className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Kanban
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span
            data-testid="user-name"
            className="text-sm text-zinc-600 dark:text-zinc-400"
          >
            {displayName}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              data-testid="logout"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </>
  );
}

function ShellSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="h-14 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
      <div className="mx-auto mt-8 h-32 max-w-6xl rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
