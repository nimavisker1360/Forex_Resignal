import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  DashboardOverviewData,
  TagDto,
  TradeDto,
  TradingAccountDto,
} from "@/components/dashboard/types";

const accountSelect = {
  id: true,
  userId: true,
  name: true,
  broker: true,
  platform: true,
  currency: true,
  balance: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TradingAccountSelect;

const tagSelect = {
  id: true,
  userId: true,
  name: true,
  color: true,
  createdAt: true,
} satisfies Prisma.TagSelect;

export const tradeListInclude = {
  account: {
    select: accountSelect,
  },
  tags: {
    include: {
      tag: {
        select: tagSelect,
      },
    },
  },
} satisfies Prisma.TradeInclude;

type AccountRecord = Prisma.TradingAccountGetPayload<{ select: typeof accountSelect }>;
type TagRecord = Prisma.TagGetPayload<{ select: typeof tagSelect }>;
type TradeListRecord = Prisma.TradeGetPayload<{ include: typeof tradeListInclude }>;

function serializeDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function serializeDecimal(value: unknown) {
  return value === null || value === undefined ? null : String(value);
}

export function serializeAccount(account: AccountRecord): TradingAccountDto {
  return {
    ...account,
    balance: serializeDecimal(account.balance),
    createdAt: serializeDate(account.createdAt),
    updatedAt: serializeDate(account.updatedAt),
  };
}

export function serializeTag(tag: TagRecord): TagDto {
  return {
    ...tag,
    createdAt: serializeDate(tag.createdAt),
  };
}

export function serializeTrade(trade: TradeListRecord): TradeDto {
  return {
    id: trade.id,
    userId: trade.userId,
    accountId: trade.accountId,
    symbol: trade.symbol,
    direction: trade.direction,
    status: trade.status,
    entryPrice: serializeDecimal(trade.entryPrice),
    exitPrice: serializeDecimal(trade.exitPrice),
    stopLoss: serializeDecimal(trade.stopLoss),
    takeProfit: serializeDecimal(trade.takeProfit),
    lotSize: serializeDecimal(trade.lotSize),
    riskAmount: serializeDecimal(trade.riskAmount),
    profitLoss: serializeDecimal(trade.profitLoss),
    commission: serializeDecimal(trade.commission),
    swap: serializeDecimal(trade.swap),
    rr: serializeDecimal(trade.rr),
    source: trade.source,
    mt5Ticket: trade.mt5Ticket,
    setup: trade.setup,
    session: trade.session,
    emotion: trade.emotion,
    mistake: trade.mistake,
    notes: trade.notes,
    openedAt: trade.openedAt ? serializeDate(trade.openedAt) : null,
    closedAt: trade.closedAt ? serializeDate(trade.closedAt) : null,
    createdAt: serializeDate(trade.createdAt),
    updatedAt: serializeDate(trade.updatedAt),
    account: trade.account ? serializeAccount(trade.account) : null,
    tags: trade.tags.map((item) => ({
      tradeId: item.tradeId,
      tagId: item.tagId,
      tag: serializeTag(item.tag),
    })),
  };
}

function calculateWinRate(closedTrades: number, winningTrades: number) {
  return closedTrades > 0 ? Math.round((winningTrades / closedTrades) * 100) : 0;
}

export async function getDashboardOverviewData(userId: string): Promise<DashboardOverviewData> {
  const [
    accounts,
    totalTrades,
    totalPnl,
    openTrades,
    closedTrades,
    winningTrades,
    trades,
  ] = await prisma.$transaction([
    prisma.tradingAccount.findMany({
      where: { userId },
      select: accountSelect,
      orderBy: { createdAt: "desc" },
    }),
    prisma.trade.count({
      where: { userId },
    }),
    prisma.trade.aggregate({
      where: { userId },
      _sum: { profitLoss: true },
    }),
    prisma.trade.count({
      where: { userId, status: "OPEN" },
    }),
    prisma.trade.count({
      where: { userId, status: "CLOSED" },
    }),
    prisma.trade.count({
      where: {
        userId,
        status: "CLOSED",
        profitLoss: { gt: 0 },
      },
    }),
    prisma.trade.findMany({
      where: { userId },
      include: tradeListInclude,
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return {
    accounts: accounts.map(serializeAccount),
    trades: trades.map(serializeTrade),
    stats: {
      totalTrades,
      totalPnl: Number(totalPnl._sum.profitLoss ?? 0),
      winRate: calculateWinRate(closedTrades, winningTrades),
      openTrades,
    },
  };
}

export async function getAccountsPageData(userId: string) {
  const accounts = await prisma.tradingAccount.findMany({
    where: { userId },
    select: accountSelect,
    orderBy: { createdAt: "desc" },
  });

  return accounts.map(serializeAccount);
}

export async function getTradesPageData(userId: string) {
  const [accounts, tags, trades] = await prisma.$transaction([
    prisma.tradingAccount.findMany({
      where: { userId },
      select: accountSelect,
      orderBy: { createdAt: "desc" },
    }),
    prisma.tag.findMany({
      where: { userId },
      select: tagSelect,
      orderBy: { name: "asc" },
    }),
    prisma.trade.findMany({
      where: { userId },
      include: tradeListInclude,
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return {
    accounts: accounts.map(serializeAccount),
    tags: tags.map(serializeTag),
    trades: trades.map(serializeTrade),
  };
}
