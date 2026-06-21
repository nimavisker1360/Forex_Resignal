import { Prisma, TradeDirection } from "@prisma/client";
import {
  analyticsTradeInclude,
  buildAnalyticsMetadata,
  buildTradeAnalytics,
} from "@/lib/analytics/tradeAnalytics";
import { prisma } from "@/lib/prisma";
import type { JournalAnalyticsResponse } from "@/types/analytics";

export const REPORT_DATE_RANGES = [
  "all",
  "today",
  "thisWeek",
  "thisMonth",
  "thisYear",
  "custom",
] as const;

export type ReportDateRange = (typeof REPORT_DATE_RANGES)[number];

export type JournalReportFilters = {
  dateRange: ReportDateRange;
  dateFrom: string;
  dateTo: string;
  accountId: string;
  symbol: string;
  direction: "" | "BUY" | "SELL";
  strategy: string;
};

export type JournalReportTrade = {
  id: string;
  accountName: string;
  broker: string | null;
  symbol: string;
  direction: "BUY" | "SELL";
  status: string;
  pnl: number;
  rr: number | null;
  openedAt: string | null;
  closedAt: string | null;
  setup: string | null;
  session: string | null;
  emotion: string | null;
  mistake: string | null;
  notes: string | null;
  tags: string[];
  screenshotsCount: number;
  entryScreenshotUrl: string | null;
  exitScreenshotUrl: string | null;
  strategyName: string | null;
  followedPlan: string | null;
  compliancePercent: number | null;
  checklistCompletion: number | null;
  rating: number | null;
  exitReason: string | null;
};

export type JournalReportDailyNote = {
  id: string;
  date: string;
  mood: string | null;
  focusLevel: number | null;
  disciplineScore: number | null;
  whatWentWell: string | null;
  mistakesSummary: string | null;
  improvementPlan: string | null;
  tomorrowPlan: string | null;
  endOfDayNotes: string | null;
};

export type LocalizedReportText = {
  en: string;
  fa: string;
};

export type JournalReportSummary = {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRate: number;
  totalPnl: number;
  grossProfit: number;
  grossLoss: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number | null;
  averageRR: number | null;
  expectancy: number | null;
  bestTrade: JournalReportTrade | null;
  worstTrade: JournalReportTrade | null;
};

export type JournalReport = {
  success: true;
  generatedAt: string;
  filters: JournalReportFilters;
  filterOptions: {
    accounts: Array<{ id: string; name: string; broker: string | null }>;
    symbols: string[];
    strategies: string[];
  };
  summary: JournalReportSummary;
  analytics: JournalAnalyticsResponse;
  recentTrades: JournalReportTrade[];
  dailyNotes: JournalReportDailyNote[];
  insights: {
    strengths: LocalizedReportText[];
    risks: LocalizedReportText[];
    actionPlan: LocalizedReportText[];
  };
};

type ReportTrade = Prisma.TradeGetPayload<{
  include: typeof reportTradeInclude;
}>;

type ReportSearchParams =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

export class ReportValidationError extends Error {
  errors: string[];

  constructor(errors: string[]) {
    super("Validation failed");
    this.name = "ReportValidationError";
    this.errors = errors;
  }
}

const reportTradeInclude = {
  account: true,
  screenshots: true,
  tags: {
    include: {
      tag: true,
    },
  },
  checklists: true,
  strategyReview: true,
  journalMetadata: true,
} satisfies Prisma.TradeInclude;

function firstParam(
  params: ReportSearchParams,
  name: string
): string | undefined {
  if (params instanceof URLSearchParams) {
    return params.get(name) || undefined;
  }

  const value = params[name];
  return Array.isArray(value) ? value[0] : value;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function startOfWeek(date: Date) {
  const copy = startOfDay(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function parseDateParam(value: string | undefined, end = false) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return end ? endOfDay(parsed) : startOfDay(parsed);
  }

  return parsed;
}

function round(value: unknown, digits = 2) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? Number(number.toFixed(digits)) : 0;
}

function toNumber(value: unknown) {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function nullableNumber(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function rangeFromPreset(value: ReportDateRange) {
  const now = new Date();

  if (value === "all" || value === "custom") {
    return {};
  }

  if (value === "today") {
    return { dateFrom: startOfDay(now), dateTo: endOfDay(now) };
  }

  if (value === "thisWeek") {
    return { dateFrom: startOfWeek(now), dateTo: endOfDay(now) };
  }

  if (value === "thisMonth") {
    return {
      dateFrom: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
      dateTo: endOfDay(now),
    };
  }

  return {
    dateFrom: startOfDay(new Date(now.getFullYear(), 0, 1)),
    dateTo: endOfDay(now),
  };
}

function normalizeDirection(value: string | undefined) {
  const normalized = value?.trim().toUpperCase();

  if (!normalized) {
    return "";
  }

  return normalized === TradeDirection.BUY || normalized === TradeDirection.SELL
    ? normalized
    : null;
}

export function normalizeJournalReportFilters(
  params: ReportSearchParams
): { filters: JournalReportFilters; dateFrom?: Date; dateTo?: Date; errors: string[] } {
  const errors: string[] = [];
  const rawDateRange = firstParam(params, "dateRange") || "thisMonth";
  const dateRange = REPORT_DATE_RANGES.includes(rawDateRange as ReportDateRange)
    ? (rawDateRange as ReportDateRange)
    : null;
  const direction = normalizeDirection(
    firstParam(params, "direction") || firstParam(params, "side")
  );
  const customDateFrom = parseDateParam(
    firstParam(params, "dateFrom") || firstParam(params, "from")
  );
  const customDateTo = parseDateParam(
    firstParam(params, "dateTo") || firstParam(params, "to"),
    true
  );

  if (!dateRange) {
    errors.push("dateRange must be all, today, thisWeek, thisMonth, thisYear, or custom");
  }

  if (direction === null) {
    errors.push("direction must be BUY or SELL");
  }

  if (customDateFrom === null) {
    errors.push("dateFrom must be a valid date");
  }

  if (customDateTo === null) {
    errors.push("dateTo must be a valid date");
  }

  const presetRange = rangeFromPreset(dateRange || "thisMonth");
  const dateFrom = customDateFrom || presetRange.dateFrom;
  const dateTo = customDateTo || presetRange.dateTo;

  return {
    filters: {
      dateRange: dateRange || "thisMonth",
      dateFrom: firstParam(params, "dateFrom") || firstParam(params, "from") || "",
      dateTo: firstParam(params, "dateTo") || firstParam(params, "to") || "",
      accountId: firstParam(params, "accountId")?.trim() || "",
      symbol: firstParam(params, "symbol")?.trim() || "",
      direction: direction || "",
      strategy: firstParam(params, "strategy")?.trim() || "",
    },
    dateFrom,
    dateTo,
    errors,
  };
}

function buildTradeWhere(
  userId: string,
  filters: JournalReportFilters,
  dateFrom?: Date,
  dateTo?: Date
) {
  const and: Prisma.TradeWhereInput[] = [{ userId }];

  if (filters.accountId) {
    and.push({ accountId: filters.accountId });
  }

  if (filters.symbol) {
    and.push({ symbol: { contains: filters.symbol, mode: "insensitive" } });
  }

  if (filters.direction) {
    and.push({ direction: filters.direction });
  }

  if (filters.strategy) {
    and.push({
      OR: [
        { setup: { contains: filters.strategy, mode: "insensitive" } },
        { session: { contains: filters.strategy, mode: "insensitive" } },
        {
          strategyReview: {
            strategyNameSnapshot: {
              contains: filters.strategy,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  if (dateFrom || dateTo) {
    and.push({
      openedAt: {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lte: dateTo } : {}),
      },
    });
  }

  return { AND: and } satisfies Prisma.TradeWhereInput;
}

function screenshotUrl(trade: ReportTrade, type: string) {
  return (
    trade.screenshots.find(
      (screenshot) => screenshot.type.toLowerCase() === type
    )?.url || null
  );
}

function averageChecklistCompletion(trade: ReportTrade) {
  if (trade.checklists.length === 0) {
    return null;
  }

  return round(
    trade.checklists.reduce(
      (total, checklist) => total + toNumber(checklist.completionPercent),
      0
    ) / trade.checklists.length,
    1
  );
}

function serializeTrade(trade: ReportTrade): JournalReportTrade {
  return {
    id: trade.id,
    accountName: trade.account.name,
    broker: trade.account.broker,
    symbol: trade.symbol,
    direction: trade.direction,
    status: trade.status,
    pnl: round(trade.profitLoss),
    rr: nullableNumber(trade.rr),
    openedAt: toIso(trade.openedAt),
    closedAt: toIso(trade.closedAt),
    setup: trade.setup,
    session: trade.session,
    emotion: trade.emotion,
    mistake: trade.mistake,
    notes: trade.notes,
    tags: trade.tags
      .map((tradeTag) => tradeTag.tag.name?.trim())
      .filter((tag): tag is string => Boolean(tag)),
    screenshotsCount: trade.screenshots.length,
    entryScreenshotUrl: screenshotUrl(trade, "entry"),
    exitScreenshotUrl: screenshotUrl(trade, "exit"),
    strategyName: trade.strategyReview?.strategyNameSnapshot || null,
    followedPlan: trade.strategyReview?.followedPlan || null,
    compliancePercent:
      trade.strategyReview?.compliancePercent === undefined
        ? null
        : round(trade.strategyReview.compliancePercent, 1),
    checklistCompletion: averageChecklistCompletion(trade),
    rating: trade.journalMetadata?.rating || null,
    exitReason: trade.journalMetadata?.exitReason || null,
  };
}

function summarizeTrades(trades: JournalReportTrade[]): JournalReportSummary {
  const closedTrades = trades.filter((trade) => trade.status === "CLOSED");
  const openTrades = trades.filter((trade) => trade.status === "OPEN");
  const wins = closedTrades.filter((trade) => trade.pnl > 0);
  const losses = closedTrades.filter((trade) => trade.pnl < 0);
  const breakEven = closedTrades.filter((trade) => trade.pnl === 0);
  const grossProfit = wins.reduce((total, trade) => total + trade.pnl, 0);
  const grossLoss = losses.reduce((total, trade) => total + Math.abs(trade.pnl), 0);
  const totalPnl = trades.reduce((total, trade) => total + trade.pnl, 0);
  const rrTrades = closedTrades.filter((trade) => trade.rr !== null);
  const bestTrade =
    trades.length > 0
      ? trades.reduce((best, trade) => (trade.pnl > best.pnl ? trade : best))
      : null;
  const worstTrade =
    trades.length > 0
      ? trades.reduce((worst, trade) => (trade.pnl < worst.pnl ? trade : worst))
      : null;

  return {
    totalTrades: trades.length,
    openTrades: openTrades.length,
    closedTrades: closedTrades.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    breakEvenTrades: breakEven.length,
    winRate: closedTrades.length > 0 ? round((wins.length / closedTrades.length) * 100, 1) : 0,
    totalPnl: round(totalPnl),
    grossProfit: round(grossProfit),
    grossLoss: round(grossLoss),
    averageWin: wins.length > 0 ? round(grossProfit / wins.length) : 0,
    averageLoss: losses.length > 0 ? round(-grossLoss / losses.length) : 0,
    profitFactor: grossLoss > 0 ? round(grossProfit / grossLoss, 2) : null,
    averageRR:
      rrTrades.length > 0
        ? round(
            rrTrades.reduce((total, trade) => total + toNumber(trade.rr), 0) /
              rrTrades.length,
            2
          )
        : null,
    expectancy:
      closedTrades.length > 0 ? round(closedTrades.reduce((total, trade) => total + trade.pnl, 0) / closedTrades.length) : null,
    bestTrade,
    worstTrade,
  };
}

function compactText(value: string | null | undefined, fallback: string) {
  const text = value?.trim();
  return text || fallback;
}

function buildInsights(
  summary: JournalReportSummary,
  analytics: JournalAnalyticsResponse,
  trades: JournalReportTrade[],
  dailyNotes: JournalReportDailyNote[]
) {
  const bestSymbol = analytics.bySymbol[0];
  const worstSymbol = [...analytics.bySymbol].sort((a, b) => a.netPnl - b.netPnl)[0];
  const bestStrategy = analytics.byStrategy[0];
  const worstMistake = analytics.byMistake[0];
  const weakestHour = [...analytics.byHour]
    .filter((row) => row.totalTrades > 0)
    .sort((a, b) => a.netPnl - b.netPnl)[0];
  const averageComplianceRows = trades.filter(
    (trade) => trade.compliancePercent !== null
  );
  const averageCompliance =
    averageComplianceRows.length > 0
      ? round(
          averageComplianceRows.reduce(
            (total, trade) => total + toNumber(trade.compliancePercent),
            0
          ) / averageComplianceRows.length,
          1
        )
      : null;
  const latestPlan = dailyNotes.find(
    (note) => note.improvementPlan || note.tomorrowPlan
  );

  const strengths = [
    summary.totalPnl > 0
      ? {
          en: `Net PnL is positive at ${summary.totalPnl.toLocaleString("en-US")}.`,
          fa: `سود/زیان خالص در این بازه مثبت است: ${summary.totalPnl.toLocaleString("en-US")}.`,
        }
      : {
          en: "The report establishes a clear baseline for the selected period.",
          fa: "این گزارش یک خط پایه شفاف برای بازه انتخاب‌شده ایجاد می‌کند.",
        },
    bestSymbol
      ? {
          en: `${bestSymbol.symbol} is the strongest symbol with ${bestSymbol.netPnl.toLocaleString("en-US")} net PnL.`,
          fa: `${bestSymbol.symbol} قوی‌ترین نماد بوده و ${bestSymbol.netPnl.toLocaleString("en-US")} سود/زیان خالص داشته است.`,
        }
      : {
          en: "No symbol edge is visible yet.",
          fa: "هنوز مزیت مشخصی در هیچ نمادی دیده نمی‌شود.",
        },
    bestStrategy
      ? {
          en: `${bestStrategy.strategy} is the strongest setup with ${bestStrategy.winRate}% win rate.`,
          fa: `${bestStrategy.strategy} قوی‌ترین ستاپ بوده و نرخ برد آن ${bestStrategy.winRate}% است.`,
        }
      : {
          en: "Strategy data is not complete enough yet.",
          fa: "داده‌های استراتژی هنوز برای نتیجه‌گیری کامل کافی نیست.",
        },
  ];

  const risks = [
    summary.profitFactor !== null && summary.profitFactor < 1
      ? {
          en: `Profit factor is ${summary.profitFactor}; losses are outweighing wins.`,
          fa: `فاکتور سود ${summary.profitFactor} است؛ زیان‌ها از سودها سنگین‌تر هستند.`,
        }
      : {
          en: "Keep monitoring profit factor as trade count grows.",
          fa: "با بیشتر شدن تعداد معاملات، فاکتور سود را همچنان زیر نظر بگیر.",
        },
    worstSymbol
      ? {
          en: `${worstSymbol.symbol} is the weakest symbol with ${worstSymbol.netPnl.toLocaleString("en-US")} net PnL.`,
          fa: `${worstSymbol.symbol} ضعیف‌ترین نماد بوده و ${worstSymbol.netPnl.toLocaleString("en-US")} سود/زیان خالص داشته است.`,
        }
      : {
          en: "No weak symbol is visible yet.",
          fa: "هنوز نماد ضعیف مشخصی دیده نمی‌شود.",
        },
    worstMistake
      ? {
          en: `${worstMistake.label} is the most expensive repeated mistake.`,
          fa: `${worstMistake.label} پرهزینه‌ترین اشتباه تکراری بوده است.`,
        }
      : {
          en: "Mistake tagging is incomplete, so behavior risk is harder to read.",
          fa: "تگ‌گذاری اشتباهات کامل نیست، بنابراین خواندن ریسک رفتاری سخت‌تر است.",
        },
  ];

  const actionPlan = [
    averageCompliance !== null && averageCompliance < 80
      ? {
          en: `Raise playbook compliance from ${averageCompliance}% toward 80%+ before increasing size.`,
          fa: `قبل از افزایش حجم، پایبندی به پلی‌بوک را از ${averageCompliance}% به بالای 80% برسان.`,
        }
      : {
          en: "Keep position sizing stable and protect the behaviors that are already working.",
          fa: "حجم معاملات را ثابت نگه دار و رفتارهایی را که نتیجه داده‌اند حفظ کن.",
        },
    weakestHour
      ? {
          en: `Review trades around ${weakestHour.label}; this time block produced ${weakestHour.netPnl.toLocaleString("en-US")} net PnL.`,
          fa: `معاملات حوالی ${weakestHour.label} را بازبینی کن؛ این بازه زمانی ${weakestHour.netPnl.toLocaleString("en-US")} سود/زیان خالص ساخته است.`,
        }
      : {
          en: "Tag sessions and trading hours consistently for sharper timing analysis.",
          fa: "سشن‌ها و ساعت معاملات را منظم تگ کن تا تحلیل زمانی دقیق‌تر شود.",
        },
    latestPlan
      ? {
          en: compactText(latestPlan.improvementPlan || latestPlan.tomorrowPlan, "Write one clear improvement rule for the next session."),
          fa: compactText(latestPlan.improvementPlan || latestPlan.tomorrowPlan, "برای جلسه بعدی یک قانون بهبود واضح بنویس."),
        }
      : {
          en: "Add an end-of-day improvement note so the next report can include a concrete execution plan.",
          fa: "آخر روز یک یادداشت بهبود ثبت کن تا گزارش بعدی برنامه اجرایی مشخص‌تری داشته باشد.",
        },
  ];

  return { strengths, risks, actionPlan };
}

function serializeDailyNote(note: {
  id: string;
  date: Date;
  mood: string | null;
  focusLevel: number | null;
  disciplineScore: number | null;
  whatWentWell: string | null;
  mistakesSummary: string | null;
  improvementPlan: string | null;
  tomorrowPlan: string | null;
  endOfDayNotes: string | null;
}): JournalReportDailyNote {
  return {
    ...note,
    date: note.date.toISOString(),
  };
}

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function journalReportToCsv(report: JournalReport, language: "en" | "fa" = "en") {
  const headers =
    language === "fa"
      ? [
          "زمان ورود",
          "زمان خروج",
          "حساب",
          "نماد",
          "جهت",
          "وضعیت",
          "سود/زیان",
          "RR",
          "ستاپ",
          "سشن",
          "احساس",
          "اشتباه",
          "تگ‌ها",
          "استراتژی",
          "پایبندی به پلن",
          "درصد پایبندی",
          "درصد چک‌لیست",
          "امتیاز",
          "دلیل خروج",
        ]
      : [
          "Opened At",
          "Closed At",
          "Account",
          "Symbol",
          "Direction",
          "Status",
          "PnL",
          "RR",
          "Setup",
          "Session",
          "Emotion",
          "Mistake",
          "Tags",
          "Strategy",
          "Followed Plan",
          "Compliance %",
          "Checklist %",
          "Rating",
          "Exit Reason",
        ];
  const rows = report.recentTrades.map((trade) => [
    trade.openedAt,
    trade.closedAt,
    trade.accountName,
    trade.symbol,
    trade.direction,
    trade.status,
    trade.pnl,
    trade.rr,
    trade.setup,
    trade.session,
    trade.emotion,
    trade.mistake,
    trade.tags.join("; "),
    trade.strategyName,
    trade.followedPlan,
    trade.compliancePercent,
    trade.checklistCompletion,
    trade.rating,
    trade.exitReason,
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
}

export async function buildJournalReport(
  userId: string,
  params: ReportSearchParams = {}
): Promise<JournalReport> {
  const { filters, dateFrom, dateTo, errors } = normalizeJournalReportFilters(params);

  if (errors.length > 0) {
    throw new ReportValidationError(errors);
  }

  const where = buildTradeWhere(userId, filters, dateFrom, dateTo);
  const dailyWhere: Prisma.DailyJournalWhereInput = {
    userId,
    ...(dateFrom || dateTo
      ? {
          date: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : {}),
  };
  const [trades, analyticsTrades, metadataTrades, accounts, dailyNotes] =
    await Promise.all([
      prisma.trade.findMany({
        where,
        include: reportTradeInclude,
        orderBy: [{ openedAt: "desc" }, { createdAt: "desc" }],
      }),
      prisma.trade.findMany({
        where,
        include: analyticsTradeInclude,
        orderBy: [{ closedAt: "asc" }, { openedAt: "asc" }, { createdAt: "asc" }],
      }),
      prisma.trade.findMany({
        where: { userId },
        include: analyticsTradeInclude,
        orderBy: [{ symbol: "asc" }, { openedAt: "asc" }],
      }),
      prisma.tradingAccount.findMany({
        where: { userId },
        select: { id: true, name: true, broker: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.dailyJournal.findMany({
        where: dailyWhere,
        select: {
          id: true,
          date: true,
          mood: true,
          focusLevel: true,
          disciplineScore: true,
          whatWentWell: true,
          mistakesSummary: true,
          improvementPlan: true,
          tomorrowPlan: true,
          endOfDayNotes: true,
        },
        orderBy: { date: "desc" },
        take: 14,
      }),
    ]);
  const serializedTrades = trades.map(serializeTrade);
  const metadata = buildAnalyticsMetadata(metadataTrades);
  const analytics = buildTradeAnalytics(analyticsTrades, metadata);
  const summary = summarizeTrades(serializedTrades);
  const serializedDailyNotes = dailyNotes.map(serializeDailyNote);

  return {
    success: true,
    generatedAt: new Date().toISOString(),
    filters,
    filterOptions: {
      accounts,
      symbols: metadata.symbols,
      strategies: metadata.strategies,
    },
    summary,
    analytics,
    recentTrades: serializedTrades,
    dailyNotes: serializedDailyNotes,
    insights: buildInsights(summary, analytics, serializedTrades, serializedDailyNotes),
  };
}
