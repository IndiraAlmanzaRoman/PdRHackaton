"use client";

import { useRef, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  isTaskStatus,
  locateItem,
  moveItem,
  TASK_STATUSES,
  withColumn,
  type KanbanBoard as BoardState,
  type KanbanTask,
  type TaskStatusValue,
} from "@/lib/kanban";
import { KanbanCardContent } from "./kanban-card";
import { KanbanColumn } from "./kanban-column";

function findContainer(
  id: UniqueIdentifier,
  board: BoardState,
): TaskStatusValue | null {
  if (isTaskStatus(id)) {
    return id;
  }
  return locateItem(board, String(id))?.status ?? null;
}

export function KanbanBoard({ initialBoard }: { initialBoard: BoardState }) {
  const [board, setBoard] = useState<BoardState>(initialBoard);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [pendingSaves, setPendingSaves] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Board as it was when the drag started: used to roll back on cancel/error.
  const snapshotRef = useRef<BoardState | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: DragStartEvent) {
    snapshotRef.current = board;
    setErrorMessage(null);

    const location = locateItem(board, String(event.active.id));
    setActiveTask(location ? board[location.status][location.index] : null);
  }

  // Live preview: while dragging over another column the card moves there.
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) {
      return;
    }

    setBoard((current) => {
      const activeContainer = findContainer(active.id, current);
      const overContainer = findContainer(over.id, current);
      if (
        !activeContainer ||
        !overContainer ||
        activeContainer === overContainer
      ) {
        return current;
      }

      const overItems = current[overContainer];
      let newIndex = overItems.length;

      if (!isTaskStatus(over.id)) {
        const overIndex = overItems.findIndex((task) => task.id === over.id);
        const activeRect = active.rect.current.translated;
        const isBelowOver =
          activeRect !== null &&
          activeRect.top > over.rect.top + over.rect.height / 2;

        if (overIndex !== -1) {
          newIndex = overIndex + (isBelowOver ? 1 : 0);
        }
      }

      return moveItem(current, String(active.id), overContainer, newIndex) ?? current;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const id = String(active.id);
    const before = snapshotRef.current;
    snapshotRef.current = null;
    setActiveTask(null);

    // Dropped outside any column: undo the live preview.
    if (!over) {
      if (before) {
        setBoard(before);
      }
      return;
    }

    let finalBoard = board;
    const activeContainer = findContainer(active.id, board);
    const overContainer = findContainer(over.id, board);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const items = board[activeContainer];
      const oldIndex = items.findIndex((task) => task.id === id);
      const newIndex = isTaskStatus(over.id)
        ? items.length - 1
        : items.findIndex((task) => task.id === String(over.id));

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        finalBoard = withColumn(
          board,
          activeContainer,
          arrayMove(items, oldIndex, newIndex),
        );
        setBoard(finalBoard);
      }
    }

    if (before) {
      void persistMove(id, before, finalBoard);
    }
  }

  function handleDragCancel() {
    setActiveTask(null);
    if (snapshotRef.current) {
      setBoard(snapshotRef.current);
    }
    snapshotRef.current = null;
  }

  // Optimistic update: the board already shows the new state. We save it in the
  // background and roll back to the pre-drag state if the server rejects it.
  async function persistMove(
    id: string,
    before: BoardState,
    after: BoardState,
  ) {
    const from = locateItem(before, id);
    const to = locateItem(after, id);
    if (!from || !to) {
      return;
    }
    if (from.status === to.status && from.index === to.index) {
      return;
    }

    setPendingSaves((count) => count + 1);
    try {
      const response = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: to.status, position: to.index }),
      });

      if (!response.ok) {
        throw new Error(String(response.status));
      }
    } catch (error) {
      setBoard(before);
      setErrorMessage(
        error instanceof Error && error.message === "401"
          ? "Tu sesión expiró. Inicia sesión de nuevo para guardar cambios."
          : "No se pudo guardar el cambio. El tablero volvió a su estado anterior.",
      );
    } finally {
      setPendingSaves((count) => count - 1);
    }
  }

  return (
    <div>
      {errorMessage ? (
        <p
          role="alert"
          data-testid="kanban-error"
          className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {errorMessage}
        </p>
      ) : null}

      <p
        aria-live="polite"
        data-testid="kanban-status"
        className="mb-3 text-xs text-zinc-500 dark:text-zinc-400"
      >
        {pendingSaves > 0
          ? "Guardando…"
          : "Los cambios se guardan automáticamente."}
      </p>

      <DndContext
        id="kanban-board"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        accessibility={{
          screenReaderInstructions: {
            draggable:
              "Para mover la tarjeta, presiona espacio. Usa las flechas para cambiar su posición o columna, espacio para soltarla y escape para cancelar.",
          },
        }}
      >
        <div className="flex gap-4 overflow-x-auto pb-2 md:overflow-visible">
          {TASK_STATUSES.map((status) => (
            <KanbanColumn key={status} status={status} tasks={board[status]} />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <KanbanCardContent task={activeTask} lifted /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
