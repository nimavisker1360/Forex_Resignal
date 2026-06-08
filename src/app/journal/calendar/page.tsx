import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  CircleDot,
  RotateCcw,
} from "lucide-react";
import {
  fetchJournalApi,
  mapPrismaTradeToJournalTrade,
  type PrismaTradingAccountsResponse,
  type PrismaTradesResponse,
} from "@/app/journal/_lib/journal-api";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DEFAULT_USER_ID = "demo-user";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type CalendarPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type CalendarDay = {
  date: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  totalPnL: number;
  winRate: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
};

type CalendarResponse = {
  success: boolean;
  month: number;
  year: number;
  days: CalendarDay[];
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function clampMonth(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 12 ? parsed : fallback;
}

function parseYear(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1970 && parsed <= 3000
    ? parsed
    : fallback;
}

function formatMoney(value: number | null | undefined) {
  const parsed = Number(value || 0);

  return parsed.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function formatNumber(value: number | null | undefined, digits = 2) {
  const parsed = Number(value || 0);

  return parsed.toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addParam(params: URLSearchParams, key: string, value: string | undefined) {
  if (value) {
    params.set(key, value);
  }
}

function monthLabel(month: number, year: number) {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function monthHref(month: number, year: number, accountId?: string) {
  const params = new URLSearchParams();
  params.set("month", String(month));
  params.set("year", String(year));
  addParam(params, "accountId", accountId);
  return `/journal/calendar?${params.toString()}`;
}

function selectedDateHref(
  month: number,
  year: number,
  date: string,
  accountId?: string
) {
  const params = new URLSearchParams();
  params.set("month", String(month));
  params.set("year", String(year));
  params.set("selectedDate", date);
  addParam(params, "accountId", accountId);
  return `/journal/calendar?${params.toString()}`;
}

function adjacentMonth(month: number, year: number, direction: -1 | 1) {
  const date = new Date(Date.UTC(year, month - 1 + direction, 1));
  return {
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
  };
}

function buildCalendarCells(month: number, year: number) {
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const leadingBlankDays = firstDay.getUTCDay();
  const cells: Array<{ day: number | null; date: string | null }> = [];

  for (let index = 0; index < leadingBlankDays; index += 1) {
    cells.push({ day: null, date: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      date: dateKey(new Date(Date.UTC(year, month - 1, day))),
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: null, date: null });
  }

  return cells;
}

function nextDateString(date: string) {
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString();
}

export default async function JournalCalendarPage({ searchParams }: CalendarPageProps) {
  const params = (await searchParams) || {};
  const today = new Date();
  const currentMonth = today.getUTCMonth() + 1;
  const currentYear = today.getUTCFullYear();
  const month = clampMonth(first(params.month), currentMonth);
  const year = parseYear(first(params.year), currentYear);
  const accountId = first(params.accountId) || "";
  const requestedSelectedDate = first(params.selectedDate);
  const previous = adjacentMonth(month, year, -1);
  const next = adjacentMonth(month, year, 1);
  const calendarQuery = new URLSearchParams();
  calendarQuery.set("month", String(month));
  calendarQuery.set("year", String(year));
  addParam(calendarQuery, "accountId", accountId);

  const [calendarData, accountsData] = await Promise.all([
    fetchJournalApi<CalendarResponse>(`/api/journal/calendar?${calendarQuery.toString()}`),
    fetchJournalApi<PrismaTradingAccountsResponse>(
      `/api/trading-accounts?userId=${DEFAULT_USER_ID}`
    ).catch(
      (): PrismaTradingAccountsResponse => ({ success: false, data: [] })
    ),
  ]);
  const selectedDate =
    requestedSelectedDate ||
    calendarData.days[0]?.date ||
    dateKey(new Date(Date.UTC(year, month - 1, 1)));
  const dayMap = new Map(calendarData.days.map((day) => [day.date, day]));
  const cells = buildCalendarCells(month, year);
  const accounts = accountsData.data || accountsData.accounts || [];
  const selectedTradesQuery = new URLSearchParams();
  selectedTradesQuery.set("limit", "100");
  selectedTradesQuery.set("dateFrom", `${selectedDate}T00:00:00.000Z`);
  selectedTradesQuery.set("dateTo", nextDateString(selectedDate));
  addParam(selectedTradesQuery, "accountId", accountId);
  const selectedTradesData = await fetchJournalApi<PrismaTradesResponse>(
    `/api/journal/trades?${selectedTradesQuery.toString()}`
  ).catch((): PrismaTradesResponse => ({ success: false, trades: [] }));
  const selectedTrades = (
    selectedTradesData.data?.trades || selectedTradesData.trades || []
  )
    .map(mapPrismaTradeToJournalTrade)
    .filter((trade) => trade.openTime && dateKey(new Date(trade.openTime)) === selectedDate);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Trading Calendar</h1>
          <p className="mt-1 text-sm text-slate-400">
            Monthly performance grouped by trade entry date.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={monthHref(previous.month, previous.year, accountId)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-800 px-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Link>
          <Link
            href={monthHref(currentMonth, currentYear, accountId)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-800 px-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Current
          </Link>
          <Link
            href={monthHref(next.month, next.year, accountId)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-800 px-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-[#111827] text-blue-300">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">{monthLabel(month, year)}</h2>
              <p className="text-xs text-slate-400">
                {calendarData.days.length > 0
                  ? `${calendarData.days.length} active trading days`
                  : "No trades found for this period"}
              </p>
            </div>
          </div>

          {accounts.length > 0 && (
            <form className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input type="hidden" name="month" value={month} />
              <input type="hidden" name="year" value={year} />
              <select
                name="accountId"
                defaultValue={accountId}
                className="h-10 rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm text-[#E5E7EB] outline-none focus:border-blue-600"
              >
                <option value="">All accounts</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="h-10 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Apply
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0F172A] shadow-sm">
          <div className="grid grid-cols-7 border-b border-slate-800 bg-[#111827] text-center text-xs font-semibold uppercase text-slate-400">
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} className="px-2 py-3">
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((cell, index) => {
              const day = cell.date ? dayMap.get(cell.date) : null;
              const totalPnL = day?.totalPnL || 0;
              const isProfit = totalPnL > 0;
              const isLoss = totalPnL < 0;
              const isToday = cell.date === dateKey(today);
              const isSelected = cell.date === selectedDate;

              if (!cell.day || !cell.date) {
                return (
                  <div
                    key={`blank-${index}`}
                    className="min-h-[126px] border-b border-r border-slate-800 bg-[#08111F]/60"
                  />
                );
              }

              return (
                <Link
                  key={cell.date}
                  href={selectedDateHref(month, year, cell.date, accountId)}
                  className={cn(
                    "group min-h-[126px] border-b border-r border-slate-800 bg-[#0B1220] p-3 transition hover:bg-slate-800/70",
                    isProfit && "bg-emerald-950/20",
                    isLoss && "bg-red-950/20",
                    isToday && "ring-1 ring-inset ring-blue-500",
                    isSelected && "outline outline-1 outline-blue-300"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-white">{cell.day}</span>
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-lg border border-slate-800 text-slate-500",
                        isProfit && "border-emerald-500/40 text-[#10B981]",
                        isLoss && "border-red-500/40 text-[#EF4444]"
                      )}
                    >
                      {isProfit ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : isLoss ? (
                        <ArrowDown className="h-3.5 w-3.5" />
                      ) : (
                        <CircleDot className="h-3.5 w-3.5" />
                      )}
                    </span>
                  </div>

                  <div className="mt-7 space-y-1">
                    <div
                      className={cn(
                        "text-sm font-semibold text-slate-300",
                        isProfit && "text-[#10B981]",
                        isLoss && "text-[#EF4444]"
                      )}
                    >
                      {formatMoney(totalPnL)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {day ? `${day.totalTrades} trades` : "No trades"}
                    </div>
                    {day && (
                      <div className="text-xs text-slate-400">
                        {formatNumber(day.winRate, 1)}% win rate
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">{selectedDate}</h2>
              <p className="mt-1 text-xs text-slate-400">
                {selectedTrades.length > 0
                  ? `${selectedTrades.length} trades opened`
                  : "No trades found for this period"}
              </p>
            </div>
            <div
              className={cn(
                "rounded-xl border border-slate-800 bg-[#111827] px-3 py-2 text-sm font-semibold text-slate-300",
                (dayMap.get(selectedDate)?.totalPnL || 0) > 0 && "text-[#10B981]",
                (dayMap.get(selectedDate)?.totalPnL || 0) < 0 && "text-[#EF4444]"
              )}
            >
              {formatMoney(dayMap.get(selectedDate)?.totalPnL || 0)}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {selectedTrades.map((trade) => (
              <Link
                key={trade._id}
                href={`/journal/${trade._id}`}
                className="block rounded-xl border border-slate-800 bg-[#111827] p-3 transition hover:border-blue-500/60 hover:bg-slate-800/70"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{trade.symbol}</div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                      {trade.tradeType} / {trade.status}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-sm font-semibold text-slate-300",
                      Number(trade.profit || 0) > 0 && "text-[#10B981]",
                      Number(trade.profit || 0) < 0 && "text-[#EF4444]"
                    )}
                  >
                    {formatMoney(Number(trade.profit || 0))}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-500">Entry</span>
                    <div className="mt-1 text-slate-200">
                      {formatNumber(Number(trade.entryPrice || 0), 5)}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Exit</span>
                    <div className="mt-1 text-slate-200">
                      {trade.closePrice === null
                        ? "-"
                        : formatNumber(Number(trade.closePrice || 0), 5)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {selectedTrades.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-800 bg-[#111827] px-4 py-10 text-center">
                <div className="text-sm font-semibold text-white">No trades found for this period</div>
                <p className="mt-1 text-xs text-slate-400">
                  Select another day, month, or account filter.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
