import { z } from "zod";

export const BulkPriceUpdateSchema = z
  .object({
    category: z.string().trim().min(1).max(50),
    percentChange: z.number().finite().min(-99).max(1_000),
  })
  .strict();

export const ProductIdSchema = z.string().trim().min(1).max(100);

export type BulkPriceUpdate = z.infer<typeof BulkPriceUpdateSchema>;
