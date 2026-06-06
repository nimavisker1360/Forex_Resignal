import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera, ImagePlus } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PnlText } from "@/components/dashboard/PnlText";
import { PsychologyReviewCard } from "@/components/dashboard/PsychologyReviewCard";
import { TradeDetailActions } from "@/components/dashboard/TradeDetailActions";
import { TradeDirectionBadge } from "@/components/dashboard/TradeDirectionBadge";
import { TradeStatusBadge } from "@/components/dashboard/TradeStatusBadge";
import { TradeTagsCard } from "@/components/dashboard/TradeTagsCard";
import { formatDate, formatNumber } from "@/components/dashboard/types";

export const dynamic = "force-dynamic";

type TradeDetailPageProps = {
  params: Promise<{ id: string }>;
};

type TradeDetail = Prisma.TradeGetPayload<{
  include: {
    account: true;
    screenshots: true;
    tags: { include: { tag: true } };
  };
}>;

function MetricCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827] p-4">
      <div className="text-xs font-medium uppercase text-slate-400">{label}</div>
      <div className="mt-2 min-h-6 text-sm font-semibold text-[#E5E7EB]">{value}</div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827] p-3">
      <div className="text-xs font-medium uppercase text-slate-400">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-[#E5E7EB]">{value}</div>
    </div>
  );
}

function ScreenshotCard({
  title,
  url,
}: {
  title: string;
  url?: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#111827]">
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3 text-sm font-semibold text-white">
        <Camera className="h-4 w-4 text-blue-400" />
        {title}
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="block">
          <img src={url} alt={`${title} screenshot`} className="aspect-video w-full object-cover" />
        </a>
      ) : (
        <div className="flex aspect-video flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-[#0F172A] text-slate-400">
            <ImagePlus className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">No screenshot uploaded</div>
            <div className="mt-1 text-xs text-slate-400">Attach entry and exit screenshots for review.</div>
          </div>
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-xl border border-slate-800 px-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            Upload screenshot
          </button>
        </div>
      )}
    </div>
  );
}

function screenshotByType(trade: TradeDetail, type: string) {
  return (
    trade.screenshots.find(
      (screenshot) => screenshot.type.toLowerCase() === type.toLowerCase()
    )?.url || null
  );
}

function decimalDisplay(value: unknown) {
  return value === null || value === undefined ? null : String(value);
}

export default async function TradeDetailPage({ params }: TradeDetailPageProps) {
  const { id } = await params;
  // TODO: Scope this lookup to the authenticated session user id.
  const trade = await prisma.trade.findUnique({
    where: { id },
    include: {
      account: true,
      screenshots: true,
      tags: { include: { tag: true } },
    },
  });

  if (!trade) {
    notFound();
  }

  const openTime = formatDate(trade.openedAt?.toISOString() || null);
  const closeTime = formatDate(trade.closedAt?.toISOString() || null);
  const metricCards = [
    ["Lot", formatNumber(decimalDisplay(trade.lotSize), 2)],
    ["Entry", formatNumber(decimalDisplay(trade.entryPrice), 5)],
    ["SL", formatNumber(decimalDisplay(trade.stopLoss), 5)],
    ["TP", formatNumber(decimalDisplay(trade.takeProfit), 5)],
    ["Exit", formatNumber(decimalDisplay(trade.exitPrice), 5)],
    [
      "PnL",
      <PnlText
        key="pnl"
        value={decimalDisplay(trade.profitLoss)}
        currency={trade.account?.currency || "USD"}
      />,
    ],
    ["R:R", formatNumber(decimalDisplay(trade.rr), 2)],
    ["Risk", formatNumber(decimalDisplay(trade.riskAmount), 2)],
  ] as const;
  const fullInfo = [
    ["Account", trade.account?.name || "-"],
    ["Broker", trade.account?.broker || "-"],
    ["Server", trade.account?.platform || "-"],
    ["Position ID", "-"],
    ["Order Ticket", "-"],
    ["Source", "Manual"],
    ["Entry Source", "Journal"],
    ["Timeframe", "-"],
    ["Spread", "-"],
    ["ATR", "-"],
    ["RSI", "-"],
    ["Session", trade.session || "-"],
    ["Magic Number", "-"],
    ["Open Time", openTime],
    ["Close Time", closeTime],
    ["Duration", "-"],
    ["Commission", "-"],
    ["Swap", "-"],
  ];

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard/trades"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to trades
      </Link>

      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-semibold text-white">{trade.symbol}</h2>
              <TradeDirectionBadge direction={trade.direction} />
              <TradeStatusBadge status={trade.status} />
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {trade.account?.name || "No account"} / {trade.account?.broker || "No broker"} /{" "}
              {trade.account?.platform || "No platform"}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[440px]">
            <MetricCard
              label="Profit/Loss"
              value={
                <PnlText
                  value={decimalDisplay(trade.profitLoss)}
                  currency={trade.account?.currency || "USD"}
                  className="text-xl"
                />
              }
            />
            <MetricCard label="R:R" value={formatNumber(decimalDisplay(trade.rr), 2)} />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <TradeDetailActions tradeId={trade.id} status={trade.status} userId={trade.userId} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-white">Screenshots</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <ScreenshotCard title="Entry Screenshot" url={screenshotByType(trade, "entry")} />
          <ScreenshotCard title="Exit Screenshot" url={screenshotByType(trade, "exit")} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(([label, value]) => (
          <MetricCard key={label} label={label} value={value} />
        ))}
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-white">Full Info</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {fullInfo.map(([label, value]) => (
            <InfoField key={label} label={label} value={value} />
          ))}
        </div>
      </div>

      <PsychologyReviewCard
        tradeId={trade.id}
        setup={trade.setup}
        emotion={trade.emotion}
        mistake={trade.mistake}
        notes={trade.notes}
        userId={trade.userId}
      />

      <TradeTagsCard tradeId={trade.id} currentTags={trade.tags} userId={trade.userId} />
    </div>
  );
}
