import { NextResponse } from "next/server";
import {
  ECONOMIC_CALENDAR_SOURCE,
  fetchJBlankedWeeklyCalendar,
  saveEconomicEventsToDatabase,
} from "@/lib/news/jblanked-calendar";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      const authorization = request.headers.get("authorization");

      if (authorization !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { success: false, message: "Unauthorized calendar import request" },
          { status: 401 }
        );
      }
    }

    if (!process.env.JBLANKED_API_KEY) {
      return NextResponse.json(
        { success: false, message: "JBLANKED_API_KEY is missing" },
        { status: 500 }
      );
    }

    const events = await fetchJBlankedWeeklyCalendar();
    const insertedOrUpdated = await saveEconomicEventsToDatabase(events);

    return NextResponse.json({
      success: true,
      insertedOrUpdated,
      source: ECONOMIC_CALENDAR_SOURCE,
    });
  } catch (error) {
    console.error("Economic calendar import failed:", error);

    return NextResponse.json(
      { success: false, message: "Failed to import economic calendar events" },
      { status: 500 }
    );
  }
}
