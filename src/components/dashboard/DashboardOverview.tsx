"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, BriefcaseBusiness, CircleDollarSign, Percent } from "lucide-react";
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
  const isRefreshingRef = useRef(false);
  const { t } = useLanguage();

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
