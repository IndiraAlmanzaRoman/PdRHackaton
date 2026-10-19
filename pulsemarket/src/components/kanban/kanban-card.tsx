"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  TASK_KIND_LABELS,
  type KanbanTask,
  type TaskKindValue,
} from "@/lib/kanban";

const KIND_STYLES: Record<TaskKindValue, string> = {
  PURCHASE_ORDER:
    "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  INVENTORY:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  COUPON:
    "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
};

export function KanbanCardContent({
  task,
  lifted = false,
}: {
  task: KanbanTask;
  lifted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-zinc-200 bg-white p-3 text-left shadow-sm transition-shadow dark:border-zinc-700 dark:bg-zinc-800 ${
        lifted ? "rotate-1 shadow-lg ring-2 ring-zinc-400/60" : ""
      }`}
    >
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${KIND_STYLES[task.kind]}`}
      >
        {TASK_KIND_LABELS[task.kind]}
      </span>
      <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
        {task.title}
      </p>
      {task.description ? (
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          {task.description}
        </p>
      ) : null}
    </div>
  );
}

export function SortableKanbanCard({ task }: { task: KanbanTask }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  return (
    <li>
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        data-testid={`kanban-card-${task.id}`}
        className={`cursor-grab touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 active:cursor-grabbing ${
          isDragging ? "opacity-40" : ""
        }`}
        {...attributes}
        {...listeners}
      >
        <KanbanCardContent task={task} />
      </div>
    </li>
  );
}
