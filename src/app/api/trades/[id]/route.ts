import { Prisma } from "@prisma/client";
import { deleteUserTrade } from "@/lib/journal/delete-trades";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId, unauthorizedResponse } from "@/lib/server-auth";
import {
  apiResponse,
  calculateTradeMetrics,
  decimalValue,
  normalizeTagIds,
  parseNullableDate,
  parseTradeDirection,
  parseTradeStatus,
} from "@/lib/journal/api-utils";
import {
  isImportedTradeSource,
  stripBrokerDataFields,
} from "@/lib/journal/trade-source";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function GET(_request: Request, context: RouteContext) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await context.params;
    const db = prisma as any;
    const trade = await db.trade.findFirst({
      where: { id, userId },
      include: tradeInclude,
    });

    if (!trade) {
      return apiResponse({ success: false, message: "Trade not found" }, 404);
    }

    return apiResponse({ success: true, data: trade });
  } catch (error) {
    console.error("Trade GET error:", error);

    return apiResponse({ success: false, message: "Failed to load trade" }, 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await context.params;
    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.accountId !== undefined) {
      data.accountId = String(body.accountId || "").trim();
    }

    if (body.mt5Ticket !== undefined) {
      const mt5Ticket = String(body.mt5Ticket || "").trim();
      data.mt5Ticket = mt5Ticket || null;
    }

    if (body.status !== undefined) {
      const status = parseTradeStatus(body.status);
      if (!status) {
        return apiResponse({ success: false, message: "Invalid trade status" }, 400);
      }

      data.status = status;
    }

    if (body.direction !== undefined) {
      const direction = parseTradeDirection(body.direction);
      if (!direction) {
        return apiResponse(
          { success: false, message: "Invalid trade direction" },
          400
        );
      }

      data.direction = direction;
    }

    const openedAt = parseNullableDate(body.openedAt);
    const closedAt = parseNullableDate(body.closedAt);

    if (openedAt === false || closedAt === false) {
      return apiResponse({ success: false, message: "Invalid trade date" }, 400);
    }

    if (openedAt !== undefined) {
      data.openedAt = openedAt;
    }

    if (closedAt !== undefined) {
      data.closedAt = closedAt;
    }

    for (const field of ["symbol", "setup", "session", "emotion", "mistake", "notes"] as const) {
      if (body[field] !== undefined) {
        data[field] =
          field === "symbol" && body[field]
            ? String(body[field]).trim().toUpperCase()
            : body[field];
      }
    }

    for (const field of [
      "entryPrice",
      "exitPrice",
      "stopLoss",
      "takeProfit",
      "lotSize",
      "riskAmount",
      "profitLoss",
      "commission",
      "swap",
      "rr",
    ] as const) {
      if (body[field] !== undefined) {
        data[field] = decimalValue(body[field]) ?? null;
      }
    }

    const trade = await prisma.$transaction(async (tx) => {
      const txDb = tx as any;
      const existing = await txDb.trade.findUnique({ where: { id } });

      if (!existing || existing.userId !== userId) {
        throw new Prisma.PrismaClientKnownRequestError("Trade not found", {
          code: "P2025",
          clientVersion: Prisma.prismaVersion.client,
        });
      }

      const brokerDataLocked = isImportedTradeSource(existing.source, existing.setup);
      const updateData = brokerDataLocked ? stripBrokerDataFields(data) : data;

      if (!brokerDataLocked) {
        const merged = { ...existing, ...updateData };
        const metrics = calculateTradeMetrics({
          status: merged.status,
          direction: merged.direction,
          entryPrice: merged.entryPrice,
          exitPrice: merged.exitPrice,
          stopLoss: merged.stopLoss,
          lotSize: merged.lotSize,
          profitLoss: body.profitLoss,
          rr: body.rr,
        });

        if (metrics.profitLoss !== undefined && body.profitLoss === undefined) {
          updateData.profitLoss = metrics.profitLoss;
        }

        if (metrics.rr !== undefined && body.rr === undefined) {
          updateData.rr = metrics.rr;
        }
      }

      const updated = await txDb.trade.update({
        where: { id },
        data: updateData,
      });

      if (Array.isArray(body.tagIds)) {
        const tagIds = normalizeTagIds(body.tagIds);
        if (tagIds.length > 0) {
          const ownedTagCount = await txDb.tag.count({
            where: { userId, id: { in: tagIds } },
          });

          if (ownedTagCount !== tagIds.length) {
            throw new Prisma.PrismaClientKnownRequestError("Invalid tagId", {
              code: "P2003",
              clientVersion: Prisma.prismaVersion.client,
            });
          }
        }

        await txDb.tradeTag.deleteMany({ where: { tradeId: id } });

        if (tagIds.length > 0) {
          await txDb.tradeTag.createMany({
            data: tagIds.map((tagId) => ({ tradeId: id, tagId })),
            skipDuplicates: true,
          });
        }
      }

      return txDb.trade.findUnique({
        where: { id: updated.id },
        include: tradeInclude,
      });
    });

    return apiResponse({ success: true, data: trade });
  } catch (error) {
    console.error("Trade PATCH error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return apiResponse({ success: false, message: "Trade not found" }, 404);
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return apiResponse({ success: false, message: "Invalid tagId" }, 400);
    }

    return apiResponse({ success: false, message: "Failed to update trade" }, 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await context.params;

    const result = await deleteUserTrade(userId, id);

    if (result.deletedTrades === 0) {
      return apiResponse({ success: false, message: "Trade not found" }, 404);
    }

    return apiResponse({ success: true });
  } catch (error) {
    console.error("Trade DELETE error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return apiResponse({ success: false, message: "Trade not found" }, 404);
    }

    return apiResponse({ success: false, message: "Failed to delete trade" }, 500);
  }
}
