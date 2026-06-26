import { z } from "zod";

const nullableNumber = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return Number(value);
}, z.number().finite().optional());

const optionalTrimmedString = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const text = String(value).trim();
  return text || undefined;
}, z.string().optional());

const optionalDateString = z
  .string()
  .trim()
  .datetime({ offset: true })
  .optional();

export const mt5JournalPayloadSchema = z
  .object({
    secret: z.string().trim().min(1),
    eventType: z.enum(["open", "close", "update"]),
    accountNumber: z.string().trim().min(1),
    ticket: z.preprocess((value) => String(value ?? "").trim(), z.string().min(1)),
    symbol: optionalTrimmedString.transform((value) => value?.toUpperCase()),
    side: optionalTrimmedString.transform((value, ctx) => {
      if (!value) {
        return undefined;
      }

      const normalized = value.toUpperCase();

      if (normalized !== "BUY" && normalized !== "SELL") {
        ctx.addIssue({
          code: "custom",
          message: "side must be BUY or SELL",
        });
        return z.NEVER;
      }

      return normalized;
    }),
    lot: nullableNumber,
    entryPrice: nullableNumber,
    exitPrice: nullableNumber,
    stopLoss: nullableNumber,
    takeProfit: nullableNumber,
    timeframe: optionalTrimmedString,
    spread: nullableNumber,
    sessionTime: optionalTrimmedString,
    mood: optionalTrimmedString,
    openedAt: optionalDateString,
    closedAt: optionalDateString,
    profitLoss: nullableNumber,
    commission: nullableNumber,
    swap: nullableNumber,
    broker: optionalTrimmedString,
    platform: optionalTrimmedString,
  })
  .superRefine((payload, ctx) => {
    if ((payload.eventType === "open" || payload.eventType === "update") && !payload.symbol) {
      ctx.addIssue({
        code: "custom",
        path: ["symbol"],
        message: "symbol is required for open/update events",
      });
    }

    if ((payload.eventType === "open" || payload.eventType === "update") && !payload.side) {
      ctx.addIssue({
        code: "custom",
        path: ["side"],
        message: "side is required for open/update events",
      });
    }
  });

export type Mt5JournalPayload = z.infer<typeof mt5JournalPayloadSchema>;
