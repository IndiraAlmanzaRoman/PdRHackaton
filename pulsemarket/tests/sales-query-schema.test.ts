import { describe, expect, it } from "vitest";
import { SalesQuerySchema } from "../src/lib/validators/sales";

describe("SalesQuerySchema", () => {
  it("coerces pagination values and applies defaults", () => {
    expect(SalesQuerySchema.parse({ page: "2", pageSize: "50" })).toEqual({
      page: 2,
      pageSize: 50,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  });

  it("rejects page sizes larger than the server-side limit", () => {
    expect(SalesQuerySchema.safeParse({ pageSize: "500" }).success).toBe(false);
  });

  it("rejects a date range where from is later than to", () => {
    expect(
      SalesQuerySchema.safeParse({
        from: "2026-10-02T00:00:00Z",
        to: "2026-10-01T00:00:00Z",
      }).success,
    ).toBe(false);
  });

  it("rejects unsupported sort fields", () => {
    expect(SalesQuerySchema.safeParse({ sortBy: "customerEmail" }).success).toBe(
      false,
    );
  });
});
