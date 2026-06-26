import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdminUser, requireUser } from "@/lib/server-auth";

export type FeatureName =
  | "trades"
  | "screenshots"
  | "playbooks"
  | "checklists"
  | "aiAnalysis"
  | "advancedAnalytics"
  | "export";

export class SubscriptionAccessError extends Error {
  status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.name = "SubscriptionAccessError";
    this.status = status;
  }
}

const ACTIVE_STATUSES = ["ACTIVE", "TRIAL", "FREE", "MANUAL"];
const PAID_STATUSES = ["ACTIVE", "MANUAL"];
const FAR_FUTURE_DAYS = 365 * 100;
const DEFAULT_TRIAL_DAYS = 10;

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function daysRemaining(expiresAt: Date) {
  const diff = expiresAt.getTime() - Date.now();
  return Math.max(Math.ceil(diff / 86_400_000), 0);
}

function positiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function calendarDayNumber(date: Date) {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000
  );
}

function calendarDaysElapsedSince(startedAt: Date, now = new Date()) {
  return Math.max(calendarDayNumber(now) - calendarDayNumber(startedAt), 0);
}

function trialDurationDays(subscription: { plan?: { durationDays?: number | null } | null }) {
  return positiveInteger(subscription.plan?.durationDays, DEFAULT_TRIAL_DAYS);
}

function trialDaysRemaining(subscription: {
  startedAt: Date;
  expiresAt: Date;
  plan?: { durationDays?: number | null } | null;
}) {
  const duration = trialDurationDays(subscription);
  const calendarRemaining = duration - calendarDaysElapsedSince(subscription.startedAt);

  return Math.max(Math.min(calendarRemaining, daysRemaining(subscription.expiresAt)), 0);
}

export function subscriptionAccessResponse(error: unknown) {
  if (error instanceof SubscriptionAccessError) {
    return NextResponse.json(
      { success: false, message: error.message, upgradeRequired: true },
      { status: error.status }
    );
  }

  return null;
}

export async function expireOldSubscriptions(userId?: string) {
  const now = new Date();
  const db = prisma as any;

  await db.subscription.updateMany({
    where: {
      ...(userId ? { userId } : {}),
      status: { in: ACTIVE_STATUSES },
      expiresAt: { lt: now },
    },
    data: {
      status: "EXPIRED",
    },
  });
}

async function getActivePaidSubscription(userId: string) {
  const db = prisma as any;

  return db.subscription.findFirst({
    where: {
      userId,
      status: { in: PAID_STATUSES },
      expiresAt: { gt: new Date() },
    },
    include: { plan: true },
    orderBy: { expiresAt: "desc" },
  });
}

export async function ensureUserTrial(userId: string) {
  const db = prisma as any;
  const existingTrial = await db.subscription.findFirst({
    where: {
      userId,
      status: { in: ["TRIAL", "EXPIRED", "CANCELED"] },
      plan: { slug: "trial" },
    },
    select: { id: true },
  });

  if (existingTrial) {
    return null;
  }

  const trialPlan = await db.plan.findUnique({
    where: { slug: "trial" },
  });

  if (!trialPlan) {
    return null;
  }

  const now = new Date();
  const startedAt = now;
  const durationDays = positiveInteger(trialPlan.durationDays, DEFAULT_TRIAL_DAYS);

  return db.subscription.create({
    data: {
      userId,
      planId: trialPlan.id,
      status: "TRIAL",
      startedAt,
      expiresAt: addDays(startedAt, durationDays),
    },
    include: { plan: true },
  });
}

export async function getOrCreateFreeSubscription(userId: string) {
  await expireOldSubscriptions(userId);

  const db = prisma as any;
  const paid = await getActivePaidSubscription(userId);

  if (paid) {
    return paid;
  }

  const activeTrial = await db.subscription.findFirst({
    where: {
      userId,
      status: "TRIAL",
      expiresAt: { gt: new Date() },
    },
    include: { plan: true },
    orderBy: { expiresAt: "desc" },
  });

  if (activeTrial) {
    return activeTrial;
  }

  const activeFree = await db.subscription.findFirst({
    where: {
      userId,
      status: "FREE",
      expiresAt: { gt: new Date() },
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  if (activeFree) {
    return activeFree;
  }

  const freePlan = await db.plan.findUnique({
    where: { slug: "free" },
  });

  if (!freePlan) {
    return null;
  }

  const now = new Date();

  return db.subscription.create({
    data: {
      userId,
      planId: freePlan.id,
      status: "FREE",
      startedAt: now,
      expiresAt: addDays(now, FAR_FUTURE_DAYS),
    },
    include: { plan: true },
  });
}

export async function getActiveSubscription(userId: string) {
  await expireOldSubscriptions(userId);

  const db = prisma as any;
  const paid = await getActivePaidSubscription(userId);

  if (paid) {
    return paid;
  }

  const active = await db.subscription.findFirst({
    where: {
      userId,
      status: { in: ACTIVE_STATUSES },
      expiresAt: { gt: new Date() },
    },
    include: { plan: true },
    orderBy: [
      { status: "asc" },
      { expiresAt: "desc" },
    ],
  });

  return active;
}

export async function ensureSubscriptionForUser(userId: string) {
  await expireOldSubscriptions(userId);

  const db = prisma as any;
  const paid = await getActivePaidSubscription(userId);

  if (paid) {
    return paid;
  }

  const activeTrial = await db.subscription.findFirst({
    where: {
      userId,
      status: "TRIAL",
      expiresAt: { gt: new Date() },
    },
    include: { plan: true },
    orderBy: { expiresAt: "desc" },
  });

  if (activeTrial) {
    return activeTrial;
  }

  const trial = await ensureUserTrial(userId);

  if (trial) {
    return trial;
  }

  return getOrCreateFreeSubscription(userId);
}

export async function requireActiveSubscription() {
  const user = await requireUser();

  if (isAdminUser(user)) {
    return null;
  }

  const subscription = await ensureSubscriptionForUser(user.id);

  if (!subscription) {
    throw new SubscriptionAccessError("No active subscription plan is available", 403);
  }

  return subscription;
}

export async function getUserPlanLimits(userId: string) {
  const db = prisma as any;
  const subscription = await ensureSubscriptionForUser(userId);
  const plan = subscription?.plan || null;
  const [user, tradesCount, screenshotsCount, legacyPlaybooksCount, strategiesCount, checklistsCount] =
    await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true },
      }),
      db.trade.count({ where: { userId } }),
      db.tradeScreenshot.count({ where: { userId } }),
      db.playbook.count({ where: { userId } }),
      db.playbookStrategy.count({ where: { userId } }),
      db.tradeChecklist.count({ where: { trade: { userId } } }),
    ]);

  if (user && isAdminUser(user)) {
    return {
      subscription,
      plan,
      limits: {
        maxTrades: null,
        maxScreenshots: null,
        maxPlaybooks: null,
        maxChecklists: null,
        aiAnalysis: true,
        advancedAnalytics: true,
        exportEnabled: true,
      },
      usage: {
        tradesCount,
        screenshotsCount,
        playbooksCount: legacyPlaybooksCount + strategiesCount,
        checklistsCount,
      },
    };
  }

  return {
    subscription,
    plan,
    limits: {
      maxTrades: plan?.maxTrades ?? null,
      maxScreenshots: plan?.maxScreenshots ?? null,
      maxPlaybooks: plan?.maxPlaybooks ?? null,
      maxChecklists: plan?.maxChecklists ?? null,
      aiAnalysis: Boolean(plan?.aiAnalysis),
      advancedAnalytics: Boolean(plan?.advancedAnalytics),
      exportEnabled: Boolean(plan?.exportEnabled),
    },
    usage: {
      tradesCount,
      screenshotsCount,
      playbooksCount: legacyPlaybooksCount + strategiesCount,
      checklistsCount,
    },
  };
}

export async function requireFeatureAccess(userId: string, featureName: FeatureName) {
  const db = prisma as any;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });

  if (isAdminUser(user)) {
    return getUserPlanLimits(userId);
  }

  const access = await getUserPlanLimits(userId);
  const { limits, usage } = access;

  if (!access.plan) {
    throw new SubscriptionAccessError("Upgrade required to use this feature", 403);
  }

  if (featureName === "aiAnalysis" && !limits.aiAnalysis) {
    throw new SubscriptionAccessError("AI analysis is not available on your current plan. Upgrade to Pro.", 403);
  }

  if (featureName === "advancedAnalytics" && !limits.advancedAnalytics) {
    throw new SubscriptionAccessError("Advanced analytics is not available on your current plan. Upgrade to Pro.", 403);
  }

  if (featureName === "export" && !limits.exportEnabled) {
    throw new SubscriptionAccessError("Export is not available on your current plan. Upgrade to Pro.", 403);
  }

  const checks = {
    trades: {
      limit: limits.maxTrades,
      usage: usage.tradesCount,
      label: "trade",
    },
    screenshots: {
      limit: limits.maxScreenshots,
      usage: usage.screenshotsCount,
      label: "screenshot",
    },
    playbooks: {
      limit: limits.maxPlaybooks,
      usage: usage.playbooksCount,
      label: "playbook",
    },
    checklists: {
      limit: limits.maxChecklists,
      usage: usage.checklistsCount,
      label: "checklist",
    },
  } as const;

  if (featureName in checks) {
    const check = checks[featureName as keyof typeof checks];

    if (check.limit !== null && check.usage >= check.limit) {
      throw new SubscriptionAccessError(
        `You have reached your ${check.label} limit for the current plan. Upgrade to Pro for unlimited access.`,
        403
      );
    }
  }

  return access;
}

export async function getSubscriptionBannerState(userId: string) {
  const db = prisma as any;
  const subscription = await ensureSubscriptionForUser(userId);

  if (!subscription?.plan) {
    return null;
  }

  const remaining =
    subscription.status === "TRIAL"
      ? trialDaysRemaining(subscription)
      : daysRemaining(subscription.expiresAt);
  const expiredTrial = await db.subscription.findFirst({
    where: {
      userId,
      status: { in: ["EXPIRED", "CANCELED"] },
      plan: { slug: "trial" },
    },
    select: { id: true },
    orderBy: { expiresAt: "desc" },
  });

  if (subscription.status === "TRIAL") {
    const duration = trialDurationDays(subscription);

    return {
      tone: remaining <= 3 ? "warning" : "info",
      title:
        remaining <= 3
          ? `Your trial ends in ${remaining} days. Upgrade to Pro to keep full access.`
          : `You are on a ${duration}-day trial. ${remaining} days remaining.`,
      titleFa:
        remaining <= 3
          ? `دوره آزمایشی شما تا ${remaining} روز دیگر تمام می‌شود. برای حفظ دسترسی کامل به Pro ارتقا دهید.`
          : `شما در دوره آزمایشی ${duration} روزه هستید. ${remaining} روز باقی مانده است.`,
      href: "/pricing",
      buttonText: "Upgrade",
      buttonTextFa: "ارتقا",
    };
  }

  if (subscription.status === "FREE") {
    if (expiredTrial) {
      return {
        tone: "warning",
        title: "Your trial has expired. Upgrade to Pro to generate MT5 keys and keep journaling.",
        titleFa: "دوره آزمایشی شما تمام شده است. برای ساخت کلید MT5 و ادامه ژورنال‌نویسی به Pro ارتقا دهید.",
        href: "/pricing",
        buttonText: "Upgrade",
        buttonTextFa: "ارتقا",
      };
    }

    return {
      tone: "neutral",
      title: "You are on the Free plan. Upgrade to unlock unlimited journaling.",
      titleFa: "شما روی پلن رایگان هستید. برای فعال شدن ژورنال‌نویسی نامحدود ارتقا دهید.",
      href: "/pricing",
      buttonText: "Upgrade",
      buttonTextFa: "ارتقا",
    };
  }

  if (
    (subscription.status === "ACTIVE" || subscription.status === "MANUAL") &&
    remaining <= 7
  ) {
    return {
      tone: "warning",
      title: `Your subscription expires in ${remaining} days. Renew now.`,
      titleFa: `اشتراک شما تا ${remaining} روز دیگر منقضی می‌شود. همین حالا تمدید کنید.`,
      href: "/pricing",
      buttonText: "Renew",
      buttonTextFa: "تمدید",
    };
  }

  return null;
}
