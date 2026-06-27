"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  Percent,
} from "lucide-react";
import { PnlText } from "@/components/dashboard/PnlText";
import { StatCard } from "@/components/dashboard/StatCard";
import { useLanguage } from "@/lib/language-context";
import { TradeDirectionBadge } from "@/components/dashboard/TradeDirectionBadge";
import { TradeTable } from "@/components/dashboard/TradeTable";
import { TradeReadinessGuide } from "@/components/dashboard/TradeReadinessGuide";
import {
  type ApiResult,
  type DashboardOverviewData,
  type DashboardOverviewStats,
  formatDate,
  formatMoney,
  formatNumber,
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

const highImpactWidgetText = {
  en: {
    title: "Upcoming High Impact Events",
    subtitle: "Forex calendar risk in the next 24 hours.",
    viewCalendar: "View calendar",
    loading: "Loading events...",
    empty: "No high-impact events in the next 24 hours.",
    minutes: (minutes: number) => `in ${minutes} minutes`,
    hours: (hours: number) => `in ${hours} ${hours === 1 ? "hour" : "hours"}`,
  },
  fa: {
    title: "رویدادهای پراثر پیش رو",
    subtitle: "ریسک تقویم فارکس در ۲۴ ساعت آینده.",
    viewCalendar: "مشاهده تقویم",
    loading: "در حال بارگذاری رویدادها...",
    empty: "در ۲۴ ساعت آینده رویداد پراثر وجود ندارد.",
    minutes: (minutes: number) => `تا ${minutes} دقیقه دیگر`,
    hours: (hours: number) => `تا ${hours} ساعت دیگر`,
  },
};

const dashboardModeText = {
  en: {
    simple: "Simple",
    pro: "Pro",
    simpleHint: "Simple mode keeps only the decision flow and the most important numbers visible.",
    recentSummary: "Recent trade summary",
    viewFullTable: "Switch to Pro mode to see the full table.",
    noTrades: "No recent trades yet.",
    review: "Review",
    waitingReview: "Waiting Review",
    reviewNotice: (count: number) => `You have ${count} trades waiting for review.`,
    reviewTrades: "Review Trades",
  },
  fa: {
    simple: "ساده",
    pro: "حرفه‌ای",
    simpleHint: "حالت ساده فقط مسیر تصمیم‌گیری و عددهای مهم را نشان می‌دهد.",
    recentSummary: "خلاصه معاملات اخیر",
    viewFullTable: "برای دیدن جدول کامل، حالت حرفه‌ای را فعال کن.",
    noTrades: "هنوز معامله اخیری وجود ندارد.",
    review: "بررسی",
    waitingReview: "در انتظار بررسی",
    reviewNotice: (count: number) => `${count} معامله در انتظار بررسی دارید.`,
    reviewTrades: "بررسی معاملات",
  },
} as const;

function formatEventDistance(eventTime: string, language: "en" | "fa") {
  const minutes = Math.max(0, Math.round((new Date(eventTime).getTime() - Date.now()) / 60000));
  const labels = highImpactWidgetText[language];

  if (minutes < 60) {
    return labels.minutes(minutes);
  }

  const hours = Math.round(minutes / 60);
  return labels.hours(hours);
}

function RecentTradeSummary({
  trades,
  labels,
  isRtl,
}: {
  trades: TradeDto[];
  labels: typeof dashboardModeText.en | typeof dashboardModeText.fa;
  isRtl: boolean;
}) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]", isRtl && "text-right")}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            {labels.recentSummary}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {labels.viewFullTable}
          </p>
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-400">
          {labels.noTrades}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {trades.slice(0, 3).map((trade) => (
            <Link
              key={trade.id}
              href={`/journal/${trade.id}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-[#111827] dark:hover:bg-slate-800"
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
                  <div className="text-xs text-slate-500 dark:text-slate-400">R:R</div>
                  <div className="font-semibold text-slate-950 dark:text-white">
                    {formatNumber(trade.rr, 2)}
                  </div>
                </div>
              </div>
              <div className="mt-4 inline-flex rounded-lg border border-blue-500/30 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-300">
                {labels.review}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
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
  const [simpleMode, setSimpleMode] = useState(true);
  const isRefreshingRef = useRef(false);
  const { language, t } = useLanguage();
  const eventLabels = highImpactWidgetText[language];
  const modeLabels = dashboardModeText[language];
  const isRtl = language === "fa";

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
              {modeLabels.simple}
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
              {modeLabels.pro}
            </button>
          </div>
          <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
            {modeLabels.simpleHint}
          </p>
        </div>
      </div>

      <TradeReadinessGuide
        recentTrades={trades}
        openTrades={stats.openTrades}
        notReviewedTrades={stats.notReviewedTrades}
        highImpactEventCount={highImpactEvents.length}
        eventsLoaded={eventsLoaded}
      />

      {simpleMode ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t("dashboard.overview.totalPnl")}
            value={formatMoney(stats.totalPnl)}
            icon={<CircleDollarSign className="h-4 w-4" />}
            tone={stats.totalPnl >= 0 ? "green" : "red"}
          />
          <StatCard
            label={t("dashboard.overview.openTrades")}
            value={String(stats.openTrades)}
            icon={<Activity className="h-4 w-4" />}
            tone="blue"
          />
          <StatCard
            label={t("dashboard.overview.winRate")}
            value={`${stats.winRate}%`}
            icon={<Percent className="h-4 w-4" />}
            tone="green"
          />
          <StatCard
            label={modeLabels.waitingReview}
            value={String(stats.notReviewedTrades)}
            icon={<ClipboardCheck className="h-4 w-4" />}
            tone={stats.notReviewedTrades > 0 ? "red" : "green"}
          />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label={t("dashboard.overview.totalAccounts")}
            value={String(accounts.length)}
            icon={<BriefcaseBusiness className="h-4 w-4" />}
            tone="blue"
          />
          <StatCard
            label={t("dashboard.overview.totalTrades")}
            value={String(stats.totalTrades)}
            icon={<Activity className="h-4 w-4" />}
          />
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
            label={t("dashboard.overview.openTrades")}
            value={String(stats.openTrades)}
            icon={<Activity className="h-4 w-4" />}
            tone="blue"
          />
        </div>
      )}

      {!simpleMode && stats.notReviewedTrades > 0 ? (
        <div className="flex flex-col gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-medium text-blue-950 dark:text-blue-100">
            {modeLabels.reviewNotice(stats.notReviewedTrades)}
          </div>
          <Link
            href="/dashboard/trades?reviewStatus=not-reviewed"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-500"
          >
            {modeLabels.reviewTrades}
          </Link>
        </div>
      ) : null}

      {!simpleMode ? (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-red-400" />
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                {eventLabels.title}
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {eventLabels.subtitle}
            </p>
          </div>
          <a
            href="/economic-calendar"
            className="inline-flex h-9 items-center rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {eventLabels.viewCalendar}
          </a>
        </div>
        <div className="mt-4 space-y-2">
          {!eventsLoaded ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">{eventLabels.loading}</div>
          ) : highImpactEvents.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {eventLabels.empty}
            </div>
          ) : (
            highImpactEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-1 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm md:flex-row md:items-center md:justify-between"
              >
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {event.currency} - {event.name}
                </span>
                <span className="text-xs font-semibold text-red-500 dark:text-red-300">
                  {formatEventDistance(event.eventTime, language)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      ) : null}

      {!simpleMode ? (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              {t("dashboard.overview.recentTrades")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("dashboard.overview.latestEntries").replace("{userId}", "your account")}
            </p>
          </div>
          <PnlText value={stats.totalPnl} />
        </div>
      </div>
      ) : null}

      {simpleMode ? (
        <RecentTradeSummary trades={trades} labels={modeLabels} isRtl={isRtl} />
      ) : (
        <TradeTable trades={trades} />
      )}
    </div>
  );
}
