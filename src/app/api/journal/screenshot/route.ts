import { NextResponse } from "next/server";
import { getJournalScreenshotConfig, uploadJournalScreenshot } from "@/lib/journal/screenshot-service";
import { journalScreenshotRequestSchema } from "@/lib/journal/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: Request) {
  const config = getJournalScreenshotConfig();

  if (!config.uploadEnabled) {
    return NextResponse.json({
      success: false,
      disabled: true,
      message: "Journal screenshot upload is disabled",
    });
  }

  try {
    const body = await request.json();
    const parsed = journalScreenshotRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid journal screenshot payload",
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

    const { imageUrl } = await uploadJournalScreenshot(parsed.data);

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload screenshot";
    const isValidationError =
      message.includes("base64") ||
      message.includes("PNG") ||
      message.includes("empty") ||
      message.includes("too large");

    if (!isValidationError) {
      console.error("Journal screenshot API error:", error);
    }

    return jsonError(
      isValidationError ? message : "Failed to upload screenshot",
      isValidationError ? 400 : 500
    );
  }
}
