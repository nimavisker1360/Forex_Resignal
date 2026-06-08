import { NextResponse } from "next/server";
import { journalEventRequestSchema } from "@/lib/journal/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

function isJournalEventIngestionEnabled() {
  return process.env.JOURNAL_ENABLED?.trim().toLowerCase() === "true";
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientPrismaConnectionError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { code?: unknown; message?: unknown };
  const code = String(maybeError.code || "");
  const message = String(maybeError.message || "");

  return (
    code === "P1001" ||
    code === "P1008" ||
    code === "P1017" ||
    message.includes("Can't reach database server") ||
    message.includes("Timed out fetching a new connection")
  );
}

export async function POST(request: Request) {
  if (!isJournalEventIngestionEnabled()) {
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

    const { processJournalEventPrisma } = await import(
      "@/lib/journal/prisma-trades"
    );
    const input = {
      account: parsed.data.account,
      event: parsed.data.event,
    };
    const retryDelays = [750, 1500, 3000];
    let lastError: unknown;

    for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
      try {
        const result = await processJournalEventPrisma(input);

        return NextResponse.json(result);
      } catch (error) {
        lastError = error;

        if (
          attempt >= retryDelays.length ||
          !isTransientPrismaConnectionError(error)
        ) {
          break;
        }

        console.warn("Journal event DB retry:", {
          attempt: attempt + 1,
          delayMs: retryDelays[attempt],
          message: error instanceof Error ? error.message : "Unknown error",
        });

        await wait(retryDelays[attempt]);
      }
    }

    throw lastError;
  } catch (error) {
    console.error("Journal event API error:", error);

    return jsonError(
      isTransientPrismaConnectionError(error)
        ? "Database temporarily unavailable"
        : "Failed to process journal event",
      isTransientPrismaConnectionError(error) ? 503 : 500
    );
  }
}
