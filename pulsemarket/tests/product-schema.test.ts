import { describe, expect, it } from "vitest";
import { BulkPriceUpdateSchema } from "../src/lib/validators/products";

describe("BulkPriceUpdateSchema", () => {
  it("accepts a valid category price adjustment", () => {
    expect(
      BulkPriceUpdateSchema.parse({
        category: "Electronics",
        percentChange: 12.5,
      }),
    ).toEqual({
      category: "Electronics",
      percentChange: 12.5,
    });
  });

  it("rejects changes that could reduce prices below zero", () => {
    expect(
      BulkPriceUpdateSchema.safeParse({
        category: "Electronics",
        percentChange: -100,
      }).success,
    ).toBe(false);
  });

  it("rejects unexpected mutation fields", () => {
    expect(
      BulkPriceUpdateSchema.safeParse({
        category: "Electronics",
        percentChange: 10,
        isDeleted: false,
      }).success,
    ).toBe(false);
  });
});
