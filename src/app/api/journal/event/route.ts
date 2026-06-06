import { NextResponse } from "next/server";
import { isJournalEnabled } from "@/lib/journal/db";
import { processJournalEvent } from "@/lib/journal/journal-service";
import { journalEventRequestSchema } from "@/lib/journal/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: Request) {
  if (!isJournalEnabled()) {
    return NextResponse.json({
      success: false,
      disabled: true,
      message: "Journal is disabled",
    });
  }

  try {
    const body = await request.json();
    const parsed = journalEventRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid journal event payload",
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const expectedSecret = process.env.JOURNAL_UPLOAD_SECRET?.trim();

    if (!expectedSecret || parsed.data.uploadSecret !== expectedSecret) {
      return jsonError("Unauthorized", 401);
    }

    const result = await processJournalEvent({
      account: parsed.data.account,
      event: parsed.data.event,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Journal event API error:", error);

    return jsonError("Failed to process journal event", 500);
  }
}
