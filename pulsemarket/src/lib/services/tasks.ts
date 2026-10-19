import "server-only";
import { prisma } from "@/lib/prisma";
import {
  groupByStatus,
  moveItem,
  TASK_STATUSES,
  type KanbanBoard,
  type TaskStatusValue,
} from "@/lib/kanban";

export interface MoveTaskResult {
  id: string;
  status: TaskStatusValue;
  position: number;
}

export async function getBoard(): Promise<KanbanBoard> {
  const tasks = await prisma.task.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      kind: true,
      status: true,
      position: true,
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  });

  return groupByStatus(tasks);
}

/**
 * Persists a drag and drop: moves the task to `status` at index `position`
 * (final index inside the target column) and renumbers every column whose
 * order changed, all inside one transaction so the board is never left
 * half-updated. Only rows whose status or position actually changed are
 * written. Returns `null` when the task does not exist.
 */
export async function moveTask(
  id: string,
  status: TaskStatusValue,
  position: number,
): Promise<MoveTaskResult | null> {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.task.findMany({
      select: { id: true, status: true, position: true },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    });

    const after = moveItem(groupByStatus(rows), id, status, position);
    if (!after) {
      return null;
    }

    const originalById = new Map(rows.map((row) => [row.id, row]));

    for (const columnStatus of TASK_STATUSES) {
      const items = after[columnStatus];
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        const original = originalById.get(item.id);
        if (
          original &&
          original.status === columnStatus &&
          original.position === index
        ) {
          continue;
        }

        await tx.task.update({
          where: { id: item.id },
          data: { status: columnStatus, position: index },
        });
      }
    }

    return {
      id,
      status,
      position: after[status].findIndex((item) => item.id === id),
    };
  });
}
