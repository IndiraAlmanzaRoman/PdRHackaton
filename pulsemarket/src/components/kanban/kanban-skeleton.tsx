import { TASK_STATUSES } from "@/lib/kanban";

export function KanbanSkeleton() {
  return (
    <div
      data-testid="kanban-skeleton"
      aria-hidden="true"
      className="flex animate-pulse gap-4 overflow-x-auto pb-2 md:overflow-visible"
    >
      {TASK_STATUSES.map((status) => (
        <div
          key={status}
          className="flex w-72 shrink-0 flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-100/60 p-3 md:w-auto md:min-w-0 md:flex-1 dark:border-zinc-800 dark:bg-zinc-900/60"
        >
          <div className="mb-1 h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-20 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-20 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-20 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}
