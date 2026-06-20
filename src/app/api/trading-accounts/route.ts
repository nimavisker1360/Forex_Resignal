import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiResponse, decimalValue } from "@/lib/journal/api-utils";
import { getCurrentUserId, unauthorizedResponse } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const accounts = await prisma.tradingAccount.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return apiResponse({ success: true, data: accounts });
  } catch (error) {
    console.error("Trading accounts GET error:", error);

    return apiResponse(
      { success: false, message: "Failed to load trading accounts" },
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { name, broker, platform, currency, balance } = body;

    if (!name || !currency) {
      return apiResponse(
        { success: false, message: "name and currency are required" },
        400
      );
    }

    const account = await prisma.tradingAccount.create({
      data: {
        userId,
        name,
        broker,
        platform,
        currency,
        balance: decimalValue(balance),
      },
    });

    return apiResponse({ success: true, data: account }, 201);
  } catch (error) {
    console.error("Trading accounts POST error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return apiResponse(
        { success: false, message: "Trading account already exists" },
        409
      );
    }

    return apiResponse(
      { success: false, message: "Failed to create trading account" },
      500
    );
  }
}
