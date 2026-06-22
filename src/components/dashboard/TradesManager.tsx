"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { TradeFilters, type TradeFilterValues } from "@/components/dashboard/TradeFilters";
import { TradeForm } from "@/components/dashboard/TradeForm";
import { TradeTable } from "@/components/dashboard/TradeTable";
import { useLanguage } from "@/lib/language-context";
import {
  DEFAULT_DASHBOARD_USER_ID,
  type ApiResult,
  type TagDto,
  type TradeDto,
  type TradesListData,
  type TradingAccountDto,
} from "@/components/dashboard/types";

const emptyFilters: TradeFilterValues = {
  accountId: "",
  symbol: "",
  direction: "",
  status: "",
  reviewStatus: "",
  from: "",
  to: "",
};

function filtersFromSearchParams(searchParams: URLSearchParams): TradeFilterValues {
  const date = searchParams.get("date") || "";

  return {
    accountId: searchParams.get("accountId") || "",
    symbol: searchParams.get("symbol") || "",
    direction: searchParams.get("direction") || "",
    status: searchParams.get("status") || "",
    reviewStatus: searchParams.get("reviewStatus") || "",
    from: searchParams.get("from") || date,
    to: searchParams.get("to") || date,
  };
}

export function TradesManager({
  userId,
  initialAccounts,
  initialTags,
  initialTrades,
}: {
  userId?: string;
  initialAccounts: TradingAccountDto[];
  initialTags: TagDto[];
  initialTrades: TradeDto[];
}) {
  // TODO: Replace temporary userId with the authenticated session user id.
  const activeUserId = userId || DEFAULT_DASHBOARD_USER_ID;
  const searchParams = useSearchParams();
  const initialFilterValues = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams]
  );
  const [accounts] = useState<TradingAccountDto[]>(initialAccounts);
  const [tags] = useState<TagDto[]>(initialTags);
  const [trades, setTrades] = useState<TradeDto[]>(initialTrades);
  const [filters, setFilters] = useState(initialFilterValues);
  const [editingTrade, setEditingTrade] = useState<TradeDto | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<"OPEN" | "CLOSED" | "CANCELLED">("OPEN");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const { t } = useLanguage();

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("userId", activeUserId);
    params.set("limit", "100");

    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        params.set(key, value);
      }
    }

    return params.toString();
  }, [activeUserId, filters]);

  const loadTrades = useCallback(async () => {
    const response = await fetch(`/api/trades?${query}`);
    const json = (await response.json()) as ApiResult<TradesListData>;
    setTrades(json.data?.trades || []);
  }, [query]);

  useEffect(() => {
    loadTrades().catch(() => setMessage(t("dashboard.trades.loadFailed")));
  }, [loadTrades, t]);

  useEffect(() => {
    const nextFilters = filtersFromSearchParams(searchParams);

    setFilters((current) =>
      JSON.stringify(current) === JSON.stringify(nextFilters) ? current : nextFilters
    );
  }, [searchParams]);

  async function saveTrade(payload: Record<string, string | string[]>) {
    const isEditing = Boolean(editingTrade);
    setSaveStatus("saving");

    try {
      const response = await fetch(
        isEditing ? `/api/trades/${editingTrade?.id}` : "/api/trades",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, userId: activeUserId }),
        }
      );
      const json = (await response.json()) as ApiResult<TradeDto>;

      if (!json.success) {
        setSaveStatus("error");
        setMessage(json.message || t("dashboard.trades.saveFailed"));
        return false;
      }

      setMessage("");
      setSaveStatus("saved");
      await loadTrades();
      window.setTimeout(() => {
        setShowForm(false);
        setEditingTrade(null);
        setSaveStatus("idle");
      }, 500);
      return true;
    } catch {
      setSaveStatus("error");
      setMessage(t("dashboard.trades.saveFailed"));
      return false;
    }
  }

  async function deleteTrade(trade: TradeDto) {
    if (!window.confirm(t("dashboard.trades.confirmDelete").replace("{symbol}", trade.symbol))) {
      return;
    }

    const response = await fetch(
      `/api/trades/${trade.id}?userId=${encodeURIComponent(activeUserId)}`,
      { method: "DELETE" }
    );
    const json = (await response.json()) as ApiResult<unknown>;

    if (!json.success) {
      setMessage(json.message || t("dashboard.trades.deleteFailed"));
      return;
    }

    await loadTrades();
  }

  async function deleteAllTrades() {
    const confirmed = window.confirm(
      t("dashboard.trades.confirmDeleteAll")
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch("/api/trades", { method: "DELETE" });
    const json = (await response.json()) as ApiResult<{ deletedTrades: number }>;

    if (!json.success) {
      setMessage(json.message || t("dashboard.trades.deleteAllFailed"));
      return;
    }

    setMessage(t("dashboard.trades.deletedCount").replace("{count}", String(json.data?.deletedTrades || 0)));
    setShowForm(false);
    setEditingTrade(null);
    await loadTrades();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">{t("dashboard.trades.title")}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {t("dashboard.trades.subtitle")}
          </p>
        </div>
      </div>

      {message ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {message}
        </div>
      ) : null}

      {accounts.length === 0 ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {t("dashboard.trades.createAccountFirst")}
        </div>
      ) : null}

      <TradeFilters
        accounts={accounts}
        values={filters}
        onChange={setFilters}
        onClear={() => setFilters(emptyFilters)}
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={deleteAllTrades}
              disabled={trades.length === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 text-sm font-semibold text-red-200 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {t("dashboard.trades.deleteAll")}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingTrade(null);
                setDefaultStatus("OPEN");
                setSaveStatus("idle");
                setShowForm(true);
              }}
              disabled={accounts.length === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {t("dashboard.trades.newTrade")}
            </button>
          </div>
        }
      />

      {showForm ? (
        <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">
            {editingTrade ? t("dashboard.trades.editTrade") : t("dashboard.trades.createTrade")}
          </h3>
          <TradeForm
            trade={editingTrade}
            accounts={accounts}
            tags={tags}
            defaultStatus={defaultStatus}
            saveStatus={saveStatus}
            onSubmit={saveTrade}
            onCancel={() => {
              setShowForm(false);
              setEditingTrade(null);
              setSaveStatus("idle");
            }}
          />
        </div>
      ) : null}

      <TradeTable
        trades={trades}
        onEdit={(trade) => {
          setEditingTrade(trade);
          setDefaultStatus(trade.status);
          setSaveStatus("idle");
          setShowForm(true);
        }}
        onClose={(trade) => {
          setEditingTrade(trade);
          setDefaultStatus("CLOSED");
          setSaveStatus("idle");
          setShowForm(true);
        }}
        onDelete={deleteTrade}
      />
    </div>
  );
}
