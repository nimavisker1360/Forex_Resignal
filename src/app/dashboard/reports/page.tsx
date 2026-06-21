import { redirect } from "next/navigation";
import { ReportsContent } from "@/app/dashboard/reports/reports-content";
import {
  buildJournalReport,
  type JournalReport,
  ReportValidationError,
} from "@/lib/reports/journal-report";
import { getCurrentUserId } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

type ReportsPageProps = {
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
          <h1 className="font-semibold">Report filters are invalid</h1>
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

  return (
    <ReportsContent
      report={report}
      csvHref={`/api/reports/journal?${reportQuery(report.filters, "csv")}`}
      rawSymbol={first(params.symbol) || ""}
    />
  );
}
