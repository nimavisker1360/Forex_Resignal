import { headers } from "next/headers";
import type { JournalEvent, JournalTrade, Psychology } from "@/lib/journal/types";

export type JournalTradeDto = Omit<
  JournalTrade,
  "_id" | "openTime" | "closeTime" | "createdAt" | "updatedAt" | "events" | "psychology"
> & {
  _id: string;
  openTime: string | null;
  closeTime: string | null;
  createdAt: string;
  updatedAt: string;
  events: Array<Omit<JournalEvent, "eventTime"> & { eventTime: string }>;
  psychology: Psychology | null;
};

export type JournalTradesResponse = {
  success: boolean;
  trades: JournalTradeDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type JournalTradeResponse = {
  success: boolean;
  trade?: JournalTradeDto;
  message?: string;
};

export type JournalStatsResponse = {
  success: boolean;
  stats: {
    totalTrades: number;
    closedTrades: number;
    openTrades: number;
    winRate: number;
    totalProfit: number;
    profitFactor: number | null;
    averageRR: number | null;
    expectancy: number | null;
    bestSymbol: string | null;
    worstSymbol: string | null;
  };
};

export type PrismaTradingAccountDto = {
  id: string;
  userId: string;
  name: string;
  broker: string | null;
  platform: string | null;
  currency: string;
  balance: string | number | null;
  createdAt: string;
  updatedAt: string;
};

export type PrismaTradeScreenshotDto = {
  id: string;
  tradeId: string;
  userId: string;
  type: string;
  url: string;
  createdAt: string;
};

export type PrismaTradingAccountsResponse = {
  success: boolean;
  data?: PrismaTradingAccountDto[];
  accounts?: PrismaTradingAccountDto[];
  message?: string;
};

export type PrismaTagDto = {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  createdAt: string;
};

export type PrismaTradeTagDto = {
  tradeId: string;
  tagId: string;
  tag: PrismaTagDto;
};

export type PrismaTradeDto = {
  id: string;
  userId: string;
  accountId: string;
  symbol: string;
  direction: "BUY" | "SELL";
  status: "OPEN" | "CLOSED" | "CANCELLED";
  entryPrice: string | number | null;
  exitPrice: string | number | null;
  stopLoss: string | number | null;
  takeProfit: string | number | null;
  lotSize: string | number | null;
  riskAmount: string | number | null;
  profitLoss: string | number | null;
  rr: string | number | null;
  setup: string | null;
  session: string | null;
  emotion: string | null;
  mistake: string | null;
  notes: string | null;
  openedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  account?: PrismaTradingAccountDto | null;
  tradingAccount?: PrismaTradingAccountDto | null;
  screenshots?: PrismaTradeScreenshotDto[];
  tags?: PrismaTradeTagDto[];
  side?: "BUY" | "SELL";
  strategy?: string | null;
  entryTime?: string | null;
  exitTime?: string | null;
  mistakes?: string | null;
};

export type PrismaTradesResponse = {
  success: boolean;
  data?: {
    trades: PrismaTradeDto[];
    pagination?: JournalTradesResponse["pagination"];
  };
  trades?: PrismaTradeDto[];
  pagination?: JournalTradesResponse["pagination"] & {
    hasMore?: boolean;
  };
};

export type PrismaTradeResponse = {
  success: boolean;
  data?: PrismaTradeDto;
  trade?: PrismaTradeDto;
  message?: string;
};

export type JournalSummaryResponse = {
  success: boolean;
  summary: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    breakEvenTrades: number;
    winRate: number;
    totalPnL: number;
    averageWin: number;
    averageLoss: number;
    profitFactor: number | null;
    bestTrade: PrismaTradeDto | null;
    worstTrade: PrismaTradeDto | null;
    openTrades: number;
    closedTrades: number;
  };
};

async function getBaseUrl() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") || "http";

  if (host) {
    return `${proto}://${host}`;
  }

  return process.env.JOURNAL_API_BASE_URL || "http://localhost:3000";
}

export async function fetchJournalApi<T>(path: string): Promise<T> {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Journal API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function inferResult(status: PrismaTradeDto["status"], profitLoss: number | null) {
  if (status === "OPEN") {
    return "open";
  }

  if (profitLoss === null || profitLoss === 0) {
    return "breakeven";
  }

  return profitLoss > 0 ? "win" : "loss";
}

function screenshotUrl(trade: PrismaTradeDto, type: string) {
  return (
    trade.screenshots?.find(
      (screenshot) => screenshot.type.toLowerCase() === type
    )?.url || null
  );
}

export function mapPrismaTradeToJournalTrade(trade: PrismaTradeDto): JournalTradeDto {
  const profitLoss = toNumber(trade.profitLoss);
  const account = trade.account || trade.tradingAccount;
  const entryScreenshotUrl = screenshotUrl(trade, "entry");
  const exitScreenshotUrl = screenshotUrl(trade, "exit");
  const psychology: Psychology | null =
    trade.emotion || trade.mistake || trade.notes
      ? {
          confidenceScore: null,
          emotionBefore: trade.emotion,
          emotionAfter: null,
          followedPlan: null,
          mistakeTag: trade.mistake,
          entryReason: trade.setup,
          personalNote: trade.notes,
          lessonLearned: null,
        }
      : null;

  return {
    _id: trade.id,
    userId: trade.userId,
    licenseKeyHash: null,
    accountNumber: account?.name || trade.accountId,
    broker: account?.broker || "-",
    serverName: account?.platform || "-",
    symbol: trade.symbol,
    ticket: null,
    positionId: null,
    orderTicket: null,
    dealTicketOpen: null,
    dealTicketClose: null,
    tradeType: trade.direction.toLowerCase() as JournalTradeDto["tradeType"],
    lotSize: toNumber(trade.lotSize),
    entryPrice: toNumber(trade.entryPrice),
    closePrice: toNumber(trade.exitPrice),
    stopLoss: toNumber(trade.stopLoss),
    takeProfit: toNumber(trade.takeProfit),
    riskAmount: toNumber(trade.riskAmount),
    targetRR: null,
    actualRR: toNumber(trade.rr),
    profit: profitLoss,
    profitPercent: null,
    commission: null,
    swap: null,
    magicNumber: null,
    comment: trade.notes,
    sourceType: "manual",
    entrySource: "manual_trade",
    timeframe: null,
    spread: null,
    atr: null,
    rsi: null,
    session: trade.strategy || trade.session,
    openTime: trade.entryTime || trade.openedAt,
    closeTime: trade.exitTime || trade.closedAt,
    durationSeconds: null,
    result: inferResult(trade.status, profitLoss),
    status:
      trade.status === "CLOSED"
        ? "closed"
        : trade.status === "OPEN"
          ? "open"
          : "closed",
    entryScreenshotUrl,
    exitScreenshotUrl,
    entryScreenshotStatus: entryScreenshotUrl ? "uploaded" : "pending",
    exitScreenshotStatus: exitScreenshotUrl ? "uploaded" : "pending",
    psychology,
    tags: trade.tags?.map((item) => item.tag.name) || [],
    events: [],
    createdAt: trade.createdAt,
    updatedAt: trade.updatedAt,
  };
}
