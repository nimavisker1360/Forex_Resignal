import { Activity, BarChart3, CircleDollarSign, Percent, Target } from "lucide-react";
import {
  fetchJournalApi,
  type JournalStatsResponse,
} from "@/app/journal/_lib/journal-api";

export const dynamic = "force-dynamic";

function formatNumber(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }

  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
}

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "profit" | "loss" | "blue";
}) {
  const toneClass =
    tone === "profit"
      ? "text-emerald-300"
      : tone === "loss"
        ? "text-red-300"
        : tone === "blue"
          ? "text-blue-200"
          : "text-white";

  return (
    <div className="border border-white/10 bg-gray-950/90 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium uppercase text-gray-500">{label}</span>
        <BarChart3 className="h-4 w-4 text-gray-600" />
      </div>
      <div className={`mt-3 text-2xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

export default async function JournalAnalyticsPage() {
  const { stats } = await fetchJournalApi<JournalStatsResponse>("/api/journal/stats");
  const profitTone = stats.totalProfit > 0 ? "profit" : stats.totalProfit < 0 ? "loss" : "neutral";

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Trades" value={formatNumber(stats.totalTrades, 0)} tone="blue" />
        <StatCard label="Closed Trades" value={formatNumber(stats.closedTrades, 0)} />
        <StatCard label="Win Rate" value={`${formatNumber(stats.winRate, 1)}%`} tone="profit" />
        <StatCard label="Total Profit" value={formatNumber(stats.totalProfit, 2)} tone={profitTone} />
        <StatCard label="Profit Factor" value={formatNumber(stats.profitFactor, 2)} />
        <StatCard label="Average RR" value={formatNumber(stats.averageRR, 2)} />
        <StatCard label="Expectancy" value={formatNumber(stats.expectancy, 2)} />
        <StatCard label="Best Symbol" value={stats.bestSymbol || "-"} tone="blue" />
        <StatCard label="Worst Symbol" value={stats.worstSymbol || "-"} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="border border-white/10 bg-gray-950/90 p-4">
          <Activity className="mb-3 h-5 w-5 text-blue-300" />
          <div className="text-sm font-semibold text-white">Open Trades</div>
          <div className="mt-1 text-2xl font-semibold text-blue-200">
            {formatNumber(stats.openTrades, 0)}
          </div>
        </div>
        <div className="border border-white/10 bg-gray-950/90 p-4">
          <CircleDollarSign className="mb-3 h-5 w-5 text-emerald-300" />
          <div className="text-sm font-semibold text-white">Expectancy</div>
          <div className="mt-1 text-2xl font-semibold text-white">
            {formatNumber(stats.expectancy, 2)}
          </div>
        </div>
        <div className="border border-white/10 bg-gray-950/90 p-4">
          <Target className="mb-3 h-5 w-5 text-gray-400" />
          <div className="text-sm font-semibold text-white">Average RR</div>
          <div className="mt-1 flex items-center gap-2 text-2xl font-semibold text-white">
            {formatNumber(stats.averageRR, 2)}
            <Percent className="h-4 w-4 text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
