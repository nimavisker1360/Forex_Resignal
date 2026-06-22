export const DEFAULT_DASHBOARD_USER_ID = "demo-user";

export type ApiResult<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export type TradingAccountDto = {
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

export type TagDto = {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  createdAt: string;
};

export type TradeTagDto = {
  tradeId: string;
  tagId: string;
  tag: TagDto;
};

export type TradeScreenshotDto = {
  id: string;
  tradeId: string;
  userId: string;
  type: string;
  url: string;
  createdAt: string;
};

export type TradeDto = {
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
  commission: string | number | null;
  swap: string | number | null;
  rr: string | number | null;
  source: string;
  mt5Ticket: string | null;
  setup: string | null;
  session: string | null;
  emotion: string | null;
  mistake: string | null;
  notes: string | null;
  openedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  account?: TradingAccountDto | null;
  screenshots?: TradeScreenshotDto[];
  tags?: TradeTagDto[];
  strategyReview?: {
    id: string;
    strategyId: string | null;
    strategyNameSnapshot: string | null;
    followedPlan: "YES" | "PARTIAL" | "NO" | "NOT_REVIEWED";
    totalRules: number;
    followedRules: number;
    violatedRules: number;
    compliancePercent: number;
    requiredCompliancePercent: number;
  } | null;
};

export type TradesListData = {
  trades: TradeDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type DashboardOverviewStats = {
  totalTrades: number;
  totalPnl: number;
  winRate: number;
  openTrades: number;
};

export type DashboardOverviewData = {
  accounts: TradingAccountDto[];
  trades: TradeDto[];
  stats: DashboardOverviewStats;
};

export function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatMoney(
  value: string | number | null | undefined,
  currency = "USD"
) {
  const parsed = toNumber(value);

  if (parsed === null) {
    return "-";
  }

  return parsed.toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });
}

export function formatNumber(value: string | number | null | undefined, digits = 2) {
  const parsed = toNumber(value);

  if (parsed === null) {
    return "-";
  }

  return parsed.toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}
