import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { accountSelect, serializeAccount } from "@/lib/dashboard-data";
import { apiResponse, decimalValue } from "@/lib/journal/api-utils";
import { getCurrentUserId, unauthorizedResponse } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await context.params;
    const body = await request.json();

    const data: Prisma.TradingAccountUpdateInput = {};

    for (const field of ["name", "broker", "platform", "currency"] as const) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    if (body.mt5AccountNumber !== undefined) {
      const accountNumber = String(body.mt5AccountNumber || "").trim();
      data.mt5AccountNumber = accountNumber || null;
    }

    if (body.balance !== undefined) {
      data.balance = decimalValue(body.balance) ?? null;
    }

    const account = await prisma.tradingAccount.update({
      where: { id, userId },
      data,
      select: accountSelect,
    });

    return apiResponse({ success: true, data: serializeAccount(account) });
  } catch (error) {
    console.error("Trading account PATCH error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return apiResponse(
        { success: false, message: "Trading account not found" },
        404
      );
    }

    return apiResponse(
      { success: false, message: "Failed to update trading account" },
      500
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await context.params;

    await prisma.tradingAccount.delete({
      where: { id, userId },
    });

    return apiResponse({ success: true });
  } catch (error) {
    console.error("Trading account DELETE error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return apiResponse(
        { success: false, message: "Trading account not found" },
        404
      );
    }

    return apiResponse(
      { success: false, message: "Failed to delete trading account" },
      500
    );
  }
}
