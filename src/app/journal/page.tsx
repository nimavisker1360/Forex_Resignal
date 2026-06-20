import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Eye, Plus, RotateCcw, Search } from "lucide-react";
import {
  fetchJournalApi,
  type JournalSummaryResponse,
  mapPrismaTradeToJournalTrade,
  type PrismaTradesResponse,
} from "@/app/journal/_lib/journal-api";
import { ManualTradeForm } from "@/app/journal/manual-trade-form";
import { DashboardText } from "@/components/dashboard/DashboardText";
import { StrategyComplianceBadge } from "@/components/journal/StrategyComplianceBadge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type JournalPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function appendParam(params: URLSearchParams, name: string, value: string | undefined) {
  if (value && value.trim()) {
    params.set(name, value.trim());
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }

  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
}

function badgeClass(kind: "status" | "side", value: string | null | undefined) {
  const normalized = String(value || "").toLowerCase();

  if (kind === "side") {
    return normalized === "sell"
      ? "border-red-500/30 bg-red-500/10 text-[#EF4444]"
      : "border-emerald-500/30 bg-emerald-500/10 text-[#10B981]";
  }

  if (normalized === "closed") {
    return "border-emerald-500/30 bg-emerald-500/10 text-[#10B981]";
  }

  if (normalized === "open") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }

  return "border-slate-700 bg-slate-900 text-slate-300";
}

function planBadgeClass(value: string | null | undefined) {
  if (value === "YES") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (value === "PARTIAL") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }

  if (value === "NO") {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  return "border-slate-700 bg-slate-900 text-slate-300";
}

function SummaryCard({
  label,
  value,
  tone = "neutral",
}: {
  label: ReactNode;
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
    <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
      <div className="text-xs font-medium uppercase text-slate-400">{label}</div>
      <div className={cn("mt-2 text-2xl font-semibold", toneClass)}>{value}</div>
    </div>
  );
}

function buildPageHref(page: number, values: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "50");

  for (const [name, value] of Object.entries(values)) {
    appendParam(params, name, value);
  }

  return `/journal?${params.toString()}`;
}

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const params = (await searchParams) || {};
  const filters = {
    symbol: first(params.symbol) || "",
    status: first(params.status) || "",
    result: first(params.result) || "",
    tradeType: first(params.tradeType) || "",
    dateFrom: first(params.dateFrom) || "",
    dateTo: first(params.dateTo) || "",
  };
  const page = first(params.page) || "1";
  const query = new URLSearchParams();
  query.set("limit", "50");
  query.set("page", page);

  appendParam(query, "symbol", filters.symbol);
  appendParam(query, "status", filters.status);
  appendParam(query, "direction", filters.tradeType);
  appendParam(query, "dateFrom", filters.dateFrom);
  appendParam(query, "dateTo", filters.dateTo);

  const [prismaData, summaryData] = await Promise.all([
    fetchJournalApi<PrismaTradesResponse>(`/api/journal/trades?${query.toString()}`),
    fetchJournalApi<JournalSummaryResponse>(`/api/journal/summary?${query.toString()}`),
  ]);
  let trades = (prismaData.data?.trades || prismaData.trades || []).map(
    mapPrismaTradeToJournalTrade
  );
  const summary = summaryData.summary;

  if (filters.result) {
    trades = trades.filter((trade) => trade.result === filters.result);
  }

  const pagination =
    prismaData.data?.pagination || prismaData.pagination || {
      page: Number(page),
      limit: 50,
      total: trades.length,
      totalPages: 1,
    };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white"><DashboardText k="journal.trades.title" /></h1>
          <p className="mt-1 text-sm text-slate-400">
            <DashboardText k="journal.trades.subtitle" />
          </p>
        </div>
      </div>

      <ManualTradeForm />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label={<DashboardText k="journal.analytics.totalTrades" />}
          value={formatNumber(summary.totalTrades, 0)}
          tone="blue"
        />
        <SummaryCard
          label={<DashboardText k="journal.analytics.winRate" />}
          value={`${formatNumber(summary.winRate, 1)}%`}
          tone="profit"
        />
        <SummaryCard
          label={<DashboardText k="journal.analytics.totalNetPnl" />}
          value={formatNumber(summary.totalPnL, 2)}
          tone={summary.totalPnL > 0 ? "profit" : summary.totalPnL < 0 ? "loss" : "neutral"}
        />
        <SummaryCard
          label={<DashboardText k="journal.analytics.profitFactor" />}
          value={formatNumber(summary.profitFactor, 2)}
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white"><DashboardText k="journal.trades.filters" /></h2>
            <p className="text-xs text-slate-400"><DashboardText k="journal.trades.filtersDescription" /></p>
          </div>
        </div>

        <form className="grid gap-3 md:grid-cols-7">
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            <DashboardText k="journal.tradeDetail.symbol" />
            <input
              name="symbol"
              defaultValue={filters.symbol}
              placeholder="EURUSD"
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm uppercase text-[#E5E7EB] outline-none focus:border-blue-600"
            />
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            <DashboardText k="journal.tradeDetail.status" />
            <select
              name="status"
              defaultValue={filters.status}
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            >
              <option value="">All</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            <DashboardText k="journal.trades.result" />
            <select
              name="result"
              defaultValue={filters.result}
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="breakeven">Breakeven</option>
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            <DashboardText k="journal.trades.buySell" />
            <select
              name="tradeType"
              defaultValue={filters.tradeType}
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            >
              <option value="">All</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            <DashboardText k="journal.trades.from" />
            <input
              name="dateFrom"
              type="date"
              defaultValue={filters.dateFrom}
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            />
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            <DashboardText k="journal.trades.to" />
            <input
              name="dateTo"
              type="date"
              defaultValue={filters.dateTo}
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            />
          </label>
          <div className="flex gap-2 self-end">
            <button
              type="submit"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500"
            >
              <Search className="h-4 w-4" />
              <DashboardText k="journal.trades.filter" />
            </button>
            <Link
              href="/journal"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800"
              aria-label="Clear filters"
              title="Clear filters"
            >
              <RotateCcw className="h-4 w-4" />
            </Link>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0F172A] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-[#111827] text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3"><DashboardText k="journal.trades.openTime" /></th>
                <th className="px-3 py-3"><DashboardText k="journal.tradeDetail.symbol" /></th>
                <th className="px-3 py-3"><DashboardText k="journal.trades.direction" /></th>
                <th className="px-3 py-3"><DashboardText k="journal.tradeDetail.account" /></th>
                <th className="px-3 py-3"><DashboardText k="journal.tradeDetail.strategy" /></th>
                <th className="px-3 py-3"><DashboardText k="journal.strategyReview.plan" /></th>
                <th className="px-3 py-3"><DashboardText k="journal.trades.compliance" /></th>
                <th className="px-3 py-3"><DashboardText k="journal.tradeDetail.entry" /></th>
                <th className="px-3 py-3"><DashboardText k="journal.tradeDetail.exit" /></th>
                <th className="px-3 py-3">PnL</th>
                <th className="px-3 py-3">R:R</th>
                <th className="px-3 py-3"><DashboardText k="journal.tradeDetail.status" /></th>
                <th className="px-3 py-3"><DashboardText k="journal.trades.actions" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {trades.map((trade) => (
                <tr key={trade._id} className="text-[#E5E7EB] hover:bg-slate-800/50">
                  <td className="whitespace-nowrap px-4 py-4 text-slate-300">
                    {formatDate(trade.openTime)}
                  </td>
                  <td className="px-3 py-4 font-semibold text-white">
                    <Link href={`/journal/${trade._id}`} className="hover:text-blue-200">
                      {trade.symbol}
                    </Link>
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize",
                        badgeClass("side", trade.tradeType)
                      )}
                    >
                      {trade.tradeType === "sell" ? (
                        <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUp className="h-3 w-3" />
                      )}
                      <DashboardText k={trade.tradeType === "sell" ? "journal.tradeDetail.sell" : "journal.tradeDetail.buy"} />
                    </span>
                  </td>
                  <td className="px-3 py-4 text-slate-300">{trade.accountNumber || "-"}</td>
                  <td className="px-3 py-4 text-slate-300">
                    {trade.strategyReview?.strategyNameSnapshot || trade.session || "-"}
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold",
                        planBadgeClass(trade.strategyReview?.followedPlan)
                      )}
                    >
                      <DashboardText
                        k={
                          trade.strategyReview?.followedPlan === "YES"
                            ? "journal.strategyReview.yes"
                            : trade.strategyReview?.followedPlan === "PARTIAL"
                              ? "journal.strategyReview.partial"
                              : trade.strategyReview?.followedPlan === "NO"
                                ? "journal.strategyReview.no"
                                : "journal.strategyReview.notReviewed"
                        }
                      />
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <StrategyComplianceBadge
                      percent={trade.strategyReview?.compliancePercent}
                      violatedRules={trade.strategyReview?.violatedRules || 0}
                      reviewed={Boolean(trade.strategyReview)}
                    />
                  </td>
                  <td className="px-3 py-4">{formatNumber(trade.entryPrice, 5)}</td>
                  <td className="px-3 py-4">{formatNumber(trade.closePrice, 5)}</td>
                  <td
                    className={cn(
                      "px-3 py-4 font-semibold",
                      Number(trade.profit || 0) > 0 && "text-[#10B981]",
                      Number(trade.profit || 0) < 0 && "text-[#EF4444]",
                      !trade.profit && "text-slate-300"
                    )}
                  >
                    {formatNumber(trade.profit, 2)}
                  </td>
                  <td className="px-3 py-4">{formatNumber(trade.actualRR, 2)}</td>
                  <td className="px-3 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize",
                        badgeClass("status", trade.status)
                      )}
                    >
                      <DashboardText
                        k={
                          trade.status === "closed"
                            ? "journal.tradeDetail.closed"
                            : trade.status === "open"
                              ? "journal.tradeDetail.open"
                              : "journal.tradeDetail.cancelled"
                        }
                      />
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <Link
                      href={`/journal/${trade._id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800"
                      aria-label="View trade"
                      title="View trade"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {trades.length === 0 && (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-[#111827] text-slate-400">
              <Plus className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white"><DashboardText k="journal.trades.emptyTitle" /></h3>
            <p className="mt-1 text-sm text-slate-400"><DashboardText k="journal.trades.emptyDescription" /></p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          <DashboardText k="journal.trades.page" /> {pagination.page} <DashboardText k="journal.trades.of" /> {pagination.totalPages} / {pagination.total} <DashboardText k="journal.analytics.trades" />
        </span>
        <div className="flex gap-2">
          <Link
            href={buildPageHref(Math.max(pagination.page - 1, 1), filters)}
            className={cn(
              "rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-800",
              pagination.page <= 1 && "pointer-events-none opacity-40"
            )}
          >
            <DashboardText k="journal.trades.previous" />
          </Link>
          <Link
            href={buildPageHref(Math.min(pagination.page + 1, pagination.totalPages), filters)}
            className={cn(
              "rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-800",
              pagination.page >= pagination.totalPages && "pointer-events-none opacity-40"
            )}
          >
            <DashboardText k="journal.trades.next" />
          </Link>
        </div>
      </div>
    </div>
  );
}
