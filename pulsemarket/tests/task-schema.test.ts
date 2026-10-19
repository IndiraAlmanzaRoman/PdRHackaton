import { describe, expect, it } from "vitest";
import { MoveTaskSchema } from "../src/lib/validators/tasks";

describe("MoveTaskSchema", () => {
  it("accepts a valid move", () => {
    expect(
      MoveTaskSchema.parse({ status: "IN_PROGRESS", position: 3 }),
    ).toEqual({ status: "IN_PROGRESS", position: 3 });
  });

  it("rejects unknown statuses", () => {
    expect(
      MoveTaskSchema.safeParse({ status: "ARCHIVED", position: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative or fractional positions", () => {
    expect(
      MoveTaskSchema.safeParse({ status: "TODO", position: -1 }).success,
    ).toBe(false);
    expect(
      MoveTaskSchema.safeParse({ status: "TODO", position: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects extra fields so clients cannot change other columns", () => {
    expect(
      MoveTaskSchema.safeParse({ status: "TODO", position: 0, title: "x" })
        .success,
    ).toBe(false);
  });
});
