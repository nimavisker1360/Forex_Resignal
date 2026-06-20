import { NextResponse } from "next/server";
import {
  getActiveJournalConnection,
  regenerateJournalConnection,
} from "@/lib/journal/connections";
import { requireUser, authErrorResponse } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

function serializeDate(value: Date | null) {
  return value ? value.toISOString() : null;
}

function serializeConnection(
  connection: Awaited<ReturnType<typeof getActiveJournalConnection>>
) {
  if (!connection) {
    return null;
  }

  return {
    ...connection,
    connectedAt: serializeDate(connection.connectedAt),
    lastUsedAt: serializeDate(connection.lastUsedAt),
    createdAt: serializeDate(connection.createdAt),
    updatedAt: serializeDate(connection.updatedAt),
  };
}

export async function GET() {
  try {
    const user = await requireUser();
    const connection = await getActiveJournalConnection(user.id);

    return NextResponse.json({
      success: true,
      connection: serializeConnection(connection),
      apiBaseUrl:
        process.env.JOURNAL_API_BASE_URL?.trim() || "http://127.0.0.1:3000",
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);

    if (authResponse) {
      return authResponse;
    }

    console.error("Journal connection GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load journal connection" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const user = await requireUser();
    const { connection, token } = await regenerateJournalConnection(user.id);

    return NextResponse.json({
      success: true,
      connection: serializeConnection(connection),
      token,
      apiBaseUrl:
        process.env.JOURNAL_API_BASE_URL?.trim() || "http://127.0.0.1:3000",
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);

    if (authResponse) {
      return authResponse;
    }

    console.error("Journal connection POST error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to generate journal connection" },
      { status: 500 }
    );
  }
}

