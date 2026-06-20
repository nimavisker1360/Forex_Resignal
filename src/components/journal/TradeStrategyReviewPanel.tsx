"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpenCheck, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RULE_SECTION_LABELS, RULE_SECTION_ORDER } from "@/components/journal/PlaybookRuleSection";
import { StrategyComplianceBadge } from "@/components/journal/StrategyComplianceBadge";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import type {
  FollowedPlanStatus,
  PlaybookStrategyDto,
  RuleReviewStatus,
  TradeStrategyReviewDto,
} from "@/types/playbooks";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600";
const textareaClass =
  "w-full rounded-lg border border-slate-800 bg-[#0F172A] px-3 py-2 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600";

const followedPlanOptions: FollowedPlanStatus[] = ["NOT_REVIEWED", "YES", "PARTIAL", "NO"];

const ruleStatusOptions: RuleReviewStatus[] = ["NOT_REVIEWED", "FOLLOWED", "VIOLATED", "NOT_APPLICABLE"];

function statusTone(status: RuleReviewStatus) {
  if (status === "FOLLOWED") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "VIOLATED") {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  if (status === "NOT_APPLICABLE") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }

  return "border-slate-700 bg-slate-900 text-slate-300";
}

export function TradeStrategyReviewPanel({ tradeId }: { tradeId: string }) {
  const { t } = useLanguage();
  const [playbooks, setPlaybooks] = useState<PlaybookStrategyDto[]>([]);
  const [review, setReview] = useState<TradeStrategyReviewDto | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState("");
  const [followedPlan, setFollowedPlan] = useState<FollowedPlanStatus>("NOT_REVIEWED");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activePlaybooks = useMemo(
    () => playbooks.filter((playbook) => playbook.isActive || playbook.id === review?.strategyId),
    [playbooks, review?.strategyId]
  );
  const loadPlaybooksFailedText = t("journal.strategyReview.loadPlaybooksFailed");
  const loadReviewFailedText = t("journal.strategyReview.loadReviewFailed");
  const followedPlanLabel = (status: FollowedPlanStatus | null | undefined) => {
    if (status === "YES") return t("journal.strategyReview.yes");
    if (status === "PARTIAL") return t("journal.strategyReview.partial");
    if (status === "NO") return t("journal.strategyReview.no");
    return t("journal.strategyReview.notReviewed");
  };
  const ruleStatusLabel = (status: RuleReviewStatus) => {
    if (status === "FOLLOWED") return t("journal.strategyReview.followed");
    if (status === "VIOLATED") return t("journal.strategyReview.violated");
    if (status === "NOT_APPLICABLE") return t("journal.strategyReview.notApplicable");
    return t("journal.strategyReview.notReviewed");
  };
  const ruleSectionLabel = (section: string) => {
    if (section === "SETUP") return t("journal.playbooks.setupRules");
    if (section === "ENTRY") return t("journal.playbooks.entryRules");
    if (section === "MANAGEMENT") return t("journal.playbooks.managementRules");
    if (section === "EXIT") return t("journal.playbooks.exitRules");
    return RULE_SECTION_LABELS[section as keyof typeof RULE_SECTION_LABELS] || section;
  };

  const loadPanel = useCallback(async () => {
    setLoading(true);

    try {
      const [playbooksResponse, reviewResponse] = await Promise.all([
        fetch("/api/journal/playbooks?active=true"),
        fetch(`/api/journal/trades/${tradeId}/strategy-review`),
      ]);
      const [playbooksData, reviewData] = await Promise.all([
        playbooksResponse.json(),
        reviewResponse.json(),
      ]);

      if (!playbooksResponse.ok) {
        toast.error(playbooksData.message || loadPlaybooksFailedText);
      } else {
        setPlaybooks(playbooksData.playbooks || []);
      }

      if (!reviewResponse.ok) {
        toast.error(reviewData.message || loadReviewFailedText);
      } else {
        const nextReview = reviewData.review || null;
        setReview(nextReview);
        setSelectedStrategyId(nextReview?.strategyId || "");
        setFollowedPlan(nextReview?.followedPlan || "NOT_REVIEWED");
        setNotes(nextReview?.notes || "");
      }
    } catch {
      toast.error(loadReviewFailedText);
    } finally {
      setLoading(false);
    }
  }, [loadPlaybooksFailedText, loadReviewFailedText, tradeId]);

  useEffect(() => {
    void loadPanel();
  }, [loadPanel]);

  function updateRuleReview(
    id: string,
    patch: Partial<TradeStrategyReviewDto["ruleReviews"][number]>
  ) {
    setReview((current) =>
      current
        ? {
            ...current,
            ruleReviews: current.ruleReviews.map((rule) =>
              rule.id === id ? { ...rule, ...patch } : rule
            ),
          }
        : current
    );
  }

  async function assignStrategy() {
    if (!selectedStrategyId) {
      toast.error(t("journal.strategyReview.selectPlaybook"));
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/journal/trades/${tradeId}/strategy-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          followedPlan,
          notes,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(Array.isArray(data.errors) ? data.errors.join(", ") : data.message);
        return;
      }

      setReview(data.review);
      setFollowedPlan(data.review.followedPlan);
      setNotes(data.review.notes || "");
      toast.success(t("journal.strategyReview.assigned"));
    } catch {
      toast.error(t("journal.strategyReview.assignFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function saveReview() {
    if (!review) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/journal/trades/${tradeId}/strategy-review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followedPlan,
          notes,
          ruleReviews: review.ruleReviews.map((rule) => ({
            id: rule.id,
            status: rule.status,
            note: rule.note,
          })),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(Array.isArray(data.errors) ? data.errors.join(", ") : data.message);
        return;
      }

      setReview(data.review);
      toast.success(t("journal.strategyReview.saved"));
    } catch {
      toast.error(t("journal.strategyReview.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function removeReview() {
    if (!review) {
      return;
    }

    const confirmed = window.confirm(t("journal.strategyReview.confirmRemove"));

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/journal/trades/${tradeId}/strategy-review`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || t("journal.strategyReview.removeFailed"));
        return;
      }

      setReview(null);
      setSelectedStrategyId("");
      setFollowedPlan("NOT_REVIEWED");
      setNotes("");
      toast.success(t("journal.strategyReview.removed"));
    } catch {
      toast.error(t("journal.strategyReview.removeFailed"));
    }
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{t("journal.strategyReview.title")}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {t("journal.strategyReview.subtitle")}
          </p>
        </div>
        {review ? (
          <StrategyComplianceBadge
            percent={review.compliancePercent}
            violatedRules={review.violatedRules}
            reviewed={review.followedPlan !== "NOT_REVIEWED"}
          />
        ) : null}
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-800 bg-[#111827] p-4 text-sm text-slate-400">
          {t("journal.strategyReview.loading")}
        </div>
      ) : null}

      {!loading ? (
        <div className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto_auto]">
            <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
              {t("journal.tradeDetail.strategy")}
              <select
                value={selectedStrategyId}
                onChange={(event) => setSelectedStrategyId(event.target.value)}
                className={inputClass}
                disabled={activePlaybooks.length === 0}
              >
                <option value="">
                  {activePlaybooks.length === 0 ? t("journal.strategyReview.noPlaybooksAvailable") : t("journal.strategyReview.selectStrategy")}
                </option>
                {activePlaybooks.map((playbook) => (
                  <option key={playbook.id} value={playbook.id}>
                    {playbook.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
              {t("journal.strategyReview.followedPlan")}
              <select
                value={followedPlan}
                onChange={(event) => setFollowedPlan(event.target.value as FollowedPlanStatus)}
                className={inputClass}
              >
                {followedPlanOptions.map((option) => (
                  <option key={option} value={option}>
                    {followedPlanLabel(option)}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={assignStrategy}
              disabled={saving || !selectedStrategyId}
              className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg border border-slate-800 px-4 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {review ? t("journal.strategyReview.reloadSnapshot") : t("journal.strategyReview.assign")}
            </button>
            <button
              type="button"
              onClick={saveReview}
              disabled={saving || !review}
              className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? t("journal.tradeDetail.saving") : t("journal.tradeDetail.save")}
            </button>
          </div>

          {activePlaybooks.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-[#111827] px-4 py-8 text-center">
              <BookOpenCheck className="mx-auto h-8 w-8 text-slate-500" />
              <h3 className="mt-3 text-base font-semibold text-white">{t("journal.strategyReview.noPlaybooksAvailable")}</h3>
              <p className="mt-1 text-sm text-slate-400">
                {t("journal.strategyReview.emptyDescription")}
              </p>
            </div>
          ) : null}

          {review ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-slate-800 bg-[#111827] p-3">
                  <div className="text-xs font-medium uppercase text-slate-400">{t("journal.strategyReview.strategySnapshot")}</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {review.strategyNameSnapshot || t("journal.tradeDetail.strategy")}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#111827] p-3">
                  <div className="text-xs font-medium uppercase text-slate-400">{t("journal.strategyReview.rulesFollowed")}</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {review.followedRules}/{review.totalRules}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#111827] p-3">
                  <div className="text-xs font-medium uppercase text-slate-400">{t("journal.strategyReview.requiredFollowed")}</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {review.requiredFollowedRules}/{review.requiredRules}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#111827] p-3">
                  <div className="text-xs font-medium uppercase text-slate-400">{t("journal.strategyReview.requiredCompliance")}</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {Math.round(review.requiredCompliancePercent)}%
                  </div>
                </div>
              </div>

              <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
                {t("journal.strategyReview.notes")}
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  className={textareaClass}
                />
              </label>

              <div className="space-y-4">
                {RULE_SECTION_ORDER.map((section) => {
                  const rules = review.ruleReviews.filter(
                    (rule) => rule.ruleSectionSnapshot === section
                  );

                  if (rules.length === 0) {
                    return null;
                  }

                  return (
                    <div key={section} className="rounded-lg border border-slate-800 bg-[#111827] p-4">
                      <h3 className="text-sm font-semibold text-white">{ruleSectionLabel(section)}</h3>
                      <div className="mt-3 space-y-3">
                        {rules.map((rule) => (
                          <div key={rule.id} className="rounded-lg border border-slate-800 bg-[#0F172A] p-3">
                            <div className="grid gap-3 lg:grid-cols-[1fr_180px]">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="text-sm font-semibold text-white">{rule.ruleTitleSnapshot}</div>
                                  {rule.isRequiredSnapshot ? (
                                    <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
                                      {t("journal.checklistPanel.required")}
                                    </span>
                                  ) : null}
                                  <span className={cn("rounded-md border px-2 py-0.5 text-xs font-semibold", statusTone(rule.status))}>
                                    {ruleStatusLabel(rule.status)}
                                  </span>
                                </div>
                                {rule.ruleDescriptionSnapshot ? (
                                  <p className="mt-1 text-sm text-slate-400">{rule.ruleDescriptionSnapshot}</p>
                                ) : null}
                              </div>
                              <select
                                value={rule.status}
                                onChange={(event) =>
                                  updateRuleReview(rule.id, {
                                    status: event.target.value as RuleReviewStatus,
                                  })
                                }
                                className={inputClass}
                              >
                                {ruleStatusOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {ruleStatusLabel(option)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <textarea
                              value={rule.note || ""}
                              onChange={(event) => updateRuleReview(rule.id, { note: event.target.value })}
                              placeholder={t("journal.strategyReview.optionalRuleNote")}
                              rows={2}
                              className={cn(textareaClass, "mt-3")}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between gap-2">
                <button
                  type="button"
                  onClick={removeReview}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-500/30 px-4 text-sm font-semibold text-[#EF4444] hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("journal.strategyReview.removeReview")}
                </button>
                <button
                  type="button"
                  onClick={saveReview}
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? t("journal.tradeDetail.saving") : t("journal.strategyReview.saveReview")}
                </button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
