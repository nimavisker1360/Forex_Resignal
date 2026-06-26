"use client";

import type { FormEvent } from "react";
import type { TradingAccountDto } from "@/components/dashboard/types";
import { useLanguage } from "@/lib/language-context";

type AccountPayload = {
  name: string;
  broker?: string;
  platform?: string;
  currency: string;
  balance?: string;
  mt5AccountNumber?: string;
};

export function TradingAccountForm({
  account,
  onSubmit,
  onCancel,
}: {
  account?: TradingAccountDto | null;
  onSubmit: (payload: AccountPayload) => Promise<void>;
  onCancel?: () => void;
}) {
  const { t } = useLanguage();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await onSubmit({
      name: String(formData.get("name") || ""),
      broker: String(formData.get("broker") || ""),
      platform: String(formData.get("platform") || ""),
      currency: String(formData.get("currency") || "USD"),
      balance: String(formData.get("balance") || ""),
      mt5AccountNumber: String(formData.get("mt5AccountNumber") || ""),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          {t("dashboard.accounts.name")}
          <input
            name="name"
            required
            defaultValue={account?.name || ""}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          />
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          {t("dashboard.accounts.currency")}
          <input
            name="currency"
            required
            defaultValue={account?.currency || "USD"}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          />
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          {t("dashboard.accounts.broker")}
          <input
            name="broker"
            defaultValue={account?.broker || ""}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          />
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          {t("dashboard.accounts.platform")}
          <input
            name="platform"
            defaultValue={account?.platform || ""}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          />
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400 md:col-span-2">
          MT5 Account Number
          <input
            name="mt5AccountNumber"
            defaultValue={account?.mt5AccountNumber || ""}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          />
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400 md:col-span-2">
          {t("dashboard.accounts.balance")}
          <input
            name="balance"
            type="number"
            step="0.01"
            defaultValue={account?.balance ? String(account.balance) : ""}
            className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          />
        </label>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center rounded-xl border border-slate-800 px-4 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            {t("dashboard.actions.cancel")}
          </button>
        ) : null}
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500"
        >
          {t("dashboard.accounts.save")}
        </button>
      </div>
    </form>
  );
}
