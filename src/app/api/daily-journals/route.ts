import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function parseDate(value: unknown) {
  if (!value) {
    return null;
  }

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // TODO: Replace query-param userId with the authenticated session user id.
    const userId = searchParams.get("userId");
    const accountId = searchParams.get("accountId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    const journals = await prisma.dailyJournal.findMany({
      where: {
        userId,
        ...(accountId ? { accountId } : {}),
      },
      include: { account: true },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, journals });
  } catch (error) {
    console.error("Daily journals GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load daily journals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // TODO: Replace body userId with the authenticated session user id.
    const { userId, accountId, mood, notes, plan, mistakes, lesson } = body;
    const date = parseDate(body.date);

    if (!userId || !date) {
      return NextResponse.json(
        { success: false, message: "userId and a valid date are required" },
        { status: 400 }
      );
    }

    const journal = await prisma.dailyJournal.create({
      data: {
        userId,
        accountId,
        date,
        mood,
        notes,
        plan,
        mistakes,
        lesson,
      },
      include: { account: true },
    });

    return NextResponse.json({ success: true, journal }, { status: 201 });
  } catch (error) {
    console.error("Daily journals POST error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create daily journal" },
      { status: 500 }
    );
  }
}
