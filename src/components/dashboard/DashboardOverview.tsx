"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, BriefcaseBusiness, CalendarDays, CircleDollarSign, Percent } from "lucide-react";
import { PnlText } from "@/components/dashboard/PnlText";
import { StatCard } from "@/components/dashboard/StatCard";
import { useLanguage } from "@/lib/language-context";
import { TradeTable } from "@/components/dashboard/TradeTable";
import {
  DEFAULT_DASHBOARD_USER_ID,
  type ApiResult,
  type DashboardOverviewData,
  type DashboardOverviewStats,
  formatMoney,
  type TradeDto,
  type TradingAccountDto,
} from "@/components/dashboard/types";

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

function formatEventDistance(eventTime: string, language: "en" | "fa") {
  const minutes = Math.max(0, Math.round((new Date(eventTime).getTime() - Date.now()) / 60000));
  const labels = highImpactWidgetText[language];

  if (minutes < 60) {
    return labels.minutes(minutes);
  }

  const hours = Math.round(minutes / 60);
  return labels.hours(hours);
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
  // TODO: Replace temporary userId with the authenticated session user id.
  const activeUserId = userId || DEFAULT_DASHBOARD_USER_ID;
  const [accounts, setAccounts] = useState(initialAccounts);
  const [trades, setTrades] = useState(initialTrades);
  const [stats, setStats] = useState(initialStats);
  const [highImpactEvents, setHighImpactEvents] = useState<EconomicEventDto[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const isRefreshingRef = useRef(false);
  const { language, t } = useLanguage();
  const eventLabels = highImpactWidgetText[language];

  useEffect(() => {
    setAccounts(initialAccounts);
    setTrades(initialTrades);
    setStats(initialStats);
  }, [initialAccounts, initialStats, initialTrades]);

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
      </div>

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

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              {t("dashboard.overview.recentTrades")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("dashboard.overview.latestEntries").replace("{userId}", activeUserId)}
            </p>
          </div>
          <PnlText value={stats.totalPnl} />
        </div>
      </div>

      <TradeTable trades={trades} />
    </div>
  );
}
