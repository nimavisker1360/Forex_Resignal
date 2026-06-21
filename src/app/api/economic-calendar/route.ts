import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId, unauthorizedResponse } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseDateParam(value: string | null, fallback: Date, endOfDay = false) {
  if (!value) {
    return fallback;
  }

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  if (dateOnly && endOfDay) {
    parsed.setUTCHours(23, 59, 59, 999);
  }

  return parsed;
}

function normalizeImpactFilter(value: string | null) {
  if (!value || value.toLowerCase() === "all") {
    return undefined;
  }

  const lower = value.toLowerCase();
  if (lower === "high") return "High";
  if (lower === "medium" || lower === "med") return "Medium";
  if (lower === "low") return "Low";
  if (lower === "none") return "None";

  return value;
}

export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const defaultFrom = startOfToday();
    const defaultTo = new Date(defaultFrom);
    defaultTo.setDate(defaultTo.getDate() + 7);

    const from = parseDateParam(searchParams.get("from"), defaultFrom);
    const to = parseDateParam(searchParams.get("to"), defaultTo, true);
    const currency = searchParams.get("currency");
    const impact = normalizeImpactFilter(searchParams.get("impact"));

    const events = await prisma.economicEvent.findMany({
      where: {
        eventTime: {
          gte: from,
          lte: to,
        },
        ...(currency && currency.toLowerCase() !== "all"
          ? { currency: currency.toUpperCase() }
          : {}),
        ...(impact ? { impact } : {}),
      },
      orderBy: {
        eventTime: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: events.map((event) => ({
        id: event.id,
        name: event.name,
        currency: event.currency,
        impact: event.impact,
        category: event.category,
        eventTime: event.eventTime.toISOString(),
        actual: event.actual,
        forecast: event.forecast,
        previous: event.previous,
        outcome: event.outcome,
        strength: event.strength,
        quality: event.quality,
        source: event.source,
      })),
    });
  } catch (error) {
    console.error("Economic calendar GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load economic calendar events" },
      { status: 500 }
    );
  }
}
