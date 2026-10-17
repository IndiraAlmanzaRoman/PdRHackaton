import { NextRequest, NextResponse } from "next/server";
import { getSalesPage } from "@/lib/services/sales";
import { SalesQuerySchema } from "@/lib/validators/sales";

export async function GET(request: NextRequest) {
  const rawQuery = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = SalesQuerySchema.safeParse(rawQuery);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid sales query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await getSalesPage(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch sales page:", error);
    return NextResponse.json(
      { error: "Unable to load sales right now" },
      { status: 500 },
    );
  }
}
