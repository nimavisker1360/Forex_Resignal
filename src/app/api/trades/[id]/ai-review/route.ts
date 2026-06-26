import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  requireFeatureAccess,
  subscriptionAccessResponse,
} from "@/lib/subscription";
import { authErrorResponse, requireUser } from "@/lib/server-auth";
import {
  generateTradeAIReview,
  saveTradeAIReview,
  serializeTradeAIReview,
  tradeAIReviewInclude,
} from "@/server/ai/trade-review-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function jsonError(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const regenerate = searchParams.get("regenerate") === "true";

    const trade = await prisma.trade.findFirst({
      where: { id, userId: user.id },
      include: tradeAIReviewInclude,
    });

    if (!trade) {
      return jsonError("Trade not found", 404);
    }

    const existingReview = await prisma.tradeAIReview.findFirst({
      where: { tradeId: id, userId: user.id },
    });

    if (existingReview && !regenerate) {
      return NextResponse.json({
        ok: true,
        review: serializeTradeAIReview(existingReview),
      });
    }

    await requireFeatureAccess(user.id, "aiAnalysis");

    try {
      const generated = await generateTradeAIReview(trade);
      const saved = await saveTradeAIReview({
        tradeId: trade.id,
        userId: user.id,
        review: generated,
      });

      return NextResponse.json({
        ok: true,
        review: serializeTradeAIReview(saved),
      });
    } catch (error) {
      console.error("AI trade review generation error:", error);

      await prisma.trade.updateMany({
        where: { id, userId: user.id },
        data: {
          aiReviewStatus: "FAILED",
          aiReviewScore: null,
        },
      });

      return jsonError("AI review failed", 500);
    }
  } catch (error) {
    const authResponse = authErrorResponse(error);

    if (authResponse) {
      return authResponse;
    }

    const accessResponse = subscriptionAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error("AI trade review route error:", error);

    return jsonError("AI review failed", 500);
  }
}
