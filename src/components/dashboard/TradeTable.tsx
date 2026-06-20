"use client";

import Link from "next/link";
import { Edit, Lock, Plus, Trash2 } from "lucide-react";
import { PnlText } from "@/components/dashboard/PnlText";
import { TradeDirectionBadge } from "@/components/dashboard/TradeDirectionBadge";
import { TradeStatusBadge } from "@/components/dashboard/TradeStatusBadge";
import { useLanguage } from "@/lib/language-context";
import {
  formatDate,
  formatNumber,
  type TradeDto,
} from "@/components/dashboard/types";

export function TradeTable({
  trades,
  onEdit,
  onClose,
  onDelete,
}: {
  trades: TradeDto[];
  onEdit?: (trade: TradeDto) => void;
  onClose?: (trade: TradeDto) => void;
  onDelete?: (trade: TradeDto) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">{t("dashboard.table.openTime")}</th>
              <th className="px-3 py-3">{t("dashboard.table.symbol")}</th>
              <th className="px-3 py-3">{t("dashboard.table.direction")}</th>
              <th className="px-3 py-3">{t("dashboard.table.account")}</th>
              <th className="px-3 py-3">{t("dashboard.table.entry")}</th>
              <th className="px-3 py-3">{t("dashboard.table.exit")}</th>
              <th className="px-3 py-3">{t("dashboard.table.pnl")}</th>
              <th className="px-3 py-3">{t("dashboard.table.rr")}</th>
              <th className="px-3 py-3">{t("dashboard.table.status")}</th>
              <th className="px-3 py-3">{t("dashboard.table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {trades.map((trade) => (
              <tr key={trade.id} className="text-slate-700 hover:bg-slate-50 dark:text-[#E5E7EB] dark:hover:bg-slate-800/50">
                <td className="whitespace-nowrap px-4 py-4 text-slate-500 dark:text-slate-300">
                  {formatDate(trade.openedAt)}
                </td>
                <td className="px-3 py-3 font-semibold text-slate-950 dark:text-white">
                  <Link href={`/dashboard/trades/${trade.id}`} className="hover:text-blue-600 dark:hover:text-blue-200">
                    {trade.symbol}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <TradeDirectionBadge direction={trade.direction} />
                </td>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-300">{trade.account?.name || "-"}</td>
                <td className="px-3 py-3">{formatNumber(trade.entryPrice, 5)}</td>
                <td className="px-3 py-3">{formatNumber(trade.exitPrice, 5)}</td>
                <td className="px-3 py-3">
                  <PnlText
                    value={trade.profitLoss}
                    currency={trade.account?.currency || "USD"}
                  />
                </td>
                <td className="px-3 py-3">{formatNumber(trade.rr, 2)}</td>
                <td className="px-3 py-3">
                  <TradeStatusBadge status={trade.status} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    {onEdit ? (
                      <button
                        type="button"
                        onClick={() => onEdit(trade)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                        aria-label={t("dashboard.actions.editTrade")}
                        title={t("dashboard.actions.editTrade")}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    ) : null}
                    {onClose && trade.status === "OPEN" ? (
                      <button
                        type="button"
                        onClick={() => onClose(trade)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-[#10B981] hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
                        aria-label={t("dashboard.actions.closeTrade")}
                        title={t("dashboard.actions.closeTrade")}
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                    ) : null}
                    {onDelete ? (
                      <button
                        type="button"
                        onClick={() => onDelete(trade)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/30 text-[#EF4444] hover:bg-red-500/10"
                        aria-label={t("dashboard.actions.deleteTrade")}
                        title={t("dashboard.actions.deleteTrade")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {trades.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-[#111827]">
            <Plus className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">
            {t("dashboard.table.noTrades")}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("dashboard.table.noTradesHint")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
