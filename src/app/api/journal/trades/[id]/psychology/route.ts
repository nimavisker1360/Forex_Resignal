import { NextResponse } from "next/server";
import { updateJournalTradePsychology } from "@/lib/journal/journal-service";
import { journalPsychologySchema } from "@/lib/journal/validators";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = journalPsychologySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid psychology payload",
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const trade = await updateJournalTradePsychology(id, parsed.data);

    if (!trade) {
      return NextResponse.json(
        { success: false, message: "Journal trade not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, trade });
  } catch (error) {
    console.error("Journal psychology API error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update psychology" },
      { status: 500 }
    );
  }
}
