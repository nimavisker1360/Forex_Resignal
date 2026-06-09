import { NextResponse } from "next/server";
import { calculateStrategyAnalytics } from "@/lib/playbooks/calculateStrategyAnalytics";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const strategy = await prisma.playbookStrategy.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!strategy) {
      return NextResponse.json(
        { success: false, message: "Playbook not found" },
        { status: 404 }
      );
    }

    const reviews = await prisma.tradeStrategyReview.findMany({
      where: { strategyId: id },
      include: {
        trade: true,
      },
    });
    const analytics = calculateStrategyAnalytics(
      reviews.map((review) => ({
        ...review.trade,
        strategyReview: review,
      }))
    );

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Playbook analytics GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load playbook analytics" },
      { status: 500 }
    );
  }
}
