import { describe, expect, it } from "vitest";
import {
  groupByStatus,
  isTaskStatus,
  locateItem,
  moveItem,
  type Columns,
} from "../src/lib/kanban";

interface Item {
  id: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
}

function board(): Columns<Item> {
  return groupByStatus<Item>([
    { id: "a", status: "TODO" },
    { id: "b", status: "TODO" },
    { id: "c", status: "TODO" },
    { id: "d", status: "DONE" },
  ]);
}

function ids(columns: Columns<Item>, status: Item["status"]): string[] {
  return columns[status].map((item) => item.id);
}

describe("groupByStatus", () => {
  it("keeps the incoming order and creates empty columns", () => {
    const columns = board();
    expect(ids(columns, "TODO")).toEqual(["a", "b", "c"]);
    expect(ids(columns, "DONE")).toEqual(["d"]);
    expect(columns.IN_PROGRESS).toEqual([]);
    expect(columns.REVIEW).toEqual([]);
  });
});

describe("locateItem", () => {
  it("finds the column and index of an item", () => {
    expect(locateItem(board(), "c")).toEqual({ status: "TODO", index: 2 });
    expect(locateItem(board(), "d")).toEqual({ status: "DONE", index: 0 });
  });

  it("returns null for an unknown item", () => {
    expect(locateItem(board(), "zzz")).toBeNull();
  });
});

describe("moveItem", () => {
  it("moves an item to another column at the requested index", () => {
    const moved = moveItem(board(), "a", "DONE", 0);
    expect(moved).not.toBeNull();
    expect(ids(moved!, "TODO")).toEqual(["b", "c"]);
    expect(ids(moved!, "DONE")).toEqual(["a", "d"]);
  });

  it("moves an item into an empty column", () => {
    const moved = moveItem(board(), "b", "REVIEW", 0);
    expect(ids(moved!, "REVIEW")).toEqual(["b"]);
    expect(ids(moved!, "TODO")).toEqual(["a", "c"]);
  });

  it("treats the index as the final position when reordering in a column", () => {
    const moved = moveItem(board(), "a", "TODO", 2);
    expect(ids(moved!, "TODO")).toEqual(["b", "c", "a"]);

    const movedUp = moveItem(board(), "c", "TODO", 0);
    expect(ids(movedUp!, "TODO")).toEqual(["c", "a", "b"]);
  });

  it("clamps out-of-range indexes", () => {
    expect(ids(moveItem(board(), "a", "DONE", 99)!, "DONE")).toEqual(["d", "a"]);
    expect(ids(moveItem(board(), "a", "DONE", -5)!, "DONE")).toEqual(["a", "d"]);
  });

  it("does not mutate the original board", () => {
    const original = board();
    moveItem(original, "a", "DONE", 0);
    expect(ids(original, "TODO")).toEqual(["a", "b", "c"]);
    expect(ids(original, "DONE")).toEqual(["d"]);
  });

  it("returns null when the item does not exist", () => {
    expect(moveItem(board(), "zzz", "DONE", 0)).toBeNull();
  });
});

describe("isTaskStatus", () => {
  it("accepts only the known statuses", () => {
    expect(isTaskStatus("TODO")).toBe(true);
    expect(isTaskStatus("DONE")).toBe(true);
    expect(isTaskStatus("seed_task_00001")).toBe(false);
    expect(isTaskStatus(42)).toBe(false);
  });
});
