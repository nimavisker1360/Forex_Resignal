import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { authErrorResponse, requireUser } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fileName = "TradeJournalRecorder.mq5";

export async function GET() {
  try {
    await requireUser();

    const filePath = path.join(process.cwd(), "ea", fileName);
    const file = await readFile(filePath);

    return new NextResponse(file, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": file.byteLength.toString(),
        "Content-Type": "application/octet-stream",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);

    if (authResponse) {
      return authResponse;
    }

    console.error("Failed to download TradeJournalRecorder.mq5:", error);
    return NextResponse.json(
      { success: false, message: "Failed to download MT5 bot" },
      { status: 500 }
    );
  }
}
