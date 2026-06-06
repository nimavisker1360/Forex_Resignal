import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, Plus, RotateCcw, Search } from "lucide-react";
import {
  fetchJournalApi,
  mapPrismaTradeToJournalTrade,
  type PrismaTradesResponse,
} from "@/app/journal/_lib/journal-api";
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

  const prismaData = await fetchJournalApi<PrismaTradesResponse>(
    `/api/trades?${query.toString()}`
  );
  let trades = (prismaData.data?.trades || prismaData.trades || []).map(
    mapPrismaTradeToJournalTrade
  );

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
          <h1 className="text-2xl font-semibold text-white">Trade Journal</h1>
          <p className="mt-1 text-sm text-slate-400">
            Review trades, screenshots, psychology notes, and performance.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Filters</h2>
            <p className="text-xs text-slate-400">Narrow the journal by symbol, status, result, direction, and date.</p>
          </div>
          <Link
            href="/dashboard/trades?userId=demo-user"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            New Trade
          </Link>
        </div>

        <form className="grid gap-3 md:grid-cols-7">
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
            Status
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
            Result
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
            Buy/Sell
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
          <div className="flex gap-2 self-end">
            <button
              type="submit"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500"
            >
              <Search className="h-4 w-4" />
              Filter
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
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-[#111827] text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Open Time</th>
                <th className="px-3 py-3">Symbol</th>
                <th className="px-3 py-3">Direction</th>
                <th className="px-3 py-3">Account</th>
                <th className="px-3 py-3">Entry</th>
                <th className="px-3 py-3">Exit</th>
                <th className="px-3 py-3">PnL</th>
                <th className="px-3 py-3">R:R</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Actions</th>
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
                      {trade.tradeType}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-slate-300">{trade.accountNumber || "-"}</td>
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
                      {trade.status}
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
            <h3 className="mt-4 text-base font-semibold text-white">No trades found</h3>
            <p className="mt-1 text-sm text-slate-400">Create your first trade or clear the active filters.</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          Page {pagination.page} of {pagination.totalPages} / {pagination.total} trades
        </span>
        <div className="flex gap-2">
          <Link
            href={buildPageHref(Math.max(pagination.page - 1, 1), filters)}
            className={cn(
              "rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-800",
              pagination.page <= 1 && "pointer-events-none opacity-40"
            )}
          >
            Previous
          </Link>
          <Link
            href={buildPageHref(Math.min(pagination.page + 1, pagination.totalPages), filters)}
            className={cn(
              "rounded-xl border border-slate-800 px-3 py-2 hover:bg-slate-800",
              pagination.page >= pagination.totalPages && "pointer-events-none opacity-40"
            )}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
