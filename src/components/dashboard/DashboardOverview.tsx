"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  Gauge,
  ListChecks,
  Percent,
  Plus,
  PlugZap,
  type LucideIcon,
} from "lucide-react";
import { PnlText } from "@/components/dashboard/PnlText";
import { StatCard } from "@/components/dashboard/StatCard";
import { TradeDirectionBadge } from "@/components/dashboard/TradeDirectionBadge";
import { TradeTable } from "@/components/dashboard/TradeTable";
import {
  TradeReadinessGuide,
  type ReadinessSummary,
  useTradeReadinessGuideState,
} from "@/components/dashboard/TradeReadinessGuide";
import { useLanguage } from "@/lib/language-context";
import {
  type ApiResult,
  type DashboardOverviewData,
  type DashboardOverviewStats,
  formatDate,
  formatMoney,
  type TradeDto,
  type TradingAccountDto,
} from "@/components/dashboard/types";
import { cn } from "@/lib/utils";

const DASHBOARD_REFRESH_INTERVAL_MS = 15000;

type EconomicEventDto = {
  id: string;
  name: string;
  currency: string;
  impact: string;
  eventTime: string;
};

type DailyJournalPayload = {
  success?: boolean;
  journal?: Record<string, unknown> | null;
};

const enText = {
  simple: "Simple",
  pro: "Pro",
  modeHint: "Simple mode keeps the dashboard focused on decision and next action.",
  tradingStatusTitle: "Today Trading Status",
  tradingStatusSubtitle: "Use this as the first decision point before managing trades.",
  finalDecision: "Final decision",
  readiness: "Readiness",
  mainReason: "Main reason",
  startCheck: "Start Pre-Trade Check",
  openJournal: "Open Daily Journal",
  summaryTitle: "Today check summary",
  mindset: "Mindset",
  playbook: "Playbook",
  checklist: "Checklist",
  actionCenter: "Action Center",
  noPendingActions: "No urgent actions right now.",
  reviewNeeded: "Review Needed",
  tradesWaiting: "Trades waiting for review",
  dailyJournalPending: "Daily journal not completed",
  openTrades: "Open Trades",
  highImpactNews: "High-impact news warning",
  reviewTrades: "Review trades",
  completeJournal: "Open journal",
  manageTrades: "Manage trades",
  viewCalendar: "View calendar",
  performanceSnapshot: "Performance Snapshot",
  recentSummary: "Recent Trades",
  noTrades: "No recent trades yet.",
  review: "Review",
  reviewed: "Reviewed",
  notReviewed: "Needs review",
  marketRisk: "Market Risk",
  marketRiskSubtitle: "High-impact calendar risk in the next 24 hours.",
  noHighImpactEvents: "No high-impact events in the next 24h",
  loadingEvents: "Checking market risk...",
  nextHighImpact: "Next high-impact event",
  economicDetails: "Economic Events Details",
  accountRisk: "Account Risk Breakdown",
  analyticsPreview: "Analytics Preview",
  analyticsHint: "Open analytics for deeper playbook, psychology, and account trends.",
  openAnalytics: "Open analytics",
  balance: "Balance",
  openInFeed: "open in recent feed",
  totalTrades: "Total Trades",
};

const faText = {
  simple: "ساده",
  pro: "حرفه‌ای",
  modeHint: "حالت ساده داشبورد را روی تصمیم امروز و اقدام بعدی متمرکز نگه می‌دارد.",
  tradingStatusTitle: "وضعیت معاملات امروز",
  tradingStatusSubtitle: "قبل از مدیریت معاملات، تصمیم اصلی امروز را از این بخش شروع کنید.",
  finalDecision: "تصمیم نهایی",
  readiness: "آمادگی",
  mainReason: "دلیل اصلی",
  startCheck: "شروع چک پیش از معامله",
  openJournal: "باز کردن ژورنال روزانه",
  summaryTitle: "خلاصه چک امروز",
  mindset: "ذهنیت",
  playbook: "پلی‌بوک",
  checklist: "چک‌لیست",
  actionCenter: "مرکز اقدام",
  noPendingActions: "الان اقدام فوری مهمی وجود ندارد.",
  reviewNeeded: "نیازمند بررسی",
  tradesWaiting: "معاملات در انتظار بررسی",
  dailyJournalPending: "ژورنال روزانه تکمیل نشده",
  openTrades: "معاملات باز",
  highImpactNews: "هشدار خبر پراثر",
  reviewTrades: "بررسی معاملات",
  completeJournal: "باز کردن ژورنال",
  manageTrades: "مدیریت معاملات",
  viewCalendar: "مشاهده تقویم",
  performanceSnapshot: "خلاصه عملکرد",
  recentSummary: "معاملات اخیر",
  noTrades: "هنوز معامله اخیری وجود ندارد.",
  review: "بررسی",
  reviewed: "بررسی شده",
  notReviewed: "نیازمند بررسی",
  marketRisk: "ریسک بازار",
  marketRiskSubtitle: "ریسک رویدادهای پراثر اقتصادی در ۲۴ ساعت آینده.",
  noHighImpactEvents: "در ۲۴ ساعت آینده رویداد پراثر وجود ندارد",
  loadingEvents: "در حال بررسی ریسک بازار...",
  nextHighImpact: "رویداد پراثر بعدی",
  economicDetails: "جزئیات رویدادهای اقتصادی",
  accountRisk: "تفکیک ریسک حساب‌ها",
  analyticsPreview: "پیش‌نمایش تحلیل‌ها",
  analyticsHint: "برای بررسی عمیق‌تر پلی‌بوک، روان‌شناسی و روند حساب‌ها وارد تحلیل‌ها شوید.",
  openAnalytics: "باز کردن تحلیل‌ها",
  balance: "موجودی",
  openInFeed: "معامله باز در فهرست اخیر",
  totalTrades: "کل معاملات",
};

const textByLanguage = {
  en: enText,
  fa: faText,
} as const;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatEventDistance(eventTime: string, language: "en" | "fa") {
  const minutes = Math.max(0, Math.round((new Date(eventTime).getTime() - Date.now()) / 60000));

  if (language === "fa") {
    if (minutes < 60) {
      return `${minutes} دقیقه دیگر`;
    }

    const hours = Math.round(minutes / 60);
    return `${hours} ساعت دیگر`;
  }

  if (minutes < 60) {
    return `in ${minutes} minutes`;
  }

  const hours = Math.round(minutes / 60);
  return `in ${hours} ${hours === 1 ? "hour" : "hours"}`;
}

function formatActionTradeCount(count: number, language: "en" | "fa") {
  if (language === "fa") {
    return `${count} معامله`;
  }

  return `${count} ${count === 1 ? "trade" : "trades"}`;
}

function formatOpenTradesDetail(count: number, language: "en" | "fa") {
  if (language === "fa") {
    return `${count} معامله باز`;
  }

  return `${count} open`;
}

function formatEventTime(eventTime: string, language: "en" | "fa") {
  const date = new Date(eventTime);

  if (Number.isNaN(date.getTime())) {
    return eventTime;
  }

  return new Intl.DateTimeFormat(language === "fa" ? "fa-IR" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isTradeReviewed(trade: TradeDto) {
  return Boolean(trade.strategyReview && trade.strategyReview.followedPlan !== "NOT_REVIEWED");
}

function SectionCard({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function TodayTradingStatus({
  summary,
  onStartCheck,
  labels,
  isRtl,
}: {
  summary: ReadinessSummary;
  onStartCheck: () => void;
  labels: typeof enText;
  isRtl: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]",
        isRtl && "text-right"
      )}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-300">
            <Gauge className="h-4 w-4" />
            {labels.tradingStatusTitle}
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_120px_1.4fr]">
            <div className={cn("rounded-lg border p-3", summary.decisionToneClass)}>
              <div className="text-xs font-semibold uppercase">{labels.finalDecision}</div>
              <div className="mt-1 text-lg font-bold">{summary.decisionLabel}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#111827]">
              <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                {labels.readiness}
              </div>
              <div className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{summary.readinessScore}%</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#111827]">
              <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                {labels.mainReason}
              </div>
              <div className="mt-1 text-sm font-semibold leading-5 text-slate-950 dark:text-white">
                {summary.mainReason}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#111827]">
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{labels.summaryTitle}</h3>
          <div className="mt-2 grid gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex justify-between gap-3">
              <span>{labels.mindset}</span>
              <strong>{summary.mindsetCompleted}/{summary.mindsetTotal}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span>{labels.playbook}</span>
              <strong className="text-right">{summary.selectedPlaybook}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span>{labels.checklist}</span>
              <strong>{summary.checklistCompleted}/{summary.checklistTotal}</strong>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <button
              type="button"
              onClick={onStartCheck}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              <ClipboardCheck className="h-4 w-4" />
              {labels.startCheck}
            </button>
            <Link
              href="/dashboard/daily-journal"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-white dark:border-slate-800 dark:text-slate-200 dark:hover:bg-[#0F172A]"
            >
              <BookOpenCheck className="h-4 w-4" />
              {labels.openJournal}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActionCenter({
  labels,
  accounts,
  stats,
  journalCompleted,
  journalLoaded,
  highImpactEvents,
  eventsLoaded,
  language,
}: {
  labels: typeof enText;
  accounts: TradingAccountDto[];
  stats: DashboardOverviewStats;
  journalCompleted: boolean;
  journalLoaded: boolean;
  highImpactEvents: EconomicEventDto[];
  eventsLoaded: boolean;
  language: "en" | "fa";
}) {
  const hasConnectedAccount = accounts.some(
    (account) =>
      account.journalEnabled &&
      (account.mt5AccountNumber || account.lastConnectedAt || account.lastSyncAt || account.hasJournalSecret)
  );
  const actions = [
    stats.notReviewedTrades > 0
      ? {
          key: "reviews",
          icon: ClipboardCheck,
          title: labels.tradesWaiting,
          detail: formatActionTradeCount(stats.notReviewedTrades, language),
          href: "/dashboard/trades?reviewStatus=not-reviewed",
          cta: labels.reviewTrades,
        }
      : null,
    journalLoaded && !journalCompleted
      ? {
          key: "journal",
          icon: BookOpenCheck,
          title: labels.dailyJournalPending,
          detail: todayKey(),
          href: "/dashboard/daily-journal",
          cta: labels.completeJournal,
        }
      : null,
    stats.openTrades > 0
      ? {
          key: "open",
          icon: Activity,
          title: labels.openTrades,
          detail: formatOpenTradesDetail(stats.openTrades, language),
          href: "/dashboard/trades?status=OPEN",
          cta: labels.manageTrades,
        }
      : null,
    !hasConnectedAccount
      ? {
          key: "account",
          icon: PlugZap,
          title: language === "fa" ? "حساب MT5/حساب معاملاتی متصل نیست" : "MT5/account not connected",
          detail: language === "fa" ? "MT5 را متصل کنید یا یک حساب معاملاتی بسازید" : "Connect MT5 or create a trading account",
          href: "/dashboard/accounts",
          cta: language === "fa" ? "اتصال MT5" : "Connect MT5",
        }
      : null,
    eventsLoaded && highImpactEvents.length > 0
      ? {
          key: "news",
          icon: AlertTriangle,
          title: labels.highImpactNews,
          detail: `${highImpactEvents[0].currency} ${formatEventDistance(highImpactEvents[0].eventTime, language)}`,
          href: "/economic-calendar",
          cta: labels.viewCalendar,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    icon: LucideIcon;
    title: string;
    detail: string;
    href: string;
    cta: string;
  }>;

  return (
    <SectionCard title={labels.actionCenter}>
      {actions.length === 0 ? (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          {labels.noPendingActions}
        </div>
      ) : (
        <div className="mt-3 grid gap-2">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <div
                key={action.key}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-[#111827] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600 dark:border-slate-800 dark:bg-[#0F172A] dark:text-blue-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{action.title}</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{action.detail}</p>
                  </div>
                </div>
                <Link
                  href={action.href}
                  className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  {action.cta}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

function OnboardingChecklist({ language }: { language: "en" | "fa" }) {
  const items = [
    {
      label: language === "fa" ? "اتصال حساب MT5" : "Connect MT5 account",
      href: "/dashboard/accounts",
      icon: PlugZap,
    },
    {
      label: language === "fa" ? "ساخت اولین پلی‌بوک" : "Create first playbook",
      href: "/journal/playbooks/new",
      icon: ListChecks,
    },
    {
      label: language === "fa" ? "تکمیل ژورنال روزانه" : "Complete daily journal",
      href: "/dashboard/daily-journal",
      icon: BookOpenCheck,
    },
    {
      label: language === "fa" ? "افزودن یا وارد کردن اولین معامله" : "Add or import first trade",
      href: "/dashboard/trades",
      icon: Plus,
    },
  ];

  return (
    <SectionCard title={language === "fa" ? "شروع کار" : "Getting started"}>
      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white dark:border-slate-800 dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-[#0F172A]"
            >
              <Icon className="h-4 w-4 text-blue-500" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </SectionCard>
  );
}

function RecentTradeSummary({
  trades,
  labels,
  isRtl,
  language,
}: {
  trades: TradeDto[];
  labels: typeof enText;
  isRtl: boolean;
  language: "en" | "fa";
}) {
  return (
    <SectionCard title={labels.recentSummary} className={isRtl ? "text-right" : undefined}>
      {trades.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-slate-950 dark:text-white">
                {language === "fa" ? "هنوز معامله‌ای ثبت نشده" : "No trades yet"}
              </h3>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                {language === "fa"
                  ? "MT5 را متصل کنید یا اولین معامله دستی خود را اضافه کنید تا ژورنال‌نویسی را شروع کنید."
                  : "Connect MT5 or add your first manual trade to start journaling."}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/dashboard/accounts"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-500"
              >
                <PlugZap className="h-4 w-4" />
                {language === "fa" ? "اتصال MT5" : "Connect MT5"}
              </Link>
              <Link
                href="/dashboard/trades"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-white dark:border-slate-800 dark:text-slate-200 dark:hover:bg-[#0F172A]"
              >
                <Plus className="h-4 w-4" />
                {language === "fa" ? "افزودن معامله دستی" : "Add Manual Trade"}
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {trades.slice(0, 3).map((trade) => {
            const reviewed = isTradeReviewed(trade);

            return (
              <div
                key={trade.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#111827]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold text-slate-950 dark:text-white">
                      {trade.symbol}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(trade.openedAt)}
                    </div>
                  </div>
                  <TradeDirectionBadge direction={trade.direction} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">PnL</div>
                    <PnlText value={trade.profitLoss} currency={trade.account?.currency || "USD"} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{labels.reviewNeeded}</div>
                    <div
                      className={cn(
                        "mt-1 inline-flex rounded-lg border px-2 py-1 text-xs font-semibold",
                        reviewed
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200"
                      )}
                    >
                      {reviewed ? labels.reviewed : labels.notReviewed}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/journal/${trade.id}`}
                  className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  {labels.review}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

function MarketRiskCard({
  events,
  loaded,
  labels,
  language,
}: {
  events: EconomicEventDto[];
  loaded: boolean;
  labels: typeof enText;
  language: "en" | "fa";
}) {
  const nextEvent = events[0];

  return (
    <SectionCard
      title={labels.marketRisk}
      action={
        <Link
          href="/economic-calendar"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {labels.viewCalendar}
        </Link>
      }
    >
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{labels.marketRiskSubtitle}</p>
      <div
        className={cn(
          "mt-4 rounded-lg border p-3 text-sm",
          !loaded
            ? "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-400"
            : nextEvent
              ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
        )}
      >
        {!loaded ? (
          labels.loadingEvents
        ) : nextEvent ? (
          <div className="flex flex-col gap-1">
            <strong>{labels.nextHighImpact}</strong>
            <span>
              {formatEventTime(nextEvent.eventTime, language)} - {nextEvent.currency} - {nextEvent.name}
            </span>
          </div>
        ) : (
          labels.noHighImpactEvents
        )}
      </div>
    </SectionCard>
  );
}

function AccountRiskBreakdown({
  accounts,
  trades,
  labels,
  language,
}: {
  accounts: TradingAccountDto[];
  trades: TradeDto[];
  labels: typeof enText;
  language: "en" | "fa";
}) {
  const openByAccount = useMemo(() => {
    const counts = new Map<string, number>();

    trades.forEach((trade) => {
      if (trade.status === "OPEN") {
        counts.set(trade.accountId, (counts.get(trade.accountId) || 0) + 1);
      }
    });

    return counts;
  }, [trades]);

  return (
    <SectionCard title={labels.accountRisk}>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {accounts.slice(0, 3).map((account) => (
          <div key={account.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness className="h-4 w-4 text-blue-500" />
              <h3 className="truncate text-sm font-semibold text-slate-950 dark:text-white">{account.name}</h3>
            </div>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">{labels.balance}</div>
            <div className="text-lg font-semibold text-slate-950 dark:text-white">
              {formatMoney(account.balance, account.currency)}
            </div>
            <div className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              {openByAccount.get(account.id) || 0} {labels.openInFeed}
            </div>
          </div>
        ))}
        {accounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-400">
            {language === "fa" ? "هنوز حسابی متصل نشده است." : "No accounts connected yet."}
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}

function EconomicEventsDetails({
  events,
  labels,
  language,
}: {
  events: EconomicEventDto[];
  labels: typeof enText;
  language: "en" | "fa";
}) {
  return (
    <SectionCard title={labels.economicDetails}>
      <div className="mt-3 space-y-2">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex flex-col gap-1 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm md:flex-row md:items-center md:justify-between"
          >
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {event.currency} - {event.name}
            </span>
            <span className="text-xs font-semibold text-red-500 dark:text-red-300">
              {formatEventTime(event.eventTime, language)}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function AnalyticsPreview({
  closedTrades,
  readinessScore,
  labels,
  language,
}: {
  closedTrades: number;
  readinessScore: number;
  labels: typeof enText;
  language: "en" | "fa";
}) {
  if (closedTrades < 10) {
    return (
      <SectionCard
        title={labels.analyticsPreview}
        action={
          <Link
            href="/journal/analytics"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <BarChart3 className="h-4 w-4" />
            {labels.openAnalytics}
          </Link>
        }
      >
        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {language === "fa"
              ? "تحلیل‌ها بعد از ۱۰ معامله بسته‌شده کاربردی‌تر می‌شوند."
              : "Analytics gets more useful after 10 closed trades."}
          </span>
          <strong className="text-slate-950 dark:text-white">
            {language === "fa" ? `${closedTrades}/10 معامله بسته‌شده` : `${closedTrades}/10 closed trades`}
          </strong>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={labels.analyticsPreview}
      action={
        <Link
          href="/journal/analytics"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <BarChart3 className="h-4 w-4" />
          {labels.openAnalytics}
        </Link>
      }
    >
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#111827]">
          <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            {language === "fa" ? "معاملات بسته‌شده" : "Closed Trades"}
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{closedTrades}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#111827]">
          <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{labels.readiness}</div>
          <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{readinessScore}%</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-400">
          <FileText className="mb-2 h-4 w-4 text-blue-500" />
          {labels.analyticsHint}
        </div>
      </div>
    </SectionCard>
  );
}

export function DashboardOverview({
  userId,
  initialAccounts,
  initialTrades,
  initialStats,
}: {
  userId?: string;
  initialAccounts: TradingAccountDto[];
  initialTrades: TradeDto[];
  initialStats: DashboardOverviewStats;
}) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [trades, setTrades] = useState(initialTrades);
  const [stats, setStats] = useState(initialStats);
  const [highImpactEvents, setHighImpactEvents] = useState<EconomicEventDto[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [journalCompleted, setJournalCompleted] = useState(false);
  const [journalLoaded, setJournalLoaded] = useState(false);
  const [simpleMode, setSimpleMode] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const isRefreshingRef = useRef(false);
  const { language, t } = useLanguage();
  const labels = textByLanguage[language];
  const isRtl = language === "fa";
  const guide = useTradeReadinessGuideState({ highImpactEventCount: highImpactEvents.length });
  const closedTradeCount = stats.closedTrades ?? trades.filter((trade) => trade.status === "CLOSED").length;
  const isFirstTimeUser = accounts.length === 0 && stats.totalTrades === 0;

  useEffect(() => {
    setAccounts(initialAccounts);
    setTrades(initialTrades);
    setStats(initialStats);
  }, [initialAccounts, initialStats, initialTrades]);

  useEffect(() => {
    const savedMode = window.localStorage.getItem("dashboard-mode");
    setSimpleMode(savedMode !== "pro");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("dashboard-mode", simpleMode ? "simple" : "pro");
  }, [simpleMode]);

  const refreshTrades = useCallback(async (signal?: AbortSignal) => {
    if (!userId || isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;

    try {
      const response = await fetch("/api/dashboard/overview", {
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as ApiResult<DashboardOverviewData>;

      if (payload.success && payload.data) {
        setAccounts(payload.data.accounts);
        setTrades(payload.data.trades);
        setStats(payload.data.stats);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error("Dashboard trades refresh failed:", error);
      }
    } finally {
      isRefreshingRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const controller = new AbortController();
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshTrades();
      }
    }, DASHBOARD_REFRESH_INTERVAL_MS);
    const handleFocus = () => {
      void refreshTrades();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshTrades, userId]);

  useEffect(() => {
    if (!userId) {
      setEventsLoaded(true);
      return;
    }

    const controller = new AbortController();
    const from = new Date();
    const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      impact: "High",
      from: from.toISOString(),
      to: to.toISOString(),
    });

    fetch(`/api/economic-calendar?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { success?: boolean; data?: EconomicEventDto[] } | null) => {
        if (payload?.success) {
          setHighImpactEvents((payload.data || []).slice(0, 3));
        }
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Dashboard high-impact events load failed:", error);
        }
      })
      .finally(() => {
        setEventsLoaded(true);
      });

    return () => controller.abort();
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setJournalLoaded(true);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({ date: todayKey() });

    fetch(`/api/daily-journal?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: DailyJournalPayload | null) => {
        const journal = payload?.success ? payload.journal : null;
        const hasUsefulEntry = Boolean(
          journal &&
            (journal.marketBias ||
              journal.todayFocus ||
              journal.preMarketNotes ||
              journal.whatWentWell ||
              journal.mistakesSummary ||
              journal.tomorrowPlan)
        );

        setJournalCompleted(hasUsefulEntry);
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Dashboard daily journal status load failed:", error);
        }
      })
      .finally(() => {
        setJournalLoaded(true);
      });

    return () => controller.abort();
  }, [userId]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
            {t("dashboard.overview.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("dashboard.overview.subtitle")}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
            <button
              type="button"
              onClick={() => setSimpleMode(true)}
              className={cn(
                "h-9 rounded-lg px-4 text-sm font-semibold transition",
                simpleMode
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              {labels.simple}
            </button>
            <button
              type="button"
              onClick={() => setSimpleMode(false)}
              className={cn(
                "h-9 rounded-lg px-4 text-sm font-semibold transition",
                !simpleMode
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              {labels.pro}
            </button>
          </div>
          <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
            {simpleMode
              ? language === "fa"
                ? "حالت ساده فقط تصمیم امروز، اقدام بعدی و عملکرد کلیدی را نشان می‌دهد."
                : "Simple mode shows only today’s decision, next action, and key performance."
              : language === "fa"
                ? "حالت حرفه‌ای ریسک بازار، پیش‌نمایش تحلیل‌ها، ریسک حساب و جزئیات معاملات را اضافه می‌کند."
                : "Pro mode adds market risk, analytics preview, account risk, and detailed trade data."}
          </p>
        </div>
      </div>

      <TodayTradingStatus
        summary={guide.summary}
        onStartCheck={() => setGuideOpen(true)}
        labels={labels}
        isRtl={isRtl}
      />

      {isFirstTimeUser ? <OnboardingChecklist language={language} /> : null}

      <ActionCenter
        labels={labels}
        accounts={accounts}
        stats={stats}
        journalCompleted={journalCompleted}
        journalLoaded={journalLoaded}
        highImpactEvents={highImpactEvents}
        eventsLoaded={eventsLoaded}
        language={language}
      />

      <SectionCard title={labels.performanceSnapshot}>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t("dashboard.overview.totalPnl")}
            value={formatMoney(stats.totalPnl)}
            icon={<CircleDollarSign className="h-4 w-4" />}
            tone={stats.totalPnl >= 0 ? "green" : "red"}
          />
          <StatCard
            label={t("dashboard.overview.winRate")}
            value={`${stats.winRate}%`}
            icon={<Percent className="h-4 w-4" />}
            tone="green"
          />
          <StatCard
            label={labels.openTrades}
            value={String(stats.openTrades)}
            icon={<Activity className="h-4 w-4" />}
            tone="blue"
          />
          <StatCard
            label={labels.reviewNeeded}
            value={String(stats.notReviewedTrades)}
            icon={<ClipboardCheck className="h-4 w-4" />}
            tone={stats.notReviewedTrades > 0 ? "red" : "green"}
          />
        </div>
      </SectionCard>

      <RecentTradeSummary trades={trades} labels={labels} isRtl={isRtl} language={language} />

      <MarketRiskCard events={highImpactEvents} loaded={eventsLoaded} labels={labels} language={language} />

      {!simpleMode ? (
        <>
          {eventsLoaded && highImpactEvents.length > 0 ? (
            <EconomicEventsDetails events={highImpactEvents} labels={labels} language={language} />
          ) : null}

          {accounts.length > 0 ? (
            <AccountRiskBreakdown accounts={accounts} trades={trades} labels={labels} language={language} />
          ) : null}

          <AnalyticsPreview
            closedTrades={closedTradeCount}
            readinessScore={guide.summary.readinessScore}
            labels={labels}
            language={language}
          />

          <SectionCard title={t("dashboard.overview.recentTrades")}>
            <div className="mt-4">
              <TradeTable trades={trades} />
            </div>
          </SectionCard>
        </>
      ) : null}

      <TradeReadinessGuide open={guideOpen} onClose={() => setGuideOpen(false)} guide={guide} />
    </div>
  );
}
