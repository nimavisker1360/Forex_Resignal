import { NextResponse } from "next/server";
import { findJournalTradeById } from "@/lib/journal/journal-service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const trade = await findJournalTradeById(id);

    if (!trade) {
      return NextResponse.json(
        { success: false, message: "Journal trade not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, trade });
  } catch (error) {
    console.error("Journal trade detail API error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load journal trade" },
      { status: 500 }
    );
  }
}
