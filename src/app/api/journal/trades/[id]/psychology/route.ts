import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { journalTradeInclude, serializeJournalTrade } from "@/lib/journal/prisma-trades";
import { journalPsychologySchema } from "@/lib/journal/validators";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function joinNotes(personalNote: string | null, lessonLearned: string | null) {
  const parts = [];

  if (personalNote) {
    parts.push(personalNote);
  }

  if (lessonLearned) {
    parts.push(`Lesson: ${lessonLearned}`);
  }

  return parts.length > 0 ? parts.join("\n\n") : null;
}

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

    const psychology = parsed.data;
    const trade = await prisma.trade.update({
      where: { id },
      data: {
        emotion: psychology.emotionAfter || psychology.emotionBefore,
        mistake: psychology.mistakeTag,
        setup: psychology.entryReason,
        notes: joinNotes(psychology.personalNote, psychology.lessonLearned),
      },
      include: journalTradeInclude,
    });

    return NextResponse.json({ success: true, trade: serializeJournalTrade(trade) });
  } catch (error) {
    console.error("Journal psychology API error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, message: "Journal trade not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update psychology" },
      { status: 500 }
    );
  }
}
