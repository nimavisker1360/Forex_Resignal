import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiResponse, decimalValue } from "@/lib/journal/api-utils";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    // TODO: Replace body userId with the authenticated session user id.
    const userId = body.userId;

    if (!userId) {
      return apiResponse({ success: false, message: "userId is required" }, 400);
    }

    const data: Prisma.TradingAccountUpdateInput = {};

    for (const field of ["name", "broker", "platform", "currency"] as const) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    if (body.balance !== undefined) {
      data.balance = decimalValue(body.balance) ?? null;
    }

    const account = await prisma.tradingAccount.update({
      where: { id, userId },
      data,
    });

    return apiResponse({ success: true, data: account });
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
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    // TODO: Replace query-param userId with the authenticated session user id.
    const userId = searchParams.get("userId");

    if (!userId) {
      return apiResponse({ success: false, message: "userId is required" }, 400);
    }

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
