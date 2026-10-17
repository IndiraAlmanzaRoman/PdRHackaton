import { beforeEach, describe, expect, it, vi } from "vitest";

const { executeRawMock, updateManyMock } = vi.hoisted(() => ({
  executeRawMock: vi.fn(),
  updateManyMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $executeRaw: executeRawMock,
    product: { updateMany: updateManyMock },
  },
}));

import {
  bulkUpdatePricesByCategory,
  restoreProduct,
  softDeleteProduct,
} from "../src/lib/services/products";

describe("product mutation services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates category prices in one parameterized SQL mutation", async () => {
    executeRawMock.mockResolvedValue(12);

    await expect(
      bulkUpdatePricesByCategory({
        category: "Electronics",
        percentChange: 12.5,
      }),
    ).resolves.toBe(12);

    expect(executeRawMock).toHaveBeenCalledTimes(1);
    const [, multiplier, category] = executeRawMock.mock.calls[0];
    expect(multiplier).toBe(1.125);
    expect(category).toBe("Electronics");
  });

  it("soft deletes a product without deleting its related records", async () => {
    updateManyMock.mockResolvedValue({ count: 1 });

    await expect(softDeleteProduct("product-1")).resolves.toBe(true);
    expect(updateManyMock).toHaveBeenCalledWith({
      where: { id: "product-1", isDeleted: false },
      data: { isDeleted: true, deletedAt: expect.any(Date) },
    });
  });

  it("reports when a product was already deleted or does not exist", async () => {
    updateManyMock.mockResolvedValue({ count: 0 });

    await expect(softDeleteProduct("product-1")).resolves.toBe(false);
  });

  it("restores a soft-deleted product", async () => {
    updateManyMock.mockResolvedValue({ count: 1 });

    await expect(restoreProduct("product-1")).resolves.toBe(true);
    expect(updateManyMock).toHaveBeenCalledWith({
      where: { id: "product-1", isDeleted: true },
      data: { isDeleted: false, deletedAt: null },
    });
  });
});
