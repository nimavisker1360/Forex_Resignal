"use client";

import { useRouter } from "next/navigation";
import { Edit, Lock, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function TradeDetailActions({
  tradeId,
  status,
}: {
  tradeId: string;
  status: string;
  userId?: string;
}) {
  const router = useRouter();
  const { t } = useLanguage();

  async function closeTrade() {
    await fetch(`/api/trades/${tradeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "CLOSED",
        closedAt: new Date().toISOString(),
      }),
    });
    router.refresh();
  }

  async function deleteTrade() {
    if (!window.confirm(t("dashboard.trades.confirmDeleteThis"))) {
      return;
    }

    await fetch(`/api/trades/${tradeId}`, {
      method: "DELETE",
    });
    router.push("/dashboard/trades");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => router.push("/dashboard/trades")}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-800 px-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
      >
        <Edit className="h-4 w-4" />
        {t("dashboard.actions.edit")}
      </button>
      {status === "OPEN" ? (
        <button
          type="button"
          onClick={closeTrade}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-500/30 px-3 text-sm font-semibold text-[#10B981] hover:bg-emerald-500/10"
        >
          <Lock className="h-4 w-4" />
          {t("dashboard.actions.closeTrade")}
        </button>
      ) : null}
      <button
        type="button"
        onClick={deleteTrade}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/30 px-3 text-sm font-semibold text-[#EF4444] hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" />
        {t("dashboard.actions.delete")}
      </button>
    </div>
  );
}
