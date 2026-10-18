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
        Sesión iniciada correctamente. Las métricas, las tablas y el tablero
        Kanban se agregarán en los siguientes pasos.
      </p>
    </section>
  );
}
