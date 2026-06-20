import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId, unauthorizedResponse } from "@/lib/server-auth";
import {
  buildManualTradeUpdateData,
  journalTradeInclude,
  lockImportedBrokerUpdate,
  serializeJournalTrade,
} from "@/lib/journal/prisma-trades";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validationResponse(errors: string[]) {
  return NextResponse.json(
    {
      success: false,
      message: "Validation failed",
      errors,
    },
    { status: 400 }
  );
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await context.params;
    const trade = await prisma.trade.findFirst({
      where: { id, userId },
      include: journalTradeInclude,
    });

    if (!trade) {
      return NextResponse.json(
        { success: false, message: "Journal trade not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      trade: serializeJournalTrade(trade),
    });
  } catch (error) {
    console.error("Journal trade GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load journal trade" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const built = buildManualTradeUpdateData(body);

    if (built.errors) {
      return validationResponse(built.errors);
    }

    const trade = await prisma.$transaction(async (tx) => {
      const existing = await tx.trade.findFirst({
        where: { id, userId },
        select: { source: true, setup: true, userId: true },
      });

      if (!existing) {
        throw new Prisma.PrismaClientKnownRequestError("Trade not found", {
          code: "P2025",
          clientVersion: Prisma.prismaVersion.client,
        });
      }

      if (built.data.accountId) {
        const account = await tx.tradingAccount.findFirst({
          where: { id: String(built.data.accountId), userId },
          select: { id: true },
        });

        if (!account) {
          throw new Prisma.PrismaClientKnownRequestError("Invalid accountId", {
            code: "P2003",
            clientVersion: Prisma.prismaVersion.client,
          });
        }
      }

      return tx.trade.update({
        where: { id },
        data: lockImportedBrokerUpdate(existing, built.data),
        include: journalTradeInclude,
      });
    });

    return NextResponse.json({
      success: true,
      trade: serializeJournalTrade(trade),
    });
  } catch (error) {
    console.error("Journal trade PATCH error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, message: "Journal trade not found" },
        { status: 404 }
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return validationResponse(["accountId does not match an existing trading account"]);
    }

    return NextResponse.json(
      { success: false, message: "Failed to update journal trade" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await context.params;

    await prisma.trade.delete({
      where: { id, userId },
    });

    return NextResponse.json({
      success: true,
      message: "Trade deleted",
    });
  } catch (error) {
    console.error("Journal trade DELETE error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, message: "Journal trade not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to delete journal trade" },
      { status: 500 }
    );
  }
}
