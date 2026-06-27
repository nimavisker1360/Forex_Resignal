"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  Download,
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
      session: "Session",
      result: "Result",
      win: "Win",
      loss: "Loss",
      breakeven: "Breakeven",
      aiReview: "AI Review",
      humanReview: "Human Review",
      done: "Done",
      missing: "Missing",
      screenshots: "Screenshots",
      hasScreenshots: "Has screenshots",
      noScreenshots: "No screenshots",
      source: "Source",
      manual: "Manual",
      mt5: "MT5 Import",
      minAi: "Min AI",
      maxAi: "Max AI",
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
      playbook: "Playbook",
      planCompliance: "Plan Compliance",
      reviewStatus: "Review Status",
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
      playbook: "پلی بوک",
      planCompliance: "پایبندی به پلن",
      reviewStatus: "وضعیت بررسی",
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

function formatAiScore(value: number | null | undefined) {
  return value === null || value === undefined ? "-" : `${value}/100`;
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
  const filterText = copy.filters as Record<string, string>;

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
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        {filterText.session || "Session"}
        <input name="session" defaultValue={filters.session} placeholder="London" className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-blue-500" />
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        {filterText.result || "Result"}
        <select name="result" defaultValue={filters.result} className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm normal-case text-slate-100 outline-none focus:border-blue-500">
          <option value="">{copy.filters.all}</option>
          <option value="WIN">{filterText.win || "Win"}</option>
          <option value="LOSS">{filterText.loss || "Loss"}</option>
          <option value="BREAKEVEN">{filterText.breakeven || "Breakeven"}</option>
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        {filterText.aiReview || "AI Review"}
        <select name="aiReview" defaultValue={filters.aiReview} className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm normal-case text-slate-100 outline-none focus:border-blue-500">
          <option value="">{copy.filters.all}</option>
          <option value="DONE">{filterText.done || "Done"}</option>
          <option value="MISSING">{filterText.missing || "Missing"}</option>
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        {filterText.humanReview || "Human Review"}
        <select name="humanReview" defaultValue={filters.humanReview} className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm normal-case text-slate-100 outline-none focus:border-blue-500">
          <option value="">{copy.filters.all}</option>
          <option value="DONE">{filterText.done || "Done"}</option>
          <option value="MISSING">{filterText.missing || "Missing"}</option>
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        {filterText.screenshots || "Screenshots"}
        <select name="screenshots" defaultValue={filters.screenshots} className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm normal-case text-slate-100 outline-none focus:border-blue-500">
          <option value="">{copy.filters.all}</option>
          <option value="HAS">{filterText.hasScreenshots || "Has screenshots"}</option>
          <option value="NONE">{filterText.noScreenshots || "No screenshots"}</option>
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        {filterText.source || "Source"}
        <select name="source" defaultValue={filters.source} className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm normal-case text-slate-100 outline-none focus:border-blue-500">
          <option value="">{copy.filters.all}</option>
          <option value="MANUAL">{filterText.manual || "Manual"}</option>
          <option value="MT5">{filterText.mt5 || "MT5 Import"}</option>
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        {filterText.minAi || "Min AI"}
        <input name="minAiScore" type="number" min="0" max="100" defaultValue={filters.minAiScore} className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-blue-500" />
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        {filterText.maxAi || "Max AI"}
        <input name="maxAiScore" type="number" min="0" max="100" defaultValue={filters.maxAiScore} className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-blue-500" />
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
    return <EmptyLine label="No strategy or playbook performance yet. Assign a strategy during trade review." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-800 text-sm print:divide-slate-200">
        <thead>
          <tr className="text-left text-xs uppercase text-slate-500">
            <th className="py-2 pr-4">Strategy / Playbook</th>
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

function SessionPerformanceTable({ report, copy }: { report: JournalReport; copy: typeof COPY[Language] }) {
  const rows = report.analytics.bySession.filter((row) => row.totalTrades > 0);

  if (rows.length === 0) {
    return <EmptyLine label="No session performance yet." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-800 text-sm print:divide-slate-200">
        <thead>
          <tr className="text-left text-xs uppercase text-slate-500">
            <th className="py-2 pr-4">Session</th>
            <th className="py-2 pr-4">{copy.symbolPanel.trades}</th>
            <th className="py-2 pr-4">{copy.symbolPanel.winRate}</th>
            <th className="py-2 pr-4">{copy.symbolPanel.netPnl}</th>
            <th className="py-2">Average PnL</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 print:divide-slate-200">
          {rows.map((row) => (
            <tr key={row.session} className="text-slate-300 print:text-slate-700">
              <td className="py-3 pr-4 font-semibold text-white print:text-slate-950">{row.session}</td>
              <td className="py-3 pr-4">{row.totalTrades}</td>
              <td className="py-3 pr-4">{formatPercent(row.winRate)}</td>
              <td className={cn("py-3 pr-4 font-semibold", toneClass(pnlTone(row.netPnl)), "print:text-slate-950")}>
                {formatMoney(row.netPnl)}
              </td>
              <td className="py-3">{formatMoney(row.averagePnl)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function planComplianceLabel(trade: JournalReport["recentTrades"][number]) {
  if (!trade.followedPlan || trade.followedPlan === "NOT_REVIEWED" || trade.compliancePercent === null) {
    return "-";
  }

  return formatPercent(trade.compliancePercent);
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
            <th className="py-2 pr-4">{copy.trades.playbook}</th>
            <th className="py-2 pr-4">{copy.trades.planCompliance}</th>
            <th className="py-2 pr-4">AI</th>
            <th className="py-2 pr-4">Human</th>
            <th className="py-2">{copy.trades.reviewStatus}</th>
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
              <td className="py-3 pr-4">{trade.strategyName || trade.setup || "-"}</td>
              <td className="py-3 pr-4">{planComplianceLabel(trade)}</td>
              <td className="py-3 pr-4">{formatAiScore(trade.aiReviewScore)}</td>
              <td className="py-3 pr-4">{trade.humanReviewLabel}</td>
              <td className="py-3">{trade.combinedReviewStatus}</td>
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

function FrequencyList({
  title,
  rows,
  emptyLabel,
}: {
  title: string;
  rows: JournalReport["aiSummary"]["topStrengths"];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 print:border-slate-200 print:bg-slate-50">
      <h3 className="text-sm font-semibold text-white print:text-slate-950">{title}</h3>
      {rows.length > 0 ? (
        <div className="mt-3 space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-3 text-sm text-slate-300 print:text-slate-700">
              <span>{row.label}</span>
              <span className="shrink-0 rounded-lg border border-slate-700 px-2 py-0.5 text-xs font-semibold text-slate-200 print:border-slate-300 print:text-slate-700">
                {row.count}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 text-sm text-slate-500 print:text-slate-600">{emptyLabel}</div>
      )}
    </div>
  );
}

function AITradeHighlights({
  title,
  rows,
  language,
}: {
  title: string;
  rows: JournalReport["aiSummary"]["strongestTrades"];
  language: Language;
}) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-white print:text-slate-950">{title}</h3>
      <div className="space-y-3">
        {rows.map((trade) => (
          <a
            key={trade.id}
            href={`/dashboard/trades/${trade.id}`}
            className="block rounded-lg border border-slate-800 bg-slate-950/50 p-3 transition hover:border-slate-600 print:border-slate-200 print:bg-slate-50"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-white print:text-slate-950">
                {trade.symbol} {trade.direction}
              </div>
              <div className={cn("text-sm font-semibold", toneClass(trade.score >= 70 ? "profit" : trade.score >= 50 ? "amber" : "loss"), "print:text-slate-950")}>
                {formatAiScore(trade.score)}
              </div>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 print:text-slate-600">
              <span>{formatDate(trade.openedAt, language)}</span>
              <span>{formatMoney(trade.pnl)}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-slate-300 print:text-slate-700">{trade.summary}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

function AIReviewSummaryPanel({
  report,
  language,
}: {
  report: JournalReport;
  language: Language;
}) {
  const ai = report.aiSummary;
  const copy =
    language === "fa"
      ? {
          title: "خلاصه هوش مصنوعی",
          subtitle: "جمع‌بندی از بررسی‌های AI ذخیره‌شده برای معاملات همین گزارش.",
          reviewed: "بررسی‌شده",
          coverage: "پوشش AI",
          averageScore: "میانگین امتیاز AI",
          confidence: "میانگین اطمینان",
          empty: "هنوز برای معاملات این بازه بررسی AI ذخیره نشده است.",
          strengths: "نقاط قوت پرتکرار",
          weaknesses: "ضعف‌های پرتکرار",
          mistakes: "اشتباهات پرتکرار",
          actions: "اقدام‌های پیشنهادی",
          strongest: "بهترین معاملات از نظر AI",
          weakest: "ضعیف‌ترین معاملات از نظر AI",
          noItems: "موردی ثبت نشده است.",
        }
      : {
          title: "AI Review Summary",
          subtitle: "Summary from saved AI reviews for the trades in this report.",
          reviewed: "Reviewed",
          coverage: "AI Coverage",
          averageScore: "Average AI Score",
          confidence: "Average Confidence",
          empty: "No saved AI reviews found for this report period.",
          strengths: "Repeated Strengths",
          weaknesses: "Repeated Weaknesses",
          mistakes: "Repeated Mistakes",
          actions: "Suggested Actions",
          strongest: "Strongest AI-Rated Trades",
          weakest: "Weakest AI-Rated Trades",
          noItems: "No items recorded.",
        };

  return (
    <Panel title={copy.title} subtitle={copy.subtitle} icon={Brain}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={copy.reviewed} value={`${ai.reviewedTrades} / ${report.summary.totalTrades}`} tone="blue" />
        <StatCard label={copy.coverage} value={formatPercent(ai.reviewCoveragePercent)} tone="blue" />
        <StatCard label={copy.averageScore} value={formatAiScore(ai.averageScore)} tone={ai.averageScore === null ? "neutral" : ai.averageScore >= 70 ? "profit" : ai.averageScore >= 50 ? "amber" : "loss"} />
        <StatCard label={copy.confidence} value={ai.averageConfidence === null ? "N/A" : formatPercent(ai.averageConfidence * 100)} tone="amber" />
      </div>

      {ai.reviewedTrades === 0 ? (
        <div className="mt-4">
          <EmptyLine label={copy.empty} />
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 lg:grid-cols-4">
            <FrequencyList title={copy.strengths} rows={ai.topStrengths} emptyLabel={copy.noItems} />
            <FrequencyList title={copy.weaknesses} rows={ai.topWeaknesses} emptyLabel={copy.noItems} />
            <FrequencyList title={copy.mistakes} rows={ai.topMistakes} emptyLabel={copy.noItems} />
            <FrequencyList title={copy.actions} rows={ai.improvementPlan} emptyLabel={copy.noItems} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <AITradeHighlights title={copy.strongest} rows={ai.strongestTrades} language={language} />
            <AITradeHighlights title={copy.weakest} rows={ai.weakestTrades} language={language} />
          </div>
        </div>
      )}
    </Panel>
  );
}

function listBlock(label: string, items: string[]) {
  return items.length > 0
    ? [`${label}:`, ...items.map((item) => `- ${item}`)]
    : [`${label}: -`];
}

function buildTradeReportText(tradeReport: JournalReport["tradeReports"][number]) {
  const { trade, aiReview, strategyReview, checklists, journal, screenshots, dataQuality } = tradeReport;
  const lines = [
    `Trade Report - ${trade.symbol} ${trade.direction}`,
    `Trade ID: ${trade.id}`,
    `Account: ${trade.accountName}${trade.accountNumber ? ` / ${trade.accountNumber}` : ""}${trade.broker ? ` / ${trade.broker}` : ""}`,
    `Source: ${trade.source}`,
    `Status: ${trade.status}`,
    `Opened At: ${trade.openedAt || "-"}`,
    `Closed At: ${trade.closedAt || "-"}`,
    `PnL: ${trade.pnl}`,
    `RR: ${trade.rr ?? "-"}`,
    `Setup: ${trade.setup || "-"}`,
    `Session: ${trade.session || "-"}`,
    `Emotion: ${trade.emotion || "-"}`,
    `Mistake: ${trade.mistake || "-"}`,
    `Tags: ${trade.tags.join(", ") || "-"}`,
    "",
    "AI Review",
    aiReview ? `Score: ${aiReview.score}/100` : "No AI review saved.",
    `Data Quality: ${dataQuality.level}`,
  ];

  if (aiReview) {
    lines.push(
      `Confidence: ${aiReview.confidenceLabel} (${Math.round(aiReview.confidence * 100)}%)`,
      `Confidence Reason: ${aiReview.confidenceReason}`,
      `Summary: ${aiReview.fullSummary}`,
      `Risk Management: ${aiReview.breakdown.riskManagement}/30`,
      `Execution Quality: ${aiReview.breakdown.executionQuality}/30`,
      `Plan Compliance: ${aiReview.breakdown.planCompliance}/20`,
      `Documentation Quality: ${aiReview.breakdown.documentationQuality}/20`,
      ...listBlock("Strengths", aiReview.strengths),
      ...listBlock("Weaknesses", aiReview.weaknesses),
      ...listBlock("Mistakes", aiReview.mistakes),
      `Risk Review: ${aiReview.riskReview}`,
      `Psychology Review: ${aiReview.psychologyReview}`,
      `Playbook Review: ${aiReview.playbookReview}`,
      ...listBlock("Improvement Plan", aiReview.improvementPlan),
      `AI Tags: ${aiReview.tags.join(", ") || "-"}`
    );
  }

  if (dataQuality.missing.length > 0) {
    lines.push(
      "",
      "Data Quality Notes",
      ...listBlock("Missing", dataQuality.missing),
      `Reason: ${dataQuality.reason}`
    );
  }

  lines.push(
    "",
    "Strategy Review",
    strategyReview
      ? `Strategy: ${strategyReview.strategyName || "-"}`
      : "No strategy review saved."
  );

  if (strategyReview) {
    lines.push(
      `Followed Plan: ${strategyReview.followedPlan}`,
      `Compliance: ${strategyReview.compliancePercent}%`,
      `Required Compliance: ${strategyReview.requiredCompliancePercent}%`,
      `Rules: ${strategyReview.followedRules}/${strategyReview.totalRules} followed, ${strategyReview.violatedRules} violated`,
      `Notes: ${strategyReview.notes || "-"}`
    );

    if (strategyReview.ruleReviews.length > 0) {
      lines.push("Rule Reviews:");
      strategyReview.ruleReviews.forEach((rule) => {
        lines.push(
          `- ${rule.title} [${rule.status}]${rule.required ? " required" : ""}${rule.note ? ` - ${rule.note}` : ""}`
        );
      });
    }
  }

  lines.push("", "Checklists");
  if (checklists.length === 0) {
    lines.push("No checklists saved.");
  } else {
    checklists.forEach((checklist) => {
      lines.push(
        `${checklist.title}: ${checklist.completionPercent}% (${checklist.completedCount}/${checklist.totalCount})`
      );
      checklist.answers.forEach((answer) => {
        lines.push(
          `- ${answer.checked ? "Done" : "Open"}${answer.required ? " / Required" : ""}: ${answer.title}${answer.note ? ` - ${answer.note}` : ""}`
        );
      });
    });
  }

  lines.push("", "Journal");
  if (!journal) {
    lines.push("No journal metadata saved.");
  } else {
    lines.push(
      `Rating: ${journal.rating ?? "-"}`,
      `Exit Reason: ${journal.exitReason || "-"}`,
      `Psychology Status: ${journal.psychologyStatus || "-"}`,
      `Trade Note: ${journal.tradeNote || "-"}`,
      `Daily Journal: ${journal.dailyJournal || "-"}`,
      `Mistakes: ${journal.mistakes.join(", ") || "-"}`,
      `Setups: ${journal.setups.join(", ") || "-"}`,
      `Emotions: ${journal.emotions.join(", ") || "-"}`,
      `Custom Tags: ${journal.customTags.join(", ") || "-"}`
    );
  }

  lines.push("", "Screenshots");
  if (screenshots.length === 0) {
    lines.push("No screenshots saved.");
  } else {
    screenshots.forEach((screenshot) => {
      lines.push(`- ${screenshot.type}: ${screenshot.url}`);
    });
  }

  return lines.join("\n");
}

function reportFileName(tradeReport: JournalReport["tradeReports"][number]) {
  const { trade } = tradeReport;
  const date = trade.openedAt?.slice(0, 10) || "undated";
  return `${date}-${trade.symbol}-${trade.direction}-${trade.id.slice(0, 8)}.txt`;
}

function ReportBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center rounded-md border border-slate-700 bg-slate-900 px-2.5 text-xs font-semibold text-slate-200 print:border-slate-300 print:bg-white print:text-slate-700">
      {children}
    </span>
  );
}

function ReportListBlock({
  title,
  items,
  limit = 4,
}: {
  title: string;
  items: string[];
  limit?: number;
}) {
  const visibleItems = items.slice(0, limit);

  return (
    <div>
      <div className="text-xs font-semibold uppercase text-slate-500 print:text-slate-500">{title}</div>
      {visibleItems.length > 0 ? (
        <ul className="mt-2 space-y-2 text-sm text-slate-300 print:text-slate-700">
          {visibleItems.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 text-sm text-slate-500 print:text-slate-600">No items saved.</div>
      )}
      {items.length > visibleItems.length && (
        <div className="mt-2 text-xs text-slate-500 print:text-slate-500">
          +{items.length - visibleItems.length} more
        </div>
      )}
    </div>
  );
}

function TradeReportFilesPanel({
  report,
  language,
}: {
  report: JournalReport;
  language: Language;
}) {
  if (report.tradeReports.length === 0) {
    return (
      <Panel title="Trade Report Files" subtitle="Each trade keeps its own related reports." icon={FileText}>
        <EmptyLine label="No trades found for this report period." />
      </Panel>
    );
  }

  return (
    <Panel title="Trade Report Files" subtitle="Each trade keeps its own AI, strategy, checklist, journal, and screenshot reports." icon={FileText}>
      <div className="space-y-4">
        {report.tradeReports.map((tradeReport) => {
          const { trade, aiReview, strategyReview, checklists, journal, screenshots } = tradeReport;
          const text = buildTradeReportText(tradeReport);
          const fileHref = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;

          return (
            <article key={trade.id} className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/40 print:border-slate-200 print:bg-white">
              <div className="flex flex-col gap-4 border-b border-slate-800 bg-[#111827] p-4 print:border-slate-200 print:bg-slate-50 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-white print:text-slate-950">
                      {trade.symbol} {trade.direction}
                    </h3>
                    <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", trade.status === "CLOSED" ? "bg-emerald-500/10 text-emerald-200" : "bg-blue-500/10 text-blue-200", "print:bg-white print:text-slate-700")}>
                      {trade.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 print:text-slate-600">
                    <span>{formatDate(trade.openedAt, language)}</span>
                    <span>{trade.accountNumber || trade.accountName}</span>
                    <span>RR {formatNumber(trade.rr, 2)}</span>
                    <span>{trade.setup || trade.session || "No setup label"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className={cn("mr-1 text-base font-semibold", toneClass(pnlTone(trade.pnl)), "print:text-slate-950")}>
                    {formatMoney(trade.pnl)}
                  </div>
                  <a
                    href={fileHref}
                    download={reportFileName(tradeReport)}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-blue-500/30 px-3 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/10 print:hidden"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                  <a
                    href={`/dashboard/trades/${trade.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-700 px-3 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 print:hidden"
                  >
                    Open Trade
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 px-4 pt-4">
                <ReportBadge>AI {aiReview ? formatAiScore(aiReview.score) : "missing"}</ReportBadge>
                <ReportBadge>Data {tradeReport.dataQuality.level}</ReportBadge>
                <ReportBadge>Strategy {strategyReview ? `${strategyReview.compliancePercent}%` : "missing"}</ReportBadge>
                <ReportBadge>Checklists {checklists.length}</ReportBadge>
                <ReportBadge>Journal {journal ? "saved" : "missing"}</ReportBadge>
                <ReportBadge>Screenshots {screenshots.length}</ReportBadge>
              </div>

              <div className="space-y-4 p-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                  {aiReview ? (
                    <section className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 text-sm text-slate-300 print:border-slate-200 print:bg-slate-50 print:text-slate-700">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-white print:text-slate-950">
                            <Brain className="h-4 w-4 text-violet-300" />
                            AI Analysis
                          </div>
                          <p className="mt-2 leading-6">{aiReview.summary}</p>
                          <div className="mt-2 text-xs text-slate-400 print:text-slate-500">
                            Confidence: {aiReview.confidenceLabel}. {aiReview.confidenceReason}
                          </div>
                          {tradeReport.dataQuality.missing.length > 0 && (
                            <div className="mt-3 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100 print:border-slate-200 print:bg-white print:text-slate-700">
                              Data quality: {tradeReport.dataQuality.reason}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 rounded-lg border border-violet-500/20 bg-slate-950/60 px-4 py-3 text-right print:border-slate-200 print:bg-white">
                          <div className={cn("text-xl font-semibold", toneClass(aiReview.score >= 70 ? "profit" : aiReview.score >= 50 ? "amber" : "loss"), "print:text-slate-950")}>
                            {formatAiScore(aiReview.score)}
                          </div>
                          <div className="mt-1 text-xs text-slate-400 print:text-slate-500">
                            {formatPercent(aiReview.confidence * 100)} confidence
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-4">
                        <ReportBadge>Risk {aiReview.breakdown.riskManagement}/30</ReportBadge>
                        <ReportBadge>Execution {aiReview.breakdown.executionQuality}/30</ReportBadge>
                        <ReportBadge>Plan {aiReview.breakdown.planCompliance}/20</ReportBadge>
                        <ReportBadge>Docs {aiReview.breakdown.documentationQuality}/20</ReportBadge>
                      </div>

                      <details className="mt-4 rounded-lg border border-slate-800 bg-slate-950/40 p-3 print:hidden">
                        <summary className="cursor-pointer text-sm font-semibold text-white print:text-slate-950">
                          Full AI review
                        </summary>
                        <p className="mt-3 leading-6 text-slate-300">{aiReview.fullSummary}</p>
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                          <ReportListBlock title="Strengths" items={aiReview.strengths} />
                          <ReportListBlock title="Weaknesses" items={aiReview.weaknesses} />
                          <ReportListBlock title="Mistakes" items={aiReview.mistakes} />
                        </div>
                        <div className="mt-4 grid gap-4 lg:grid-cols-3">
                          <div>
                            <div className="text-xs font-semibold uppercase text-slate-400 print:text-slate-500">Risk Review</div>
                            <p className="mt-2 leading-6">{aiReview.riskReview}</p>
                          </div>
                          <div>
                            <div className="text-xs font-semibold uppercase text-slate-400 print:text-slate-500">Psychology Review</div>
                            <p className="mt-2 leading-6">{aiReview.psychologyReview}</p>
                          </div>
                          <div>
                            <div className="text-xs font-semibold uppercase text-slate-400 print:text-slate-500">Playbook Review</div>
                            <p className="mt-2 leading-6">{aiReview.playbookReview}</p>
                          </div>
                        </div>
                        <div className="mt-4 border-t border-violet-500/10 pt-4">
                          <ReportListBlock title="Improvement Plan" items={aiReview.improvementPlan} />
                        </div>
                      </details>
                      {aiReview.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {aiReview.tags.map((tag) => (
                            <ReportBadge key={tag}>{tag}</ReportBadge>
                          ))}
                        </div>
                      )}
                    </section>
                  ) : (
                    <section className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-500 print:border-slate-200 print:bg-slate-50 print:text-slate-600">
                      No AI analysis saved for this trade.
                      {tradeReport.dataQuality.missing.length > 0 && (
                        <div className="mt-3 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100 print:border-slate-200 print:bg-white print:text-slate-700">
                          Data quality: {tradeReport.dataQuality.reason}
                        </div>
                      )}
                    </section>
                  )}

                  <aside className="space-y-3">
                    <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 text-sm text-slate-300 print:border-slate-200 print:bg-slate-50 print:text-slate-700">
                      <div className="font-semibold text-white print:text-slate-950">Execution</div>
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                        <dt className="text-slate-500">Entry</dt>
                        <dd className="text-right">{trade.openedAt ? formatDate(trade.openedAt, language) : "-"}</dd>
                        <dt className="text-slate-500">Exit</dt>
                        <dd className="text-right">{trade.closedAt ? formatDate(trade.closedAt, language) : "-"}</dd>
                        <dt className="text-slate-500">PnL</dt>
                        <dd className={cn("text-right font-semibold", toneClass(pnlTone(trade.pnl)), "print:text-slate-950")}>{formatMoney(trade.pnl)}</dd>
                        <dt className="text-slate-500">RR</dt>
                        <dd className="text-right">{formatNumber(trade.rr, 2)}</dd>
                      </dl>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 text-sm text-slate-300 print:border-slate-200 print:bg-slate-50 print:text-slate-700">
                      <div className="font-semibold text-white print:text-slate-950">Trade Reports</div>
                      <div className="mt-3 space-y-2">
                        <p>Strategy: {strategyReview?.strategyName || trade.strategyName || "-"}</p>
                        <p>Plan: {strategyReview?.followedPlan || trade.followedPlan || "-"}</p>
                        <p>Checklists: {checklists.length > 0 ? checklists.map((item) => `${item.title} ${item.completionPercent}%`).join("; ") : "-"}</p>
                        <p>Journal: {journal?.tradeNote || trade.notes || "No trade note saved."}</p>
                        <p>Media: {screenshots.length} screenshot{screenshots.length === 1 ? "" : "s"}</p>
                      </div>
                    </div>
                  </aside>
                </div>

                <details className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 text-sm text-slate-300 print:border-slate-200 print:bg-white print:text-slate-700">
                  <summary className="cursor-pointer font-semibold text-white print:text-slate-950">
                    Journal, strategy, and media details
                  </summary>
                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <div>
                      <div className="font-semibold text-white print:text-slate-950">Strategy and Checklists</div>
                      <p className="mt-2">Strategy: {strategyReview?.strategyName || trade.strategyName || "-"}</p>
                      <p>Plan: {strategyReview?.followedPlan || trade.followedPlan || "-"}</p>
                      <p>Checklists: {checklists.length > 0 ? checklists.map((item) => `${item.title} ${item.completionPercent}%`).join("; ") : "-"}</p>
                    </div>
                    <div>
                      <div className="font-semibold text-white print:text-slate-950">Journal</div>
                      <p className="mt-2">Rating: {journal?.rating ?? "-"}</p>
                      <p>Exit reason: {journal?.exitReason || trade.exitReason || "-"}</p>
                      <p>{journal?.tradeNote || trade.notes || "No trade note saved."}</p>
                    </div>
                    <div>
                      <div className="font-semibold text-white print:text-slate-950">Media</div>
                      <p className="mt-2">Entry screenshot: {trade.entryScreenshotUrl ? "saved" : "-"}</p>
                      <p>Exit screenshot: {trade.exitScreenshotUrl ? "saved" : "-"}</p>
                      <p>Total screenshots: {screenshots.length}</p>
                    </div>
                  </div>
                </details>
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
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
  const showAccountAiSummary = false;

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

      {showAccountAiSummary ? <AIReviewSummaryPanel report={report} language={language} /> : null}
      <TradeReportFilesPanel report={report} language={language} />

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Session Performance" subtitle="Timing results grouped by actual trading session." icon={CalendarDays}>
          <SessionPerformanceTable report={report} copy={copy} />
        </Panel>
        <Panel title="Strategy / Playbook Performance" subtitle="Only real selected strategies and playbooks are shown here." icon={Target}>
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
