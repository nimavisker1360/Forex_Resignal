import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, Camera, ImagePlus } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/server-auth";
import { DashboardText } from "@/components/dashboard/DashboardText";
import { PnlText } from "@/components/dashboard/PnlText";
import { PsychologyReviewCard } from "@/components/dashboard/PsychologyReviewCard";
import { TradeDetailActions } from "@/components/dashboard/TradeDetailActions";
import { TradeDirectionBadge } from "@/components/dashboard/TradeDirectionBadge";
import { TradeStatusBadge } from "@/components/dashboard/TradeStatusBadge";
import { TradeTagsCard } from "@/components/dashboard/TradeTagsCard";
import { formatDate, formatNumber } from "@/components/dashboard/types";
import { getNearbyEconomicEvents } from "@/lib/news/get-nearby-economic-events";

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

function MetricCard({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827] p-4">
      <div className="text-xs font-medium uppercase text-slate-400">{label}</div>
      <div className="mt-2 min-h-6 text-sm font-semibold text-[#E5E7EB]">{value}</div>
    </div>
  );
}

function InfoField({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
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
  title: React.ReactNode;
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
          <img src={url} alt="" className="aspect-video w-full object-cover" />
        </a>
      ) : (
        <div className="flex aspect-video flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-[#0F172A] text-slate-400">
            <ImagePlus className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              <DashboardText k="dashboard.detail.noScreenshot" />
            </div>
            <div className="mt-1 text-xs text-slate-400">
              <DashboardText k="dashboard.detail.screenshotHint" />
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-xl border border-slate-800 px-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            <DashboardText k="dashboard.detail.uploadScreenshot" />
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
  const session = await getSession();
  const userId = session?.user.id;

  if (!userId) {
    notFound();
  }

  const trade = await prisma.trade.findFirst({
    where: { id, userId },
    include: {
      account: true,
      screenshots: true,
      tags: { include: { tag: true } },
    },
  });

  if (!trade) {
    notFound();
  }

  const nearbyEconomicEvents = trade.openedAt
    ? await getNearbyEconomicEvents({
        tradeOpenTime: trade.openedAt,
        symbol: trade.symbol,
      })
    : [];
  const primaryEconomicEvent = nearbyEconomicEvents[0];
  const openTime = formatDate(trade.openedAt?.toISOString() || null);
  const closeTime = formatDate(trade.closedAt?.toISOString() || null);
  const metricCards = [
    { key: "lot", label: <DashboardText k="dashboard.detail.lot" />, value: formatNumber(decimalDisplay(trade.lotSize), 2) },
    { key: "entry", label: <DashboardText k="dashboard.table.entry" />, value: formatNumber(decimalDisplay(trade.entryPrice), 5) },
    { key: "sl", label: <DashboardText k="dashboard.detail.sl" />, value: formatNumber(decimalDisplay(trade.stopLoss), 5) },
    { key: "tp", label: <DashboardText k="dashboard.detail.tp" />, value: formatNumber(decimalDisplay(trade.takeProfit), 5) },
    { key: "exit", label: <DashboardText k="dashboard.table.exit" />, value: formatNumber(decimalDisplay(trade.exitPrice), 5) },
    {
      key: "pnl",
      label: <DashboardText k="dashboard.table.pnl" />,
      value: (
        <PnlText
          value={decimalDisplay(trade.profitLoss)}
          currency={trade.account?.currency || "USD"}
        />
      ),
    },
    { key: "rr", label: <DashboardText k="dashboard.table.rr" />, value: formatNumber(decimalDisplay(trade.rr), 2) },
    { key: "risk", label: <DashboardText k="dashboard.detail.risk" />, value: formatNumber(decimalDisplay(trade.riskAmount), 2) },
  ];
  const fullInfo = [
    { key: "account", label: <DashboardText k="dashboard.table.account" />, value: trade.account?.name || "-" },
    { key: "broker", label: <DashboardText k="dashboard.accounts.broker" />, value: trade.account?.broker || "-" },
    { key: "server", label: <DashboardText k="dashboard.detail.server" />, value: trade.account?.platform || "-" },
    { key: "positionId", label: <DashboardText k="dashboard.detail.positionId" />, value: "-" },
    { key: "orderTicket", label: <DashboardText k="dashboard.detail.orderTicket" />, value: "-" },
    { key: "source", label: <DashboardText k="dashboard.form.source" />, value: <DashboardText k="dashboard.form.manual" /> },
    { key: "entrySource", label: <DashboardText k="dashboard.detail.entrySource" />, value: <DashboardText k="dashboard.detail.journal" /> },
    { key: "timeframe", label: <DashboardText k="timeframe" />, value: "-" },
    { key: "spread", label: <DashboardText k="dashboard.detail.spread" />, value: "-" },
    { key: "atr", label: <DashboardText k="dashboard.detail.atr" />, value: "-" },
    { key: "rsi", label: <DashboardText k="dashboard.detail.rsi" />, value: "-" },
    { key: "session", label: <DashboardText k="dashboard.form.session" />, value: trade.session || "-" },
    { key: "magicNumber", label: <DashboardText k="dashboard.detail.magicNumber" />, value: "-" },
    { key: "openTime", label: <DashboardText k="dashboard.table.openTime" />, value: openTime },
    { key: "closeTime", label: <DashboardText k="dashboard.detail.closeTime" />, value: closeTime },
    { key: "duration", label: <DashboardText k="dashboard.detail.duration" />, value: "-" },
    { key: "commission", label: <DashboardText k="dashboard.form.commission" />, value: "-" },
    { key: "swap", label: <DashboardText k="dashboard.form.swap" />, value: "-" },
  ];

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard/trades"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <DashboardText k="dashboard.detail.backToTrades" />
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
              {trade.account?.name || <DashboardText k="dashboard.detail.noAccount" />} / {trade.account?.broker || <DashboardText k="dashboard.accounts.noBroker" />} /{" "}
              {trade.account?.platform || <DashboardText k="dashboard.accounts.noPlatform" />}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[440px]">
            <MetricCard
              label={<DashboardText k="dashboard.form.profitLoss" />}
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

      {primaryEconomicEvent && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">
                <DashboardText
                  k="dashboard.detail.economicEventWarning"
                  values={{ currency: primaryEconomicEvent.currency }}
                />
              </div>
              <div className="mt-1 text-xs text-amber-100/80">
                <DashboardText
                  k="dashboard.detail.economicEventDetail"
                  values={{
                    event: primaryEconomicEvent.name,
                    time: formatDate(primaryEconomicEvent.eventTime.toISOString()),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-white">
          <DashboardText k="dashboard.detail.screenshots" />
        </h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <ScreenshotCard title={<DashboardText k="dashboard.detail.entryScreenshot" />} url={screenshotByType(trade, "entry")} />
          <ScreenshotCard title={<DashboardText k="dashboard.detail.exitScreenshot" />} url={screenshotByType(trade, "exit")} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((item) => (
          <MetricCard key={item.key} label={item.label} value={item.value} />
        ))}
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-white">
          <DashboardText k="dashboard.detail.fullInfo" />
        </h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {fullInfo.map((item) => (
            <InfoField key={item.key} label={item.label} value={item.value} />
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
