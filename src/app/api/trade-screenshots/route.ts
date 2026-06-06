import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/journal/api-utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // TODO: Replace body userId with the authenticated session user id.
    const { userId, tradeId, type, url } = body;

    if (!userId || !tradeId || !type || !url) {
      return apiResponse(
        { success: false, message: "userId, tradeId, type, and url are required" },
        400
      );
    }

    const screenshot = await prisma.tradeScreenshot.create({
      data: {
        userId,
        tradeId,
        type,
        url,
      },
    });

    return apiResponse({ success: true, data: screenshot }, 201);
  } catch (error) {
    console.error("Trade screenshot POST error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return apiResponse({ success: false, message: "Invalid tradeId" }, 400);
    }

    return apiResponse(
      { success: false, message: "Failed to create screenshot metadata" },
      500
    );
  }
}
