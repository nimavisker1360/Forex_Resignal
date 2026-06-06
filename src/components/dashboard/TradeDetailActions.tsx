"use client";

import { useRouter } from "next/navigation";
import { Edit, Lock, Trash2 } from "lucide-react";
import { DEFAULT_DASHBOARD_USER_ID } from "@/components/dashboard/types";

export function TradeDetailActions({
  tradeId,
  status,
  userId = DEFAULT_DASHBOARD_USER_ID,
}: {
  tradeId: string;
  status: string;
  userId?: string;
}) {
  const router = useRouter();

  async function closeTrade() {
    await fetch(`/api/trades/${tradeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        status: "CLOSED",
        closedAt: new Date().toISOString(),
      }),
    });
    router.refresh();
  }

  async function deleteTrade() {
    if (!window.confirm("Delete this trade?")) {
      return;
    }

    await fetch(`/api/trades/${tradeId}?userId=${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
    router.push(`/dashboard/trades?userId=${encodeURIComponent(userId)}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => router.push(`/dashboard/trades?userId=${encodeURIComponent(userId)}`)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-800 px-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
      >
        <Edit className="h-4 w-4" />
        Edit
      </button>
      {status === "OPEN" ? (
        <button
          type="button"
          onClick={closeTrade}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-500/30 px-3 text-sm font-semibold text-[#10B981] hover:bg-emerald-500/10"
        >
          <Lock className="h-4 w-4" />
          Close Trade
        </button>
      ) : null}
      <button
        type="button"
        onClick={deleteTrade}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/30 px-3 text-sm font-semibold text-[#EF4444] hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    </div>
  );
}
