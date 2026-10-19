import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { moveTask } from "@/lib/services/tasks";
import { MoveTaskSchema, TaskIdSchema } from "@/lib/validators/tasks";

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/tasks/[id]">,
) {
  // The proxy already rejects anonymous requests; re-check as defense in depth.
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const idResult = TaskIdSchema.safeParse(rawId);
  if (!idResult.success) {
    return NextResponse.json({ error: "Identificador inválido" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  const parsed = MoveTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await moveTask(
      idResult.data,
      parsed.data.status,
      parsed.data.position,
    );

    if (!result) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to move task:", error);
    return NextResponse.json(
      { error: "No se pudo guardar el cambio" },
      { status: 500 },
    );
  }
}
