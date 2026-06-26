"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Info, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

type SubscriptionStatusBannerProps = {
  title: string;
  titleFa?: string;
  tone?: "info" | "warning" | "neutral";
  href?: string;
  buttonText?: string;
  buttonTextFa?: string;
  className?: string;
  dismissible?: boolean;
};

export function SubscriptionStatusBanner({
  title,
  titleFa,
  tone = "info",
  href = "/pricing",
  buttonText = "Upgrade",
  buttonTextFa,
  className,
  dismissible = true,
}: SubscriptionStatusBannerProps) {
  const { language } = useLanguage();
  const isWarning = tone === "warning";
  const localizedTitle = language === "fa" && titleFa ? titleFa : title;
  const localizedButtonText = language === "fa" && buttonTextFa ? buttonTextFa : buttonText;
  const dismissKey = useMemo(() => `subscription-banner-dismissed:${title}`, [title]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(window.sessionStorage.getItem(dismissKey) === "1");
  }, [dismissKey]);

  if (dismissible && dismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        "mb-4 rounded-lg border px-3 py-2.5 text-sm",
        isWarning
          ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"
          : tone === "neutral"
            ? "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200"
            : "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100",
        className
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {isWarning ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <p className="font-medium">{localizedTitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={href}
            className={cn(
              "inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-semibold",
              isWarning
                ? "bg-amber-300 text-slate-950 hover:bg-amber-200"
                : "bg-blue-600 text-white hover:bg-blue-500"
            )}
          >
            {localizedButtonText}
          </Link>
          {dismissible ? (
            <button
              type="button"
              onClick={() => {
                window.sessionStorage.setItem(dismissKey, "1");
                setDismissed(true);
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-current/20 opacity-80 hover:opacity-100"
              aria-label="Dismiss trial banner"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
