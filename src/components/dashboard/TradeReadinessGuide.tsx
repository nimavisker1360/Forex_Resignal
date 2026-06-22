"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  Gauge,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import type { TradeDto } from "@/components/dashboard/types";

type ScenarioId = "trend" | "range" | "news" | "wait";
type GuideState = {
  mindset: Record<string, boolean>;
  checklist: Record<string, boolean>;
  scenario: ScenarioId;
};

const defaultState: GuideState = {
  mindset: {
    calm: false,
    noRevenge: false,
    focused: false,
    riskAccepted: false,
  },
  checklist: {
    direction: false,
    entry: false,
    stopLoss: false,
    takeProfit: false,
    rr: false,
    newsChecked: false,
  },
  scenario: "trend",
};

const copy = {
  en: {
    title: "Today Trade Guide",
    subtitle: "One simple flow: mindset, playbook, checklist, then the final decision.",
    finalDecision: "Final decision",
    score: "Readiness",
    ready: "Trade allowed",
    caution: "Trade with reduced size",
    wait: "Wait, do not enter yet",
    readyHint: "Mindset and entry checks are aligned.",
    cautionHint: "Some checks need attention before full risk.",
    waitHint: "A required step is missing or risk is elevated.",
    mindsetTitle: "1. Mindset",
    mindsetSubtitle: "Check your state before looking for entry.",
    playbookTitle: "2. Today's Playbook",
    playbookSubtitle: "Choose only one market scenario for now.",
    checklistTitle: "3. Entry Checklist",
    checklistSubtitle: "Required items before accepting a signal or trade.",
    currentRisk: "Current dashboard risk",
    openTrades: "open trades",
    reviewsWaiting: "reviews waiting",
    highImpactNews: "high-impact news",
    noHighImpactNews: "no high-impact news",
    loadingNews: "checking news risk",
    actionsTitle: "Next action",
    dailyJournal: "Open Daily Journal",
    playbooks: "Manage Playbooks",
    checklists: "Manage Checklists",
    reviewTrades: "Review Trades",
    recentPlan: "Latest plan",
    noRecentPlan: "No recent trade plan yet",
    reviewed: "Reviewed",
    notReviewed: "Not reviewed",
    mindsetItems: {
      calm: "I am calm, not rushing.",
      noRevenge: "I am not trying to recover a loss.",
      focused: "I can follow the plan without distraction.",
      riskAccepted: "I accept the risk before entry.",
    },
    scenarios: {
      trend: {
        title: "Trend setup",
        description: "Trade only with the main direction after confirmation.",
      },
      range: {
        title: "Range setup",
        description: "Trade only from clear support or resistance.",
      },
      news: {
        title: "News risk",
        description: "Avoid fresh entries or reduce size around major events.",
      },
      wait: {
        title: "No clear setup",
        description: "Stand aside until the plan becomes obvious.",
      },
    },
    checklistItems: {
      direction: "Market direction is clear.",
      entry: "Entry price is defined.",
      stopLoss: "Stop loss is defined.",
      takeProfit: "Take profit is defined.",
      rr: "Risk/reward is acceptable.",
      newsChecked: "News risk has been checked.",
    },
  },
  fa: {
    title: "راهنمای معامله امروز",
    subtitle: "یک مسیر ساده: ذهنیت، پلی‌بوک، چک‌لیست، بعد تصمیم نهایی.",
    finalDecision: "تصمیم نهایی",
    score: "آمادگی",
    ready: "ورود مجاز است",
    caution: "با حجم کمتر معامله کن",
    wait: "صبر کن، هنوز وارد نشو",
    readyHint: "ذهنیت و چک‌های ورود با پلن هماهنگ هستند.",
    cautionHint: "چند مورد قبل از ریسک کامل نیاز به توجه دارد.",
    waitHint: "یک مرحله ضروری ناقص است یا ریسک بالا است.",
    mindsetTitle: "۱. وضعیت ذهنی",
    mindsetSubtitle: "قبل از ورود، حالت ذهنی خودت را چک کن.",
    playbookTitle: "۲. پلی‌بوک امروز",
    playbookSubtitle: "فعلاً فقط یک سناریوی بازار را انتخاب کن.",
    checklistTitle: "۳. چک‌لیست ورود",
    checklistSubtitle: "موارد ضروری قبل از قبول سیگنال یا معامله.",
    currentRisk: "ریسک فعلی داشبورد",
    openTrades: "معامله باز",
    reviewsWaiting: "بررسی در انتظار",
    highImpactNews: "خبر پراثر",
    noHighImpactNews: "بدون خبر پراثر",
    loadingNews: "در حال بررسی ریسک خبر",
    actionsTitle: "اقدام بعدی",
    dailyJournal: "ژورنال روزانه",
    playbooks: "مدیریت پلی‌بوک",
    checklists: "مدیریت چک‌لیست",
    reviewTrades: "بررسی معاملات",
    recentPlan: "آخرین پلن",
    noRecentPlan: "هنوز پلن معامله‌ای ثبت نشده",
    reviewed: "بررسی شده",
    notReviewed: "بررسی نشده",
    mindsetItems: {
      calm: "آرام هستم و عجله ندارم.",
      noRevenge: "برای جبران ضرر وارد نمی‌شوم.",
      focused: "می‌توانم بدون حواس‌پرتی طبق پلن عمل کنم.",
      riskAccepted: "ریسک معامله را قبل از ورود پذیرفته‌ام.",
    },
    scenarios: {
      trend: {
        title: "سناریوی روندی",
        description: "فقط هم‌جهت روند اصلی و بعد از تایید وارد شو.",
      },
      range: {
        title: "سناریوی رنج",
        description: "فقط از حمایت یا مقاومت واضح معامله کن.",
      },
      news: {
        title: "ریسک خبری",
        description: "اطراف خبر مهم، ورود جدید نزن یا حجم را کم کن.",
      },
      wait: {
        title: "ستاپ واضح نیست",
        description: "تا وقتی پلن واضح نشده، بیرون بازار بمان.",
      },
    },
    checklistItems: {
      direction: "جهت بازار مشخص است.",
      entry: "نقطه ورود مشخص است.",
      stopLoss: "حد ضرر مشخص است.",
      takeProfit: "حد سود مشخص است.",
      rr: "ریسک به ریوارد مناسب است.",
      newsChecked: "ریسک خبر بررسی شده است.",
    },
  },
} as const;

const mindsetIds = ["calm", "noRevenge", "focused", "riskAccepted"] as const;
const checklistIds = ["direction", "entry", "stopLoss", "takeProfit", "rr", "newsChecked"] as const;
const scenarioIds = ["trend", "range", "news", "wait"] as const;

function percentComplete(values: Record<string, boolean>) {
  const entries = Object.values(values);
  const checked = entries.filter(Boolean).length;
  return entries.length > 0 ? Math.round((checked / entries.length) * 100) : 0;
}

function isTradeReviewed(trade: TradeDto) {
  return Boolean(trade.strategyReview && trade.strategyReview.followedPlan !== "NOT_REVIEWED");
}

export function TradeReadinessGuide({
  recentTrades,
  openTrades,
  notReviewedTrades,
  highImpactEventCount,
  eventsLoaded,
}: {
  recentTrades: TradeDto[];
  openTrades: number;
  notReviewedTrades: number;
  highImpactEventCount: number;
  eventsLoaded: boolean;
}) {
  const { language } = useLanguage();
  const text = copy[language];
  const isRtl = language === "fa";
  const [state, setState] = useState<GuideState>(defaultState);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const saved = window.localStorage.getItem(`trade-readiness-guide:${today}`);

    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Partial<GuideState>;
      setState({
        mindset: { ...defaultState.mindset, ...parsed.mindset },
        checklist: { ...defaultState.checklist, ...parsed.checklist },
        scenario: parsed.scenario || defaultState.scenario,
      });
    } catch {
      window.localStorage.removeItem(`trade-readiness-guide:${today}`);
    }
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    window.localStorage.setItem(`trade-readiness-guide:${today}`, JSON.stringify(state));
  }, [state]);

  const latestTrade = recentTrades[0];
  const mindsetScore = percentComplete(state.mindset);
  const checklistScore = percentComplete(state.checklist);
  const missingRequired = !state.checklist.entry || !state.checklist.stopLoss || !state.checklist.newsChecked;
  const scenarioScore = state.scenario === "wait" ? 35 : state.scenario === "news" ? 60 : 85;
  const newsPenalty = highImpactEventCount > 0 && state.scenario !== "news" ? 10 : 0;
  const readinessScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(mindsetScore * 0.4 + checklistScore * 0.35 + scenarioScore * 0.25 - newsPenalty)
    )
  );
  const decision = useMemo(() => {
    if (state.scenario === "wait" || missingRequired || mindsetScore < 50) {
      return "wait";
    }

    if (readinessScore >= 80 && highImpactEventCount === 0) {
      return "ready";
    }

    return "caution";
  }, [highImpactEventCount, mindsetScore, missingRequired, readinessScore, state.scenario]);

  const decisionClass =
    decision === "ready"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
      : decision === "caution"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200"
        : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200";
  const decisionIcon =
    decision === "ready" ? (
      <CheckCircle2 className="h-5 w-5" />
    ) : decision === "caution" ? (
      <AlertTriangle className="h-5 w-5" />
    ) : (
      <ShieldCheck className="h-5 w-5" />
    );
  const newsRiskLabel = !eventsLoaded
    ? text.loadingNews
    : highImpactEventCount > 0
      ? text.highImpactNews
      : text.noHighImpactNews;

  function toggleMindset(id: (typeof mindsetIds)[number]) {
    setState((current) => ({
      ...current,
      mindset: { ...current.mindset, [id]: !current.mindset[id] },
    }));
  }

  function toggleChecklist(id: (typeof checklistIds)[number]) {
    setState((current) => ({
      ...current,
      checklist: { ...current.checklist, [id]: !current.checklist[id] },
    }));
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0F172A] sm:p-5",
        isRtl && "text-right"
      )}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                  {text.title}
                </h2>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {text.subtitle}
              </p>
            </div>
            <div className={cn("rounded-xl border px-4 py-3", decisionClass)}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                {decisionIcon}
                {text.finalDecision}
              </div>
              <div className="mt-1 text-lg font-bold">
                {decision === "ready" ? text.ready : decision === "caution" ? text.caution : text.wait}
              </div>
              <div className="mt-1 text-xs">
                {decision === "ready" ? text.readyHint : decision === "caution" ? text.cautionHint : text.waitHint}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#111827]">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                  {text.mindsetTitle}
                </h3>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {text.mindsetSubtitle}
              </p>
              <div className="mt-3 space-y-2">
                {mindsetIds.map((id) => (
                  <label
                    key={id}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-700 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={state.mindset[id]}
                      onChange={() => toggleMindset(id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 accent-blue-600"
                    />
                    <span>{text.mindsetItems[id]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#111827]">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                  {text.playbookTitle}
                </h3>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {text.playbookSubtitle}
              </p>
              <div className="mt-3 grid gap-2">
                {scenarioIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={state.scenario === id}
                    onClick={() => setState((current) => ({ ...current, scenario: id }))}
                    className={cn(
                      "rounded-lg border p-3 text-left transition dark:text-slate-200",
                      isRtl && "text-right",
                      state.scenario === id
                        ? "border-blue-500 bg-blue-500/10 text-blue-800 dark:text-blue-100"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-[#0F172A] dark:hover:bg-slate-800"
                    )}
                  >
                    <span className="block text-sm font-semibold">{text.scenarios[id].title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {text.scenarios[id].description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#111827]">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                  {text.checklistTitle}
                </h3>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {text.checklistSubtitle}
              </p>
              <div className="mt-3 space-y-2">
                {checklistIds.map((id) => (
                  <label
                    key={id}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-700 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={state.checklist[id]}
                      onChange={() => toggleChecklist(id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 accent-blue-600"
                    />
                    <span>{text.checklistItems[id]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-950 dark:text-white">{text.score}</span>
              <span className="text-2xl font-bold text-slate-950 dark:text-white">{readinessScore}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-900">
              <div
                className={cn(
                  "h-full rounded-full",
                  decision === "ready" ? "bg-emerald-500" : decision === "caution" ? "bg-amber-500" : "bg-red-500"
                )}
                style={{ width: `${readinessScore}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-[#111827]">
            <div className="font-semibold text-slate-950 dark:text-white">{text.currentRisk}</div>
            <div className="mt-3 grid gap-2 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between gap-3">
                <span>{text.openTrades}</span>
                <strong>{openTrades}</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span>{text.reviewsWaiting}</span>
                <strong>{notReviewedTrades}</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span>{newsRiskLabel}</span>
                <strong>{eventsLoaded ? highImpactEventCount : "..."}</strong>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-[#111827]">
            <div className="font-semibold text-slate-950 dark:text-white">{text.recentPlan}</div>
            {latestTrade ? (
              <Link
                href={`/journal/${latestTrade.id}`}
                className="mt-3 block rounded-lg border border-slate-200 bg-white p-3 hover:bg-slate-100 dark:border-slate-800 dark:bg-[#0F172A] dark:hover:bg-slate-800"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-950 dark:text-white">
                    {latestTrade.symbol} / {latestTrade.direction}
                  </span>
                  <span
                    className={cn(
                      "rounded-lg border px-2 py-1 text-xs font-semibold",
                      isTradeReviewed(latestTrade)
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200"
                    )}
                  >
                    {isTradeReviewed(latestTrade) ? text.reviewed : text.notReviewed}
                  </span>
                </div>
                <div className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {latestTrade.strategyReview?.strategyNameSnapshot || latestTrade.setup || text.noRecentPlan}
                </div>
              </Link>
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-slate-200 p-3 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                {text.noRecentPlan}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#111827]">
            <div className="text-sm font-semibold text-slate-950 dark:text-white">{text.actionsTitle}</div>
            <div className="mt-3 grid gap-2">
              <Link className="rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500" href="/dashboard/daily-journal">
                {text.dailyJournal}
              </Link>
              {notReviewedTrades > 0 ? (
                <Link className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-white dark:border-slate-800 dark:text-slate-200 dark:hover:bg-[#0F172A]" href="/dashboard/trades?reviewStatus=not-reviewed">
                  {text.reviewTrades}
                </Link>
              ) : null}
              <div className="grid grid-cols-2 gap-2">
                <Link className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-white dark:border-slate-800 dark:text-slate-200 dark:hover:bg-[#0F172A]" href="/journal/playbooks">
                  {text.playbooks}
                </Link>
                <Link className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-white dark:border-slate-800 dark:text-slate-200 dark:hover:bg-[#0F172A]" href="/journal/checklists">
                  {text.checklists}
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
