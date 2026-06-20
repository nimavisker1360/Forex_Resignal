"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Plus, Tag as TagIcon, Trash2 } from "lucide-react";
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
  from: "",
  to: "",
};

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
  const [accounts, setAccounts] = useState<TradingAccountDto[]>(initialAccounts);
  const [tags, setTags] = useState<TagDto[]>(initialTags);
  const [trades, setTrades] = useState<TradeDto[]>(initialTrades);
  const [filters, setFilters] = useState(emptyFilters);
  const [editingTrade, setEditingTrade] = useState<TradeDto | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<"OPEN" | "CLOSED" | "CANCELLED">("OPEN");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const skippedInitialTradeLoad = useRef(false);
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

  const loadReferenceData = useCallback(async () => {
    const [accountsResponse, tagsResponse] = await Promise.all([
      fetch(`/api/trading-accounts?userId=${encodeURIComponent(activeUserId)}`),
      fetch(`/api/tags?userId=${encodeURIComponent(activeUserId)}`),
    ]);
    const accountsJson =
      (await accountsResponse.json()) as ApiResult<TradingAccountDto[]>;
    const tagsJson = (await tagsResponse.json()) as ApiResult<TagDto[]>;
    setAccounts(accountsJson.data || []);
    setTags(tagsJson.data || []);
  }, [activeUserId]);

  const loadTrades = useCallback(async () => {
    const response = await fetch(`/api/trades?${query}`);
    const json = (await response.json()) as ApiResult<TradesListData>;
    setTrades(json.data?.trades || []);
  }, [query]);

  useEffect(() => {
    if (!skippedInitialTradeLoad.current) {
      skippedInitialTradeLoad.current = true;
      return;
    }

    loadTrades().catch(() => setMessage(t("dashboard.trades.loadFailed")));
  }, [loadTrades, t]);

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

  async function createTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const color = String(formData.get("color") || "#60a5fa");

    if (!name) {
      return;
    }

    const response = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: activeUserId, name, color }),
    });
    const json = (await response.json()) as ApiResult<TagDto>;

    if (!json.success) {
      setMessage(json.message || t("dashboard.trades.createTagFailed"));
      return;
    }

    event.currentTarget.reset();
    await loadReferenceData();
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

      <form
        onSubmit={createTag}
        className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#0F172A] p-4 shadow-sm md:flex-row md:items-end"
      >
        <label className="flex-1 space-y-1 text-xs font-medium uppercase text-slate-400">
          {t("dashboard.trades.tagName")}
          <input
            name="name"
            placeholder="Breakout"
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          />
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          {t("dashboard.trades.color")}
          <input
            name="color"
            type="color"
            defaultValue="#60a5fa"
            className="h-11 w-20 rounded-xl border border-slate-800 bg-[#111827] px-2"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-800 px-4 text-sm font-semibold text-slate-300 hover:bg-slate-800"
        >
          <TagIcon className="h-4 w-4" />
          {t("dashboard.trades.addTag")}
        </button>
      </form>

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
