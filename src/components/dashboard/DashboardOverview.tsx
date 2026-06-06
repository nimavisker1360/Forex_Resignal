"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BriefcaseBusiness, CircleDollarSign, Percent } from "lucide-react";
import { PnlText } from "@/components/dashboard/PnlText";
import { StatCard } from "@/components/dashboard/StatCard";
import { TradeTable } from "@/components/dashboard/TradeTable";
import {
  DEFAULT_DASHBOARD_USER_ID,
  formatMoney,
  toNumber,
  type ApiResult,
  type TradeDto,
  type TradesListData,
  type TradingAccountDto,
} from "@/components/dashboard/types";

export function DashboardOverview({ userId }: { userId?: string }) {
  // TODO: Replace temporary userId with the authenticated session user id.
  const activeUserId = userId || DEFAULT_DASHBOARD_USER_ID;
  const [accounts, setAccounts] = useState<TradingAccountDto[]>([]);
  const [trades, setTrades] = useState<TradeDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadData() {
      setLoading(true);
      const [accountsResponse, tradesResponse] = await Promise.all([
        fetch(`/api/trading-accounts?userId=${encodeURIComponent(activeUserId)}`),
        fetch(`/api/trades?userId=${encodeURIComponent(activeUserId)}&limit=100`),
      ]);
      const accountsJson =
        (await accountsResponse.json()) as ApiResult<TradingAccountDto[]>;
      const tradesJson = (await tradesResponse.json()) as ApiResult<TradesListData>;

      if (!alive) {
        return;
      }

      setAccounts(accountsJson.data || []);
      setTrades(tradesJson.data?.trades || []);
      setLoading(false);
    }

    loadData().catch(() => setLoading(false));

    return () => {
      alive = false;
    };
  }, [activeUserId]);

  const stats = useMemo(() => {
    const closedTrades = trades.filter((trade) => trade.status === "CLOSED");
    const wins = closedTrades.filter((trade) => Number(trade.profitLoss || 0) > 0);
    const totalPnl = trades.reduce(
      (total, trade) => total + (toNumber(trade.profitLoss) || 0),
      0
    );

    return {
      totalPnl,
      winRate:
        closedTrades.length > 0 ? Math.round((wins.length / closedTrades.length) * 100) : 0,
      openTrades: trades.filter((trade) => trade.status === "OPEN").length,
    };
  }, [trades]);

  const recentTrades = trades.slice(0, 8);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-400">
            Account performance, open risk, and recent trade activity.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total Accounts"
          value={loading ? "-" : String(accounts.length)}
          icon={<BriefcaseBusiness className="h-4 w-4" />}
          tone="blue"
        />
        <StatCard
          label="Total Trades"
          value={loading ? "-" : String(trades.length)}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          label="Total PnL"
          value={loading ? "-" : formatMoney(stats.totalPnl)}
          icon={<CircleDollarSign className="h-4 w-4" />}
          tone={stats.totalPnl >= 0 ? "green" : "red"}
        />
        <StatCard
          label="Win Rate"
          value={loading ? "-" : `${stats.winRate}%`}
          icon={<Percent className="h-4 w-4" />}
          tone="green"
        />
        <StatCard
          label="Open Trades"
          value={loading ? "-" : String(stats.openTrades)}
          icon={<Activity className="h-4 w-4" />}
          tone="blue"
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Trades</h2>
            <p className="text-sm text-slate-400">
              Latest manual journal entries for {activeUserId}.
            </p>
          </div>
          <PnlText value={stats.totalPnl} />
        </div>
      </div>

      <TradeTable trades={recentTrades} />
    </div>
  );
}
