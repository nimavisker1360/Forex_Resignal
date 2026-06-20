"use client";

import type { FormEvent, ReactNode } from "react";
import { CheckCircle2, Lock, Loader2, XCircle } from "lucide-react";
import type {
  TagDto,
  TradeDto,
  TradingAccountDto,
} from "@/components/dashboard/types";
import { useLanguage } from "@/lib/language-context";
import {
  isImportedTradeSource,
  normalizeTradeSource,
} from "@/lib/journal/trade-source";

type TradePayload = Record<string, string | string[]>;
type SaveStatus = "idle" | "saving" | "saved" | "error";

const inputClass =
  "h-10 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600 disabled:cursor-not-allowed disabled:border-slate-800/70 disabled:bg-slate-900/60 disabled:text-slate-500";
const textareaClass =
  "w-full rounded-xl border border-slate-800 bg-[#111827] px-3 py-2 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600 disabled:cursor-not-allowed disabled:border-slate-800/70 disabled:bg-slate-900/60 disabled:text-slate-500";

function toDateTimeValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}

function fieldValue(formData: FormData, name: string) {
  return String(formData.get(name) || "");
}

function tradeValue(trade: TradeDto | null | undefined, name: keyof TradeDto) {
  const value = trade?.[name];
  return value === null || value === undefined ? "" : String(value);
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-slate-800 bg-[#0B1220] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="text-sm font-semibold uppercase text-slate-200">{title}</h4>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
      {label}
      {children}
    </label>
  );
}

function SaveState({ status }: { status: SaveStatus }) {
  const { t } = useLanguage();

  if (status === "idle") {
    return null;
  }

  const config = {
    saving: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      text: t("dashboard.saveState.saving"),
      className: "text-blue-200",
    },
    saved: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      text: t("dashboard.saveState.saved"),
      className: "text-emerald-300",
    },
    error: {
      icon: <XCircle className="h-4 w-4" />,
      text: t("dashboard.saveState.error"),
      className: "text-red-300",
    },
  }[status];

  return (
    <div className={`inline-flex items-center gap-2 text-sm font-medium ${config.className}`}>
      {config.icon}
      {config.text}
    </div>
  );
}

export function TradeForm({
  trade,
  accounts,
  tags,
  defaultStatus,
  saveStatus = "idle",
  onSubmit,
  onCancel,
}: {
  trade?: TradeDto | null;
  accounts: TradingAccountDto[];
  tags: TagDto[];
  defaultStatus?: "OPEN" | "CLOSED" | "CANCELLED";
  saveStatus?: SaveStatus;
  onSubmit: (payload: TradePayload) => Promise<boolean>;
  onCancel?: () => void;
}) {
  const normalizedSource = normalizeTradeSource(trade?.source, trade?.setup);
  const brokerLocked = Boolean(trade && isImportedTradeSource(trade.source, trade.setup));
  const selectedTags = new Set(trade?.tags?.map((item) => item.tagId) || []);
  const { t } = useLanguage();
  const brokerFields = [
    ["entryPrice", t("dashboard.form.entryPrice"), "0.00001"],
    ["exitPrice", t("dashboard.form.exitPrice"), "0.00001"],
    ["stopLoss", t("dashboard.form.stopLoss"), "0.00001"],
    ["takeProfit", t("dashboard.form.takeProfit"), "0.00001"],
    ["lotSize", t("dashboard.form.lotSize"), "0.01"],
    ["riskAmount", t("dashboard.form.riskAmount"), "0.01"],
    ["profitLoss", t("dashboard.form.profitLoss"), "0.01"],
    ["commission", t("dashboard.form.commission"), "0.01"],
    ["swap", t("dashboard.form.swap"), "0.01"],
    ["rr", t("dashboard.form.rr"), "0.01"],
  ] as const;
  const reviewFields = [
    ["setup", t("dashboard.form.setup")],
    ["session", t("dashboard.form.session")],
    ["emotion", t("dashboard.form.emotion")],
    ["mistake", t("dashboard.form.mistake")],
  ] as const;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const selectedTagIds = formData
      .getAll("tagIds")
      .map(String)
      .filter(Boolean);
    const payload: TradePayload = {
      setup: fieldValue(formData, "setup"),
      session: fieldValue(formData, "session"),
      emotion: fieldValue(formData, "emotion"),
      mistake: fieldValue(formData, "mistake"),
      notes: fieldValue(formData, "notes"),
      tagIds: selectedTagIds,
    };

    if (!brokerLocked) {
      Object.assign(payload, {
        accountId: fieldValue(formData, "accountId"),
        mt5Ticket: fieldValue(formData, "mt5Ticket"),
        symbol: fieldValue(formData, "symbol"),
        direction: fieldValue(formData, "direction") || "BUY",
        status: fieldValue(formData, "status") || "OPEN",
        entryPrice: fieldValue(formData, "entryPrice"),
        exitPrice: fieldValue(formData, "exitPrice"),
        stopLoss: fieldValue(formData, "stopLoss"),
        takeProfit: fieldValue(formData, "takeProfit"),
        lotSize: fieldValue(formData, "lotSize"),
        riskAmount: fieldValue(formData, "riskAmount"),
        profitLoss: fieldValue(formData, "profitLoss"),
        commission: fieldValue(formData, "commission"),
        swap: fieldValue(formData, "swap"),
        rr: fieldValue(formData, "rr"),
        openedAt: fieldValue(formData, "openedAt"),
        closedAt: fieldValue(formData, "closedAt"),
      });
    }

    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section
        title={t("dashboard.form.brokerData")}
        action={
          brokerLocked ? (
            <span className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">
              <Lock className="h-3.5 w-3.5" />
              {t("dashboard.form.syncedFromMt5")}
            </span>
          ) : (
            <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              {t("dashboard.form.manual")}
            </span>
          )
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Field label={t("dashboard.form.source")}>
            <input value={normalizedSource} disabled className={inputClass} />
          </Field>
          <Field label={t("dashboard.table.account")}>
            <select
              name="accountId"
              required={!brokerLocked}
              disabled={brokerLocked}
              defaultValue={trade?.accountId || accounts[0]?.id || ""}
              className={inputClass}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("dashboard.form.mt5Ticket")}>
            <input
              name="mt5Ticket"
              defaultValue={trade?.mt5Ticket || ""}
              disabled={brokerLocked}
              placeholder="-"
              className={inputClass}
            />
          </Field>
          <Field label={t("dashboard.table.symbol")}>
            <input
              name="symbol"
              required={!brokerLocked}
              disabled={brokerLocked}
              defaultValue={trade?.symbol || ""}
              placeholder="EURUSD"
              className={`${inputClass} uppercase`}
            />
          </Field>
          <Field label={t("dashboard.table.direction")}>
            <select
              name="direction"
              required={!brokerLocked}
              disabled={brokerLocked}
              defaultValue={trade?.direction || "BUY"}
              className={inputClass}
            >
              <option value="BUY">{t("dashboard.common.buy")}</option>
              <option value="SELL">{t("dashboard.common.sell")}</option>
            </select>
          </Field>
          <Field label={t("dashboard.table.status")}>
            <select
              name="status"
              disabled={brokerLocked}
              defaultValue={defaultStatus || trade?.status || "OPEN"}
              className={inputClass}
            >
              <option value="OPEN">{t("dashboard.common.open")}</option>
              <option value="CLOSED">{t("dashboard.common.closed")}</option>
              <option value="CANCELLED">{t("dashboard.common.cancelled")}</option>
            </select>
          </Field>
          {brokerFields.map(([name, label, step]) => (
            <Field key={name} label={label}>
              <input
                name={name}
                type="number"
                step={step}
                disabled={brokerLocked}
                defaultValue={tradeValue(trade, name as keyof TradeDto)}
                className={inputClass}
              />
            </Field>
          ))}
          <Field label={t("dashboard.form.openedAt")}>
            <input
              name="openedAt"
              type="datetime-local"
              disabled={brokerLocked}
              defaultValue={toDateTimeValue(trade?.openedAt)}
              className={inputClass}
            />
          </Field>
          <Field label={t("dashboard.form.closedAt")}>
            <input
              name="closedAt"
              type="datetime-local"
              disabled={brokerLocked}
              defaultValue={toDateTimeValue(trade?.closedAt)}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title={t("dashboard.form.journalReview")}>
        <div className="grid gap-3 md:grid-cols-2">
          {reviewFields.map(([name, label]) => (
            <Field key={name} label={label}>
              <input
                name={name}
                defaultValue={tradeValue(trade, name as keyof TradeDto)}
                className={inputClass}
              />
            </Field>
          ))}
        </div>

        <Field label={t("dashboard.form.notes")}>
          <textarea
            name="notes"
            defaultValue={trade?.notes || ""}
            rows={4}
            className={textareaClass}
          />
        </Field>

        <div className="space-y-2">
          <div className="text-xs font-medium uppercase text-slate-400">{t("dashboard.form.tags")}</div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label
                key={tag.id}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-[#111827] px-3 py-2 text-sm text-gray-200"
              >
                <input
                  name="tagIds"
                  type="checkbox"
                  value={tag.id}
                  defaultChecked={selectedTags.has(tag.id)}
                  className="h-4 w-4"
                />
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: tag.color || "#60a5fa" }}
                />
                {tag.name}
              </label>
            ))}
            {tags.length === 0 ? (
              <span className="text-sm text-slate-400">{t("dashboard.form.noTags")}</span>
            ) : null}
          </div>
        </div>
      </Section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SaveState status={saveStatus} />
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
            disabled={saveStatus === "saving"}
            className="inline-flex h-10 items-center rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveStatus === "saving" ? t("dashboard.saveState.saving") : t("dashboard.form.saveTrade")}
          </button>
        </div>
      </div>
    </form>
  );
}
