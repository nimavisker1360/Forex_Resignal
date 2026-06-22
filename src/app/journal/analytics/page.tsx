"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  AlertTriangle,
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  Brain,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  Filter,
  LineChart as LineChartIcon,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  Star,
  Tags,
  Target,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SubscriptionLockedFeature } from "@/components/subscription/SubscriptionLockedFeature";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import type {
  AnalyticsDirectionalStats,
  HourlyAnalyticsRow,
  JournalAnalyticsResponse,
  StrategyAnalyticsRow,
  SymbolAnalyticsRow,
  TagAnalyticsRow,
} from "@/types/analytics";

type DateRange = "all" | "today" | "thisWeek" | "thisMonth" | "thisYear" | "custom";
type DirectionFilter = "" | "BUY" | "SELL";
type SortKey = keyof Pick<
  SymbolAnalyticsRow,
  "symbol" | "totalTrades" | "winRate" | "netPnl" | "averagePnl" | "profitFactor" | "bestTrade" | "worstTrade"
>;

type Filters = {
  dateRange: DateRange;
  dateFrom: string;
  dateTo: string;
  symbol: string;
  direction: DirectionFilter;
  strategy: string;
};

type ChartPayloadItem = {
  name?: string;
  value?: number;
  color?: string;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: ChartPayloadItem[];
  label?: string;
};

type ReviewTone = "neutral" | "profit" | "loss";

type ReviewListItem = {
  label: string;
  detail: string;
  tone: ReviewTone;
};

type EditableMetric = {
  id: string;
  label: string;
  value: string;
  tone: "neutral" | "profit" | "loss" | "blue" | "amber";
};

type JournalTradeOption = {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL";
  profitLoss: number | string | null;
  rr: number | string | null;
  setup: string | null;
  emotion: string | null;
  mistake: string | null;
  notes: string | null;
  openedAt: string | null;
  closedAt: string | null;
  entryScreenshotUrl?: string | null;
  exitScreenshotUrl?: string | null;
  status?: string | null;
  tags?: Array<{ tag?: { name?: string | null }; name?: string | null }>;
  screenshots?: Array<{ id?: string; type: string; url: string }>;
};

type TradeMetadata = {
  rating: number | null;
  mistakes: string[];
  setups: string[];
  emotions: string[];
  customTags: string[];
  tradeNote: string;
  dailyJournal: string;
  checklistResults: string[];
  psychologyStatus: string;
  exitReason: string;
};

type SaveStatus = "idle" | "loading" | "saving" | "saved" | "error";
type ReviewPanelTab = "entry" | "exit" | "trade" | "daily";
type PageError = {
  message: string;
  upgradeRequired?: boolean;
};

const EMPTY_FILTERS: Filters = {
  dateRange: "all",
  dateFrom: "",
  dateTo: "",
  symbol: "",
  direction: "",
  strategy: "",
};

const EMPTY_ANALYTICS: JournalAnalyticsResponse = {
  success: true,
  overview: {
    totalNetPnl: 0,
    grossProfit: 0,
    grossLoss: 0,
    winRate: 0,
    lossRate: 0,
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    breakEvenTrades: 0,
    averageWin: 0,
    averageLoss: 0,
    profitFactor: null,
    averageRR: 0,
    bestTrade: null,
    worstTrade: null,
    maxDrawdown: 0,
    currentDrawdown: 0,
    expectancyPerTrade: 0,
  },
  longShort: {
    buy: {
      direction: "BUY",
      totalTrades: 0,
      winRate: 0,
      netPnl: 0,
      averagePnl: 0,
      bestTrade: 0,
      worstTrade: 0,
    },
    sell: {
      direction: "SELL",
      totalTrades: 0,
      winRate: 0,
      netPnl: 0,
      averagePnl: 0,
      bestTrade: 0,
      worstTrade: 0,
    },
  },
  bySymbol: [],
  bySession: [],
  byWeekday: [],
  byHour: [],
  byStrategy: [],
  byPsychology: [],
  byMistake: [],
  byEmotion: [],
  bySetup: [],
  byTag: [],
  equityCurve: [],
  drawdownCurve: [],
  metadata: {
    symbols: [],
    strategies: [],
    hasStrategyData: false,
    hasPsychologyData: false,
    hasTagData: false,
  },
};

function formatMoney(value: number | null | undefined) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function formatNumber(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "N/A";
  }

  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
}

function formatPercent(value: number | null | undefined) {
  return `${formatNumber(value, 1)}%`;
}

function valueTone(value: number | null | undefined): "profit" | "loss" | "neutral" {
  const number = Number(value || 0);
  return number > 0 ? "profit" : number < 0 ? "loss" : "neutral";
}

function buildQuery(filters: Filters) {
  const params = new URLSearchParams();
  params.set("dateRange", filters.dateRange);

  if (filters.dateRange === "custom") {
    if (filters.dateFrom) {
      params.set("dateFrom", filters.dateFrom);
    }

    if (filters.dateTo) {
      params.set("dateTo", filters.dateTo);
    }
  }

  if (filters.symbol) {
    params.set("symbol", filters.symbol);
  }

  if (filters.direction) {
    params.set("direction", filters.direction);
  }

  if (filters.strategy) {
    params.set("strategy", filters.strategy);
  }

  return params.toString();
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
  tone?: "neutral" | "profit" | "loss" | "blue" | "amber";
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium uppercase text-slate-400">{label}</span>
        <span
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-[#111827] text-slate-500",
            tone === "profit" && "text-emerald-300",
            tone === "loss" && "text-red-300",
            tone === "blue" && "text-sky-300",
            tone === "amber" && "text-amber-300"
          )}
        >
          {icon}
        </span>
      </div>
      <div
        className={cn(
          "mt-4 text-2xl font-semibold text-white",
          tone === "profit" && "text-emerald-300",
          tone === "loss" && "text-red-300",
          tone === "blue" && "text-sky-200",
          tone === "amber" && "text-amber-200"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
        </div>
        <span className="text-slate-500">{icon}</span>
      </div>
      {children}
    </section>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-slate-800 bg-[#111827] px-4 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-lg border border-slate-800 bg-[#0F172A]"
        />
      ))}
    </div>
  );
}

function MoneyTooltip(props: ChartTooltipProps) {
  if (!props.active || !props.payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-[#020617] px-3 py-2 text-xs shadow-xl">
      <div className="mb-1 font-semibold text-white">{props.label}</div>
      <div className="space-y-1">
        {props.payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-5 text-slate-300">
            <span>{item.name}</span>
            <span style={{ color: item.color }}>{formatMoney(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PnlBarChart({
  data,
  xKey,
  height = 260,
}: {
  data: Array<Record<string, unknown>>;
  xKey: string;
  height?: number;
}) {
  const { t } = useLanguage();

  if (data.length === 0) {
    return <EmptyPanel message={t("journal.analytics.noTradesForReport")} />;
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1E293B" vertical={false} />
          <XAxis dataKey={xKey} stroke="#94A3B8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} width={70} />
          <Tooltip content={<MoneyTooltip />} cursor={{ fill: "#1E293B", opacity: 0.35 }} />
          <Bar dataKey="netPnl" name={t("journal.analytics.netPnl")} radius={[4, 4, 0, 0]}>
            {data.map((item, index) => (
              <Cell
                key={index}
                fill={Number(item.netPnl || 0) >= 0 ? "#10B981" : "#EF4444"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EquityChart({ data }: { data: JournalAnalyticsResponse["equityCurve"] }) {
  const { t } = useLanguage();

  if (data.length === 0) {
    return <EmptyPanel message={t("journal.analytics.noEquityCurve")} />;
  }

  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1E293B" vertical={false} />
          <XAxis dataKey="label" stroke="#94A3B8" tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} width={72} />
          <Tooltip content={<MoneyTooltip />} />
          <Line
            type="monotone"
            dataKey="equity"
            name={t("journal.analytics.equity")}
            stroke="#38BDF8"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, fill: "#38BDF8" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DrawdownChart({ data }: { data: JournalAnalyticsResponse["drawdownCurve"] }) {
  const { t } = useLanguage();

  if (data.length === 0) {
    return <EmptyPanel message={t("journal.analytics.noDrawdownData")} />;
  }

  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1E293B" vertical={false} />
          <XAxis dataKey="label" stroke="#94A3B8" tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} width={72} />
          <Tooltip content={<MoneyTooltip />} />
          <Area
            type="monotone"
            dataKey="drawdown"
            name={t("journal.analytics.drawdown")}
            stroke="#F97316"
            fill="#F97316"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DirectionChart({ data }: { data: AnalyticsDirectionalStats[] }) {
  return <PnlBarChart data={data} xKey="direction" height={230} />;
}

function DirectionStats({ items }: { items: AnalyticsDirectionalStats[] }) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div key={item.direction} className="rounded-lg border border-slate-800 bg-[#111827] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              {item.direction === "BUY" ? t("journal.analytics.longBuy") : t("journal.analytics.shortSell")}
            </span>
            <span
              className={cn(
                "inline-flex rounded-md border px-2 py-1 text-xs font-semibold",
                item.direction === "BUY"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              )}
            >
              {item.direction}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Metric label={t("journal.analytics.trades")} value={formatNumber(item.totalTrades, 0)} />
            <Metric label={t("journal.analytics.winRate")} value={formatPercent(item.winRate)} />
            <Metric label={t("journal.analytics.netPnl")} value={formatMoney(item.netPnl)} tone={valueTone(item.netPnl)} />
            <Metric label={t("journal.analytics.average")} value={formatMoney(item.averagePnl)} tone={valueTone(item.averagePnl)} />
            <Metric label={t("journal.analytics.best")} value={formatMoney(item.bestTrade)} tone={valueTone(item.bestTrade)} />
            <Metric label={t("journal.analytics.worst")} value={formatMoney(item.worstTrade)} tone={valueTone(item.worstTrade)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "profit" | "loss";
}) {
  return (
    <div>
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div
        className={cn(
          "mt-1 font-semibold text-slate-200",
          tone === "profit" && "text-emerald-300",
          tone === "loss" && "text-red-300"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function valueToneClass(value: number | null | undefined) {
  const tone = valueTone(value);
  return cn(tone === "profit" && "text-emerald-300", tone === "loss" && "text-red-300");
}

function toFiniteNumber(value: number | string | null | undefined) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(new Set(value.map((item) => String(item || "").trim()).filter(Boolean)));
}

function tagNamesFromTrade(trade: JournalTradeOption | null) {
  if (!trade?.tags) {
    return [];
  }

  return Array.from(
    new Set(
      trade.tags
        .map((item) => item.tag?.name || item.name || "")
        .map((name) => String(name).trim())
        .filter(Boolean)
    )
  );
}

function screenshotUrlFromTrade(
  trade: JournalTradeOption | null,
  type: "entry" | "exit"
) {
  if (!trade) {
    return null;
  }

  const directUrl =
    type === "entry" ? trade.entryScreenshotUrl : trade.exitScreenshotUrl;

  if (directUrl) {
    return directUrl;
  }

  return (
    trade.screenshots?.find(
      (screenshot) => screenshot.type.toLowerCase() === type
    )?.url || null
  );
}

function tradeDateKey(trade: JournalTradeOption | null) {
  const value = trade?.openedAt || trade?.closedAt;

  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function firstString(value: string | null | undefined) {
  const text = String(value || "").trim();
  return text ? [text] : [];
}

function normalizeMetadataPayload(value: Partial<TradeMetadata> | null | undefined): TradeMetadata {
  return {
    rating: typeof value?.rating === "number" ? value.rating : null,
    mistakes: normalizeStringArray(value?.mistakes),
    setups: normalizeStringArray(value?.setups),
    emotions: normalizeStringArray(value?.emotions),
    customTags: normalizeStringArray(value?.customTags),
    tradeNote: String(value?.tradeNote || ""),
    dailyJournal: String(value?.dailyJournal || ""),
    checklistResults: normalizeStringArray(value?.checklistResults),
    psychologyStatus: String(value?.psychologyStatus || ""),
    exitReason: String(value?.exitReason || ""),
  };
}

function metadataFromTrade(trade: JournalTradeOption | null): TradeMetadata {
  return {
    rating: null,
    mistakes: firstString(trade?.mistake),
    setups: firstString(trade?.setup),
    emotions: firstString(trade?.emotion),
    customTags: tagNamesFromTrade(trade),
    tradeNote: trade?.notes || "",
    dailyJournal: "",
    checklistResults: [],
    psychologyStatus: "",
    exitReason: "",
  };
}

function mergeMetadataWithTrade(
  savedMetadata: Partial<TradeMetadata> | null | undefined,
  trade: JournalTradeOption | null
) {
  const fallback = metadataFromTrade(trade);
  const saved = normalizeMetadataPayload(savedMetadata);

  return {
    rating: saved.rating ?? fallback.rating,
    mistakes: saved.mistakes.length > 0 ? saved.mistakes : fallback.mistakes,
    setups: saved.setups.length > 0 ? saved.setups : fallback.setups,
    emotions: saved.emotions.length > 0 ? saved.emotions : fallback.emotions,
    customTags: saved.customTags.length > 0 ? saved.customTags : fallback.customTags,
    tradeNote: saved.tradeNote || fallback.tradeNote,
    dailyJournal: saved.dailyJournal,
    checklistResults: saved.checklistResults,
    psychologyStatus: saved.psychologyStatus,
    exitReason: saved.exitReason,
  };
}

function bestPnlRow(rows: TagAnalyticsRow[]) {
  return rows
    .filter((row) => row.totalTrades > 0)
    .sort((a, b) => b.netPnl - a.netPnl)[0] || null;
}

function worstPnlRow(rows: TagAnalyticsRow[]) {
  return rows
    .filter((row) => row.totalTrades > 0)
    .sort((a, b) => a.netPnl - b.netPnl)[0] || null;
}

function AnalyticsHero({
  analytics,
  loading,
}: {
  analytics: JournalAnalyticsResponse;
  loading: boolean;
}) {
  const { t } = useLanguage();
  const overview = analytics.overview;
  const costlyMistake = worstPnlRow(analytics.byMistake) || worstPnlRow(analytics.byTag);
  const bestSetup = bestPnlRow(analytics.bySetup) || bestPnlRow(analytics.byTag);
  const activeHours = analytics.byHour.filter((row) => row.totalTrades > 0);
  const weakHour = activeHours.sort((a, b) => a.netPnl - b.netPnl)[0] || null;

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0B1020]">
      <div className="grid gap-0 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50 p-5 sm:p-6 lg:p-7 dark:bg-none">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200">
            <Activity className="h-3.5 w-3.5" />
            {t("journal.analytics.tradeAnalysis")}
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl dark:text-white">
            {t("journal.analytics.heroTitlePrefix")} <span className="text-violet-600 dark:text-violet-300">{t("journal.analytics.heroTitleHighlight")}</span> {t("journal.analytics.heroTitleSuffix")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            {t("journal.analytics.heroDescription")}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricTile label={t("journal.analytics.netPnl")} value={formatMoney(overview.totalNetPnl)} tone={valueTone(overview.totalNetPnl)} />
            <MetricTile label={t("journal.analytics.winRate")} value={formatPercent(overview.winRate)} tone="blue" />
            <MetricTile label={t("journal.analytics.profitFactor")} value={formatNumber(overview.profitFactor, 2)} tone="amber" />
            <MetricTile label={t("journal.analytics.expectancy")} value={formatMoney(overview.expectancyPerTrade)} tone={valueTone(overview.expectancyPerTrade)} />
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white p-5 sm:p-6 xl:border-l xl:border-t-0 dark:border-slate-800 dark:bg-[#111827]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-950 dark:text-white">{t("journal.analytics.keyInsights")}</div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {loading ? t("journal.analytics.updatingReport") : t("journal.analytics.closedTradesAnalyzed").replace("{count}", formatNumber(overview.totalTrades, 0))}
              </div>
            </div>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-violet-500 dark:text-violet-300" />
            ) : (
              <Zap className="h-4 w-4 text-violet-500 dark:text-violet-300" />
            )}
          </div>
          <div className="space-y-3">
            <InsightLine
              icon={<AlertTriangle className="h-4 w-4" />}
              label={t("journal.analytics.costliestMistake")}
              value={costlyMistake ? costlyMistake.label : t("journal.analytics.noMistakeTags")}
              detail={costlyMistake ? t("journal.analytics.moneyAcrossTrades").replace("{money}", formatMoney(costlyMistake.netPnl)).replace("{count}", formatNumber(costlyMistake.totalTrades, 0)) : t("journal.analytics.tagLosingTrades")}
              tone="loss"
            />
            <InsightLine
              icon={<ClipboardCheck className="h-4 w-4" />}
              label={t("journal.analytics.bestSetup")}
              value={bestSetup ? bestSetup.label : t("journal.analytics.noSetupData")}
              detail={bestSetup ? t("journal.analytics.moneyWinRate").replace("{money}", formatMoney(bestSetup.netPnl)).replace("{rate}", formatPercent(bestSetup.winRate)) : t("journal.analytics.addSetupNames")}
              tone="profit"
            />
            <InsightLine
              icon={<CalendarDays className="h-4 w-4" />}
              label={t("journal.analytics.weakTimeWindow")}
              value={weakHour ? weakHour.label : t("journal.analytics.noHourData")}
              detail={weakHour ? t("journal.analytics.moneyFromOpenedTrades").replace("{money}", formatMoney(weakHour.netPnl)) : t("journal.analytics.closedTradesNeeded")}
              tone="amber"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "profit" | "loss" | "blue" | "amber";
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
      <div className="text-xs font-medium uppercase text-slate-500 dark:text-slate-500">{label}</div>
      <div
        className={cn(
          "mt-2 text-lg font-semibold text-slate-950 dark:text-white",
          tone === "profit" && "text-emerald-600 dark:text-emerald-300",
          tone === "loss" && "text-red-500 dark:text-red-300",
          tone === "blue" && "text-sky-500 dark:text-sky-300",
          tone === "amber" && "text-amber-500 dark:text-amber-300"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function InsightLine({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tone: "profit" | "loss" | "amber";
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-[#0B1020]">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            tone === "profit" && "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
            tone === "loss" && "border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
            tone === "amber" && "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
          )}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase text-slate-500 dark:text-slate-500">{label}</div>
          <div className="mt-1 truncate text-sm font-semibold text-slate-950 dark:text-white">{value}</div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{detail}</div>
        </div>
      </div>
    </div>
  );
}

function StrategyTable({ rows }: { rows: StrategyAnalyticsRow[] }) {
  const { t } = useLanguage();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2 pr-3">{t("journal.analytics.strategy")}</th>
            <th className="py-2 pr-3">{t("journal.analytics.trades")}</th>
            <th className="py-2 pr-3">{t("journal.analytics.winRate")}</th>
            <th className="py-2 pr-3">{t("journal.analytics.netPnl")}</th>
            <th className="py-2 pr-3">{t("journal.analytics.profitFactor")}</th>
            <th className="py-2">{t("journal.analytics.average")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((row) => (
            <tr key={row.strategy} className="text-slate-300">
              <td className="py-3 pr-3 font-semibold text-white">{row.strategy}</td>
              <td className="py-3 pr-3">{formatNumber(row.totalTrades, 0)}</td>
              <td className="py-3 pr-3">{formatPercent(row.winRate)}</td>
              <td className={cn("py-3 pr-3 font-semibold", valueToneClass(row.netPnl))}>
                {formatMoney(row.netPnl)}
              </td>
              <td className="py-3 pr-3">{formatNumber(row.profitFactor, 2)}</td>
              <td className={cn("py-3", valueToneClass(row.averagePnl))}>
                {formatMoney(row.averagePnl)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <EmptyPanel message={t("journal.analytics.noStrategyFilter")} />
      )}
    </div>
  );
}

function TradeZellaMetricRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "profit" | "loss" | "blue" | "amber";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-800 bg-[#0F172A] px-3 py-2 text-xs">
      <span className="text-slate-400">{label}</span>
      <span
        className={cn(
          "font-semibold text-slate-100",
          tone === "profit" && "text-emerald-300",
          tone === "loss" && "text-red-300",
          tone === "blue" && "text-sky-300",
          tone === "amber" && "text-amber-300"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ReviewCategory({
  title,
  addLabel,
  emptyMessage,
  icon,
  items,
  draft,
  onDraftChange,
  onAdd,
  onRemove,
  onRename,
}: {
  title: string;
  addLabel: string;
  emptyMessage: string;
  icon: ReactNode;
  items: ReviewListItem[];
  draft: string;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onRename: (index: number, value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300">
          {icon}
        </span>
        {title}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
          placeholder={addLabel}
          className="h-9 min-w-0 flex-1 rounded-md border border-slate-800 bg-[#0F172A] px-3 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
        />
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-800 bg-[#0F172A] text-slate-400 hover:border-violet-500/50 hover:text-violet-300"
          title={addLabel}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-700 bg-[#0F172A]/70 px-3 py-3 text-xs text-slate-500">
            {emptyMessage}
          </div>
        )}
        {items.map((item) => (
          <div
            key={`${title}-${item.label}`}
            className="flex min-h-10 items-center justify-between gap-3 rounded-md border border-slate-800 bg-[#0F172A] px-3 py-2"
          >
            <div className="min-w-0">
              <input
                value={item.label}
                onChange={(event) => onRename(items.indexOf(item), event.target.value)}
                className="w-full truncate bg-transparent text-xs font-semibold text-slate-100 outline-none"
              />
              <div className="mt-0.5 text-[11px] text-slate-500">{item.detail}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full bg-slate-300",
                  item.tone === "profit" && "bg-emerald-400",
                  item.tone === "loss" && "bg-red-400"
                )}
              />
              <button
                type="button"
                onClick={() => onRemove(items.indexOf(item))}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 hover:bg-red-500/10 hover:text-red-300"
                title={`Remove ${item.label}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TradeZellaChartPanel({
  analytics,
  selectedTrade,
  tradeNote,
  activeNoteTab,
  saving,
  notesDirty,
  onActiveNoteTabChange,
  onTradeNoteChange,
  onSaveNotes,
}: {
  analytics: JournalAnalyticsResponse;
  selectedTrade: JournalTradeOption | null;
  tradeNote: string;
  activeNoteTab: ReviewPanelTab;
  saving: boolean;
  notesDirty: boolean;
  onActiveNoteTabChange: (tab: ReviewPanelTab) => void;
  onTradeNoteChange: (value: string) => void;
  onSaveNotes: () => void;
}) {
  const [expandedScreenshotUrl, setExpandedScreenshotUrl] = useState<string | null>(null);
  const chartData = (analytics.equityCurve.length > 0
    ? analytics.equityCurve
    : [{ label: "No data", equity: 0, pnl: 0 }]
  ).map((point) => {
    const equity = toFiniteNumber(point.equity);
    const pnl = toFiniteNumber(point.pnl);

    return {
      ...point,
      equity,
      pnl,
      positiveEquity: equity >= 0 ? equity : null,
      negativeEquity: equity < 0 ? equity : null,
    };
  });
  const runningData = chartData.map((point) => ({
    label: point.label,
    equity: point.equity,
    pnl: point.pnl,
    positiveEquity: point.positiveEquity,
    negativeEquity: point.negativeEquity,
  }));
  const entryScreenshotUrl = screenshotUrlFromTrade(selectedTrade, "entry");
  const exitScreenshotUrl = screenshotUrlFromTrade(selectedTrade, "exit");
  const selectedTradeDate = tradeDateKey(selectedTrade);
  const activeScreenshotUrl =
    activeNoteTab === "entry"
      ? entryScreenshotUrl
      : activeNoteTab === "exit"
        ? exitScreenshotUrl
        : null;
  const activeScreenshotAlt =
    activeNoteTab === "entry" ? "Entry screenshot" : "Exit screenshot";
  const reviewTabs: Array<{ id: ReviewPanelTab; label: string }> = [
    { id: "entry", label: "Entry Screenshot" },
    { id: "exit", label: "Exit Screenshot" },
    { id: "trade", label: "Trade Note" },
    { id: "daily", label: "Daily Journal" },
  ];

  return (
    <div className="min-w-0 flex-1 bg-[#020617]">
      <div className="flex min-h-12 flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#0F172A] px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold text-slate-400">
          {["1m", "5m", "1h", "Indicators"].map((label) => (
            <span key={label} className="shrink-0 rounded-md border border-slate-800 bg-[#111827] px-2 py-1">
              {label}
            </span>
          ))}
        </div>
        <div className={cn("text-xs font-semibold", valueToneClass(analytics.overview.totalNetPnl))}>
          {formatMoney(analytics.overview.totalNetPnl)}
        </div>
      </div>

      <div className="flex min-h-[640px] flex-col">
        <div className="grid gap-3 border-b border-slate-800 bg-[#020617] p-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <div className="relative h-[320px] overflow-hidden rounded-lg border border-slate-800 bg-[#0F172A] shadow-sm">
            <div className="absolute left-3 top-3 z-10 rounded-md border border-slate-800 bg-[#111827]/95 px-2 py-1 text-xs font-semibold text-slate-300 shadow-sm">
              Equity chart
            </div>
            <div className="absolute bottom-3 left-3 z-10 flex gap-2 text-[11px] font-semibold text-slate-500">
              <span>3m</span>
              <span>1m</span>
              <span>5d</span>
              <span>1d</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 36, right: 24, left: 8, bottom: 24 }}>
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  stroke="#64748B"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                  fontSize={11}
                />
                <YAxis stroke="#64748B" tickLine={false} axisLine={false} width={56} fontSize={11} />
                <Tooltip content={<MoneyTooltip />} cursor={{ stroke: "#475569", strokeDasharray: "4 4" }} />
                <Area
                  type="monotone"
                  dataKey="positiveEquity"
                  name="Equity"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.18}
                  strokeWidth={2}
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="negativeEquity"
                  name="Equity"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.16}
                  strokeWidth={2}
                  connectNulls
                />
                <Bar dataKey="pnl" name="Trade P&L" radius={[3, 3, 0, 0]}>
                  {chartData.map((item, index) => (
                    <Cell
                      key={index}
                      fill={Number(item.pnl || 0) >= 0 ? "#10B981" : "#EF4444"}
                      opacity={0.38}
                    />
                  ))}
                </Bar>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-800 bg-[#0F172A] shadow-sm">
            <div className="flex h-10 items-center border-b border-slate-800 px-4 text-xs font-semibold text-slate-400">
              CHARTS & RUNNING P/L
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={runningData} margin={{ top: 20, right: 22, left: 2, bottom: 14 }}>
                  <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#64748B"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={20}
                    fontSize={11}
                  />
                  <YAxis stroke="#64748B" tickLine={false} axisLine={false} width={56} fontSize={11} />
                  <Tooltip content={<MoneyTooltip />} cursor={{ stroke: "#475569", strokeDasharray: "4 4" }} />
                  <Area
                    type="monotone"
                    dataKey="positiveEquity"
                    name="Running P&L"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    connectNulls
                  />
                  <Area
                    type="monotone"
                    dataKey="negativeEquity"
                    name="Running P&L"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.18}
                    strokeWidth={2}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-800 bg-[#0F172A]">
          <div className="flex min-h-14 items-center gap-2 overflow-x-auto px-4 py-2">
            {reviewTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onActiveNoteTabChange(tab.id)}
                className={cn(
                  "h-9 shrink-0 rounded-md border px-3 text-xs font-semibold transition",
                  activeNoteTab === tab.id
                    ? "border-violet-500/60 bg-violet-600 text-white shadow-sm shadow-violet-950/30"
                    : "border-slate-800 bg-[#111827] text-slate-400 hover:border-slate-700 hover:text-slate-100"
                )}
              >
                {tab.label}
              </button>
            ))}
            <button
              type="button"
              onClick={onSaveNotes}
              disabled={saving || !notesDirty || activeNoteTab !== "trade"}
              className="ml-auto h-9 shrink-0 rounded-md bg-violet-600 px-3 text-xs font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
            >
              {saving ? "Saving..." : notesDirty ? "Save" : "Saved"}
            </button>
          </div>
        </div>

        <div className="bg-[#020617] p-4">
          {activeNoteTab === "entry" || activeNoteTab === "exit" ? (
            <div className="flex h-[280px] items-center justify-center rounded-lg border border-slate-800 bg-[#0F172A] p-3 shadow-lg shadow-black/20 sm:h-[360px] xl:h-[480px] 2xl:h-[540px]">
              {activeScreenshotUrl ? (
                <button
                  type="button"
                  onClick={() => setExpandedScreenshotUrl(activeScreenshotUrl)}
                  className="flex h-full w-full items-center justify-center rounded-md border border-slate-700 bg-[#020617] p-2 shadow-inner shadow-black/30 outline-none transition hover:border-violet-500/60 focus:border-violet-500"
                  title="Open screenshot preview"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeScreenshotUrl}
                    alt={activeScreenshotAlt}
                    className="h-full w-full object-contain"
                  />
                </button>
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-slate-700 bg-[#111827] px-4 text-center text-sm text-slate-400">
                  No screenshot saved for this trade yet.
                </div>
              )}
            </div>
          ) : activeNoteTab === "daily" ? (
            <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-5">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-[#111827] text-blue-300">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-white">Daily Journal</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    This trade belongs to the daily journal for {selectedTradeDate || "the selected trade date"}.
                  </p>
                </div>
              </div>
              {selectedTradeDate ? (
                <Link
                  href={`/dashboard/daily-journal?date=${selectedTradeDate}`}
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  <CalendarDays className="h-4 w-4" />
                  Open Daily Journal for this day
                </Link>
              ) : null}
            </div>
          ) : (
            <textarea
              value={tradeNote}
              onChange={(event) => {
                onTradeNoteChange(event.target.value);
              }}
              placeholder="Write trade notes, checklist results, and execution comments..."
              className="h-[280px] w-full resize-none rounded-lg border border-slate-800 bg-[#0F172A] px-4 py-3 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-500 sm:h-[340px]"
            />
          )}
        </div>
      </div>

      {expandedScreenshotUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setExpandedScreenshotUrl(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-7xl items-center justify-center rounded-lg border border-slate-700 bg-[#020617] p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setExpandedScreenshotUrl(null)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 bg-[#111827] text-slate-300 hover:border-violet-500 hover:text-white"
              aria-label="Close screenshot preview"
            >
              <X className="h-4 w-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={expandedScreenshotUrl}
              alt={activeScreenshotAlt}
              className="max-h-[86vh] w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function buildWorkspaceMetrics(
  overview: JournalAnalyticsResponse["overview"],
  trade: JournalTradeOption | null,
  t: (key: string) => string
): EditableMetric[] {
  const tradePnl = trade ? toFiniteNumber(trade.profitLoss) : overview.totalNetPnl;
  const tradeRR = trade ? toFiniteNumber(trade.rr) : overview.averageRR;

  return [
    { id: "netPnl", label: t("journal.analytics.netPnl"), value: formatMoney(tradePnl), tone: valueTone(tradePnl) },
    {
      id: "side",
      label: t("journal.analytics.side"),
      value: trade?.direction === "SELL"
        ? t("journal.analytics.short")
        : trade?.direction === "BUY"
          ? t("journal.analytics.long")
          : t("journal.analytics.allTrades"),
      tone: trade?.direction === "SELL" ? "loss" : "profit",
    },
    { id: "grossProfit", label: t("journal.analytics.grossProfit"), value: formatMoney(Math.max(tradePnl, 0) || overview.grossProfit), tone: "profit" },
    { id: "grossLoss", label: t("journal.analytics.grossLoss"), value: formatMoney(trade ? Math.abs(Math.min(tradePnl, 0)) : overview.grossLoss), tone: "loss" },
    { id: "winRate", label: t("journal.analytics.winRate"), value: formatPercent(overview.winRate), tone: "blue" },
    { id: "profitFactor", label: t("journal.analytics.profitFactor"), value: formatNumber(overview.profitFactor, 2), tone: "amber" },
    { id: "plannedR", label: t("journal.analytics.plannedRMultiple"), value: formatNumber(overview.averageRR, 2), tone: "amber" },
    { id: "realizedR", label: t("journal.analytics.realizedRMultiple"), value: formatNumber(tradeRR, 2), tone: valueTone(tradeRR) },
    { id: "maxDrawdown", label: t("journal.analytics.maxDrawdown"), value: formatMoney(overview.maxDrawdown), tone: "loss" },
  ];
}

function TradeZellaAnalysisWorkspace({ analytics }: { analytics: JournalAnalyticsResponse }) {
  const { t } = useLanguage();
  const overview = analytics.overview;
  const [closedTrades, setClosedTrades] = useState<JournalTradeOption[]>([]);
  const [selectedTradeId, setSelectedTradeId] = useState("");
  const [selectedTradeDetail, setSelectedTradeDetail] = useState<JournalTradeOption | null>(null);
  const selectedTrade =
    selectedTradeDetail ||
    closedTrades.find((trade) => trade.id === selectedTradeId) ||
    null;
  const calculatedRating = Math.max(1, Math.min(5, Math.round((overview.winRate || 0) / 20)));
  const [tradeRating, setTradeRating] = useState<number | null>(null);
  const [activeNoteTab, setActiveNoteTab] = useState<ReviewPanelTab>("entry");
  const [tradeNote, setTradeNote] = useState("");
  const [dailyJournal, setDailyJournal] = useState("");
  const [notesDirty, setNotesDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const editableMetrics = buildWorkspaceMetrics(overview, selectedTrade, t);
  const [reviewItems, setReviewItems] = useState<{
    mistakes: ReviewListItem[];
    setups: ReviewListItem[];
    emotions: ReviewListItem[];
    tags: ReviewListItem[];
    checklist: ReviewListItem[];
  }>(() => ({
    mistakes: [],
    setups: [],
    emotions: [],
    tags: [],
    checklist: [],
  }));
  const [drafts, setDrafts] = useState({
    mistakes: "",
    setups: "",
    emotions: "",
    tags: "",
    checklist: "",
  });
  const [psychologyStatus, setPsychologyStatus] = useState("");
  const [exitReason, setExitReason] = useState("");
  const loadClosedTradesFailedText = t("journal.analytics.loadClosedTradesFailed");
  const loadingJournalMetadataText = t("journal.analytics.loadingJournalMetadata");
  const loadSelectedTradeFailedText = t("journal.analytics.loadSelectedTradeFailed");
  const loadJournalMetadataFailedText = t("journal.analytics.loadJournalMetadataFailed");
  const savedMetadataText = t("journal.analytics.savedMetadata");
  const checklistResultText = t("journal.analytics.checklistResult");
  const savingJournalMetadataText = t("journal.analytics.savingJournalMetadata");
  const saveJournalMetadataFailedText = t("journal.analytics.saveJournalMetadataFailed");
  const savedText = t("journal.analytics.saved");
  const manualItemText = t("journal.analytics.manualItem");

  useEffect(() => {
    let cancelled = false;

    async function loadClosedTrades() {
      try {
        const response = await fetch("/api/journal/trades?status=CLOSED&limit=100", {
          cache: "no-store",
        });
        const data = (await response.json()) as {
          success: boolean;
          trades?: JournalTradeOption[];
          message?: string;
        };

        if (!response.ok || !data.success) {
          throw new Error(data.message || loadClosedTradesFailedText);
        }

        if (!cancelled) {
          const trades = data.trades || [];
          setClosedTrades(trades);
          setSelectedTradeId((current) => current || trades[0]?.id || "");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setStatusMessage((error as Error).message || loadClosedTradesFailedText);
        }
      }
    }

    loadClosedTrades();

    return () => {
      cancelled = true;
    };
  }, [loadClosedTradesFailedText]);

  useEffect(() => {
    if (!selectedTradeId) {
      return;
    }

    const controller = new AbortController();

    async function loadSelectedTradeAndMetadata() {
      setHydrated(false);
      setStatus("loading");
      setStatusMessage(loadingJournalMetadataText);

      try {
        const [tradeResponse, metadataResponse] = await Promise.all([
          fetch(`/api/journal/trades/${selectedTradeId}`, {
            signal: controller.signal,
            cache: "no-store",
          }),
          fetch(`/api/journal/trades/${selectedTradeId}/metadata`, {
            signal: controller.signal,
            cache: "no-store",
          }),
        ]);
        const tradeData = (await tradeResponse.json()) as {
          success: boolean;
          trade?: JournalTradeOption;
          message?: string;
        };
        const metadataData = (await metadataResponse.json()) as {
          success: boolean;
          metadata?: Partial<TradeMetadata>;
          message?: string;
        };

        if (!tradeResponse.ok || !tradeData.success || !tradeData.trade) {
          throw new Error(tradeData.message || loadSelectedTradeFailedText);
        }

        if (!metadataResponse.ok || !metadataData.success) {
          throw new Error(metadataData.message || loadJournalMetadataFailedText);
        }

        setSelectedTradeDetail(tradeData.trade);
        const merged = mergeMetadataWithTrade(metadataData.metadata, tradeData.trade);
        setTradeRating(merged.rating ?? calculatedRating);
        setReviewItems({
          mistakes: merged.mistakes.map((label) => ({ label, detail: savedMetadataText, tone: "neutral" })),
          setups: merged.setups.map((label) => ({ label, detail: savedMetadataText, tone: "neutral" })),
          emotions: merged.emotions.map((label) => ({ label, detail: savedMetadataText, tone: "neutral" })),
          tags: merged.customTags.map((label) => ({ label, detail: savedMetadataText, tone: "neutral" })),
          checklist: merged.checklistResults.map((label) => ({ label, detail: checklistResultText, tone: "neutral" })),
        });
        setTradeNote(merged.tradeNote);
        setDailyJournal(merged.dailyJournal);
        setPsychologyStatus(merged.psychologyStatus);
        setExitReason(merged.exitReason);
        setNotesDirty(false);
        setHydrated(true);
        setStatus("idle");
        setStatusMessage("");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setStatus("error");
          setStatusMessage((error as Error).message || loadJournalMetadataFailedText);
        }
      }
    }

    loadSelectedTradeAndMetadata();

    return () => controller.abort();
  }, [
    calculatedRating,
    checklistResultText,
    loadJournalMetadataFailedText,
    loadSelectedTradeFailedText,
    loadingJournalMetadataText,
    savedMetadataText,
    selectedTradeId,
  ]);

  function currentMetadataPayload(): TradeMetadata {
    return {
      rating: tradeRating,
      mistakes: reviewItems.mistakes.map((item) => item.label).filter(Boolean),
      setups: reviewItems.setups.map((item) => item.label).filter(Boolean),
      emotions: reviewItems.emotions.map((item) => item.label).filter(Boolean),
      customTags: reviewItems.tags.map((item) => item.label).filter(Boolean),
      tradeNote,
      dailyJournal,
      checklistResults: reviewItems.checklist.map((item) => item.label).filter(Boolean),
      psychologyStatus,
      exitReason,
    };
  }

  async function saveMetadata() {
    if (!selectedTradeId || !hydrated) {
      return;
    }

    setStatus("saving");
    setStatusMessage(savingJournalMetadataText);

    try {
      const response = await fetch(`/api/journal/trades/${selectedTradeId}/metadata`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentMetadataPayload()),
      });
      const data = (await response.json()) as { success: boolean; message?: string; errors?: string[] };

      if (!response.ok || !data.success) {
        throw new Error(data.errors?.join(", ") || data.message || saveJournalMetadataFailedText);
      }

      setStatus("saved");
      setStatusMessage(savedText);
      setNotesDirty(false);
    } catch (error) {
      setStatus("error");
      setStatusMessage((error as Error).message || saveJournalMetadataFailedText);
    }
  }

  function updateDraft(category: keyof typeof drafts, value: string) {
    setDrafts((current) => ({ ...current, [category]: value }));
  }

  function addReviewItem(category: keyof typeof drafts) {
    const label = drafts[category].trim();

    if (!label) {
      return;
    }

    setReviewItems((current) => ({
      ...current,
      [category]: [
        ...current[category],
        { label, detail: manualItemText, tone: "neutral" },
      ],
    }));
    updateDraft(category, "");
  }

  function removeReviewItem(category: keyof typeof drafts, index: number) {
    setReviewItems((current) => ({
      ...current,
      [category]: current[category].filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function renameReviewItem(category: keyof typeof drafts, index: number, value: string) {
    setReviewItems((current) => ({
      ...current,
      [category]: current[category].map((item, itemIndex) =>
        itemIndex === index ? { ...item, label: value } : item
      ),
    }));
  }

  useEffect(() => {
    if (!hydrated || !selectedTradeId) {
      return;
    }

    const timer = window.setTimeout(() => {
      saveMetadata();
    }, 700);

    return () => window.clearTimeout(timer);
    // Notes are intentionally saved by the explicit Save button in the chart panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeRating, reviewItems, psychologyStatus, exitReason, hydrated, selectedTradeId]);

  return (
    <section className="overflow-hidden rounded-lg border border-slate-800 bg-[#111827] shadow-xl">
      <div className="grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="flex min-h-[640px] bg-[#0F172A] text-slate-100">
          <div className="flex w-14 shrink-0 flex-col items-center justify-between border-r border-slate-800 bg-gradient-to-b from-violet-700 via-indigo-950 to-slate-950 py-5">
            <div className="space-y-4 text-white/75">
              <BarChart3 className="h-4 w-4" />
              <Tags className="h-4 w-4" />
              <Brain className="h-4 w-4" />
              <Target className="h-4 w-4" />
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="h-8 w-8 rounded-full border border-white/20 bg-white/10" />
          </div>

          <div className="min-w-0 flex-1 overflow-y-auto border-r border-slate-800 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase text-slate-400">{t("journal.analytics.tradeReview")}</div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {selectedTrade
                    ? `${selectedTrade.symbol} / ${selectedTrade.direction}`
                    : t("journal.analytics.closedTradesCount").replace("{count}", formatNumber(overview.totalTrades, 0))}
                </div>
              </div>
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: 5 }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setTradeRating(index + 1)}
                    className="rounded p-0.5 hover:bg-amber-400/10"
                    title={t("journal.analytics.rateTrade").replace("{rating}", String(index + 1))}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        index < Number(tradeRating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-600"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <label className="mb-4 block text-xs font-semibold uppercase text-slate-400">
              {t("journal.analytics.selectedTrade")}
              <select
                value={selectedTradeId}
                onChange={(event) => {
                  setSelectedTradeDetail(null);
                  setSelectedTradeId(event.target.value);
                }}
                className="mt-1 h-10 w-full rounded-md border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-slate-100 outline-none focus:border-violet-500"
              >
                {closedTrades.map((trade) => (
                  <option key={trade.id} value={trade.id}>
                    {trade.symbol} / {trade.direction} / {formatMoney(toFiniteNumber(trade.profitLoss))}
                  </option>
                ))}
              </select>
            </label>

            <div className="mb-4 max-h-28 space-y-2 overflow-y-auto pr-1">
              {closedTrades.slice(0, 8).map((trade) => (
                <button
                  type="button"
                  key={trade.id}
                  onClick={() => {
                    setSelectedTradeDetail(null);
                    setSelectedTradeId(trade.id);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-xs",
                    trade.id === selectedTradeId
                      ? "border-violet-500/60 bg-violet-500/15 text-violet-100"
                      : "border-slate-800 bg-[#111827] text-slate-300 hover:border-violet-500/40"
                  )}
                >
                  <span className="min-w-0 truncate font-semibold">
                    {trade.symbol} / {trade.direction}
                  </span>
                  <span className={cn("shrink-0 font-semibold", valueToneClass(toFiniteNumber(trade.profitLoss)))}>
                    {formatMoney(toFiniteNumber(trade.profitLoss))}
                  </span>
                </button>
              ))}
            </div>

            <div className="mb-4 rounded-md border border-slate-800 bg-[#111827] px-3 py-2 text-xs text-slate-400">
              {status === "loading" && t("journal.analytics.loadingMetadata")}
              {status === "saving" && t("journal.analytics.savingChanges")}
              {status === "saved" && t("journal.analytics.savedPermanently")}
              {status === "error" && <span className="text-red-300">{statusMessage}</span>}
              {status === "idle" && t("journal.analytics.calculatedReadOnly")}
            </div>

            <div className="space-y-2">
              {editableMetrics.map((metric) => (
                <TradeZellaMetricRow
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  tone={metric.tone}
                />
              ))}
            </div>

            <div className="mt-5 grid gap-3">
              <label className="space-y-1 text-xs font-semibold text-slate-300">
                {t("journal.analytics.psychologyStatus")}
                <select
                  value={psychologyStatus}
                  onChange={(event) => setPsychologyStatus(event.target.value)}
                  className="h-9 w-full rounded-md border border-slate-800 bg-[#111827] px-3 text-xs font-medium text-slate-100 outline-none focus:border-violet-500"
                >
                  <option value="">{t("journal.analytics.selectStatus")}</option>
                  <option value="DISCIPLINED">{t("journal.analytics.disciplined")}</option>
                  <option value="PARTIAL">{t("journal.analytics.partiallyFollowedPlan")}</option>
                  <option value="IMPULSIVE">{t("journal.analytics.impulsive")}</option>
                  <option value="REVENGE">{t("journal.analytics.revengeTrade")}</option>
                  <option value="FOMO">FOMO</option>
                </select>
              </label>
              <label className="space-y-1 text-xs font-semibold text-slate-300">
                {t("journal.analytics.exitReason")}
                <input
                  value={exitReason}
                  onChange={(event) => setExitReason(event.target.value)}
                  placeholder={t("journal.analytics.exitReasonPlaceholder")}
                  className="h-9 w-full rounded-md border border-slate-800 bg-[#111827] px-3 text-xs font-medium text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-500"
                />
              </label>
            </div>

            <div className="mt-5 space-y-5">
              <ReviewCategory
                title={t("journal.analytics.mistakes")}
                addLabel={t("journal.analytics.addMistakes")}
                emptyMessage={t("journal.analytics.noItemsYet")}
                icon={<AlertTriangle className="h-3 w-3" />}
                items={reviewItems.mistakes}
                draft={drafts.mistakes}
                onDraftChange={(value) => updateDraft("mistakes", value)}
                onAdd={() => addReviewItem("mistakes")}
                onRemove={(index) => removeReviewItem("mistakes", index)}
                onRename={(index, value) => renameReviewItem("mistakes", index, value)}
              />
              <ReviewCategory
                title={t("journal.analytics.setups")}
                addLabel={t("journal.analytics.addSetups")}
                emptyMessage={t("journal.analytics.noItemsYet")}
                icon={<ClipboardCheck className="h-3 w-3" />}
                items={reviewItems.setups}
                draft={drafts.setups}
                onDraftChange={(value) => updateDraft("setups", value)}
                onAdd={() => addReviewItem("setups")}
                onRemove={(index) => removeReviewItem("setups", index)}
                onRename={(index, value) => renameReviewItem("setups", index, value)}
              />
              <ReviewCategory
                title={t("journal.analytics.emotions")}
                addLabel={t("journal.analytics.addEmotions")}
                emptyMessage={t("journal.analytics.noItemsYet")}
                icon={<Brain className="h-3 w-3" />}
                items={reviewItems.emotions}
                draft={drafts.emotions}
                onDraftChange={(value) => updateDraft("emotions", value)}
                onAdd={() => addReviewItem("emotions")}
                onRemove={(index) => removeReviewItem("emotions", index)}
                onRename={(index, value) => renameReviewItem("emotions", index, value)}
              />
              <ReviewCategory
                title={t("journal.analytics.customTags")}
                addLabel={t("journal.analytics.addCustomTags")}
                emptyMessage={t("journal.analytics.noItemsYet")}
                icon={<Tags className="h-3 w-3" />}
                items={reviewItems.tags}
                draft={drafts.tags}
                onDraftChange={(value) => updateDraft("tags", value)}
                onAdd={() => addReviewItem("tags")}
                onRemove={(index) => removeReviewItem("tags", index)}
                onRename={(index, value) => renameReviewItem("tags", index, value)}
              />
              <ReviewCategory
                title={t("journal.analytics.checklistResults")}
                addLabel={t("journal.analytics.addChecklistResults")}
                emptyMessage={t("journal.analytics.noItemsYet")}
                icon={<ClipboardCheck className="h-3 w-3" />}
                items={reviewItems.checklist}
                draft={drafts.checklist}
                onDraftChange={(value) => updateDraft("checklist", value)}
                onAdd={() => addReviewItem("checklist")}
                onRemove={(index) => removeReviewItem("checklist", index)}
                onRename={(index, value) => renameReviewItem("checklist", index, value)}
              />
            </div>
          </div>
        </div>

        <TradeZellaChartPanel
          analytics={analytics}
          selectedTrade={selectedTrade}
          tradeNote={tradeNote}
          activeNoteTab={activeNoteTab}
          saving={status === "saving"}
          notesDirty={notesDirty}
          onActiveNoteTabChange={setActiveNoteTab}
          onTradeNoteChange={(value) => {
            setTradeNote(value);
            setNotesDirty(true);
          }}
          onSaveNotes={() => saveMetadata()}
        />
      </div>
    </section>
  );
}

function HourlyHighlightCard({
  label,
  title,
  row,
  helper,
  tone,
}: {
  label: string;
  title: string;
  row: HourlyAnalyticsRow | null;
  helper: string;
  tone: "profit" | "loss" | "neutral";
}) {
  const { t } = useLanguage();

  return (
    <div className="rounded-lg border border-slate-800 bg-[#111827] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase text-slate-500">{label}</div>
          <div className="mt-1 text-sm font-semibold text-white">{title}</div>
        </div>
        <span
          className={cn(
            "rounded-md border px-2 py-1 text-xs font-semibold",
            tone === "profit" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
            tone === "loss" && "border-red-500/30 bg-red-500/10 text-red-300",
            tone === "neutral" && "border-slate-700 bg-slate-800 text-slate-300"
          )}
        >
          {row ? row.label : "N/A"}
        </span>
      </div>
      {row ? (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Metric label={t("journal.analytics.trades")} value={formatNumber(row.totalTrades, 0)} />
          <Metric label={t("journal.analytics.winRate")} value={formatPercent(row.winRate)} />
          <Metric label={t("journal.analytics.netPnl")} value={formatMoney(row.netPnl)} tone={valueTone(row.netPnl)} />
        </div>
      ) : (
        <div className="mt-4 text-sm text-slate-400">{t("journal.analytics.noClosedTradesInBucket")}</div>
      )}
      <p className="mt-4 text-xs leading-5 text-slate-400">{helper}</p>
    </div>
  );
}

function HourlyMiniList({
  title,
  rows,
  emptyMessage,
}: {
  title: string;
  rows: HourlyAnalyticsRow[];
  emptyMessage: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="rounded-lg border border-slate-800 bg-[#111827] p-4">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
              <div className="font-semibold text-slate-200">{row.label}</div>
              <div className="text-xs text-slate-500">
                {t("journal.analytics.tradesCount").replace("{count}", formatNumber(row.totalTrades, 0))} / {formatPercent(row.winRate)}
              </div>
            </div>
            <div className={cn("shrink-0 font-semibold", valueToneClass(row.netPnl))}>
              {formatMoney(row.netPnl)}
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-sm text-slate-400">{emptyMessage}</div>}
      </div>
    </div>
  );
}

function getHourlyTileClass(row: HourlyAnalyticsRow) {
  if (row.totalTrades === 0) {
    return "border-slate-800 bg-slate-900/50 text-slate-500";
  }

  if (row.netPnl > 0) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }

  if (row.netPnl < 0) {
    return "border-red-500/30 bg-red-500/10 text-red-200";
  }

  return "border-slate-700 bg-slate-800/70 text-slate-300";
}

function HourlyDecisionPanel({ rows }: { rows: HourlyAnalyticsRow[] }) {
  const { t } = useLanguage();
  const activeRows = rows.filter((row) => row.totalTrades > 0);
  const totalTrades = activeRows.reduce((sum, row) => sum + row.totalTrades, 0);
  const bestHour = activeRows.reduce<HourlyAnalyticsRow | null>(
    (best, row) => (!best || row.netPnl > best.netPnl ? row : best),
    null
  );
  const worstHour = activeRows.reduce<HourlyAnalyticsRow | null>(
    (worst, row) => (!worst || row.netPnl < worst.netPnl ? row : worst),
    null
  );
  const volumeHour = activeRows.reduce<HourlyAnalyticsRow | null>(
    (largest, row) => (!largest || row.totalTrades > largest.totalTrades ? row : largest),
    null
  );
  const opportunityRows = activeRows
    .filter((row) => row.netPnl > 0)
    .sort((a, b) => b.netPnl - a.netPnl)
    .slice(0, 3);
  const riskRows = activeRows
    .filter((row) => row.netPnl < 0)
    .sort((a, b) => a.netPnl - b.netPnl)
    .slice(0, 3);
  const sampleLabel =
    totalTrades >= 50
      ? t("journal.analytics.strongSample")
      : totalTrades >= 20
        ? t("journal.analytics.buildingSample")
        : t("journal.analytics.earlySample");
  const sampleTone = totalTrades >= 20 ? "text-sky-300" : "text-amber-300";

  if (activeRows.length === 0) {
    return <EmptyPanel message={t("journal.analytics.noOpeningHourTrades")} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-3">
        <HourlyHighlightCard
          label={t("journal.analytics.bestWindow")}
          title={t("journal.analytics.focusCandidate")}
          row={bestHour}
          helper={t("journal.analytics.highestHourlyPnl")}
          tone={bestHour && bestHour.netPnl > 0 ? "profit" : "neutral"}
        />
        <HourlyHighlightCard
          label={t("journal.analytics.weakWindow")}
          title={t("journal.analytics.reviewOrReduceSize")}
          row={worstHour}
          helper={t("journal.analytics.lowestHourlyPnl")}
          tone={worstHour && worstHour.netPnl < 0 ? "loss" : "neutral"}
        />
        <HourlyHighlightCard
          label={t("journal.analytics.mostActivity")}
          title={t("journal.analytics.behaviorHotspot")}
          row={volumeHour}
          helper={t("journal.analytics.largestTradeShare")}
          tone="neutral"
        />
      </div>

      <div className="rounded-lg border border-slate-800 bg-[#111827] p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-white">{t("journal.analytics.hourHeatmap24")}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {t("journal.analytics.profitable")}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                {t("journal.analytics.losing")}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-600" />
                {t("journal.analytics.noTrades")}
              </span>
            </div>
          </div>
          <div className={cn("text-xs font-semibold uppercase", sampleTone)}>
            {sampleLabel}: {t("journal.analytics.tradesCount").replace("{count}", formatNumber(totalTrades, 0))}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
          {rows.map((row) => (
            <div
              key={row.label}
              className={cn("min-h-[82px] rounded-lg border p-2", getHourlyTileClass(row))}
              title={`${row.label}: ${formatNumber(row.totalTrades, 0)} trades, ${formatMoney(
                row.netPnl
              )}`}
            >
              <div className="text-xs font-semibold">{row.label}</div>
              <div className="mt-2 text-sm font-semibold">{formatMoney(row.netPnl)}</div>
              <div className="mt-1 text-[11px] text-slate-400">
                {t("journal.analytics.tradesCount").replace("{count}", formatNumber(row.totalTrades, 0))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <HourlyMiniList
          title={t("journal.analytics.opportunityShortlist")}
          rows={opportunityRows}
          emptyMessage={t("journal.analytics.noProfitableHourYet")}
        />
        <HourlyMiniList title={t("journal.analytics.riskShortlist")} rows={riskRows} emptyMessage={t("journal.analytics.noLosingHourYet")} />
        <div className="rounded-lg border border-slate-800 bg-[#111827] p-4">
          <div className="text-sm font-semibold text-white">{t("journal.analytics.decisionRule")}</div>
          <div className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
            <p>
              {t("journal.analytics.decisionRuleDescription")}
            </p>
            {bestHour && worstHour && (
              <p>
                {t("journal.analytics.currentRead")
                  .replace("{bestHour}", bestHour.label)
                  .replace("{worstHour}", worstHour.label)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactTable<T>({
  rows,
  labelHeader,
  getLabel,
  emptyMessage,
}: {
  rows: T[];
  labelHeader: string;
  getLabel: (row: T) => string;
  emptyMessage: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2 pr-3">{labelHeader}</th>
            <th className="py-2 pr-3">{t("journal.analytics.trades")}</th>
            <th className="py-2 pr-3">{t("journal.analytics.winRate")}</th>
            <th className="py-2 pr-3">{t("journal.analytics.netPnl")}</th>
            <th className="py-2">{t("journal.analytics.average")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((row) => {
            const data = row as {
              totalTrades: number;
              winRate: number;
              netPnl: number;
              averagePnl: number;
            };

            return (
              <tr key={getLabel(row)} className="text-slate-300">
                <td className="py-3 pr-3 font-semibold text-white">{getLabel(row)}</td>
                <td className="py-3 pr-3">{formatNumber(data.totalTrades, 0)}</td>
                <td className="py-3 pr-3">{formatPercent(data.winRate)}</td>
                <td className={cn("py-3 pr-3 font-semibold", valueToneClass(data.netPnl))}>
                  {formatMoney(data.netPnl)}
                </td>
                <td className={cn("py-3", valueToneClass(data.averagePnl))}>
                  {formatMoney(data.averagePnl)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && <EmptyPanel message={emptyMessage} />}
    </div>
  );
}

export default function JournalAnalyticsPage() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(EMPTY_FILTERS);
  const [analytics, setAnalytics] = useState<JournalAnalyticsResponse>(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PageError | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("netPnl");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const loadFailedText = t("journal.analytics.loadFailed");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnalytics() {
      setLoading(true);
      setError(null);

      try {
        const query = buildQuery(appliedFilters);
        const response = await fetch(`/api/journal/analytics?${query}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = (await response.json()) as JournalAnalyticsResponse & {
          message?: string;
          errors?: string[];
          upgradeRequired?: boolean;
        };

        if (!response.ok || !data.success) {
          setError({
            message: data.errors?.join(", ") || data.message || loadFailedText,
            upgradeRequired: data.upgradeRequired,
          });
          setAnalytics(EMPTY_ANALYTICS);
          return;
        }

        setAnalytics(data);
      } catch (loadError) {
        if ((loadError as Error).name !== "AbortError") {
          setError({ message: (loadError as Error).message || loadFailedText });
          setAnalytics(EMPTY_ANALYTICS);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => controller.abort();
  }, [appliedFilters, loadFailedText]);

  const overview = analytics.overview;
  const directionData = [analytics.longShort.buy, analytics.longShort.sell];
  const sortedSymbols = useMemo(() => {
    return [...analytics.bySymbol].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      const multiplier = sortDirection === "asc" ? 1 : -1;

      if (typeof aValue === "string" || typeof bValue === "string") {
        return String(aValue).localeCompare(String(bValue)) * multiplier;
      }

      return (Number(aValue || 0) - Number(bValue || 0)) * multiplier;
    });
  }, [analytics.bySymbol, sortDirection, sortKey]);
  const hourlyChartData = analytics.byHour.filter((row) => row.totalTrades > 0);
  const hasTrades = overview.totalTrades > 0;

  function updateFilter<K extends keyof Filters>(name: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(filters);
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
  }

  function toggleSymbolSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "symbol" ? "asc" : "desc");
  }

  const overviewCards: Array<{
    label: string;
    value: string;
    icon: ReactNode;
    tone: "neutral" | "profit" | "loss" | "blue" | "amber";
  }> = [
    { label: t("journal.analytics.totalNetPnl"), value: formatMoney(overview.totalNetPnl), icon: <CircleDollarSign className="h-4 w-4" />, tone: valueTone(overview.totalNetPnl) },
    { label: t("journal.analytics.grossProfit"), value: formatMoney(overview.grossProfit), icon: <ArrowUp className="h-4 w-4" />, tone: "profit" },
    { label: t("journal.analytics.grossLoss"), value: formatMoney(overview.grossLoss), icon: <ArrowDown className="h-4 w-4" />, tone: "loss" },
    { label: t("journal.analytics.winRate"), value: formatPercent(overview.winRate), icon: <Target className="h-4 w-4" />, tone: "blue" },
    { label: t("journal.analytics.lossRate"), value: formatPercent(overview.lossRate), icon: <Target className="h-4 w-4" />, tone: "amber" },
    { label: t("journal.analytics.totalTrades"), value: formatNumber(overview.totalTrades, 0), icon: <BarChart3 className="h-4 w-4" />, tone: "blue" },
    { label: t("journal.analytics.winningTrades"), value: formatNumber(overview.winningTrades, 0), icon: <ArrowUp className="h-4 w-4" />, tone: "profit" },
    { label: t("journal.analytics.losingTrades"), value: formatNumber(overview.losingTrades, 0), icon: <ArrowDown className="h-4 w-4" />, tone: "loss" },
    { label: t("journal.analytics.breakEvenTrades"), value: formatNumber(overview.breakEvenTrades, 0), icon: <Target className="h-4 w-4" />, tone: "neutral" },
    { label: t("journal.analytics.averageWin"), value: formatMoney(overview.averageWin), icon: <ArrowUp className="h-4 w-4" />, tone: "profit" },
    { label: t("journal.analytics.averageLoss"), value: formatMoney(overview.averageLoss), icon: <ArrowDown className="h-4 w-4" />, tone: "loss" },
    { label: t("journal.analytics.profitFactor"), value: formatNumber(overview.profitFactor, 2), icon: <BarChart3 className="h-4 w-4" />, tone: "blue" },
    { label: t("journal.analytics.averageRr"), value: formatNumber(overview.averageRR, 2), icon: <Target className="h-4 w-4" />, tone: "amber" },
    { label: t("journal.analytics.bestTrade"), value: overview.bestTrade ? formatMoney(overview.bestTrade.pnl) : "$0.00", icon: <ArrowUp className="h-4 w-4" />, tone: "profit" },
    { label: t("journal.analytics.worstTrade"), value: overview.worstTrade ? formatMoney(overview.worstTrade.pnl) : "$0.00", icon: <ArrowDown className="h-4 w-4" />, tone: "loss" },
    { label: t("journal.analytics.maxDrawdown"), value: formatMoney(overview.maxDrawdown), icon: <ArrowDown className="h-4 w-4" />, tone: "loss" },
    { label: t("journal.analytics.expectancyPerTrade"), value: formatMoney(overview.expectancyPerTrade), icon: <CircleDollarSign className="h-4 w-4" />, tone: valueTone(overview.expectancyPerTrade) },
  ];

  return (
    <div className="space-y-5">
      <AnalyticsHero analytics={analytics} loading={loading} />

      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
        <form className="grid gap-3 lg:grid-cols-6" onSubmit={submitFilters}>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            {t("journal.analytics.dateRange")}
            <select
              value={filters.dateRange}
              onChange={(event) => updateFilter("dateRange", event.target.value as DateRange)}
              className="h-11 w-full rounded-lg border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-sky-600"
            >
              <option value="all">{t("journal.analytics.allTime")}</option>
              <option value="today">{t("today")}</option>
              <option value="thisWeek">{t("thisWeek")}</option>
              <option value="thisMonth">{t("journal.analytics.thisMonth")}</option>
              <option value="thisYear">{t("journal.analytics.thisYear")}</option>
              <option value="custom">{t("journal.analytics.custom")}</option>
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            {t("dashboard.filters.from")}
            <input
              type="date"
              value={filters.dateFrom}
              disabled={filters.dateRange !== "custom"}
              onChange={(event) => updateFilter("dateFrom", event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-sky-600 disabled:opacity-40"
            />
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            {t("dashboard.filters.to")}
            <input
              type="date"
              value={filters.dateTo}
              disabled={filters.dateRange !== "custom"}
              onChange={(event) => updateFilter("dateTo", event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-sky-600 disabled:opacity-40"
            />
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            {t("dashboard.table.symbol")}
            <select
              value={filters.symbol}
              onChange={(event) => updateFilter("symbol", event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-800 bg-[#111827] px-3 text-sm text-[#E5E7EB] outline-none focus:border-sky-600"
            >
              <option value="">{t("journal.playbooks.allSymbols")}</option>
              {analytics.metadata.symbols.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            {t("dashboard.table.direction")}
            <select
              value={filters.direction}
              onChange={(event) => updateFilter("direction", event.target.value as DirectionFilter)}
              className="h-11 w-full rounded-lg border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-sky-600"
            >
              <option value="">{t("dashboard.common.all")}</option>
              <option value="BUY">{t("dashboard.common.buy")}</option>
              <option value="SELL">{t("dashboard.common.sell")}</option>
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            {t("journal.analytics.strategy")}
            <select
              value={filters.strategy}
              disabled={!analytics.metadata.hasStrategyData}
              onChange={(event) => updateFilter("strategy", event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-sky-600 disabled:opacity-40"
            >
              <option value="">{t("journal.analytics.allStrategies")}</option>
              {analytics.metadata.strategies.map((strategy) => (
                <option key={strategy} value={strategy}>
                  {strategy}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2 lg:col-span-6">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500"
            >
              <Search className="h-4 w-4" />
              {t("journal.analytics.applyFilters")}
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-800 px-4 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              <RotateCcw className="h-4 w-4" />
              {t("dashboard.actions.reset")}
            </button>
          </div>
        </form>
      </div>

      {error?.upgradeRequired ? (
        <SubscriptionLockedFeature
          title={t("journal.analytics.lockedTitle")}
          description={error.message}
          requiredPlan="Pro"
          buttonText={t("journal.analytics.upgradeToPro")}
          href="/pricing"
        />
      ) : error ? (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold text-red-100">{t("journal.analytics.failedTitle")}</div>
            <div className="mt-1">{error.message}</div>
          </div>
        </div>
      ) : null}

      {loading ? (
        <LoadingPanel />
      ) : (
        <>
          {!hasTrades && (
            <div className="rounded-lg border border-dashed border-slate-800 bg-[#0F172A] p-6 text-sm text-slate-400">
              {t("journal.analytics.noClosedTrades")}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {overviewCards.map(({ label, value, icon, tone }) => (
              <StatCard key={label} label={label} value={value} icon={icon} tone={tone} />
            ))}
          </div>

          <TradeZellaAnalysisWorkspace analytics={analytics} />

          <div className="grid gap-5 xl:grid-cols-2">
            <Section
              title={t("journal.analytics.equityCurve")}
              description={t("journal.analytics.equityDescription")}
              icon={<LineChartIcon className="h-4 w-4" />}
            >
              <EquityChart data={analytics.equityCurve} />
            </Section>
            <Section
              title={t("journal.analytics.drawdown")}
              description={t("journal.analytics.drawdownDescription").replace("{current}", formatMoney(overview.currentDrawdown)).replace("{max}", formatMoney(overview.maxDrawdown))}
              icon={<ArrowDown className="h-4 w-4" />}
            >
              <DrawdownChart data={analytics.drawdownCurve} />
            </Section>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Section
              title={t("journal.analytics.longShort")}
              description={t("journal.analytics.longShortDescription")}
              icon={<Filter className="h-4 w-4" />}
            >
              <div className="space-y-4">
                <DirectionStats items={directionData} />
                <DirectionChart data={directionData} />
              </div>
            </Section>
            <Section
              title={t("journal.analytics.sessionPerformance")}
              description={t("journal.analytics.sessionPerformanceDescription")}
              icon={<CalendarDays className="h-4 w-4" />}
            >
              <PnlBarChart data={analytics.bySession} xKey="session" height={300} />
            </Section>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Section title={t("journal.analytics.weekdayPnl")} icon={<CalendarDays className="h-4 w-4" />}>
              <PnlBarChart data={analytics.byWeekday} xKey="weekday" height={280} />
            </Section>
            <Section title={t("journal.analytics.hourlyPnl")} icon={<BarChart3 className="h-4 w-4" />}>
              <PnlBarChart
                data={hourlyChartData.length > 0 ? hourlyChartData : analytics.byHour}
                xKey="label"
                height={280}
              />
            </Section>
          </div>

          <Section
            title={t("journal.analytics.symbolAnalytics")}
            description={t("journal.analytics.symbolAnalyticsDescription")}
            icon={<ArrowUpDown className="h-4 w-4" />}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    {[
                      ["symbol", t("dashboard.table.symbol")],
                      ["totalTrades", t("journal.analytics.trades")],
                      ["winRate", t("journal.analytics.winRate")],
                      ["netPnl", t("journal.analytics.netPnl")],
                      ["averagePnl", t("journal.analytics.average")],
                      ["profitFactor", t("journal.analytics.profitFactor")],
                      ["bestTrade", t("journal.analytics.best")],
                      ["worstTrade", t("journal.analytics.worst")],
                    ].map(([key, label]) => (
                      <th key={key} className="py-2 pr-3">
                        <button
                          type="button"
                          onClick={() => toggleSymbolSort(key as SortKey)}
                          className="inline-flex items-center gap-1 hover:text-white"
                        >
                          {label}
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sortedSymbols.map((row) => (
                    <tr key={row.symbol} className="text-slate-300">
                      <td className="py-3 pr-3 font-semibold text-white">{row.symbol}</td>
                      <td className="py-3 pr-3">{formatNumber(row.totalTrades, 0)}</td>
                      <td className="py-3 pr-3">{formatPercent(row.winRate)}</td>
                      <td className={cn("py-3 pr-3 font-semibold", valueToneClass(row.netPnl))}>
                        {formatMoney(row.netPnl)}
                      </td>
                      <td className={cn("py-3 pr-3", valueToneClass(row.averagePnl))}>
                        {formatMoney(row.averagePnl)}
                      </td>
                      <td className="py-3 pr-3">{formatNumber(row.profitFactor, 2)}</td>
                      <td className="py-3 pr-3 text-emerald-300">{formatMoney(row.bestTrade)}</td>
                      <td className="py-3 text-red-300">{formatMoney(row.worstTrade)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sortedSymbols.length === 0 && <EmptyPanel message={t("journal.analytics.noSymbolAnalytics")} />}
            </div>
          </Section>

          <div className="grid gap-5 xl:grid-cols-2">
            <Section title={t("journal.analytics.sessionAnalytics")} icon={<CalendarDays className="h-4 w-4" />}>
              <CompactTable
                rows={analytics.bySession}
                labelHeader={t("journal.analytics.session")}
                getLabel={(row) => row.session}
                emptyMessage={t("journal.analytics.noSessionAnalytics")}
              />
            </Section>
            <Section title={t("journal.analytics.weekdayAnalytics")} icon={<CalendarDays className="h-4 w-4" />}>
              <CompactTable
                rows={analytics.byWeekday}
                labelHeader={t("journal.analytics.weekday")}
                getLabel={(row) => row.weekday}
                emptyMessage={t("journal.analytics.noWeekdayAnalytics")}
              />
            </Section>
          </div>

          <Section
            title={t("journal.analytics.hourlyDecisionBoard")}
            description={t("journal.analytics.hourlyDecisionDescription")}
            icon={<BarChart3 className="h-4 w-4" />}
          >
            <HourlyDecisionPanel rows={analytics.byHour} />
          </Section>

          <div className="grid gap-5 xl:grid-cols-2">
            <Section title={t("journal.analytics.strategyMagicAnalytics")} icon={<Target className="h-4 w-4" />}>
              {analytics.metadata.hasStrategyData ? (
                <StrategyTable rows={analytics.byStrategy} />
              ) : (
                <EmptyPanel message={t("journal.analytics.noStrategyData")} />
              )}
            </Section>
            <Section title={t("journal.analytics.psychologyAnalytics")} icon={<Brain className="h-4 w-4" />}>
              {analytics.metadata.hasPsychologyData ? (
                <CompactTable
                  rows={analytics.byPsychology}
                  labelHeader={t("journal.analytics.psychologyStatus")}
                  getLabel={(row) => row.psychologyStatus}
                  emptyMessage={t("journal.analytics.noPsychologyFilter")}
                />
              ) : (
                <EmptyPanel message={t("journal.analytics.noPsychologyData")} />
              )}
            </Section>
          </div>
        </>
      )}
    </div>
  );
}
