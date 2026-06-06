import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera, ImageOff } from "lucide-react";
import {
  fetchJournalApi,
  mapPrismaTradeToJournalTrade,
  type JournalTradeDto,
  type PrismaTradeResponse,
} from "@/app/journal/_lib/journal-api";
import { JournalReviewForms } from "@/app/journal/[id]/journal-review-forms";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type JournalTradeDetailPageProps = {
  params: Promise<{ id: string }>;
};

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

function formatLabel(value: string | null | undefined) {
  return value ? value.replace(/_/g, " ") : "-";
}

function resultClass(result: string | null | undefined) {
  if (result === "win") {
    return "border-emerald-500/30 bg-emerald-500/10 text-[#10B981]";
  }

  if (result === "loss") {
    return "border-red-500/30 bg-red-500/10 text-[#EF4444]";
  }

  return "border-slate-700 bg-slate-900 text-slate-300";
}

function Metric({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827] p-3">
      <div className="text-xs font-medium uppercase text-slate-400">{label}</div>
      <div className={cn("mt-1 truncate text-sm font-semibold text-white", className)}>
        {value}
      </div>
    </div>
  );
}

function ScreenshotPanel({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#111827]">
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3 text-sm font-semibold text-white">
        <Camera className="h-4 w-4 text-blue-400" />
        {label}
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="block">
          <img src={url} alt={`${label} screenshot`} className="aspect-video w-full object-cover" />
        </a>
      ) : (
        <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-[#0F172A] p-6 text-center text-sm text-slate-400">
          <ImageOff className="h-8 w-8 text-slate-600" />
          <div className="font-semibold text-white">No screenshot uploaded</div>
          <button className="rounded-xl border border-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
            Upload screenshot
          </button>
        </div>
      )}
    </div>
  );
}

function TradeInfo({ trade }: { trade: JournalTradeDto }) {
  const rows: Array<[string, string | null | undefined]> = [
    ["Account", trade.accountNumber],
    ["Broker", trade.broker],
    ["Server", trade.serverName],
    ["Ticket", trade.ticket],
    ["Position ID", trade.positionId],
    ["Order Ticket", trade.orderTicket],
    ["Open Deal", trade.dealTicketOpen],
    ["Close Deal", trade.dealTicketClose],
    ["Source", formatLabel(trade.sourceType)],
    ["Entry Source", formatLabel(trade.entrySource)],
    ["Timeframe", trade.timeframe],
    ["Spread", formatNumber(trade.spread, 2)],
    ["ATR", formatNumber(trade.atr, 5)],
    ["RSI", formatNumber(trade.rsi, 2)],
    ["Session", trade.session],
    ["Magic Number", formatNumber(trade.magicNumber, 0)],
    ["Open Time", formatDate(trade.openTime)],
    ["Close Time", formatDate(trade.closeTime)],
    ["Duration", trade.durationSeconds ? `${trade.durationSeconds}s` : "-"],
    ["Commission", formatNumber(trade.commission, 2)],
    ["Swap", formatNumber(trade.swap, 2)],
    ["Comment", trade.comment],
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-white">Full Trade Info</h2>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(([label, value]) => (
          <Metric key={label} label={label} value={String(value || "-")} />
        ))}
      </div>
    </div>
  );
}

export default async function JournalTradeDetailPage({ params }: JournalTradeDetailPageProps) {
  const { id } = await params;
  const response = await fetchJournalApi<PrismaTradeResponse>(`/api/trades/${id}`);

  const responseTrade = response.data || response.trade;

  if (!responseTrade) {
    notFound();
  }

  const trade = mapPrismaTradeToJournalTrade(responseTrade);

  return (
    <div className="space-y-5">
      <Link href="/journal" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back to trades
      </Link>

      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold text-white">{trade.symbol}</h2>
              <span className="rounded-lg border border-slate-800 bg-[#111827] px-2.5 py-1 text-xs font-semibold capitalize text-slate-300">
                {trade.tradeType}
              </span>
              <span className={cn("rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize", resultClass(trade.result))}>
                {formatLabel(trade.result)}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {trade.accountNumber} / {trade.broker} / {trade.serverName}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-right md:min-w-[260px]">
            <Metric label="Profit" value={formatNumber(trade.profit, 2)} className={Number(trade.profit || 0) >= 0 ? "text-emerald-300" : "text-red-300"} />
            <Metric label="RR" value={formatNumber(trade.actualRR, 2)} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ScreenshotPanel label="Entry Screenshot" url={trade.entryScreenshotUrl} />
        <ScreenshotPanel label="Exit Screenshot" url={trade.exitScreenshotUrl} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Lot" value={formatNumber(trade.lotSize, 3)} />
        <Metric label="Entry" value={formatNumber(trade.entryPrice, 5)} />
        <Metric label="SL" value={formatNumber(trade.stopLoss, 5)} className="text-red-300" />
        <Metric label="TP" value={formatNumber(trade.takeProfit, 5)} className="text-emerald-300" />
        <Metric label="Close" value={formatNumber(trade.closePrice, 5)} />
      </div>

      <TradeInfo trade={trade} />

      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">Timeline of Events</h2>
        <div className="space-y-3">
          {trade.events.map((event) => (
            <div key={event.idempotencyKey} className="rounded-xl border border-slate-800 bg-[#111827] p-3">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div className="font-semibold capitalize text-white">{formatLabel(event.eventType)}</div>
                <div className="text-sm text-slate-400">{formatDate(event.eventTime)}</div>
              </div>
              <div className="mt-2 grid gap-2 text-sm text-slate-300 md:grid-cols-4">
                <span>Ticket: {event.ticket || "-"}</span>
                <span>Deal: {event.dealTicket || "-"}</span>
                <span>Price: {formatNumber(event.price, 5)}</span>
                <span>Profit: {formatNumber(event.profit, 2)}</span>
              </div>
            </div>
          ))}
          {trade.events.length === 0 && (
            <div className="text-sm text-slate-400">No events stored for this trade.</div>
          )}
        </div>
      </div>

      <JournalReviewForms tradeId={trade._id} psychology={trade.psychology} tags={trade.tags || []} />
    </div>
  );
}
