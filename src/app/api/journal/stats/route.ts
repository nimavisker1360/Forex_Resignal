import { NextResponse } from "next/server";
import { getJournalStats } from "@/lib/journal/analytics-service";
import { journalTradeQuerySchema } from "@/lib/journal/validators";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = journalTradeQuerySchema.safeParse(
      Object.fromEntries(url.searchParams.entries())
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid journal stats filters",
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const stats = await getJournalStats({
      symbol: parsed.data.symbol,
      status: parsed.data.status,
      result: parsed.data.result,
      tradeType: parsed.data.tradeType,
      from: parsed.data.dateFrom,
      to: parsed.data.dateTo,
    });

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Journal stats API error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load journal stats" },
      { status: 500 }
    );
  }
}
