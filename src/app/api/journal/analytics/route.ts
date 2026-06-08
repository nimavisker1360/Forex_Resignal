import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type TradeWithRelations = Prisma.TradeGetPayload<{
  include: {
    account: true;
    tags: {
      include: {
        tag: true;
      };
    };
  };
}>;

function toNumber(value: unknown) {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDateParam(value: string | null, endOfDay = false) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date.setUTCHours(23, 59, 59, 999);
  }

  return date;
}

function buildAnalyticsWhere(searchParams: URLSearchParams) {
  const where: Prisma.TradeWhereInput = {};
  const errors: string[] = [];
  const accountId = searchParams.get("accountId")?.trim();
  const symbol = searchParams.get("symbol")?.trim();
  const strategy = searchParams.get("strategy")?.trim();
  const tag = searchParams.get("tag")?.trim();
  const dateFrom = parseDateParam(searchParams.get("dateFrom"));
  const dateTo = parseDateParam(searchParams.get("dateTo"), true);

  if (dateFrom === null) {
    errors.push("dateFrom must be a valid date");
  }

  if (dateTo === null) {
    errors.push("dateTo must be a valid date");
  }

  if (accountId) {
    where.accountId = accountId;
  }

  if (symbol) {
    where.symbol = { contains: symbol, mode: "insensitive" };
  }

  if (strategy) {
    where.OR = [
      { session: { contains: strategy, mode: "insensitive" } },
      { setup: { contains: strategy, mode: "insensitive" } },
    ];
  }

  if (tag) {
    where.tags = {
      some: {
        tag: {
          name: { contains: tag, mode: "insensitive" },
        },
      },
    };
  }

  if (dateFrom || dateTo) {
    where.openedAt = {
      ...(dateFrom ? { gte: dateFrom } : {}),
      ...(dateTo ? { lte: dateTo } : {}),
    };
  }

  return { where, errors };
}

function emptySummary() {
  return {
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0,
    averagePnL: 0,
    averageWin: 0,
    averageLoss: 0,
    profitFactor: 0,
    bestTrade: 0,
    worstTrade: 0,
    maxWinStreak: 0,
    maxLossStreak: 0,
    averageRR: 0,
    totalVolume: 0,
  };
}

function pushMetric(
  map: Map<string, { label: string; pnl: number; trades: number; wins: number; losses: number }>,
  key: string,
  pnl: number,
  isWin: boolean,
  isLoss: boolean
) {
  const metric = map.get(key) || {
    label: key,
    pnl: 0,
    trades: 0,
    wins: 0,
    losses: 0,
  };

  metric.pnl += pnl;
  metric.trades += 1;

  if (isWin) {
    metric.wins += 1;
  }

  if (isLoss) {
    metric.losses += 1;
  }

  map.set(key, metric);
}

function maxStreaks(trades: TradeWithRelations[]) {
  let currentWin = 0;
  let currentLoss = 0;
  let maxWin = 0;
  let maxLoss = 0;

  for (const trade of trades) {
    const pnl = toNumber(trade.profitLoss);

    if (pnl > 0) {
      currentWin += 1;
      currentLoss = 0;
    } else if (pnl < 0) {
      currentLoss += 1;
      currentWin = 0;
    } else {
      currentWin = 0;
      currentLoss = 0;
    }

    maxWin = Math.max(maxWin, currentWin);
    maxLoss = Math.max(maxLoss, currentLoss);
  }

  return { maxWinStreak: maxWin, maxLossStreak: maxLoss };
}

function metricArray(
  map: Map<string, { label: string; pnl: number; trades: number; wins: number; losses: number }>,
  labelName: string
) {
  return Array.from(map.values())
    .map((metric) => ({
      [labelName]: metric.label,
      pnl: round(metric.pnl),
      totalTrades: metric.trades,
      winningTrades: metric.wins,
      losingTrades: metric.losses,
      winRate: metric.trades > 0 ? round((metric.wins / metric.trades) * 100, 1) : 0,
    }))
    .sort((a, b) => Number(b.pnl) - Number(a.pnl));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { where, errors } = buildAnalyticsWhere(searchParams);

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const trades = await prisma.trade.findMany({
      where,
      include: {
        account: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: [{ openedAt: "asc" }, { createdAt: "asc" }],
    });

    if (trades.length === 0) {
      return NextResponse.json({
        success: true,
        summary: emptySummary(),
        charts: {
          pnlByDay: [],
          pnlBySymbol: [],
          winRateBySymbol: [],
          pnlByStrategy: [],
          pnlByDirection: [],
          pnlByAccount: [],
          pnlByTag: [],
          emotionPerformance: [],
        },
      });
    }

    const closedTrades = trades.filter((trade) => trade.status === "CLOSED");
    const wins = closedTrades.filter((trade) => toNumber(trade.profitLoss) > 0);
    const losses = closedTrades.filter((trade) => toNumber(trade.profitLoss) < 0);
    const totalPnL = trades.reduce(
      (total, trade) => total + toNumber(trade.profitLoss),
      0
    );
    const grossProfit = wins.reduce(
      (total, trade) => total + toNumber(trade.profitLoss),
      0
    );
    const grossLoss = losses.reduce(
      (total, trade) => total + Math.abs(toNumber(trade.profitLoss)),
      0
    );
    const rrTrades = closedTrades.filter((trade) => trade.rr !== null);
    const streaks = maxStreaks(closedTrades);
    const pnlValues = trades.map((trade) => toNumber(trade.profitLoss));
    const totalVolume = trades.reduce(
      (total, trade) => total + toNumber(trade.lotSize),
      0
    );
    const dayMap = new Map<
      string,
      { label: string; pnl: number; trades: number; wins: number; losses: number }
    >();
    const symbolMap = new Map<
      string,
      { label: string; pnl: number; trades: number; wins: number; losses: number }
    >();
    const strategyMap = new Map<
      string,
      { label: string; pnl: number; trades: number; wins: number; losses: number }
    >();
    const directionMap = new Map<
      string,
      { label: string; pnl: number; trades: number; wins: number; losses: number }
    >();
    const accountMap = new Map<
      string,
      { label: string; pnl: number; trades: number; wins: number; losses: number }
    >();
    const tagMap = new Map<
      string,
      { label: string; pnl: number; trades: number; wins: number; losses: number }
    >();
    const emotionMap = new Map<
      string,
      { label: string; pnl: number; trades: number; wins: number; losses: number }
    >();

    for (const trade of trades) {
      const pnl = toNumber(trade.profitLoss);
      const isWin = trade.status === "CLOSED" && pnl > 0;
      const isLoss = trade.status === "CLOSED" && pnl < 0;
      const tradeDate = trade.openedAt ? dateKey(trade.openedAt) : "Unscheduled";
      const strategy = trade.session || trade.setup || "Unspecified";
      const accountName = trade.account?.name || trade.accountId || "Unassigned";
      const emotion = trade.emotion || "Unspecified";

      pushMetric(dayMap, tradeDate, pnl, isWin, isLoss);
      pushMetric(symbolMap, trade.symbol, pnl, isWin, isLoss);
      pushMetric(strategyMap, strategy, pnl, isWin, isLoss);
      pushMetric(directionMap, trade.direction, pnl, isWin, isLoss);
      pushMetric(accountMap, accountName, pnl, isWin, isLoss);
      pushMetric(emotionMap, emotion, pnl, isWin, isLoss);

      for (const tradeTag of trade.tags) {
        pushMetric(tagMap, tradeTag.tag.name, pnl, isWin, isLoss);
      }
    }

    const pnlByDay = metricArray(dayMap, "date").sort((a, b) =>
      String(a.date).localeCompare(String(b.date))
    );
    const pnlBySymbol = metricArray(symbolMap, "symbol");

    return NextResponse.json({
      success: true,
      summary: {
        totalTrades: trades.length,
        winRate:
          closedTrades.length > 0 ? round((wins.length / closedTrades.length) * 100, 1) : 0,
        totalPnL: round(totalPnL),
        averagePnL: trades.length > 0 ? round(totalPnL / trades.length) : 0,
        averageWin: wins.length > 0 ? round(grossProfit / wins.length) : 0,
        averageLoss:
          losses.length > 0
            ? round(
                losses.reduce((total, trade) => total + toNumber(trade.profitLoss), 0) /
                  losses.length
              )
            : 0,
        profitFactor:
          grossLoss > 0 ? round(grossProfit / grossLoss, 2) : grossProfit > 0 ? round(grossProfit, 2) : 0,
        bestTrade: pnlValues.length > 0 ? round(Math.max(...pnlValues)) : 0,
        worstTrade: pnlValues.length > 0 ? round(Math.min(...pnlValues)) : 0,
        maxWinStreak: streaks.maxWinStreak,
        maxLossStreak: streaks.maxLossStreak,
        averageRR:
          rrTrades.length > 0
            ? round(
                rrTrades.reduce((total, trade) => total + toNumber(trade.rr), 0) /
                  rrTrades.length,
                2
              )
            : 0,
        totalVolume: round(totalVolume, 2),
      },
      charts: {
        pnlByDay,
        pnlBySymbol,
        winRateBySymbol: pnlBySymbol.map((item) => ({
          symbol: item.symbol,
          totalTrades: item.totalTrades,
          winningTrades: item.winningTrades,
          losingTrades: item.losingTrades,
          winRate: item.winRate,
        })),
        pnlByStrategy: metricArray(strategyMap, "strategy"),
        pnlByDirection: metricArray(directionMap, "direction"),
        pnlByAccount: metricArray(accountMap, "account"),
        pnlByTag: metricArray(tagMap, "tag"),
        emotionPerformance: metricArray(emotionMap, "emotion"),
      },
    });
  } catch (error) {
    console.error("Journal analytics GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load journal analytics" },
      { status: 500 }
    );
  }
}
