import { z } from "zod";
import { TASK_KINDS, TASK_STATUSES } from "@/lib/kanban";

export const TaskStatusSchema = z.enum(TASK_STATUSES);
export const TaskKindSchema = z.enum(TASK_KINDS);
export const TaskIdSchema = z.string().trim().min(1).max(100);

export const MoveTaskSchema = z
  .object({
    status: TaskStatusSchema,
    position: z.number().int().min(0).max(10_000),
  })
  .strict();

export type MoveTaskInput = z.infer<typeof MoveTaskSchema>;
