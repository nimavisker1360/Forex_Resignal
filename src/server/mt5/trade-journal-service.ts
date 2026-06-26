import { TradeDirection, TradeStatus, type Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { attachPendingMt5Screenshots } from "@/server/mt5/pending-screenshots";
import type { Mt5JournalPayload } from "@/server/mt5/schemas";
import type { VerifiedJournalAccount } from "@/server/mt5/verify-journal-secret";

export class Mt5TradeJournalError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "Mt5TradeJournalError";
    this.status = status;
  }
}

const QUICK_CONNECT_ACCOUNT_NAME = "MT5 Auto Connect";

function decimal(value: number | undefined, fallback?: number) {
  if (value === undefined) {
    return fallback === undefined ? undefined : String(fallback);
  }

  return String(value);
}

function dateValue(value: string | undefined, fallback?: Date) {
  return value ? new Date(value) : fallback;
}

function toDirection(value: Mt5JournalPayload["side"]) {
  return value === "SELL" ? TradeDirection.SELL : TradeDirection.BUY;
}

function calculateRr(input: {
  direction: TradeDirection;
  entryPrice?: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
}) {
  const entry = input.entryPrice;
  const stop = input.stopLoss;
  const rewardTarget = input.exitPrice ?? input.takeProfit;

  if (entry === undefined || stop === undefined || rewardTarget === undefined) {
    return "0";
  }

  const risk =
    input.direction === TradeDirection.BUY ? entry - stop : stop - entry;
  const reward =
    input.direction === TradeDirection.BUY
      ? rewardTarget - entry
      : entry - rewardTarget;

  if (risk <= 0) {
    return "0";
  }

  return String(Number((reward / risk).toFixed(2)));
}

function defined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined)
  ) as T;
}

function buildAccountActivityData(
  account: VerifiedJournalAccount,
  payload: Mt5JournalPayload,
  shouldBindAccountNumber: boolean
) {
  const data: Prisma.TradingAccountUpdateInput = {
    lastConnectedAt: new Date(),
    lastSyncAt: new Date(),
  };

  if (shouldBindAccountNumber || !account.mt5AccountNumber) {
    data.mt5AccountNumber = payload.accountNumber;
  }

  if (account.name === QUICK_CONNECT_ACCOUNT_NAME && payload.accountNumber) {
    data.name = payload.accountNumber;
  }

  if (!account.broker && payload.broker) {
    data.broker = payload.broker;
  }

  if (!account.platform && payload.platform) {
    data.platform = payload.platform;
  }

  return data;
}

function buildOpenTradeData(
  account: VerifiedJournalAccount,
  payload: Mt5JournalPayload
) {
  const direction = toDirection(payload.side);

  return defined({
    userId: account.userId,
    accountId: account.id,
    mt5Ticket: payload.ticket,
    symbol: payload.symbol || "UNKNOWN",
    direction,
    status: TradeStatus.OPEN,
    entryPrice: decimal(payload.entryPrice, 0),
    exitPrice: decimal(payload.exitPrice, 0),
    stopLoss: decimal(payload.stopLoss, 0),
    takeProfit: decimal(payload.takeProfit, 0),
    lotSize: decimal(payload.lot, 0),
    profitLoss: decimal(0),
    commission: decimal(payload.commission, 0),
    swap: decimal(payload.swap, 0),
    rr: calculateRr({
      direction,
      entryPrice: payload.entryPrice,
      stopLoss: payload.stopLoss,
      takeProfit: payload.takeProfit,
    }),
    setup: "MT5 Import",
    session: payload.sessionTime,
    emotion: payload.mood,
    notes: "Imported from MT5 EA",
    openedAt: dateValue(payload.openedAt, new Date()),
    source: "MT5",
  }) satisfies Prisma.TradeUncheckedCreateInput;
}

function buildUpdateTradeData(payload: Mt5JournalPayload) {
  const data: Prisma.TradeUncheckedUpdateInput = {};

  if (payload.symbol) {
    data.symbol = payload.symbol;
  }

  if (payload.side) {
    data.direction = toDirection(payload.side);
  }

  if (payload.entryPrice !== undefined) {
    data.entryPrice = decimal(payload.entryPrice);
  }

  if (payload.exitPrice !== undefined) {
    data.exitPrice = decimal(payload.exitPrice);
  }

  if (payload.stopLoss !== undefined) {
    data.stopLoss = decimal(payload.stopLoss);
  }

  if (payload.takeProfit !== undefined) {
    data.takeProfit = decimal(payload.takeProfit);
  }

  if (payload.lot !== undefined) {
    data.lotSize = decimal(payload.lot);
  }

  if (payload.profitLoss !== undefined) {
    data.profitLoss = decimal(payload.profitLoss);
  }

  if (payload.commission !== undefined) {
    data.commission = decimal(payload.commission);
  }

  if (payload.swap !== undefined) {
    data.swap = decimal(payload.swap);
  }

  if (payload.sessionTime) {
    data.session = payload.sessionTime;
  }

  if (payload.mood) {
    data.emotion = payload.mood;
  }

  if (payload.openedAt) {
    data.openedAt = dateValue(payload.openedAt);
  }

  data.source = "MT5";

  return data;
}

function buildCloseCreateData(
  account: VerifiedJournalAccount,
  payload: Mt5JournalPayload
) {
  if (!payload.symbol || !payload.side) {
    throw new Mt5TradeJournalError("Trade not found", 404);
  }

  const direction = toDirection(payload.side);
  const entryPrice = payload.entryPrice ?? payload.exitPrice ?? 0;

  return defined({
    userId: account.userId,
    accountId: account.id,
    mt5Ticket: payload.ticket,
    symbol: payload.symbol,
    direction,
    status: TradeStatus.CLOSED,
    entryPrice: decimal(entryPrice, 0),
    exitPrice: decimal(payload.exitPrice, 0),
    stopLoss: decimal(payload.stopLoss, 0),
    takeProfit: decimal(payload.takeProfit, 0),
    lotSize: decimal(payload.lot, 0),
    profitLoss: decimal(payload.profitLoss, 0),
    commission: decimal(payload.commission, 0),
    swap: decimal(payload.swap, 0),
    rr: calculateRr({
      direction,
      entryPrice,
      exitPrice: payload.exitPrice,
      stopLoss: payload.stopLoss,
    }),
    setup: "MT5 Import",
    session: payload.sessionTime,
    emotion: payload.mood,
    notes: "Imported from MT5 EA",
    openedAt: dateValue(payload.openedAt),
    closedAt: dateValue(payload.closedAt, new Date()),
    source: "MT5",
  }) satisfies Prisma.TradeUncheckedCreateInput;
}

export async function saveMt5JournalTrade(input: {
  account: VerifiedJournalAccount;
  payload: Mt5JournalPayload;
  shouldBindAccountNumber: boolean;
}) {
  const { account, payload, shouldBindAccountNumber } = input;

  return prisma.$transaction(async (tx) => {
    const existingTrade = await tx.trade.findFirst({
      where: {
        accountId: account.id,
        mt5Ticket: payload.ticket,
      },
      orderBy: { createdAt: "desc" },
    });

    let trade;

    if (payload.eventType === "close") {
      if (existingTrade) {
        const direction = existingTrade.direction;
        trade = await tx.trade.update({
          where: { id: existingTrade.id },
          data: {
            status: TradeStatus.CLOSED,
            exitPrice: decimal(payload.exitPrice, 0),
            profitLoss: decimal(payload.profitLoss, 0),
            commission: decimal(payload.commission, 0),
            swap: decimal(payload.swap, 0),
            rr: calculateRr({
              direction,
              entryPrice: payload.entryPrice ?? Number(existingTrade.entryPrice ?? 0),
              exitPrice: payload.exitPrice,
              stopLoss: payload.stopLoss ?? Number(existingTrade.stopLoss ?? 0),
            }),
            closedAt: dateValue(payload.closedAt, new Date()),
            source: "MT5",
          },
        });
      } else {
        trade = await tx.trade.create({
          data: buildCloseCreateData(account, payload),
        });
      }
    } else if (existingTrade) {
      const updateData = buildUpdateTradeData(payload);

      if (payload.eventType === "open") {
        updateData.status = TradeStatus.OPEN;
      }

      trade = await tx.trade.update({
        where: { id: existingTrade.id },
        data: updateData,
      });
    } else {
      trade = await tx.trade.create({
        data: buildOpenTradeData(account, payload),
      });
    }

    await tx.tradingAccount.update({
      where: { id: account.id },
      data: buildAccountActivityData(account, payload, shouldBindAccountNumber),
    });

    await attachPendingMt5Screenshots(tx as any, {
      userId: account.userId,
      accountId: account.id,
      positionId: payload.ticket,
      tradeId: trade.id,
    });

    return trade;
  });
}
