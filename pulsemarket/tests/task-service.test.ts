import { beforeEach, describe, expect, it, vi } from "vitest";

const { findManyMock, updateMock, transactionMock } = vi.hoisted(() => {
  const findMany = vi.fn();
  const update = vi.fn();
  return {
    findManyMock: findMany,
    updateMock: update,
    transactionMock: vi.fn(
      async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({ task: { findMany, update } }),
    ),
  };
});

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({
  prisma: { $transaction: transactionMock },
}));

import { moveTask } from "../src/lib/services/tasks";

describe("moveTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("moves a task to another column and only rewrites rows that changed", async () => {
    findManyMock.mockResolvedValue([
      { id: "A", status: "TODO", position: 0 },
      { id: "B", status: "TODO", position: 1 },
      { id: "C", status: "DONE", position: 0 },
    ]);

    await expect(moveTask("A", "DONE", 1)).resolves.toEqual({
      id: "A",
      status: "DONE",
      position: 1,
    });

    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "B" },
      data: { status: "TODO", position: 0 },
    });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "A" },
      data: { status: "DONE", position: 1 },
    });
  });

  it("renumbers a column when a task is reordered inside it", async () => {
    findManyMock.mockResolvedValue([
      { id: "A", status: "TODO", position: 0 },
      { id: "B", status: "TODO", position: 1 },
      { id: "C", status: "TODO", position: 2 },
    ]);

    await expect(moveTask("A", "TODO", 2)).resolves.toEqual({
      id: "A",
      status: "TODO",
      position: 2,
    });

    expect(updateMock).toHaveBeenCalledTimes(3);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "B" },
      data: { status: "TODO", position: 0 },
    });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "C" },
      data: { status: "TODO", position: 1 },
    });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "A" },
      data: { status: "TODO", position: 2 },
    });
  });

  it("returns null and writes nothing when the task does not exist", async () => {
    findManyMock.mockResolvedValue([{ id: "A", status: "TODO", position: 0 }]);

    await expect(moveTask("missing", "DONE", 0)).resolves.toBeNull();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("runs everything inside a single transaction", async () => {
    findManyMock.mockResolvedValue([{ id: "A", status: "TODO", position: 0 }]);

    await moveTask("A", "REVIEW", 0);
    expect(transactionMock).toHaveBeenCalledTimes(1);
  });
});
