"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

export type JournalConnectionDto = {
  id: string;
  tokenPreview: string;
  name: string | null;
  connectedAt: string;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type JournalConnectionSettingsProps = {
  initialConnection: JournalConnectionDto | null;
  apiBaseUrl: string;
};

type ConnectionResponse = {
  success: boolean;
  connection: JournalConnectionDto | null;
  token?: string;
  apiBaseUrl?: string;
  message?: string;
};

function formatDate(value: string | null, locale: string, emptyLabel: string) {
  if (!value) {
    return emptyLabel;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const readonlyInputClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

export function JournalConnectionSettings({
  initialConnection,
  apiBaseUrl,
}: JournalConnectionSettingsProps) {
  const [connection, setConnection] = useState(initialConnection);
  const [baseUrl, setBaseUrl] = useState(apiBaseUrl);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState<"token" | "base" | null>(null);
  const { language, t } = useLanguage();
  const locale = language === "fa" ? "fa-IR" : "en";

  async function regenerate() {
    setStatus("saving");
    setMessage("");
    setCopied(null);

    try {
      const response = await fetch("/api/journal/connection", {
        method: "POST",
      });
      const data = (await response.json()) as ConnectionResponse;

      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.message || t("dashboard.journalConnection.generateFailed"));
      }

      setConnection(data.connection);
      setToken(data.token);
      setBaseUrl(data.apiBaseUrl || baseUrl);
      setStatus("success");
      setMessage(t("dashboard.journalConnection.generated"));
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : t("dashboard.journalConnection.generateFailed"));
    }
  }

  async function copyValue(value: string, type: "token" | "base") {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopied(type);
    window.setTimeout(() => setCopied(null), 1800);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
              {t("dashboard.journalConnection.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {connection
                ? t("dashboard.journalConnection.connected").replace(
                    "{date}",
                    formatDate(connection.connectedAt, locale, t("dashboard.journalConnection.never"))
                  )
                : t("dashboard.journalConnection.noActiveKey")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={regenerate}
          disabled={status === "saving"}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={cn("h-4 w-4", status === "saving" && "animate-spin")} />
          {connection ? t("dashboard.journalConnection.resetKey") : t("dashboard.journalConnection.generateKey")}
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            JOURNAL_API_BASE_URL
          </span>
          <div className="flex gap-2">
            <input readOnly value={baseUrl} className={readonlyInputClass} />
            <button
              type="button"
              onClick={() => copyValue(baseUrl, "base")}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label={t("dashboard.journalConnection.copyApiBaseUrl")}
              title={t("dashboard.journalConnection.copyApiBaseUrl")}
            >
              {copied === "base" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            JOURNAL_UPLOAD_SECRET
          </span>
          <div className="flex gap-2">
            <input
              readOnly
              value={token || connection?.tokenPreview || ""}
              className={readonlyInputClass}
            />
            <button
              type="button"
              onClick={() => copyValue(token, "token")}
              disabled={!token}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label={t("dashboard.journalConnection.copyJournalKey")}
              title={t("dashboard.journalConnection.copyJournalKey")}
            >
              {copied === "token" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </label>
      </div>

      <div
        className={cn(
          "mt-4 min-h-5 text-sm font-medium",
          status === "success" && "text-emerald-600 dark:text-emerald-300",
          status === "error" && "text-red-600 dark:text-red-300",
          status === "saving" && "text-blue-600 dark:text-blue-300",
          status === "idle" && "text-slate-500 dark:text-slate-400"
        )}
      >
        {status === "saving" ? t("dashboard.journalConnection.generating") : message}
      </div>

      <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-800 md:grid-cols-3">
        <div>
          <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            {t("dashboard.journalConnection.keyPreview")}
          </div>
          <div className="mt-1 text-slate-800 dark:text-slate-100">
            {connection?.tokenPreview || t("dashboard.common.none")}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            {t("dashboard.journalConnection.connectedAt")}
          </div>
          <div className="mt-1 text-slate-800 dark:text-slate-100">
            {formatDate(connection?.connectedAt || null, locale, t("dashboard.journalConnection.never"))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            {t("dashboard.journalConnection.lastUsed")}
          </div>
          <div className="mt-1 text-slate-800 dark:text-slate-100">
            {formatDate(connection?.lastUsedAt || null, locale, t("dashboard.journalConnection.never"))}
          </div>
        </div>
      </div>
    </section>
  );
}
