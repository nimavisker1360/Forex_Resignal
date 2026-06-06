import { Prisma, TradeStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  apiResponse,
  calculateTradeMetrics,
  decimalValue,
  normalizeTagIds,
  parseDate,
  parsePositiveInt,
  parseTradeDirection,
  parseTradeStatus,
} from "@/lib/journal/api-utils";

export const dynamic = "force-dynamic";

const tradeInclude = {
  account: true,
  screenshots: true,
  voiceMemos: true,
  tags: {
    include: {
      tag: true,
    },
  },
};

function buildTradeCreateData(body: Record<string, unknown>) {
  const direction = parseTradeDirection(body.direction);
  const status = body.status ? parseTradeStatus(body.status) : TradeStatus.OPEN;
  const openedAt = parseDate(body.openedAt);
  const closedAt = parseDate(body.closedAt);

  if (!direction) {
    return { error: "Invalid trade direction" };
  }

  if (!status) {
    return { error: "Invalid trade status" };
  }

  if (openedAt === null || closedAt === null) {
    return { error: "Invalid trade date" };
  }

  const metrics = calculateTradeMetrics({
    ...body,
    direction,
    status,
  });

  return {
    data: {
      userId: String(body.userId),
      accountId: String(body.accountId),
      symbol: String(body.symbol).trim().toUpperCase(),
      direction,
      status,
      entryPrice: decimalValue(body.entryPrice),
      exitPrice: decimalValue(body.exitPrice),
      stopLoss: decimalValue(body.stopLoss),
      takeProfit: decimalValue(body.takeProfit),
      lotSize: decimalValue(body.lotSize),
      riskAmount: decimalValue(body.riskAmount),
      profitLoss: decimalValue(body.profitLoss) ?? metrics.profitLoss,
      rr: decimalValue(body.rr) ?? metrics.rr,
      setup: body.setup ?? undefined,
      session: body.session ?? undefined,
      emotion: body.emotion ?? undefined,
      mistake: body.mistake ?? undefined,
      notes: body.notes ?? undefined,
      openedAt,
      closedAt,
    },
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const direction = searchParams.get("direction");
    const dateFrom = parseDate(searchParams.get("from") ?? searchParams.get("dateFrom"));
    const dateTo = parseDate(searchParams.get("to") ?? searchParams.get("dateTo"));
    const where: Prisma.TradeWhereInput = {};
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 50), 100);

    // TODO: Replace query-param userId with the authenticated session user id.
    const userId = searchParams.get("userId");
    if (userId) {
      where.userId = userId;
    }

    const accountId = searchParams.get("accountId");
    if (accountId) {
      where.accountId = accountId;
    }

    const symbol = searchParams.get("symbol");
    if (symbol) {
      where.symbol = { contains: symbol.trim(), mode: "insensitive" };
    }

    if (status) {
      const parsedStatus = parseTradeStatus(status);
      if (!parsedStatus) {
        return apiResponse({ success: false, message: "Invalid trade status" }, 400);
      }

      where.status = parsedStatus;
    }

    if (direction) {
      const parsedDirection = parseTradeDirection(direction);
      if (!parsedDirection) {
        return apiResponse(
          { success: false, message: "Invalid trade direction" },
          400
        );
      }

      where.direction = parsedDirection;
    }

    if (dateFrom === null || dateTo === null) {
      return apiResponse({ success: false, message: "Invalid date filter" }, 400);
    }

    if (dateFrom || dateTo) {
      where.openedAt = {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lte: dateTo } : {}),
      };
    }

    const db = prisma as any;
    const [total, trades] = await prisma.$transaction([
      prisma.trade.count({ where }),
      db.trade.findMany({
        where,
        include: tradeInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return apiResponse({
      success: true,
      data: {
        trades,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(Math.ceil(total / limit), 1),
        },
      },
    });
  } catch (error) {
    console.error("Trades GET error:", error);

    return apiResponse({ success: false, message: "Failed to load trades" }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // TODO: Replace body userId with the authenticated session user id.
    const { userId, accountId, symbol } = body;

    if (!userId || !accountId || !symbol || !body.direction) {
      return apiResponse(
        {
          success: false,
          message: "userId, accountId, symbol, and direction are required",
        },
        400
      );
    }

    const built = buildTradeCreateData(body);
    if ("error" in built) {
      return apiResponse({ success: false, message: built.error }, 400);
    }

    const tagIds = normalizeTagIds(body.tagIds);
    const trade = await prisma.$transaction(async (tx) => {
      const txDb = tx as any;
      const created = await txDb.trade.create({
        data: built.data,
      });

      if (tagIds.length > 0) {
        await txDb.tradeTag.createMany({
          data: tagIds.map((tagId) => ({ tradeId: created.id, tagId })),
          skipDuplicates: true,
        });
      }

      return txDb.trade.findUnique({
        where: { id: created.id },
        include: tradeInclude,
      });
    });

    return apiResponse({ success: true, data: trade }, 201);
  } catch (error) {
    console.error("Trades POST error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return apiResponse(
        { success: false, message: "Invalid accountId or tagId" },
        400
      );
    }

    return apiResponse({ success: false, message: "Failed to create trade" }, 500);
  }
}
