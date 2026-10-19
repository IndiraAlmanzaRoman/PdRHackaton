"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  TASK_STATUS_LABELS,
  type KanbanTask,
  type TaskStatusValue,
} from "@/lib/kanban";
import { SortableKanbanCard } from "./kanban-card";

export function KanbanColumn({
  status,
  tasks,
}: {
  status: TaskStatusValue;
  tasks: KanbanTask[];
}) {
  // The list itself is droppable so empty columns still accept cards.
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      data-testid={`kanban-column-${status}`}
      aria-label={TASK_STATUS_LABELS[status]}
      className={`flex w-72 shrink-0 flex-col rounded-xl border p-3 transition-colors md:w-auto md:min-w-0 md:flex-1 ${
        isOver
          ? "border-zinc-400 bg-zinc-100 dark:border-zinc-500 dark:bg-zinc-800/70"
          : "border-zinc-200 bg-zinc-100/60 dark:border-zinc-800 dark:bg-zinc-900/60"
      }`}
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          {TASK_STATUS_LABELS[status]}
        </h2>
        <span
          data-testid={`kanban-count-${status}`}
          className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
        >
          {tasks.length}
        </span>
      </header>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul ref={setNodeRef} className="flex min-h-24 flex-1 flex-col gap-2">
          {tasks.map((task) => (
            <SortableKanbanCard key={task.id} task={task} />
          ))}
        </ul>
      </SortableContext>
    </section>
  );
}
