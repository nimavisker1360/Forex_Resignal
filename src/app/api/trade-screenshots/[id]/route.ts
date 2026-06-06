import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/journal/api-utils";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    // TODO: Replace query-param userId with the authenticated session user id.
    const userId = searchParams.get("userId");

    if (!userId) {
      return apiResponse({ success: false, message: "userId is required" }, 400);
    }

    await prisma.tradeScreenshot.delete({
      where: { id, userId },
    });

    return apiResponse({ success: true });
  } catch (error) {
    console.error("Trade screenshot DELETE error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return apiResponse(
        { success: false, message: "Screenshot metadata not found" },
        404
      );
    }

    return apiResponse(
      { success: false, message: "Failed to delete screenshot metadata" },
      500
    );
  }
}
