"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, Power, RefreshCw } from "lucide-react";
import { MT5_JOURNAL_API_PATH, PRODUCTION_SITE_URL } from "@/lib/deployment-url";
import { cn } from "@/lib/utils";
import type { TradingAccountDto } from "@/components/dashboard/types";

type JournalConfigResponse = {
  ok: boolean;
  error?: string;
  apiUrl?: string;
  journalEnabled?: boolean;
  hasSecret?: boolean;
  lastConnectedAt?: string | null;
  lastSyncAt?: string | null;
};

type RegenerateResponse = {
  ok: boolean;
  error?: string;
  secret?: string;
  apiUrl?: string;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toEaBaseUrl(value: string) {
  return value.replace(new RegExp(`${MT5_JOURNAL_API_PATH}$`), "");
}

export function AccountJournalConnectionPanel({
  account,
  journalAccess,
}: {
  account: TradingAccountDto;
  journalAccess: {
    canUseJournal: boolean;
    status: string;
    message: string | null;
  };
}) {
  const [apiUrl, setApiUrl] = useState(PRODUCTION_SITE_URL);
  const [secret, setSecret] = useState("");
  const [journalEnabled, setJournalEnabled] = useState(account.journalEnabled);
  const [hasSecret, setHasSecret] = useState(Boolean(account.hasJournalSecret));
  const [lastConnectedAt, setLastConnectedAt] = useState(account.lastConnectedAt);
  const [lastSyncAt, setLastSyncAt] = useState(account.lastSyncAt);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState<"api" | "secret" | null>(null);
  const connectionStatus = !journalAccess.canUseJournal
    ? "Subscription Required"
    : !journalEnabled
      ? "Disabled"
      : hasSecret
        ? "Connected"
        : "Not Connected";

  async function regenerateSecret() {
    setStatus("saving");
    setMessage("");
    setCopied(null);

    try {
      const response = await fetch(
        `/api/trading-accounts/${account.id}/journal-secret/regenerate`,
        { method: "POST" }
      );
      const data = (await response.json()) as RegenerateResponse;

      if (!response.ok || !data.ok || !data.secret) {
        throw new Error(data.error || "Failed to regenerate secret");
      }

      setApiUrl(data.apiUrl ? toEaBaseUrl(data.apiUrl) : apiUrl);
      setSecret(data.secret);
      setHasSecret(true);
      setJournalEnabled(true);
      setStatus("success");
      setMessage("Save this secret now. For security, it will not be shown again.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to regenerate secret");
    }
  }

  async function toggleJournal() {
    const nextEnabled = !journalEnabled;
    setStatus("saving");
    setMessage("");

    try {
      const response = await fetch(
        `/api/trading-accounts/${account.id}/journal-config`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ journalEnabled: nextEnabled }),
        }
      );
      const data = (await response.json()) as JournalConfigResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to update journal config");
      }

      setApiUrl(data.apiUrl ? toEaBaseUrl(data.apiUrl) : apiUrl);
      setJournalEnabled(Boolean(data.journalEnabled));
      setHasSecret(Boolean(data.hasSecret));
      setLastConnectedAt(data.lastConnectedAt || null);
      setLastSyncAt(data.lastSyncAt || null);
      setStatus("success");
      setMessage(nextEnabled ? "Journal enabled" : "Journal disabled");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to update journal config");
    }
  }

  async function copyValue(value: string, type: "api" | "secret") {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopied(type);
    window.setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-800 bg-[#111827] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              MT5 Journal Connection
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Account number: {account.mt5AccountNumber || account.name}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={regenerateSecret}
            disabled={status === "saving" || !journalAccess.canUseJournal}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", status === "saving" && "animate-spin")} />
            {hasSecret ? "Regenerate Secret" : "Generate Secret"}
          </button>
          <button
            type="button"
            onClick={toggleJournal}
            disabled={status === "saving" || !journalAccess.canUseJournal}
            className={cn(
              "inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
              journalEnabled
                ? "border-red-500/30 text-red-200 hover:bg-red-500/10"
                : "border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/10"
            )}
          >
            <Power className="h-3.5 w-3.5" />
            {journalEnabled ? "Disable Journal Sync" : "Enable Journal Sync"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-700 bg-slate-950 p-3">
          <div className="font-semibold uppercase text-slate-500">Connection status</div>
          <div
            className={cn(
              "mt-1 font-semibold",
              connectionStatus === "Connected" && "text-emerald-300",
              connectionStatus === "Not Connected" && "text-amber-200",
              connectionStatus === "Disabled" && "text-slate-300",
              connectionStatus === "Subscription Required" && "text-red-200"
            )}
          >
            {connectionStatus}
          </div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-950 p-3">
          <div className="font-semibold uppercase text-slate-500">Account</div>
          <div className="mt-1 font-semibold text-slate-100">
            {account.name} {account.mt5AccountNumber ? `(${account.mt5AccountNumber})` : ""}
          </div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-950 p-3">
          <div className="font-semibold uppercase text-slate-500">Broker</div>
          <div className="mt-1 font-semibold text-slate-100">{account.broker || "-"}</div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-950 p-3">
          <div className="font-semibold uppercase text-slate-500">Platform</div>
          <div className="mt-1 font-semibold text-slate-100">{account.platform || "-"}</div>
        </div>
      </div>

      {journalAccess.message ? (
        <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200">
          {journalAccess.message}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-400">
            JOURNAL_API_BASE_URL
          </span>
          <div className="flex gap-2">
            <input
              readOnly
              value={apiUrl}
              className="h-10 min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100 outline-none"
            />
            <button
              type="button"
              onClick={() => copyValue(apiUrl, "api")}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
              aria-label="Copy API URL"
              title="Copy API URL"
            >
              {copied === "api" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-400">
            JOURNAL_UPLOAD_SECRET
          </span>
          <div className="flex gap-2">
            <input
              readOnly
              value={secret || (hasSecret ? "Secret already generated" : "")}
              className="h-10 min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100 outline-none"
            />
            <button
              type="button"
              onClick={() => copyValue(secret, "secret")}
              disabled={!secret}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Copy secret"
              title="Copy secret"
            >
              {copied === "secret" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </label>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
        <div>journalEnabled: {journalEnabled ? "true" : "false"}</div>
        <div>Last connected: {formatDate(lastConnectedAt)}</div>
        <div>Last sync: {formatDate(lastSyncAt)}</div>
      </div>

      <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950 p-3">
        <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
          EA settings helper
        </div>
        <pre className="overflow-x-auto text-xs leading-6 text-slate-200">{`JOURNAL_API_BASE_URL = ${apiUrl}
JOURNAL_UPLOAD_SECRET = ${secret || "your generated secret"}
JOURNAL_ENABLED = true
DEBUG_MODE = true`}</pre>
      </div>

      <div
        className={cn(
          "mt-3 min-h-4 text-xs font-medium",
          status === "success" && "text-emerald-300",
          status === "error" && "text-red-300",
          status === "saving" && "text-blue-300",
          status === "idle" && "text-slate-400"
        )}
      >
        {status === "saving" ? "Saving..." : message}
      </div>
    </div>
  );
}
