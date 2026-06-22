"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  FileText,
  Target,
} from "lucide-react";
import { ReportActions } from "@/app/dashboard/reports/report-actions";
import type { JournalReport, LocalizedReportText } from "@/lib/reports/journal-report";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "profit" | "loss" | "blue" | "amber";
type Language = "en" | "fa";

const COPY = {
  en: {
    badge: "Trading Performance Report",
    title: "Journal Reports",
    subtitle:
      "Customer-ready summary generated from journal trades, analytics, playbooks, checklists, and daily notes.",
    filters: {
      period: "Period",
      today: "Today",
      thisWeek: "This week",
      thisMonth: "This month",
      thisYear: "This year",
      all: "All",
      custom: "Custom",
      from: "From",
      to: "To",
      account: "Account",
      allAccounts: "All accounts",
      symbol: "Symbol",
      side: "Side",
      buy: "Buy",
      sell: "Sell",
      strategy: "Strategy",
      strategyPlaceholder: "Setup",
      generate: "Generate Report",
      reset: "Reset",
    },
    stats: {
      netPnl: "Net PnL",
      winRate: "Win Rate",
      profitFactor: "Profit Factor",
      expectancy: "Expectancy",
      totalTrades: "Total Trades",
      closedOpen: "Closed / Open",
      averageRr: "Average RR",
    },
    executive: {
      title: "Executive Summary",
      generated: "Generated",
      for: "for",
      strengths: "Strengths",
      risks: "Risks",
      actionPlan: "Action Plan",
    },
    symbolPanel: {
      title: "Performance by Symbol",
      subtitle: "Top symbols ranked by net PnL.",
      empty: "No closed trades found for this report period.",
      symbol: "Symbol",
      trades: "Trades",
      winRate: "Win Rate",
      netPnl: "Net PnL",
      weight: "Weight",
    },
    behavior: {
      title: "Behavior and Setup",
      subtitle: "Most repeated tags from the closed-trade sample.",
      mistakes: "Mistakes",
      setups: "Setups",
      noMistakes: "No mistake tags yet.",
      noSetups: "No setup tags yet.",
    },
    trades: {
      title: "Recent Trades",
      subtitle: "Latest trades included in the report export.",
      empty: "No trades found for this report period.",
      date: "Date",
      symbol: "Symbol",
      side: "Side",
      pnl: "PnL",
      setup: "Setup",
      execution: "Execution",
      plan: "plan",
    },
    notes: {
      title: "Daily Journal Notes",
      subtitle: "Most recent notes from the selected period.",
      empty: "No daily journal notes found for this period.",
      discipline: "Discipline",
      worked: "Worked",
      mistakes: "Mistakes",
      plan: "Plan",
    },
  },
  fa: {
    badge: "گزارش عملکرد معاملاتی",
    title: "گزارش ژورنال",
    subtitle:
      "خلاصه آماده ارائه بر اساس معاملات ژورنال، آنالیتیکس، پلی‌بوک‌ها، چک‌لیست‌ها و یادداشت‌های روزانه.",
    filters: {
      period: "بازه زمانی",
      today: "امروز",
      thisWeek: "این هفته",
      thisMonth: "این ماه",
      thisYear: "امسال",
      all: "همه",
      custom: "دلخواه",
      from: "از تاریخ",
      to: "تا تاریخ",
      account: "حساب",
      allAccounts: "همه حساب‌ها",
      symbol: "نماد",
      side: "جهت",
      buy: "خرید",
      sell: "فروش",
      strategy: "استراتژی",
      strategyPlaceholder: "نام ستاپ",
      generate: "ساخت گزارش",
      reset: "پاک کردن",
    },
    stats: {
      netPnl: "سود/زیان خالص",
      winRate: "نرخ برد",
      profitFactor: "فاکتور سود",
      expectancy: "امید ریاضی",
      totalTrades: "کل معاملات",
      closedOpen: "بسته / باز",
      averageRr: "میانگین RR",
    },
    executive: {
      title: "خلاصه مدیریتی",
      generated: "تولید شده در",
      for: "برای",
      strengths: "نقاط قوت",
      risks: "ریسک‌ها",
      actionPlan: "برنامه اقدام",
    },
    symbolPanel: {
      title: "عملکرد بر اساس نماد",
      subtitle: "نمادهای برتر بر اساس سود/زیان خالص.",
      empty: "برای این بازه معامله بسته‌شده‌ای پیدا نشد.",
      symbol: "نماد",
      trades: "تعداد معاملات",
      winRate: "نرخ برد",
      netPnl: "سود/زیان خالص",
      weight: "وزن",
    },
    behavior: {
      title: "رفتار و ستاپ",
      subtitle: "تگ‌های پرتکرار در معاملات بسته‌شده.",
      mistakes: "اشتباهات",
      setups: "ستاپ‌ها",
      noMistakes: "هنوز تگ اشتباه ثبت نشده است.",
      noSetups: "هنوز ستاپی ثبت نشده است.",
    },
    trades: {
      title: "معاملات اخیر",
      subtitle: "آخرین معاملاتی که در خروجی گزارش آمده‌اند.",
      empty: "برای این بازه معامله‌ای پیدا نشد.",
      date: "تاریخ",
      symbol: "نماد",
      side: "جهت",
      pnl: "سود/زیان",
      setup: "ستاپ",
      execution: "اجرا",
      plan: "پایبندی به پلن",
    },
    notes: {
      title: "یادداشت‌های ژورنال روزانه",
      subtitle: "آخرین یادداشت‌های ثبت‌شده در بازه انتخابی.",
      empty: "برای این بازه یادداشت ژورنال روزانه‌ای پیدا نشد.",
      discipline: "نظم",
      worked: "نقاط مثبت",
      mistakes: "اشتباهات",
      plan: "برنامه",
    },
  },
} as const;

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

function formatDate(value: string | null | undefined, language: Language) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(language === "fa" ? "fa-IR" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toneClass(tone: Tone) {
  if (tone === "profit") {
    return "text-emerald-300";
  }

  if (tone === "loss") {
    return "text-red-300";
  }

  if (tone === "blue") {
    return "text-blue-200";
  }

  if (tone === "amber") {
    return "text-amber-200";
  }

  return "text-white";
}

function pnlTone(value: number | null | undefined): Tone {
  const number = Number(value || 0);
  return number > 0 ? "profit" : number < 0 ? "loss" : "neutral";
}

function Panel({
  title,
  subtitle,
  children,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <section className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 shadow-sm print:border-slate-200 print:bg-white print:text-slate-950">
      <div className="mb-4 flex items-start gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/15 text-blue-300 print:bg-slate-100 print:text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h2 className="text-base font-semibold text-white print:text-slate-950">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-400 print:text-slate-600">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value, tone = "neutral" }: { label: string; value: string; tone?: Tone }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 print:border-slate-200 print:bg-slate-50">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 print:text-slate-500">{label}</div>
      <div className={cn("mt-2 text-2xl font-semibold", toneClass(tone), "print:text-slate-950")}>{value}</div>
    </div>
  );
}

function ProgressBar({ value, tone = "blue" }: { value: number; tone?: "blue" | "profit" | "loss" }) {
  const color =
    tone === "profit" ? "bg-emerald-400" : tone === "loss" ? "bg-red-400" : "bg-blue-400";

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-800 print:bg-slate-200">
      <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
    </div>
  );
}

function EmptyLine({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400 print:border-slate-300 print:text-slate-600">
      {label}
    </div>
  );
}

function ReportFilters({ report, copy }: { report: JournalReport; copy: typeof COPY[Language] }) {
  const filters = report.filters;

  return (
    <form className="grid gap-3 rounded-lg border border-slate-800 bg-[#0F172A] p-4 print:hidden md:grid-cols-7">
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400 md:col-span-1">
        {copy.filters.period}
        <select name="dateRange" defaultValue={filters.dateRange} className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm normal-case text-slate-100 outline-none focus:border-blue-500">
          <option value="today">{copy.filters.today}</option>
          <option value="thisWeek">{copy.filters.thisWeek}</option>
          <option value="thisMonth">{copy.filters.thisMonth}</option>
          <option value="thisYear">{copy.filters.thisYear}</option>
          <option value="all">{copy.filters.all}</option>
          <option value="custom">{copy.filters.custom}</option>
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        {copy.filters.from}
        <input type="date" name="dateFrom" defaultValue={filters.dateFrom} className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-blue-500" />
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        {copy.filters.to}
        <input type="date" name="dateTo" defaultValue={filters.dateTo} className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-blue-500" />
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        {copy.filters.account}
        <select name="accountId" defaultValue={filters.accountId} className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm normal-case text-slate-100 outline-none focus:border-blue-500">
          <option value="">{copy.filters.allAccounts}</option>
          {report.filterOptions.accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        {copy.filters.symbol}
        <input name="symbol" defaultValue={filters.symbol} placeholder="EURUSD" className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm uppercase text-slate-100 outline-none focus:border-blue-500" />
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        {copy.filters.side}
        <select name="direction" defaultValue={filters.direction} className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm normal-case text-slate-100 outline-none focus:border-blue-500">
          <option value="">{copy.filters.all}</option>
          <option value="BUY">{copy.filters.buy}</option>
          <option value="SELL">{copy.filters.sell}</option>
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        {copy.filters.strategy}
        <input name="strategy" defaultValue={filters.strategy} placeholder={copy.filters.strategyPlaceholder} className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-blue-500" />
      </label>
      <div className="flex items-end gap-2 md:col-span-7">
        <button className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500">
          {copy.filters.generate}
        </button>
        <a href="/dashboard/reports" className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-700 px-4 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">
          {copy.filters.reset}
        </a>
      </div>
    </form>
  );
}

function InsightList({
  items,
  tone,
  language,
}: {
  items: LocalizedReportText[];
  tone: "profit" | "loss" | "blue";
  language: Language;
}) {
  const Icon = tone === "loss" ? AlertTriangle : tone === "profit" ? CheckCircle2 : Target;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.en} className="flex gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3 print:border-slate-200 print:bg-slate-50">
          <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", toneClass(tone))} />
          <p className="text-sm text-slate-300 print:text-slate-700">{item[language]}</p>
        </div>
      ))}
    </div>
  );
}

function TopTable({ report, copy }: { report: JournalReport; copy: typeof COPY[Language] }) {
  const rows = report.analytics.bySymbol.slice(0, 6);

  if (rows.length === 0) {
    return <EmptyLine label={copy.symbolPanel.empty} />;
  }

  const maxAbs = Math.max(...rows.map((row) => Math.abs(row.netPnl)), 1);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-800 text-sm print:divide-slate-200">
        <thead>
          <tr className="text-left text-xs uppercase text-slate-500">
            <th className="py-2 pr-4">{copy.symbolPanel.symbol}</th>
            <th className="py-2 pr-4">{copy.symbolPanel.trades}</th>
            <th className="py-2 pr-4">{copy.symbolPanel.winRate}</th>
            <th className="py-2 pr-4">{copy.symbolPanel.netPnl}</th>
            <th className="py-2">{copy.symbolPanel.weight}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 print:divide-slate-200">
          {rows.map((row) => (
            <tr key={row.symbol} className="text-slate-300 print:text-slate-700">
              <td className="py-3 pr-4 font-semibold text-white print:text-slate-950">{row.symbol}</td>
              <td className="py-3 pr-4">{row.totalTrades}</td>
              <td className="py-3 pr-4">{formatPercent(row.winRate)}</td>
              <td className={cn("py-3 pr-4 font-semibold", toneClass(pnlTone(row.netPnl)), "print:text-slate-950")}>
                {formatMoney(row.netPnl)}
              </td>
              <td className="min-w-40 py-3">
                <ProgressBar value={(Math.abs(row.netPnl) / maxAbs) * 100} tone={row.netPnl < 0 ? "loss" : "profit"} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlaybookPerformanceTable({ report, copy }: { report: JournalReport; copy: typeof COPY[Language] }) {
  const rows = report.analytics.byStrategy.slice(0, 8);

  if (rows.length === 0) {
    return <EmptyLine label="No playbook performance yet." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-800 text-sm print:divide-slate-200">
        <thead>
          <tr className="text-left text-xs uppercase text-slate-500">
            <th className="py-2 pr-4">Playbook</th>
            <th className="py-2 pr-4">{copy.symbolPanel.trades}</th>
            <th className="py-2 pr-4">{copy.symbolPanel.winRate}</th>
            <th className="py-2 pr-4">{copy.symbolPanel.netPnl}</th>
            <th className="py-2">Profit Factor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 print:divide-slate-200">
          {rows.map((row) => (
            <tr key={row.strategy} className="text-slate-300 print:text-slate-700">
              <td className="py-3 pr-4 font-semibold text-white print:text-slate-950">{row.strategy}</td>
              <td className="py-3 pr-4">{row.totalTrades}</td>
              <td className="py-3 pr-4">{formatPercent(row.winRate)}</td>
              <td className={cn("py-3 pr-4 font-semibold", toneClass(pnlTone(row.netPnl)), "print:text-slate-950")}>
                {formatMoney(row.netPnl)}
              </td>
              <td className="py-3">{formatNumber(row.profitFactor, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentTradesTable({
  report,
  copy,
  language,
}: {
  report: JournalReport;
  copy: typeof COPY[Language];
  language: Language;
}) {
  const rows = report.recentTrades.slice(0, 12);

  if (rows.length === 0) {
    return <EmptyLine label={copy.trades.empty} />;
  }

  const directionLabel = (direction: string) =>
    direction === "BUY" ? copy.filters.buy : direction === "SELL" ? copy.filters.sell : direction;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-800 text-sm print:divide-slate-200">
        <thead>
          <tr className="text-left text-xs uppercase text-slate-500">
            <th className="py-2 pr-4">{copy.trades.date}</th>
            <th className="py-2 pr-4">{copy.trades.symbol}</th>
            <th className="py-2 pr-4">{copy.trades.side}</th>
            <th className="py-2 pr-4">{copy.trades.pnl}</th>
            <th className="py-2 pr-4">RR</th>
            <th className="py-2 pr-4">{copy.trades.setup}</th>
            <th className="py-2">{copy.trades.execution}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 print:divide-slate-200">
          {rows.map((trade) => (
            <tr key={trade.id} className="text-slate-300 print:text-slate-700">
              <td className="whitespace-nowrap py-3 pr-4">{formatDate(trade.openedAt, language)}</td>
              <td className="py-3 pr-4 font-semibold text-white print:text-slate-950">{trade.symbol}</td>
              <td className="py-3 pr-4">{directionLabel(trade.direction)}</td>
              <td className={cn("py-3 pr-4 font-semibold", toneClass(pnlTone(trade.pnl)), "print:text-slate-950")}>
                {formatMoney(trade.pnl)}
              </td>
              <td className="py-3 pr-4">{formatNumber(trade.rr, 2)}</td>
              <td className="py-3 pr-4">{trade.setup || trade.strategyName || "-"}</td>
              <td className="py-3">
                {trade.compliancePercent !== null ? `${formatPercent(trade.compliancePercent)} ${copy.trades.plan}` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DailyNotes({
  report,
  copy,
  language,
}: {
  report: JournalReport;
  copy: typeof COPY[Language];
  language: Language;
}) {
  if (report.dailyNotes.length === 0) {
    return <EmptyLine label={copy.notes.empty} />;
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {report.dailyNotes.slice(0, 4).map((note) => (
        <article key={note.id} className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 print:border-slate-200 print:bg-slate-50">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-white print:text-slate-950">{formatDate(note.date, language)}</h3>
            <span className="text-xs text-slate-400 print:text-slate-500">
              {copy.notes.discipline} {formatNumber(note.disciplineScore, 0)}
            </span>
          </div>
          <div className="mt-3 space-y-2 text-sm text-slate-300 print:text-slate-700">
            {note.whatWentWell && <p><span className="font-semibold">{copy.notes.worked}:</span> {note.whatWentWell}</p>}
            {note.mistakesSummary && <p><span className="font-semibold">{copy.notes.mistakes}:</span> {note.mistakesSummary}</p>}
            {note.improvementPlan && <p><span className="font-semibold">{copy.notes.plan}:</span> {note.improvementPlan}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}

export function ReportsContent({
  report,
  csvHref,
  rawSymbol,
}: {
  report: JournalReport;
  csvHref: string;
  rawSymbol: string;
}) {
  const { language } = useLanguage();
  const copy = COPY[language];
  const summary = report.summary;

  return (
    <div className="space-y-5 print:bg-white print:text-slate-950">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-200 print:border-slate-300 print:bg-white print:text-slate-600">
            <FileText className="h-3.5 w-3.5" />
            {copy.badge}
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-white print:text-slate-950">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-400 print:text-slate-600">{copy.subtitle}</p>
        </div>
        <ReportActions csvHref={csvHref} />
      </div>

      <ReportFilters report={report} copy={copy} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={copy.stats.netPnl} value={formatMoney(summary.totalPnl)} tone={pnlTone(summary.totalPnl)} />
        <StatCard label={copy.stats.winRate} value={formatPercent(summary.winRate)} tone="profit" />
        <StatCard label={copy.stats.profitFactor} value={formatNumber(summary.profitFactor, 2)} tone="blue" />
        <StatCard label={copy.stats.expectancy} value={formatMoney(summary.expectancy)} tone={pnlTone(summary.expectancy)} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label={copy.stats.totalTrades} value={formatNumber(summary.totalTrades, 0)} tone="blue" />
        <StatCard label={copy.stats.closedOpen} value={`${summary.closedTrades} / ${summary.openTrades}`} />
        <StatCard label={copy.stats.averageRr} value={formatNumber(summary.averageRR, 2)} tone="amber" />
      </div>

      <Panel
        title={copy.executive.title}
        subtitle={`${copy.executive.generated} ${formatDate(report.generatedAt, language)}${rawSymbol ? ` ${copy.executive.for} ${rawSymbol.toUpperCase()}` : ""}`}
        icon={BarChart3}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-emerald-200 print:text-slate-950">{copy.executive.strengths}</h3>
            <InsightList items={report.insights.strengths} tone="profit" language={language} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-red-200 print:text-slate-950">{copy.executive.risks}</h3>
            <InsightList items={report.insights.risks} tone="loss" language={language} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-blue-200 print:text-slate-950">{copy.executive.actionPlan}</h3>
            <InsightList items={report.insights.actionPlan} tone="blue" language={language} />
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Playbook Performance" subtitle="Plan compliance and realized performance grouped by playbook." icon={Target}>
          <PlaybookPerformanceTable report={report} copy={copy} />
        </Panel>
        <Panel title={copy.symbolPanel.title} subtitle={copy.symbolPanel.subtitle} icon={Target}>
          <TopTable report={report} copy={copy} />
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title={copy.behavior.title} subtitle={copy.behavior.subtitle} icon={Brain}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white print:text-slate-950">{copy.behavior.mistakes}</h3>
              <div className="space-y-3">
                {report.analytics.byMistake.slice(0, 5).map((row) => (
                  <div key={row.label}>
                    <div className="mb-1 flex justify-between text-xs text-slate-400 print:text-slate-600">
                      <span>{row.label}</span>
                      <span>{formatMoney(row.netPnl)}</span>
                    </div>
                    <ProgressBar value={row.shareOfTrades} tone={row.netPnl < 0 ? "loss" : "profit"} />
                  </div>
                ))}
                {report.analytics.byMistake.length === 0 && <EmptyLine label={copy.behavior.noMistakes} />}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white print:text-slate-950">{copy.behavior.setups}</h3>
              <div className="space-y-3">
                {report.analytics.bySetup.slice(0, 5).map((row) => (
                  <div key={row.label}>
                    <div className="mb-1 flex justify-between text-xs text-slate-400 print:text-slate-600">
                      <span>{row.label}</span>
                      <span>{formatPercent(row.winRate)}</span>
                    </div>
                    <ProgressBar value={row.winRate} tone={row.netPnl < 0 ? "loss" : "profit"} />
                  </div>
                ))}
                {report.analytics.bySetup.length === 0 && <EmptyLine label={copy.behavior.noSetups} />}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title={copy.trades.title} subtitle={copy.trades.subtitle} icon={FileText}>
        <RecentTradesTable report={report} copy={copy} language={language} />
      </Panel>

      <Panel title={copy.notes.title} subtitle={copy.notes.subtitle} icon={CalendarDays}>
        <DailyNotes report={report} copy={copy} language={language} />
      </Panel>
    </div>
  );
}
