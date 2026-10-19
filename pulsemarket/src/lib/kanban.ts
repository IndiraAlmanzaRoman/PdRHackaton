/**
 * Pure Kanban logic shared by the server (persisting a move) and the client
 * (optimistic update). It deliberately avoids importing the Prisma client so it
 * can be bundled for the browser.
 */

export const TASK_STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
] as const;
export type TaskStatusValue = (typeof TASK_STATUSES)[number];

export const TASK_KINDS = ["PURCHASE_ORDER", "INVENTORY", "COUPON"] as const;
export type TaskKindValue = (typeof TASK_KINDS)[number];

export const TASK_STATUS_LABELS: Record<TaskStatusValue, string> = {
  TODO: "Pendiente",
  IN_PROGRESS: "En proceso",
  REVIEW: "En revisión",
  DONE: "Completado",
};

export const TASK_KIND_LABELS: Record<TaskKindValue, string> = {
  PURCHASE_ORDER: "Orden de compra",
  INVENTORY: "Inventario",
  COUPON: "Cupón",
};

export interface KanbanTask {
  id: string;
  title: string;
  description: string | null;
  kind: TaskKindValue;
  status: TaskStatusValue;
  position: number;
}

export type Columns<T> = Record<TaskStatusValue, T[]>;
export type KanbanBoard = Columns<KanbanTask>;

export function isTaskStatus(value: unknown): value is TaskStatusValue {
  return (
    typeof value === "string" &&
    (TASK_STATUSES as readonly string[]).includes(value)
  );
}

export function emptyColumns<T>(): Columns<T> {
  return { TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [] };
}

/** Groups items by status, keeping the order in which they were received. */
export function groupByStatus<T extends { status: TaskStatusValue }>(
  items: readonly T[],
): Columns<T> {
  const columns = emptyColumns<T>();
  for (const item of items) {
    columns[item.status].push(item);
  }
  return columns;
}

/** Returns a copy of the board where one column has been replaced. */
export function withColumn<T>(
  columns: Columns<T>,
  status: TaskStatusValue,
  items: T[],
): Columns<T> {
  return { ...columns, [status]: items };
}

export function locateItem<T extends { id: string }>(
  columns: Columns<T>,
  id: string,
): { status: TaskStatusValue; index: number } | null {
  for (const status of TASK_STATUSES) {
    const index = columns[status].findIndex((item) => item.id === id);
    if (index !== -1) {
      return { status, index };
    }
  }
  return null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Moves one item to `toStatus`. `toIndex` is the final index inside the target
 * column, counted after the item has been removed from its current place (so
 * for a reorder inside the same column it is simply the new index).
 *
 * Returns a new board without mutating the input, or `null` when the item does
 * not exist.
 */
export function moveItem<T extends { id: string }>(
  columns: Columns<T>,
  id: string,
  toStatus: TaskStatusValue,
  toIndex: number,
): Columns<T> | null {
  const from = locateItem(columns, id);
  if (!from) {
    return null;
  }

  const moved = columns[from.status][from.index];
  const next: Columns<T> = {
    TODO: [...columns.TODO],
    IN_PROGRESS: [...columns.IN_PROGRESS],
    REVIEW: [...columns.REVIEW],
    DONE: [...columns.DONE],
  };

  next[from.status].splice(from.index, 1);
  const target = next[toStatus];
  target.splice(clamp(Math.trunc(toIndex), 0, target.length), 0, moved);

  return next;
}
