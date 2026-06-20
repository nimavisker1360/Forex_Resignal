import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import {
  PAID_SUBSCRIPTION_STATUSES,
  addDays,
  apiError,
  apiJson,
  handleApiError,
  serializeSubscription,
} from "@/lib/payments-api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = (await request.json()) as Record<string, unknown>;
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const planId = typeof body.planId === "string" ? body.planId.trim() : "";
    const durationDays =
      body.durationDays === undefined || body.durationDays === null
        ? null
        : Number(body.durationDays);
    const note =
      typeof body.note === "string" && body.note.trim() ? body.note.trim() : null;

    if (!userId || !planId) {
      return apiError("userId and planId are required", 400);
    }

    if (
      durationDays !== null &&
      (!Number.isInteger(durationDays) || durationDays <= 0)
    ) {
      return apiError("durationDays must be a positive integer", 400);
    }

    const db = prisma as any;
    const [user, plan] = await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { id: true } }),
      db.plan.findFirst({ where: { id: planId, isActive: true } }),
    ]);

    if (!user) {
      return apiError("User not found", 404);
    }

    if (!plan) {
      return apiError("Plan not found", 404);
    }

    const effectiveDurationDays = durationDays ?? Number(plan.durationDays);

    if (!Number.isInteger(effectiveDurationDays) || effectiveDurationDays <= 0) {
      return apiError("durationDays is required for this plan", 400);
    }

    const now = new Date();
    const subscription = await prisma.$transaction(async (tx) => {
      const txDb = tx as any;
      const existingSubscription = await txDb.subscription.findFirst({
        where: {
          userId,
          status: { in: [...PAID_SUBSCRIPTION_STATUSES] },
          expiresAt: { gt: now },
        },
        orderBy: { expiresAt: "desc" },
      });
      const baseDate =
        existingSubscription && existingSubscription.expiresAt > now
          ? existingSubscription.expiresAt
          : now;

      await txDb.subscription.updateMany({
        where: {
          userId,
          status: { in: ["TRIAL", "FREE"] },
          expiresAt: { gt: now },
        },
        data: {
          status: "CANCELED",
          canceledAt: now,
        },
      });

      if (note) {
        await txDb.adminNote.create({
          data: {
            userId,
            adminId: admin.id,
            note,
          },
        });
      }

      return txDb.subscription.create({
        data: {
          userId,
          planId,
          status: "MANUAL",
          startedAt: baseDate,
          expiresAt: addDays(baseDate, effectiveDurationDays),
        },
        include: {
          plan: true,
          payment: true,
        },
      });
    });

    return apiJson({
      success: true,
      subscription: serializeSubscription(subscription),
    }, 201);
  } catch (error) {
    return handleApiError(error, "Failed to create manual subscription");
  }
}
