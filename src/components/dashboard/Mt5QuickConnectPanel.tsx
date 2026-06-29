"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, RefreshCw } from "lucide-react";
import { PRODUCTION_SITE_URL } from "@/lib/deployment-url";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

type QuickConnectResponse = {
  ok: boolean;
  error?: string;
  secret?: string;
  apiUrl?: string;
};

export function Mt5QuickConnectPanel({
  onCreated,
}: {
  onCreated: () => Promise<void>;
}) {
  const { language } = useLanguage();
  const text = language === "fa"
    ? {
        title: "اتصال سریع MT5",
        description:
          "ابتدا یک کلید بسازید، آن را در EA وارد کنید، سپس اولین معامله MT5 این اتصال را به‌صورت خودکار به شماره واقعی حساب وصل می‌کند.",
        generateKey: "ساخت کلید MT5",
        generating: "در حال ساخت...",
        generateFailed: "ساخت کلید MT5 ناموفق بود",
        secretReady: "این secret را همین حالا در MT5 وارد کنید. دوباره نمایش داده نمی‌شود.",
        copyApiUrl: "کپی آدرس API",
        copySecret: "کپی secret",
      }
    : {
        title: "MT5 Quick Connect",
        description:
          "Generate a key first, put it in the EA, and the first MT5 trade will attach this connection to the real account number automatically.",
        generateKey: "Generate MT5 Key",
        generating: "Generating...",
        generateFailed: "Failed to generate MT5 key",
        secretReady: "Use this secret in MT5 now. It will not be shown again.",
        copyApiUrl: "Copy API URL",
        copySecret: "Copy secret",
      };
  const [apiUrl, setApiUrl] = useState(PRODUCTION_SITE_URL);
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState<"api" | "secret" | null>(null);

  async function generateQuickConnect() {
    setStatus("saving");
    setMessage("");

    try {
      const response = await fetch("/api/trading-accounts/mt5-quick-connect", {
        method: "POST",
      });
      const data = (await response.json()) as QuickConnectResponse;

      if (!response.ok || !data.ok || !data.secret) {
        throw new Error(data.error || text.generateFailed);
      }

      setApiUrl((data.apiUrl || apiUrl).replace(/\/api\/mt5\/journal$/, ""));
      setSecret(data.secret);
      setStatus("success");
      setMessage(text.secretReady);
      await onCreated();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : text.generateFailed);
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
    <section className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">
              {text.title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              {text.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={generateQuickConnect}
          disabled={status === "saving"}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={cn("h-4 w-4", status === "saving" && "animate-spin")} />
          {text.generateKey}
        </button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            JOURNAL_API_BASE_URL
          </span>
          <div className="flex gap-2">
            <input
              readOnly
              value={apiUrl}
              className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => copyValue(apiUrl, "api")}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label={text.copyApiUrl}
              title={text.copyApiUrl}
            >
              {copied === "api" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            JOURNAL_UPLOAD_SECRET
          </span>
          <div className="flex gap-2">
            <input
              readOnly
              value={secret}
              className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => copyValue(secret, "secret")}
              disabled={!secret}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label={text.copySecret}
              title={text.copySecret}
            >
              {copied === "secret" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </label>
      </div>

      <div
        className={cn(
          "mt-3 min-h-5 text-sm font-medium",
          status === "success" && "text-emerald-700 dark:text-emerald-300",
          status === "error" && "text-red-700 dark:text-red-300",
          status === "saving" && "text-blue-700 dark:text-blue-300",
          status === "idle" && "text-slate-500 dark:text-slate-400"
        )}
      >
        {status === "saving" ? text.generating : message}
      </div>
    </section>
  );
}
