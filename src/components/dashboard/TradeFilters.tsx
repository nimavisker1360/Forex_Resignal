"use client";

import type { FormEvent } from "react";
import type { ReactNode } from "react";
import { Filter, RotateCcw } from "lucide-react";
import type { TradingAccountDto } from "@/components/dashboard/types";
import { useLanguage } from "@/lib/language-context";

export type TradeFilterValues = {
  accountId: string;
  symbol: string;
  direction: string;
  status: string;
  reviewStatus: string;
  source: string;
  minAiScore: string;
  maxAiScore: string;
  from: string;
  to: string;
};

export function TradeFilters({
  accounts,
  values,
  onChange,
  onClear,
  action,
}: {
  accounts: TradingAccountDto[];
  values: TradeFilterValues;
  onChange: (values: TradeFilterValues) => void;
  onClear: () => void;
  action?: ReactNode;
}) {
  const { t } = useLanguage();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onChange({
      accountId: String(formData.get("accountId") || ""),
      symbol: String(formData.get("symbol") || ""),
      direction: String(formData.get("direction") || ""),
      status: String(formData.get("status") || ""),
      reviewStatus: String(formData.get("reviewStatus") || ""),
      source: String(formData.get("source") || ""),
      minAiScore: String(formData.get("minAiScore") || ""),
      maxAiScore: String(formData.get("maxAiScore") || ""),
      from: String(formData.get("from") || ""),
      to: String(formData.get("to") || ""),
    });
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{t("dashboard.filters.title")}</h3>
          <p className="text-xs text-slate-400">{t("dashboard.filters.subtitle")}</p>
        </div>
        {action}
      </div>
      <form key={JSON.stringify(values)} onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-10">
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          {t("dashboard.table.account")}
          <select
            name="accountId"
            defaultValue={values.accountId}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          >
            <option value="">{t("dashboard.common.all")}</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          {t("dashboard.table.symbol")}
          <input
            name="symbol"
            defaultValue={values.symbol}
            placeholder="EURUSD"
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm uppercase text-[#E5E7EB] outline-none focus:border-blue-600"
          />
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          {t("dashboard.table.direction")}
          <select
            name="direction"
            defaultValue={values.direction}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          >
            <option value="">{t("dashboard.common.all")}</option>
            <option value="BUY">{t("dashboard.common.buy")}</option>
            <option value="SELL">{t("dashboard.common.sell")}</option>
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          {t("dashboard.table.status")}
          <select
            name="status"
            defaultValue={values.status}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          >
            <option value="">{t("dashboard.common.all")}</option>
            <option value="OPEN">{t("dashboard.common.open")}</option>
            <option value="CLOSED">{t("dashboard.common.closed")}</option>
            <option value="CANCELLED">{t("dashboard.common.cancelled")}</option>
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          {t("dashboard.filters.review")}
          <select
            name="reviewStatus"
            defaultValue={values.reviewStatus}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          >
            <option value="">{t("dashboard.common.all")}</option>
            <option value="not-reviewed">{t("dashboard.reviewStatus.notReviewed")}</option>
            <option value="reviewed">{t("dashboard.reviewStatus.reviewed")}</option>
            <option value="failed">{t("dashboard.reviewStatus.failed")}</option>
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          {t("dashboard.filters.source")}
          <select
            name="source"
            defaultValue={values.source}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          >
            <option value="">{t("dashboard.common.all")}</option>
            <option value="MANUAL">{t("dashboard.common.manual")}</option>
            <option value="MT5">MT5</option>
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          {t("dashboard.filters.minAi")}
          <input
            name="minAiScore"
            type="number"
            min="0"
            max="100"
            defaultValue={values.minAiScore}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          />
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          {t("dashboard.filters.maxAi")}
          <input
            name="maxAiScore"
            type="number"
            min="0"
            max="100"
            defaultValue={values.maxAiScore}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          />
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          {t("dashboard.filters.from")}
          <input
            name="from"
            type="date"
            defaultValue={values.from}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          />
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          {t("dashboard.filters.to")}
          <input
            name="to"
            type="date"
            defaultValue={values.to}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          />
        </label>
        <div className="flex gap-2 self-end">
          <button
            type="submit"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500"
          >
            <Filter className="h-4 w-4" />
            {t("dashboard.filters.apply")}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800"
            aria-label={t("dashboard.filters.clear")}
            title={t("dashboard.filters.clear")}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
