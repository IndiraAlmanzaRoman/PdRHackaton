import "server-only";
import { prisma } from "@/lib/prisma";
import type { BulkPriceUpdate } from "@/lib/validators/products";
import { ProductIdSchema } from "@/lib/validators/products";

export async function bulkUpdatePricesByCategory({
  category,
  percentChange,
}: BulkPriceUpdate): Promise<number> {
  const multiplier = 1 + percentChange / 100;

  return prisma.$executeRaw`
    UPDATE "Product"
    SET "price" = ROUND("price" * ${multiplier}, 2),
        "updatedAt" = NOW()
    WHERE "category" = ${category}
      AND "isDeleted" = false
  `;
}

export async function softDeleteProduct(productId: string): Promise<boolean> {
  const id = ProductIdSchema.parse(productId);
  const result = await prisma.product.updateMany({
    where: { id, isDeleted: false },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return result.count === 1;
}

export async function restoreProduct(productId: string): Promise<boolean> {
  const id = ProductIdSchema.parse(productId);
  const result = await prisma.product.updateMany({
    where: { id, isDeleted: true },
    data: { isDeleted: false, deletedAt: null },
  });

  return result.count === 1;
}
