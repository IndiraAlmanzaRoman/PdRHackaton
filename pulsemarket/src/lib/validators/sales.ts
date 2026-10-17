import { z } from "zod";

const optionalText = z.string().trim().max(100).optional();
const optionalDateTime = z.iso.datetime({ offset: true }).optional();

export const SalesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
    sortBy: z.enum(["createdAt", "total", "quantity"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    category: z.string().trim().min(1).max(50).optional(),
    search: optionalText,
    from: optionalDateTime,
    to: optionalDateTime,
  })
  .refine(
    ({ from, to }) => !from || !to || new Date(from) <= new Date(to),
    { message: "`from` must be earlier than or equal to `to`", path: ["from"] },
  );

export type SalesQuery = z.infer<typeof SalesQuerySchema>;
