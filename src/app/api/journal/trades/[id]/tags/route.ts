import { NextResponse } from "next/server";
import { updateJournalTradeTags } from "@/lib/journal/journal-service";
import { journalTagsSchema } from "@/lib/journal/validators";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = journalTagsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid tags payload",
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const trade = await updateJournalTradeTags(id, parsed.data.tags);

    if (!trade) {
      return NextResponse.json(
        { success: false, message: "Journal trade not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, trade });
  } catch (error) {
    console.error("Journal tags API error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update tags" },
      { status: 500 }
    );
  }
}
