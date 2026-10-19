import Link from "next/link";

export default function DashboardPage() {
  return (
    <section>
      <h1
        data-testid="dashboard-heading"
        className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
      >
        Panel de PulseMarket
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Sesión iniciada correctamente. Las métricas y las tablas se agregarán
        en los siguientes pasos.
      </p>
      <Link
        href="/dashboard/kanban"
        className="mt-4 inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        Abrir tablero Kanban
      </Link>
    </section>
  );
}
