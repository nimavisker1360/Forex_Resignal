"use client";

import Link from "next/link";
import { AlertTriangle, Info } from "lucide-react";
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
};

export function SubscriptionStatusBanner({
  title,
  titleFa,
  tone = "info",
  href = "/pricing",
  buttonText = "Upgrade",
  buttonTextFa,
  className,
}: SubscriptionStatusBannerProps) {
  const { language } = useLanguage();
  const isWarning = tone === "warning";
  const localizedTitle = language === "fa" && titleFa ? titleFa : title;
  const localizedButtonText = language === "fa" && buttonTextFa ? buttonTextFa : buttonText;

  return (
    <div
      className={cn(
        "mb-5 rounded-lg border p-4 text-sm",
        isWarning
          ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
          : tone === "neutral"
            ? "border-slate-700 bg-slate-800/70 text-slate-200"
            : "border-blue-500/30 bg-blue-500/10 text-blue-100",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {isWarning ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <p className="font-medium">{localizedTitle}</p>
        </div>
        <Link
          href={href}
          className={cn(
            "inline-flex h-9 shrink-0 items-center justify-center rounded-lg px-3 text-sm font-semibold",
            isWarning
              ? "bg-amber-300 text-slate-950 hover:bg-amber-200"
              : "bg-blue-600 text-white hover:bg-blue-500"
          )}
        >
          {localizedButtonText}
        </Link>
      </div>
    </div>
  );
}
