import Link from "next/link";
import type { ReactNode } from "react";
import {
  BarChart3,
  CircleDollarSign,
  Percent,
  RotateCcw,
  Table2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  fetchJournalApi,
  type PrismaTradingAccountsResponse,
} from "@/app/journal/_lib/journal-api";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DEFAULT_USER_ID = "demo-user";

type AnalyticsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type Summary = {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  averagePnL: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  maxWinStreak: number;
  maxLossStreak: number;
  averageRR: number;
  totalVolume: number;
};

type PnlPoint = {
  date: string;
  pnl: number;
  totalTrades: number;
  winRate: number;
};

type PnlMetric = {
  pnl: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
};

type AnalyticsResponse = {
  success: boolean;
  summary: Summary;
  charts: {
    pnlByDay: PnlPoint[];
    pnlBySymbol: Array<PnlMetric & { symbol: string }>;
    winRateBySymbol: Array<Pick<PnlMetric, "totalTrades" | "winningTrades" | "losingTrades" | "winRate"> & { symbol: string }>;
    pnlByStrategy: Array<PnlMetric & { strategy: string }>;
    pnlByDirection: Array<PnlMetric & { direction: string }>;
    pnlByAccount: Array<PnlMetric & { account: string }>;
    pnlByTag: Array<PnlMetric & { tag: string }>;
    emotionPerformance: Array<PnlMetric & { emotion: string }>;
  };
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatMoney(value: number | null | undefined) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function formatNumber(value: number | null | undefined, digits = 2) {
  return Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
}

function appendParam(params: URLSearchParams, name: string, value: string | undefined) {
  if (value && value.trim()) {
    params.set(name, value.trim());
  }
}

function StatCard({
  label,
  value,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: "neutral" | "profit" | "loss" | "blue";
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium uppercase text-slate-400">{label}</span>
        <span
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-[#111827] text-slate-500",
            tone === "profit" && "text-[#10B981]",
            tone === "loss" && "text-[#EF4444]",
            tone === "blue" && "text-blue-300"
          )}
        >
          {icon}
        </span>
      </div>
      <div
        className={cn(
          "mt-4 text-2xl font-semibold text-white",
          tone === "profit" && "text-[#10B981]",
          tone === "loss" && "text-[#EF4444]",
          tone === "blue" && "text-blue-200"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function EquityLineChart({ points }: { points: PnlPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-800 bg-[#111827] text-sm text-slate-400">
        No trades found for this period
      </div>
    );
  }

  let cumulative = 0;
  const values = points.map((point) => {
    cumulative += point.pnl;
    return cumulative;
  });
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;
  const width = 720;
  const height = 260;
  const padding = 24;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const coordinates = values.map((value, index) => {
    const x =
      values.length === 1
        ? width / 2
        : padding + (index / (values.length - 1)) * innerWidth;
    const y = padding + ((max - value) / range) * innerHeight;
    return `${x},${y}`;
  });
  const zeroY = padding + ((max - 0) / range) * innerHeight;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#111827]">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-72 w-full"
        role="img"
        aria-label="Equity by day line chart"
      >
        <line
          x1={padding}
          x2={width - padding}
          y1={zeroY}
          y2={zeroY}
          stroke="#334155"
          strokeDasharray="5 5"
        />
        <polyline
          fill="none"
          stroke="#60A5FA"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
          points={coordinates.join(" ")}
        />
        {coordinates.map((coordinate, index) => {
          const [x, y] = coordinate.split(",").map(Number);
          return (
            <circle
              key={`${points[index].date}-${index}`}
              cx={x}
              cy={y}
              r="5"
              fill={values[index] >= 0 ? "#10B981" : "#EF4444"}
              stroke="#020617"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
}

function BarList<T extends PnlMetric>({
  title,
  items,
  labelKey,
}: {
  title: string;
  items: T[];
  labelKey: keyof T;
}) {
  const maxAbs = Math.max(...items.map((item) => Math.abs(item.pnl)), 1);

  return (
    <section className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <BarChart3 className="h-4 w-4 text-slate-500" />
      </div>
      <div className="space-y-3">
        {items.slice(0, 8).map((item) => {
          const label = String(item[labelKey] || "Unspecified");
          const width = `${Math.max((Math.abs(item.pnl) / maxAbs) * 100, 6)}%`;

          return (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-slate-200">{label}</span>
                <span
                  className={cn(
                    "font-semibold text-slate-300",
                    item.pnl > 0 && "text-[#10B981]",
                    item.pnl < 0 && "text-[#EF4444]"
                  )}
                >
                  {formatMoney(item.pnl)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={cn(
                    "h-full rounded-full",
                    item.pnl > 0 ? "bg-[#10B981]" : item.pnl < 0 ? "bg-[#EF4444]" : "bg-slate-500"
                  )}
                  style={{ width }}
                />
              </div>
              <div className="text-xs text-slate-500">
                {item.totalTrades} trades / {formatNumber(item.winRate, 1)}% win rate
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-800 bg-[#111827] px-4 py-10 text-center text-sm text-slate-400">
            No trades found for this period
          </div>
        )}
      </div>
    </section>
  );
}

function WinRateTable({
  items,
}: {
  items: AnalyticsResponse["charts"]["winRateBySymbol"];
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-white">Win Rate by Symbol</h2>
        <Table2 className="h-4 w-4 text-slate-500" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="py-2">Symbol</th>
              <th className="py-2">Trades</th>
              <th className="py-2">Wins</th>
              <th className="py-2">Losses</th>
              <th className="py-2">Win Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {items.map((item) => (
              <tr key={item.symbol} className="text-slate-300">
                <td className="py-3 font-semibold text-white">{item.symbol}</td>
                <td className="py-3">{item.totalTrades}</td>
                <td className="py-3 text-[#10B981]">{item.winningTrades}</td>
                <td className="py-3 text-[#EF4444]">{item.losingTrades}</td>
                <td className="py-3">{formatNumber(item.winRate, 1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-800 bg-[#111827] px-4 py-10 text-center text-sm text-slate-400">
          No trades found for this period
        </div>
      )}
    </section>
  );
}

export default async function JournalAnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = (await searchParams) || {};
  const filters = {
    dateFrom: first(params.dateFrom) || "",
    dateTo: first(params.dateTo) || "",
    accountId: first(params.accountId) || "",
    symbol: first(params.symbol) || "",
    strategy: first(params.strategy) || "",
    tag: first(params.tag) || "",
  };
  const query = new URLSearchParams();

  for (const [name, value] of Object.entries(filters)) {
    appendParam(query, name, value);
  }

  const [analyticsData, accountsData] = await Promise.all([
    fetchJournalApi<AnalyticsResponse>(
      `/api/journal/analytics${query.toString() ? `?${query.toString()}` : ""}`
    ),
    fetchJournalApi<PrismaTradingAccountsResponse>(
      `/api/trading-accounts?userId=${DEFAULT_USER_ID}`
    ).catch(
      (): PrismaTradingAccountsResponse => ({ success: false, data: [] })
    ),
  ]);
  const accounts = accountsData.data || accountsData.accounts || [];
  const { summary, charts } = analyticsData;
  const totalTone =
    summary.totalPnL > 0 ? "profit" : summary.totalPnL < 0 ? "loss" : "neutral";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Professional journal performance analytics from saved trades.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
        <form className="grid gap-3 md:grid-cols-7">
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            From
            <input
              name="dateFrom"
              type="date"
              defaultValue={filters.dateFrom}
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            />
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            To
            <input
              name="dateTo"
              type="date"
              defaultValue={filters.dateTo}
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            />
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            Account
            <select
              name="accountId"
              defaultValue={filters.accountId}
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            >
              <option value="">All</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            Symbol
            <input
              name="symbol"
              defaultValue={filters.symbol}
              placeholder="EURUSD"
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm uppercase text-[#E5E7EB] outline-none focus:border-blue-600"
            />
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            Strategy
            <input
              name="strategy"
              defaultValue={filters.strategy}
              placeholder="London"
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm text-[#E5E7EB] outline-none focus:border-blue-600"
            />
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            Tag
            <input
              name="tag"
              defaultValue={filters.tag}
              placeholder="A+"
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm text-[#E5E7EB] outline-none focus:border-blue-600"
            />
          </label>
          <div className="flex gap-2 self-end">
            <button
              type="submit"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Apply
            </button>
            <Link
              href="/journal/analytics"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800"
              aria-label="Clear filters"
              title="Clear filters"
            >
              <RotateCcw className="h-4 w-4" />
            </Link>
          </div>
        </form>
      </div>

      {summary.totalTrades === 0 && (
        <div className="rounded-xl border border-dashed border-slate-800 bg-[#0F172A] px-4 py-5 text-sm text-slate-400">
          No trades found for this period
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total PnL"
          value={formatMoney(summary.totalPnL)}
          icon={<CircleDollarSign className="h-4 w-4" />}
          tone={totalTone}
        />
        <StatCard
          label="Win Rate"
          value={`${formatNumber(summary.winRate, 1)}%`}
          icon={<Percent className="h-4 w-4" />}
          tone="blue"
        />
        <StatCard
          label="Profit Factor"
          value={formatNumber(summary.profitFactor, 2)}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          label="Total Trades"
          value={formatNumber(summary.totalTrades, 0)}
          icon={<Table2 className="h-4 w-4" />}
          tone="blue"
        />
        <StatCard
          label="Average Win"
          value={formatMoney(summary.averageWin)}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="profit"
        />
        <StatCard
          label="Average Loss"
          value={formatMoney(summary.averageLoss)}
          icon={<TrendingDown className="h-4 w-4" />}
          tone="loss"
        />
        <StatCard
          label="Best Trade"
          value={formatMoney(summary.bestTrade)}
          icon={<TrendingUp className="h-4 w-4" />}
          tone={summary.bestTrade > 0 ? "profit" : "neutral"}
        />
        <StatCard
          label="Worst Trade"
          value={formatMoney(summary.worstTrade)}
          icon={<TrendingDown className="h-4 w-4" />}
          tone={summary.worstTrade < 0 ? "loss" : "neutral"}
        />
      </div>

      <section className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Equity / PnL by Day</h2>
            <p className="mt-1 text-xs text-slate-400">
              Cumulative curve based on daily realized PnL.
            </p>
          </div>
          <BarChart3 className="h-4 w-4 text-slate-500" />
        </div>
        <EquityLineChart points={charts.pnlByDay} />
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <BarList title="PnL by Symbol" items={charts.pnlBySymbol} labelKey="symbol" />
        <WinRateTable items={charts.winRateBySymbol} />
        <BarList title="BUY vs SELL Performance" items={charts.pnlByDirection} labelKey="direction" />
        <BarList title="Strategy Performance" items={charts.pnlByStrategy} labelKey="strategy" />
        <BarList title="Account Performance" items={charts.pnlByAccount} labelKey="account" />
        <BarList title="Emotion / Psychology Performance" items={charts.emotionPerformance} labelKey="emotion" />
      </div>

      {charts.pnlByTag.length > 0 && (
        <BarList title="Tag Performance" items={charts.pnlByTag} labelKey="tag" />
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Average PnL"
          value={formatMoney(summary.averagePnL)}
          icon={<CircleDollarSign className="h-4 w-4" />}
          tone={summary.averagePnL > 0 ? "profit" : summary.averagePnL < 0 ? "loss" : "neutral"}
        />
        <StatCard
          label="Average RR"
          value={formatNumber(summary.averageRR, 2)}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          label="Max Win Streak"
          value={formatNumber(summary.maxWinStreak, 0)}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="profit"
        />
        <StatCard
          label="Max Loss Streak"
          value={formatNumber(summary.maxLossStreak, 0)}
          icon={<TrendingDown className="h-4 w-4" />}
          tone="loss"
        />
      </div>
    </div>
  );
}
