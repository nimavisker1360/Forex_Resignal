import { redirect } from "next/navigation";
import { AlertTriangle, BarChart3, Brain, CalendarDays, CheckCircle2, FileText, Target } from "lucide-react";
import { ReportActions } from "@/app/dashboard/reports/report-actions";
import {
  buildJournalReport,
  type JournalReport,
  ReportValidationError,
} from "@/lib/reports/journal-report";
import { getCurrentUserId } from "@/lib/server-auth";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ReportsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type Tone = "neutral" | "profit" | "loss" | "blue" | "amber";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function appendParam(params: URLSearchParams, name: string, value: string | undefined) {
  if (value && value.trim()) {
    params.set(name, value.trim());
  }
}

function reportQuery(filters: JournalReport["filters"], format?: string) {
  const params = new URLSearchParams();
  params.set("dateRange", filters.dateRange);
  appendParam(params, "dateFrom", filters.dateFrom);
  appendParam(params, "dateTo", filters.dateTo);
  appendParam(params, "accountId", filters.accountId);
  appendParam(params, "symbol", filters.symbol);
  appendParam(params, "direction", filters.direction);
  appendParam(params, "strategy", filters.strategy);

  if (format) {
    params.set("format", format);
  }

  return params.toString();
}

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

function formatDirection(value: string | null | undefined) {
  if (value === "BUY") {
    return "خرید";
  }

  if (value === "SELL") {
    return "فروش";
  }

  return value || "-";
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
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
  children: React.ReactNode;
  icon?: typeof FileText;
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

function ReportFilters({ report }: { report: JournalReport }) {
  const filters = report.filters;

  return (
    <form className="grid gap-3 rounded-lg border border-slate-800 bg-[#0F172A] p-4 print:hidden md:grid-cols-7">
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400 md:col-span-1">
        بازه زمانی
        <select
          name="dateRange"
          defaultValue={filters.dateRange}
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm normal-case text-slate-100 outline-none focus:border-blue-500"
        >
          <option value="today">امروز</option>
          <option value="thisWeek">این هفته</option>
          <option value="thisMonth">این ماه</option>
          <option value="thisYear">امسال</option>
          <option value="all">همه</option>
          <option value="custom">دلخواه</option>
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        از تاریخ
        <input
          type="date"
          name="dateFrom"
          defaultValue={filters.dateFrom}
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-blue-500"
        />
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        تا تاریخ
        <input
          type="date"
          name="dateTo"
          defaultValue={filters.dateTo}
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-blue-500"
        />
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        حساب
        <select
          name="accountId"
          defaultValue={filters.accountId}
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm normal-case text-slate-100 outline-none focus:border-blue-500"
        >
          <option value="">همه حساب‌ها</option>
          {report.filterOptions.accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        نماد
        <input
          name="symbol"
          defaultValue={filters.symbol}
          placeholder="EURUSD"
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm uppercase text-slate-100 outline-none focus:border-blue-500"
        />
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        جهت
        <select
          name="direction"
          defaultValue={filters.direction}
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm normal-case text-slate-100 outline-none focus:border-blue-500"
        >
          <option value="">همه</option>
          <option value="BUY">خرید</option>
          <option value="SELL">فروش</option>
        </select>
      </label>
      <label className="space-y-1 text-xs font-semibold uppercase text-slate-400">
        استراتژی
        <input
          name="strategy"
          defaultValue={filters.strategy}
          placeholder="نام ستاپ"
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-blue-500"
        />
      </label>
      <div className="flex items-end gap-2 md:col-span-7">
        <button className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500">
          ساخت گزارش
        </button>
        <a
          href="/dashboard/reports"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-700 px-4 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
        >
          پاک کردن
        </a>
      </div>
    </form>
  );
}

function InsightList({ items, tone }: { items: string[]; tone: "profit" | "loss" | "blue" }) {
  const Icon = tone === "loss" ? AlertTriangle : tone === "profit" ? CheckCircle2 : Target;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item} className="flex gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3 print:border-slate-200 print:bg-slate-50">
          <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", toneClass(tone))} />
          <p className="text-sm text-slate-300 print:text-slate-700">{item}</p>
        </div>
      ))}
    </div>
  );
}

function TopTable({ report }: { report: JournalReport }) {
  const rows = report.analytics.bySymbol.slice(0, 6);

  if (rows.length === 0) {
    return <EmptyLine label="برای این بازه معامله بسته‌شده‌ای پیدا نشد." />;
  }

  const maxAbs = Math.max(...rows.map((row) => Math.abs(row.netPnl)), 1);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-800 text-sm print:divide-slate-200">
        <thead>
          <tr className="text-left text-xs uppercase text-slate-500">
            <th className="py-2 pr-4">نماد</th>
            <th className="py-2 pr-4">تعداد معاملات</th>
            <th className="py-2 pr-4">نرخ برد</th>
            <th className="py-2 pr-4">سود/زیان خالص</th>
            <th className="py-2">وزن</th>
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

function RecentTradesTable({ report }: { report: JournalReport }) {
  const rows = report.recentTrades.slice(0, 12);

  if (rows.length === 0) {
    return <EmptyLine label="برای این بازه معامله‌ای پیدا نشد." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-800 text-sm print:divide-slate-200">
        <thead>
          <tr className="text-left text-xs uppercase text-slate-500">
            <th className="py-2 pr-4">تاریخ</th>
            <th className="py-2 pr-4">نماد</th>
            <th className="py-2 pr-4">جهت</th>
            <th className="py-2 pr-4">سود/زیان</th>
            <th className="py-2 pr-4">RR</th>
            <th className="py-2 pr-4">ستاپ</th>
            <th className="py-2">اجرا</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 print:divide-slate-200">
          {rows.map((trade) => (
            <tr key={trade.id} className="text-slate-300 print:text-slate-700">
              <td className="whitespace-nowrap py-3 pr-4">{formatDate(trade.openedAt)}</td>
              <td className="py-3 pr-4 font-semibold text-white print:text-slate-950">{trade.symbol}</td>
              <td className="py-3 pr-4">{formatDirection(trade.direction)}</td>
              <td className={cn("py-3 pr-4 font-semibold", toneClass(pnlTone(trade.pnl)), "print:text-slate-950")}>
                {formatMoney(trade.pnl)}
              </td>
              <td className="py-3 pr-4">{formatNumber(trade.rr, 2)}</td>
              <td className="py-3 pr-4">{trade.setup || trade.strategyName || "-"}</td>
              <td className="py-3">
                {trade.compliancePercent !== null ? `${formatPercent(trade.compliancePercent)} پایبندی به پلن` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DailyNotes({ report }: { report: JournalReport }) {
  if (report.dailyNotes.length === 0) {
    return <EmptyLine label="برای این بازه یادداشت ژورنال روزانه‌ای پیدا نشد." />;
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {report.dailyNotes.slice(0, 4).map((note) => (
        <article key={note.id} className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 print:border-slate-200 print:bg-slate-50">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-white print:text-slate-950">{formatDate(note.date)}</h3>
            <span className="text-xs text-slate-400 print:text-slate-500">
              نظم {formatNumber(note.disciplineScore, 0)}
            </span>
          </div>
          <div className="mt-3 space-y-2 text-sm text-slate-300 print:text-slate-700">
            {note.whatWentWell && <p><span className="font-semibold">نقاط مثبت:</span> {note.whatWentWell}</p>}
            {note.mistakesSummary && <p><span className="font-semibold">اشتباهات:</span> {note.mistakesSummary}</p>}
            {note.improvementPlan && <p><span className="font-semibold">برنامه:</span> {note.improvementPlan}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}

async function loadReport(params: Record<string, string | string[] | undefined>) {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/login");
  }

  return buildJournalReport(userId, params);
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = (await searchParams) || {};
  let report: JournalReport;

  try {
    report = await loadReport(params);
  } catch (error) {
    if (error instanceof ReportValidationError) {
      return (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
          <h1 className="font-semibold">فیلترهای گزارش معتبر نیستند</h1>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {error.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      );
    }

    throw error;
  }

  const summary = report.summary;
  const csvHref = `/api/reports/journal?${reportQuery(report.filters, "csv")}`;
  const rawSymbol = first(params.symbol) || "";

  return (
    <div className="space-y-5 print:bg-white print:text-slate-950">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-200 print:border-slate-300 print:bg-white print:text-slate-600">
            <FileText className="h-3.5 w-3.5" />
            گزارش عملکرد معاملاتی
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-white print:text-slate-950">گزارش ژورنال</h1>
          <p className="mt-1 text-sm text-slate-400 print:text-slate-600">
            خلاصه آماده ارائه بر اساس معاملات ژورنال، آنالیتیکس، پلی‌بوک‌ها، چک‌لیست‌ها و یادداشت‌های روزانه.
          </p>
        </div>
        <ReportActions csvHref={csvHref} />
      </div>

      <ReportFilters report={report} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="سود/زیان خالص" value={formatMoney(summary.totalPnl)} tone={pnlTone(summary.totalPnl)} />
        <StatCard label="نرخ برد" value={formatPercent(summary.winRate)} tone="profit" />
        <StatCard label="فاکتور سود" value={formatNumber(summary.profitFactor, 2)} tone="blue" />
        <StatCard label="امید ریاضی" value={formatMoney(summary.expectancy)} tone={pnlTone(summary.expectancy)} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label="کل معاملات" value={formatNumber(summary.totalTrades, 0)} tone="blue" />
        <StatCard label="بسته / باز" value={`${summary.closedTrades} / ${summary.openTrades}`} />
        <StatCard label="میانگین RR" value={formatNumber(summary.averageRR, 2)} tone="amber" />
      </div>

      <Panel
        title="خلاصه مدیریتی"
        subtitle={`تولید شده در ${formatDate(report.generatedAt)}${rawSymbol ? ` برای ${rawSymbol.toUpperCase()}` : ""}`}
        icon={BarChart3}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-emerald-200 print:text-slate-950">نقاط قوت</h3>
            <InsightList items={report.insights.strengths} tone="profit" />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-red-200 print:text-slate-950">ریسک‌ها</h3>
            <InsightList items={report.insights.risks} tone="loss" />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-blue-200 print:text-slate-950">برنامه اقدام</h3>
            <InsightList items={report.insights.actionPlan} tone="blue" />
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="عملکرد بر اساس نماد" subtitle="نمادهای برتر بر اساس سود/زیان خالص." icon={Target}>
          <TopTable report={report} />
        </Panel>
        <Panel title="رفتار و ستاپ" subtitle="تگ‌های پرتکرار در معاملات بسته‌شده." icon={Brain}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white print:text-slate-950">اشتباهات</h3>
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
                {report.analytics.byMistake.length === 0 && <EmptyLine label="هنوز تگ اشتباه ثبت نشده است." />}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white print:text-slate-950">ستاپ‌ها</h3>
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
                {report.analytics.bySetup.length === 0 && <EmptyLine label="هنوز ستاپی ثبت نشده است." />}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="معاملات اخیر" subtitle="آخرین معاملاتی که در خروجی گزارش آمده‌اند." icon={FileText}>
        <RecentTradesTable report={report} />
      </Panel>

      <Panel title="یادداشت‌های ژورنال روزانه" subtitle="آخرین یادداشت‌های ثبت‌شده در بازه انتخابی." icon={CalendarDays}>
        <DailyNotes report={report} />
      </Panel>
    </div>
  );
}
