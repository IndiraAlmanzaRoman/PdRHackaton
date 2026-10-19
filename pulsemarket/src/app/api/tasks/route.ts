import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getBoard } from "@/lib/services/tasks";

export async function GET() {
  // The proxy already rejects anonymous requests; re-check as defense in depth.
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    return NextResponse.json(await getBoard());
  } catch (error) {
    console.error("Failed to load the Kanban board:", error);
    return NextResponse.json(
      { error: "No se pudo cargar el tablero" },
      { status: 500 },
    );
  }
}
