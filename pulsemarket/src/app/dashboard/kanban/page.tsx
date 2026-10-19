import { Suspense } from "react";
import { connection } from "next/server";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { KanbanSkeleton } from "@/components/kanban/kanban-skeleton";
import { getBoard } from "@/lib/services/tasks";

export default function KanbanPage() {
  return (
    <section>
      <h1
        data-testid="kanban-heading"
        className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
      >
        Tablero Kanban
      </h1>
      <p className="mb-6 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Arrastra las órdenes de compra, tareas de inventario y cupones entre
        columnas para cambiar su estado. El cambio se guarda en la base de
        datos al soltar la tarjeta.
      </p>

      <Suspense fallback={<KanbanSkeleton />}>
        <KanbanData />
      </Suspense>
    </section>
  );
}

async function KanbanData() {
  // The board lives in the database and must be read on every request, never
  // baked into the prerendered shell.
  await connection();
  const board = await getBoard();

  return <KanbanBoard initialBoard={board} />;
}
