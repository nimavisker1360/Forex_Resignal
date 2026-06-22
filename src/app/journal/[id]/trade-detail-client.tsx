"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Camera,
  Edit3,
  ImageOff,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type {
  PrismaTradeDto,
  PrismaTradingAccountDto,
} from "@/app/journal/_lib/journal-api";
import { TradeChecklistPanel } from "@/components/journal/TradeChecklistPanel";
import { TradeStrategyReviewPanel } from "@/components/journal/TradeStrategyReviewPanel";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

type TradeDetailClientProps = {
  initialTrade: PrismaTradeDto;
  accounts: PrismaTradingAccountDto[];
};

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm normal-case text-slate-950 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-[#111827] dark:text-[#E5E7EB]";
const textareaClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm normal-case text-slate-950 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-[#111827] dark:text-[#E5E7EB]";

function toDisplay(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function formatNumber(value: string | number | null | undefined, digits = 2) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return String(value);
  }

  return parsed.toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dateTimeLocalValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formValue(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text ? text : null;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
      {label}
      {children}
    </label>
  );
}

function Section({
  title,
  children,
  actions,
  rtl = false,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  rtl?: boolean;
}) {
  return (
    <section className={cn("rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]", rtl && "text-right")}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

function Metric({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#111827]">
      <div className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">{label}</div>
      <div className={cn("mt-1 truncate text-sm font-semibold text-slate-950 dark:text-white", className)}>
        {value}
      </div>
    </div>
  );
}

function sideClass(direction: PrismaTradeDto["direction"]) {
  return direction === "SELL"
    ? "border-red-500/30 bg-red-500/10 text-[#EF4444]"
    : "border-emerald-500/30 bg-emerald-500/10 text-[#10B981]";
}

function statusClass(status: PrismaTradeDto["status"]) {
  if (status === "CLOSED") {
    return "border-emerald-500/30 bg-emerald-500/10 text-[#10B981]";
  }

  if (status === "OPEN") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }

  return "border-slate-700 bg-slate-900 text-slate-300";
}

function tradeAccount(trade: PrismaTradeDto) {
  return trade.account || trade.tradingAccount || null;
}

export function TradeDetailClient({
  initialTrade,
  accounts,
}: TradeDetailClientProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isRtl = language === "fa";
  const [trade, setTrade] = useState(initialTrade);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingScreenshot, setSavingScreenshot] = useState(false);
  const [savingTags, setSavingTags] = useState(false);
  const [isPending, startTransition] = useTransition();
  const account = tradeAccount(trade);
  const tags = useMemo(
    () => trade.tags?.map((item) => item.tag.name).join(", ") || "",
    [trade.tags]
  );
  const screenshots = trade.screenshots || [];
  const groupedScreenshots = {
    ENTRY: screenshots.filter((screenshot) => screenshot.type.toUpperCase() === "ENTRY"),
    EXIT: screenshots.filter((screenshot) => screenshot.type.toUpperCase() === "EXIT"),
  };
  const additionalScreenshots = screenshots.filter(
    (screenshot) =>
      !["ENTRY", "EXIT"].includes(screenshot.type.toUpperCase())
  );
  const directionLabel = (direction: string | null | undefined) => {
    if (direction === "BUY") {
      return t("journal.tradeDetail.buy");
    }

    if (direction === "SELL") {
      return t("journal.tradeDetail.sell");
    }

    return direction || "-";
  };
  const statusLabel = (status: string | null | undefined) => {
    if (status === "OPEN") {
      return t("journal.tradeDetail.open");
    }

    if (status === "CLOSED") {
      return t("journal.tradeDetail.closed");
    }

    if (status === "CANCELLED") {
      return t("journal.tradeDetail.cancelled");
    }

    return status || "-";
  };
  const screenshotTypeLabel = (type: string) => {
    if (type.toUpperCase() === "ENTRY") {
      return t("journal.tradeDetail.entryScreenshot");
    }

    if (type.toUpperCase() === "EXIT") {
      return t("journal.tradeDetail.exitScreenshot");
    }

    return t("journal.tradeDetail.additionalScreenshot");
  };

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function saveTrade(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      symbol: formValue(formData.get("symbol")),
      side: formValue(formData.get("side")),
      entryPrice: formValue(formData.get("entryPrice")),
      exitPrice: formValue(formData.get("exitPrice")),
      stopLoss: formValue(formData.get("stopLoss")),
      takeProfit: formValue(formData.get("takeProfit")),
      lotSize: formValue(formData.get("lotSize")),
      riskAmount: formValue(formData.get("riskAmount")),
      profitLoss: formValue(formData.get("profitLoss")),
      status: formValue(formData.get("status")),
      strategy: formValue(formData.get("strategy")),
      setup: formValue(formData.get("setup")),
      emotion: formValue(formData.get("emotion")),
      mistakes: formValue(formData.get("mistakes")),
      notes: formValue(formData.get("notes")),
      entryTime: formValue(formData.get("entryTime")),
      exitTime: formValue(formData.get("exitTime")),
      accountId: formValue(formData.get("accountId")),
    };

    try {
      const response = await fetch(`/api/journal/trades/${trade.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(
          Array.isArray(data.errors) ? data.errors.join(", ") : data.message
        );
        return;
      }

      if (data.trade) {
        setTrade(data.trade);
      }

      toast.success(t("journal.tradeDetail.tradeSaved"));
      setEditing(false);
      refresh();
    } catch {
      toast.error(t("journal.tradeDetail.saveTradeFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function addScreenshot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingScreenshot(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      screenshotUrl: formValue(formData.get("screenshotUrl")),
      type: formValue(formData.get("type")),
      caption: formValue(formData.get("caption")),
    };

    try {
      const response = await fetch(`/api/journal/trades/${trade.id}/screenshots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(
          Array.isArray(data.errors) ? data.errors.join(", ") : data.message
        );
        return;
      }

      if (data.trade) {
        setTrade(data.trade);
      }

      toast.success(t("journal.tradeDetail.screenshotAdded"));
      form.reset();
      refresh();
    } catch {
      toast.error(t("journal.tradeDetail.addScreenshotFailed"));
    } finally {
      setSavingScreenshot(false);
    }
  }

  async function saveTags(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingTags(true);

    const formData = new FormData(event.currentTarget);
    const tags = Array.from(
      new Set(
        String(formData.get("tags") || "")
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean)
      )
    );
    const payload = {
      tags,
    };

    try {
      const response = await fetch(`/api/journal/trades/${trade.id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || t("journal.tradeDetail.saveTagsFailed"));
        return;
      }

      if (Array.isArray(data.tags)) {
        const now = new Date().toISOString();

        setTrade((currentTrade) => ({
          ...currentTrade,
          tags: data.tags.map((name: string) => ({
            tradeId: currentTrade.id,
            tagId: name,
            tag: {
              id: name,
              userId: currentTrade.userId,
              name,
              color: null,
              createdAt: now,
            },
          })),
        }));
      }

      toast.success(t("journal.tradeDetail.tagsSaved"));
      refresh();
    } catch {
      toast.error(t("journal.tradeDetail.saveTagsFailed"));
    } finally {
      setSavingTags(false);
    }
  }

  async function deleteTrade() {
    const confirmed = window.confirm(
      t("journal.tradeDetail.confirmDelete").replace("{symbol}", trade.symbol)
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/journal/trades/${trade.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || t("journal.tradeDetail.deleteTradeFailed"));
        return;
      }

      toast.success(t("journal.tradeDetail.tradeDeleted"));
      router.push("/journal");
      router.refresh();
    } catch {
      toast.error(t("journal.tradeDetail.deleteTradeFailed"));
    }
  }

  return (
    <div className="space-y-5">
      <Link
        href="/journal"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950 dark:text-gray-300 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("journal.tradeDetail.backToTrades")}
      </Link>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
        <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", isRtl && "text-right")}>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">{trade.symbol}</h1>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold",
                  sideClass(trade.direction)
                )}
              >
                {trade.direction === "SELL" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <ArrowUp className="h-3 w-3" />
                )}
                {directionLabel(trade.direction)}
              </span>
              <span
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-xs font-semibold",
                  statusClass(trade.status)
                )}
              >
                {statusLabel(trade.status)}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {account?.name || trade.accountId} / {account?.broker || "-"} /{" "}
              {account?.platform || "-"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditing((value) => !value)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {editing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              {editing ? t("journal.tradeDetail.cancel") : t("journal.tradeDetail.edit")}
            </button>
            <button
              type="button"
              onClick={deleteTrade}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-500/30 px-4 text-sm font-semibold text-[#EF4444] hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              {t("journal.tradeDetail.delete")}
            </button>
          </div>
        </div>
      </div>

      {editing ? (
        <Section
          title={t("journal.tradeDetail.editTrade")}
          rtl={isRtl}
          actions={
            <button
              type="submit"
              form="journal-trade-edit-form"
              disabled={saving || isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving || isPending ? t("journal.tradeDetail.saving") : t("journal.tradeDetail.save")}
            </button>
          }
        >
          <form id="journal-trade-edit-form" onSubmit={saveTrade} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <Field label={t("journal.tradeDetail.symbol")}>
                <input name="symbol" defaultValue={trade.symbol} className={inputClass} />
              </Field>
              <Field label={t("journal.tradeDetail.side")}>
                <select name="side" defaultValue={trade.direction} className={inputClass}>
                  <option value="BUY">{t("journal.tradeDetail.buy")}</option>
                  <option value="SELL">{t("journal.tradeDetail.sell")}</option>
                </select>
              </Field>
              <Field label={t("journal.tradeDetail.status")}>
                <select name="status" defaultValue={trade.status} className={inputClass}>
                  <option value="OPEN">{t("journal.tradeDetail.open")}</option>
                  <option value="CLOSED">{t("journal.tradeDetail.closed")}</option>
                  <option value="CANCELLED">{t("journal.tradeDetail.cancelled")}</option>
                </select>
              </Field>
              <Field label={t("journal.tradeDetail.account")}>
                {accounts.length > 0 ? (
                  <select name="accountId" defaultValue={trade.accountId} className={inputClass}>
                    {accounts.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input name="accountId" defaultValue={trade.accountId} className={inputClass} />
                )}
              </Field>
              <Field label={t("journal.tradeDetail.entryPrice")}>
                <input
                  name="entryPrice"
                  type="number"
                  step="any"
                  defaultValue={toDisplay(trade.entryPrice) === "-" ? "" : toDisplay(trade.entryPrice)}
                  className={inputClass}
                />
              </Field>
              <Field label={t("journal.tradeDetail.exitPrice")}>
                <input
                  name="exitPrice"
                  type="number"
                  step="any"
                  defaultValue={toDisplay(trade.exitPrice) === "-" ? "" : toDisplay(trade.exitPrice)}
                  className={inputClass}
                />
              </Field>
              <Field label={t("journal.tradeDetail.stopLoss")}>
                <input
                  name="stopLoss"
                  type="number"
                  step="any"
                  defaultValue={toDisplay(trade.stopLoss) === "-" ? "" : toDisplay(trade.stopLoss)}
                  className={inputClass}
                />
              </Field>
              <Field label={t("journal.tradeDetail.takeProfit")}>
                <input
                  name="takeProfit"
                  type="number"
                  step="any"
                  defaultValue={toDisplay(trade.takeProfit) === "-" ? "" : toDisplay(trade.takeProfit)}
                  className={inputClass}
                />
              </Field>
              <Field label={t("journal.tradeDetail.lotSize")}>
                <input
                  name="lotSize"
                  type="number"
                  step="any"
                  defaultValue={toDisplay(trade.lotSize) === "-" ? "" : toDisplay(trade.lotSize)}
                  className={inputClass}
                />
              </Field>
              <Field label={t("journal.tradeDetail.riskAmount")}>
                <input
                  name="riskAmount"
                  type="number"
                  step="any"
                  defaultValue={toDisplay(trade.riskAmount) === "-" ? "" : toDisplay(trade.riskAmount)}
                  className={inputClass}
                />
              </Field>
              <Field label="PnL">
                <input
                  name="profitLoss"
                  type="number"
                  step="any"
                  defaultValue={toDisplay(trade.profitLoss) === "-" ? "" : toDisplay(trade.profitLoss)}
                  className={inputClass}
                />
              </Field>
              <Field label={t("journal.tradeDetail.entryTime")}>
                <input
                  name="entryTime"
                  type="datetime-local"
                  defaultValue={dateTimeLocalValue(trade.openedAt || trade.entryTime)}
                  className={inputClass}
                />
              </Field>
              <Field label={t("journal.tradeDetail.exitTime")}>
                <input
                  name="exitTime"
                  type="datetime-local"
                  defaultValue={dateTimeLocalValue(trade.closedAt || trade.exitTime)}
                  className={inputClass}
                />
              </Field>
              <Field label={t("journal.tradeDetail.strategy")}>
                <input
                  name="strategy"
                  defaultValue={trade.strategy || trade.session || ""}
                  className={inputClass}
                />
              </Field>
              <Field label={t("journal.tradeDetail.setup")}>
                <input name="setup" defaultValue={trade.setup || ""} className={inputClass} />
              </Field>
              <Field label={t("journal.tradeDetail.emotion")}>
                <input name="emotion" defaultValue={trade.emotion || ""} className={inputClass} />
              </Field>
              <Field label={t("journal.tradeDetail.mistakes")}>
                <input
                  name="mistakes"
                  defaultValue={trade.mistakes || trade.mistake || ""}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label={t("journal.tradeDetail.notes")}>
              <textarea
                name="notes"
                rows={4}
                defaultValue={trade.notes || ""}
                className={textareaClass}
              />
            </Field>
          </form>
        </Section>
      ) : null}

      <Section title={t("journal.tradeDetail.tradeOverview")} rtl={isRtl}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label={t("journal.tradeDetail.symbol")} value={trade.symbol} />
          <Metric label={t("journal.tradeDetail.directionSide")} value={directionLabel(trade.direction)} />
          <Metric label={t("journal.tradeDetail.account")} value={account?.name || trade.accountId} />
          <Metric label={t("journal.tradeDetail.status")} value={statusLabel(trade.status)} />
          <Metric label={t("journal.tradeDetail.entryPrice")} value={formatNumber(trade.entryPrice, 5)} />
          <Metric label={t("journal.tradeDetail.exitPrice")} value={formatNumber(trade.exitPrice, 5)} />
          <Metric label={t("journal.tradeDetail.stopLoss")} value={formatNumber(trade.stopLoss, 5)} className="text-red-300" />
          <Metric label={t("journal.tradeDetail.takeProfit")} value={formatNumber(trade.takeProfit, 5)} className="text-emerald-300" />
          <Metric label={t("journal.tradeDetail.lotSize")} value={formatNumber(trade.lotSize, 3)} />
          <Metric label={t("journal.tradeDetail.riskAmount")} value={formatNumber(trade.riskAmount, 2)} />
          <Metric
            label="PnL"
            value={formatNumber(trade.profitLoss, 2)}
            className={Number(trade.profitLoss || 0) >= 0 ? "text-emerald-300" : "text-red-300"}
          />
          <Metric label="R:R" value={formatNumber(trade.rr, 2)} />
          <Metric label={t("journal.tradeDetail.entryTime")} value={formatDate(trade.openedAt || trade.entryTime)} />
          <Metric label={t("journal.tradeDetail.exitTime")} value={formatDate(trade.closedAt || trade.exitTime)} />
        </div>
      </Section>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Section title={t("journal.tradeDetail.tradeReview")} rtl={isRtl}>
          <div className="grid gap-3 md:grid-cols-2">
            <Metric label={t("journal.tradeDetail.strategy")} value={toDisplay(trade.strategy || trade.session)} />
            <Metric label={t("journal.tradeDetail.setup")} value={toDisplay(trade.setup)} />
            <Metric label={t("journal.tradeDetail.mistakes")} value={toDisplay(trade.mistakes || trade.mistake)} />
            <Metric label={t("journal.tradeDetail.emotionPsychologyState")} value={toDisplay(trade.emotion)} />
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#111827]">
            <div className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">{t("journal.tradeDetail.notes")}</div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
              {trade.notes || "-"}
            </p>
          </div>
        </Section>

        <Section title={t("journal.tradeDetail.psychology")} rtl={isRtl}>
          <div className="grid gap-3">
            <Metric label={t("journal.tradeDetail.emotion")} value={toDisplay(trade.emotion)} />
            <Metric label={t("journal.tradeDetail.mistakeType")} value={toDisplay(trade.mistakes || trade.mistake)} />
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#111827]">
              <div className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">{t("journal.tradeDetail.psychologyNotes")}</div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
                {trade.notes || "-"}
              </p>
            </div>
          </div>
        </Section>
      </div>

      <TradeChecklistPanel tradeId={trade.id} />

      <TradeStrategyReviewPanel tradeId={trade.id} />

      <Section title={t("journal.tradeDetail.screenshots")} rtl={isRtl}>
        <div className="grid gap-4 lg:grid-cols-2">
          {Object.entries(groupedScreenshots).map(([type, items]) => (
            <div key={type} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#111827]">
              <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-950 dark:border-slate-800 dark:text-white">
                <Camera className="h-4 w-4 text-blue-400" />
                {screenshotTypeLabel(type)}
              </div>
              {items.length > 0 ? (
                <div className="grid gap-3 p-3">
                  {items.map((screenshot) => (
                    <a
                      key={screenshot.id}
                      href={screenshot.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-lg border border-slate-800"
                    >
                      <img
                        src={screenshot.url}
                        alt={screenshotTypeLabel(type)}
                        className="aspect-video w-full bg-[#020617] object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-white p-6 text-center text-sm text-slate-500 dark:bg-[#0F172A] dark:text-slate-400">
                  <ImageOff className="h-8 w-8 text-slate-600" />
                  <div>{t("journal.tradeDetail.noScreenshot")}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {additionalScreenshots.length > 0 ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {additionalScreenshots.map((screenshot) => (
              <a
                key={screenshot.id}
                href={screenshot.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#111827]"
              >
                <img
                  src={screenshot.url}
                  alt={t("journal.tradeDetail.additionalScreenshot")}
                  className="aspect-video w-full object-cover"
                />
              </a>
            ))}
          </div>
        ) : null}

        <form onSubmit={addScreenshot} className="mt-4 grid gap-3 md:grid-cols-[1fr_160px_1fr_auto]">
          <Field label={t("journal.tradeDetail.screenshotUrl")}>
            <input
              name="screenshotUrl"
              required
              type="url"
              placeholder="https://example.com/chart.png"
              className={inputClass}
            />
          </Field>
          <Field label={t("journal.tradeDetail.type")}>
            <select name="type" defaultValue="ENTRY" className={inputClass}>
              <option value="ENTRY">{t("journal.tradeDetail.entry")}</option>
              <option value="EXIT">{t("journal.tradeDetail.exit")}</option>
            </select>
          </Field>
          <Field label={t("journal.tradeDetail.caption")}>
            <input name="caption" className={inputClass} />
          </Field>
          <button
            type="submit"
            disabled={savingScreenshot || isPending}
            className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            <Camera className="h-4 w-4" />
            {savingScreenshot ? t("journal.tradeDetail.adding") : t("journal.tradeDetail.add")}
          </button>
        </form>
      </Section>

      <Section title={t("journal.tradeDetail.tags")} rtl={isRtl}>
        <form onSubmit={saveTags} className="flex flex-col gap-3 md:flex-row md:items-end">
          <Field label={t("journal.tradeDetail.connectedTags")}>
            <input
              name="tags"
              defaultValue={tags}
              placeholder="breakout, london, clean setup"
              className={inputClass}
            />
          </Field>
          <button
            type="submit"
            disabled={savingTags || isPending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {savingTags ? t("journal.tradeDetail.saving") : t("journal.tradeDetail.saveTags")}
          </button>
        </form>
      </Section>
    </div>
  );
}
