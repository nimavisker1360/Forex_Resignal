"use client";

import { useState } from "react";
import { Brain, Loader2, RefreshCw, Sparkles } from "lucide-react";
import type { TradeAIReviewDto, TradeDto } from "@/components/dashboard/types";
import { useLanguage } from "@/lib/language-context";

type ReviewResponse = {
  ok: boolean;
  review?: TradeAIReviewDto;
  error?: string;
  message?: string;
  upgradeRequired?: boolean;
};

function scoreClass(score: number) {
  if (score >= 80) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }

  if (score >= 60) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-100";
  }

  return "border-red-500/30 bg-red-500/10 text-red-100";
}

function ListBlock({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#111827] p-3">
      <div className="text-xs font-semibold uppercase text-slate-400">{title}</div>
      {items.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-200">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 text-sm text-slate-500">{emptyLabel}</div>
      )}
    </div>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#111827] p-3">
      <div className="text-xs font-semibold uppercase text-slate-400">{title}</div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">{text}</p>
    </div>
  );
}

export function TradeAIReviewPanel({
  trade,
  aiAnalysisEnabled,
  onReviewUpdated,
}: {
  trade: TradeDto;
  aiAnalysisEnabled: boolean;
  onReviewUpdated?: () => Promise<void> | void;
}) {
  const { t } = useLanguage();
  const [review, setReview] = useState<TradeAIReviewDto | null>(trade.aiReview || null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const hasReview = Boolean(review);
  const canGenerate = aiAnalysisEnabled || hasReview;

  async function requestReview(regenerate = false) {
    if (!aiAnalysisEnabled && !hasReview) {
      setStatus("error");
      setMessage(t("dashboard.aiReview.upgrade"));
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(
        `/api/trades/${trade.id}/ai-review${regenerate ? "?regenerate=true" : ""}`,
        { method: "POST" }
      );
      const data = (await response.json()) as ReviewResponse;

      if (!response.ok || !data.ok || !data.review) {
        throw new Error(data.message || data.error || t("dashboard.aiReview.failed"));
      }

      setReview(data.review);
      setStatus("idle");
      await onReviewUpdated?.();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : t("dashboard.aiReview.failed"));
    }
  }

  return (
    <section className="space-y-4 rounded-lg border border-slate-800 bg-[#0B1220] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase text-slate-200">
            <Brain className="h-4 w-4 text-violet-300" />
            {t("dashboard.aiReview.title")}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {t("dashboard.aiReview.description")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!hasReview ? (
            <button
              type="button"
              onClick={() => requestReview(false)}
              disabled={status === "loading" || !canGenerate}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {trade.aiReviewStatus === "FAILED"
                ? t("dashboard.aiReview.retry")
                : aiAnalysisEnabled
                  ? t("dashboard.aiReview.generate")
                  : t("dashboard.aiReview.upgrade")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => requestReview(true)}
              disabled={status === "loading" || !aiAnalysisEnabled}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-violet-500/30 px-3 text-xs font-semibold text-violet-200 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              {aiAnalysisEnabled ? t("dashboard.aiReview.regenerate") : t("dashboard.aiReview.upgradeRegenerate")}
            </button>
          )}
        </div>
      </div>

      {message ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {message}
        </div>
      ) : null}

      {review ? (
        <div className="space-y-3">
          <div className={`rounded-lg border p-4 ${scoreClass(review.score)}`}>
            <div className="text-xs font-semibold uppercase opacity-80">{t("dashboard.aiReview.score")}</div>
            <div className="mt-2 text-3xl font-semibold">{review.score}/100</div>
            <div className="mt-1 text-xs opacity-80">{t("dashboard.aiReview.confidence")}: {Math.round(review.confidence * 100)}%</div>
          </div>
          <TextBlock title={t("dashboard.aiReview.summary")} text={review.summary} />
          <div className="grid gap-3 lg:grid-cols-3">
            <ListBlock title={t("dashboard.aiReview.strengths")} items={review.strengths} emptyLabel={t("dashboard.aiReview.noItems")} />
            <ListBlock title={t("dashboard.aiReview.weaknesses")} items={review.weaknesses} emptyLabel={t("dashboard.aiReview.noItems")} />
            <ListBlock title={t("dashboard.aiReview.mistakes")} items={review.mistakes} emptyLabel={t("dashboard.aiReview.noItems")} />
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <TextBlock title={t("dashboard.aiReview.riskReview")} text={review.riskReview} />
            <TextBlock title={t("dashboard.aiReview.psychologyReview")} text={review.psychologyReview} />
            <TextBlock title={t("dashboard.aiReview.playbookReview")} text={review.playbookReview} />
          </div>
          <ListBlock title={t("dashboard.aiReview.improvementPlan")} items={review.improvementPlan} emptyLabel={t("dashboard.aiReview.noItems")} />
          <div className="flex flex-wrap gap-2">
            {review.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-800 bg-[#111827] p-4 text-sm text-slate-400">
          {t("dashboard.aiReview.empty")}
        </div>
      )}
    </section>
  );
}
