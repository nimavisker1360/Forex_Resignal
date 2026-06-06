"use client";

import Link from "next/link";
import { Edit, Lock, Plus, Trash2 } from "lucide-react";
import { PnlText } from "@/components/dashboard/PnlText";
import { TradeDirectionBadge } from "@/components/dashboard/TradeDirectionBadge";
import { TradeStatusBadge } from "@/components/dashboard/TradeStatusBadge";
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
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0F172A] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-[#111827] text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Open Time</th>
              <th className="px-3 py-3">Symbol</th>
              <th className="px-3 py-3">Direction</th>
              <th className="px-3 py-3">Account</th>
              <th className="px-3 py-3">Entry</th>
              <th className="px-3 py-3">Exit</th>
              <th className="px-3 py-3">PnL</th>
              <th className="px-3 py-3">R:R</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {trades.map((trade) => (
              <tr key={trade.id} className="text-[#E5E7EB] hover:bg-slate-800/50">
                <td className="whitespace-nowrap px-4 py-4 text-slate-300">
                  {formatDate(trade.openedAt)}
                </td>
                <td className="px-3 py-3 font-semibold text-white">
                  <Link href={`/dashboard/trades/${trade.id}`} className="hover:text-blue-200">
                    {trade.symbol}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <TradeDirectionBadge direction={trade.direction} />
                </td>
                <td className="px-3 py-3 text-slate-300">{trade.account?.name || "-"}</td>
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
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800"
                        aria-label="Edit trade"
                        title="Edit trade"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    ) : null}
                    {onClose && trade.status === "OPEN" ? (
                      <button
                        type="button"
                        onClick={() => onClose(trade)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-[#10B981] hover:bg-slate-800"
                        aria-label="Close trade"
                        title="Close trade"
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                    ) : null}
                    {onDelete ? (
                      <button
                        type="button"
                        onClick={() => onDelete(trade)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/30 text-[#EF4444] hover:bg-red-500/10"
                        aria-label="Delete trade"
                        title="Delete trade"
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-[#111827] text-slate-400">
            <Plus className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-white">No trades found</h3>
          <p className="mt-1 text-sm text-slate-400">Create your first trade or clear the active filters.</p>
        </div>
      ) : null}
    </div>
  );
}
