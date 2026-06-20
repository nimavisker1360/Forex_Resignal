"use client";

import { useCallback, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { TradingAccountForm } from "@/components/dashboard/TradingAccountForm";
import { useLanguage } from "@/lib/language-context";
import {
  DEFAULT_DASHBOARD_USER_ID,
  formatMoney,
  type ApiResult,
  type TradingAccountDto,
} from "@/components/dashboard/types";

export function AccountsManager({
  userId,
  initialAccounts,
}: {
  userId?: string;
  initialAccounts: TradingAccountDto[];
}) {
  // TODO: Replace temporary userId with the authenticated session user id.
  const activeUserId = userId || DEFAULT_DASHBOARD_USER_ID;
  const [accounts, setAccounts] = useState<TradingAccountDto[]>(initialAccounts);
  const [editingAccount, setEditingAccount] = useState<TradingAccountDto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const { t } = useLanguage();

  const loadAccounts = useCallback(async () => {
    const response = await fetch(
      `/api/trading-accounts?userId=${encodeURIComponent(activeUserId)}`
    );
    const json = (await response.json()) as ApiResult<TradingAccountDto[]>;
    setAccounts(json.data || []);
  }, [activeUserId]);

  async function saveAccount(payload: Record<string, string | undefined>) {
    const isEditing = Boolean(editingAccount);
    const response = await fetch(
      isEditing
        ? `/api/trading-accounts/${editingAccount?.id}`
        : "/api/trading-accounts",
      {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, userId: activeUserId }),
      }
    );
    const json = (await response.json()) as ApiResult<TradingAccountDto>;

    if (!json.success) {
      setMessage(json.message || t("dashboard.accounts.saveFailed"));
      return;
    }

    setMessage("");
    setShowForm(false);
    setEditingAccount(null);
    await loadAccounts();
  }

  async function deleteAccount(account: TradingAccountDto) {
    const response = await fetch(
      `/api/trading-accounts/${account.id}?userId=${encodeURIComponent(activeUserId)}`,
      { method: "DELETE" }
    );
    const json = (await response.json()) as ApiResult<unknown>;

    if (!json.success) {
      setMessage(json.message || t("dashboard.accounts.deleteFailed"));
      return;
    }

    await loadAccounts();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">{t("dashboard.accounts.title")}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {t("dashboard.accounts.subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingAccount(null);
            setShowForm(true);
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          {t("dashboard.accounts.create")}
        </button>
      </div>

      {message ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {message}
        </div>
      ) : null}

      {showForm ? (
        <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">
            {editingAccount ? t("dashboard.accounts.edit") : t("dashboard.accounts.create")}
          </h3>
          <TradingAccountForm
            account={editingAccount}
            onSubmit={saveAccount}
            onCancel={() => {
              setShowForm(false);
              setEditingAccount(null);
            }}
          />
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{account.name}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {account.broker || t("dashboard.accounts.noBroker")} / {account.platform || t("dashboard.accounts.noPlatform")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAccount(account);
                    setShowForm(true);
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800"
                  aria-label={t("dashboard.accounts.editAccount")}
                  title={t("dashboard.accounts.editAccount")}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteAccount(account)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/30 text-red-200 hover:bg-red-500/10"
                  aria-label={t("dashboard.accounts.deleteAccount")}
                  title={t("dashboard.accounts.deleteAccount")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl border border-slate-800 bg-[#111827] p-3">
                <div className="text-xs uppercase text-slate-400">{t("dashboard.accounts.balance")}</div>
                <div className="mt-1 font-semibold text-white">
                  {formatMoney(account.balance, account.currency)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#111827] p-3">
                <div className="text-xs uppercase text-slate-400">{t("dashboard.accounts.currency")}</div>
                <div className="mt-1 font-semibold text-white">{account.currency}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {accounts.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#0F172A] px-4 py-12 text-center text-sm text-slate-400">
          {t("dashboard.accounts.empty")}
        </div>
      ) : null}
    </div>
  );
}
