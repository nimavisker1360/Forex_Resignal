import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const JBLANKED_BASE_URL = "https://www.jblanked.com";
const WEEKLY_CALENDAR_ENDPOINT = "/news/api/forex-factory/calendar/week/";
export const ECONOMIC_CALENDAR_SOURCE = "jblanked-forex-factory";

type JBlankedEvent = Record<string, unknown>;

export type NormalizedEconomicEvent = {
  name: string;
  currency: string;
  impact: string;
  category: string | null;
  eventTime: Date;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  outcome: string | null;
  strength: string | null;
  quality: string | null;
  source: string;
  rawPayload: Prisma.InputJsonValue;
};

function text(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeImpact(value: unknown) {
  const normalized = text(value);

  if (!normalized) {
    return "None";
  }

  const lower = normalized.toLowerCase();
  if (lower === "high") return "High";
  if (lower === "medium" || lower === "med") return "Medium";
  if (lower === "low") return "Low";

  return normalized;
}

function parseJBlankedDate(value: unknown) {
  const raw = text(value);

  if (!raw) {
    return null;
  }

  const dotted = raw.match(
    /^(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (dotted) {
    const [, year, month, day, hour, minute, second = "0"] = dotted;
    const date = new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
      )
    );

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function extractEvents(payload: unknown): JBlankedEvent[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is JBlankedEvent => item !== null && typeof item === "object");
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const objectPayload = payload as Record<string, unknown>;
  const candidates = [
    objectPayload.data,
    objectPayload.results,
    objectPayload.events,
    objectPayload.calendar,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is JBlankedEvent => item !== null && typeof item === "object");
    }
  }

  return [];
}

export async function fetchJBlankedWeeklyCalendar() {
  const apiKey = process.env.JBLANKED_API_KEY;

  if (!apiKey) {
    throw new Error("JBLANKED_API_KEY is missing");
  }

  const response = await fetch(`${JBLANKED_BASE_URL}${WEEKLY_CALENDAR_ENDPOINT}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Api-Key ${apiKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const details = body ? `: ${body.slice(0, 250)}` : "";
    throw new Error(`JBlanked calendar request failed with ${response.status}${details}`);
  }

  const payload = (await response.json()) as unknown;
  const events = extractEvents(payload);

  if (events.length === 0) {
    console.warn("JBlanked calendar response did not include any events.");
  }

  return events;
}

export function normalizeJBlankedEvent(item: JBlankedEvent): NormalizedEconomicEvent | null {
  const eventTime = parseJBlankedDate(item.Date);

  if (!eventTime) {
    console.warn("Skipping JBlanked calendar event with invalid Date field.");
    return null;
  }

  const name = text(item.Name);
  const currency = text(item.Currency)?.toUpperCase();

  if (!name || !currency) {
    console.warn("Skipping JBlanked calendar event with missing Name or Currency.");
    return null;
  }

  return {
    name,
    currency,
    impact: normalizeImpact(item.Impact),
    category: text(item.Category),
    eventTime,
    actual: text(item.Actual),
    forecast: text(item.Forecast),
    previous: text(item.Previous),
    outcome: text(item.Outcome),
    strength: text(item.Strength),
    quality: text(item.Quality),
    source: ECONOMIC_CALENDAR_SOURCE,
    rawPayload: item as Prisma.InputJsonValue,
  };
}

export async function saveEconomicEventsToDatabase(events: JBlankedEvent[]) {
  let insertedOrUpdated = 0;

  for (const item of events) {
    const normalized = normalizeJBlankedEvent(item);

    if (!normalized) {
      continue;
    }

    await prisma.economicEvent.upsert({
      where: {
        name_currency_eventTime_source: {
          name: normalized.name,
          currency: normalized.currency,
          eventTime: normalized.eventTime,
          source: normalized.source,
        },
      },
      create: normalized,
      update: {
        impact: normalized.impact,
        category: normalized.category,
        actual: normalized.actual,
        forecast: normalized.forecast,
        previous: normalized.previous,
        outcome: normalized.outcome,
        strength: normalized.strength,
        quality: normalized.quality,
        rawPayload: normalized.rawPayload,
      },
    });

    insertedOrUpdated += 1;
  }

  return insertedOrUpdated;
}
