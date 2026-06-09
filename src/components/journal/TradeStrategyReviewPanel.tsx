"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpenCheck, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RULE_SECTION_LABELS, RULE_SECTION_ORDER } from "@/components/journal/PlaybookRuleSection";
import { StrategyComplianceBadge } from "@/components/journal/StrategyComplianceBadge";
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

const followedPlanOptions: Array<{ value: FollowedPlanStatus; label: string }> = [
  { value: "NOT_REVIEWED", label: "Not Reviewed" },
  { value: "YES", label: "Yes" },
  { value: "PARTIAL", label: "Partial" },
  { value: "NO", label: "No" },
];

const ruleStatusOptions: Array<{ value: RuleReviewStatus; label: string }> = [
  { value: "NOT_REVIEWED", label: "Not Reviewed" },
  { value: "FOLLOWED", label: "Followed" },
  { value: "VIOLATED", label: "Violated" },
  { value: "NOT_APPLICABLE", label: "N/A" },
];

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
        toast.error(playbooksData.message || "Failed to load playbooks");
      } else {
        setPlaybooks(playbooksData.playbooks || []);
      }

      if (!reviewResponse.ok) {
        toast.error(reviewData.message || "Failed to load strategy review");
      } else {
        const nextReview = reviewData.review || null;
        setReview(nextReview);
        setSelectedStrategyId(nextReview?.strategyId || "");
        setFollowedPlan(nextReview?.followedPlan || "NOT_REVIEWED");
        setNotes(nextReview?.notes || "");
      }
    } catch {
      toast.error("Failed to load strategy review");
    } finally {
      setLoading(false);
    }
  }, [tradeId]);

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
      toast.error("Select a strategy playbook");
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
      toast.success("Strategy assigned");
    } catch {
      toast.error("Failed to assign strategy");
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
      toast.success("Strategy review saved");
    } catch {
      toast.error("Failed to save strategy review");
    } finally {
      setSaving(false);
    }
  }

  async function removeReview() {
    if (!review) {
      return;
    }

    const confirmed = window.confirm("Remove the strategy review from this trade?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/journal/trades/${tradeId}/strategy-review`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to remove strategy review");
        return;
      }

      setReview(null);
      setSelectedStrategyId("");
      setFollowedPlan("NOT_REVIEWED");
      setNotes("");
      toast.success("Strategy review removed");
    } catch {
      toast.error("Failed to remove strategy review");
    }
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Strategy / Playbook Review</h2>
          <p className="mt-1 text-sm text-slate-400">
            Assign a strategy, review snapshotted rules, and track plan compliance.
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
          Loading strategy review...
        </div>
      ) : null}

      {!loading ? (
        <div className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto_auto]">
            <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
              Strategy
              <select
                value={selectedStrategyId}
                onChange={(event) => setSelectedStrategyId(event.target.value)}
                className={inputClass}
                disabled={activePlaybooks.length === 0}
              >
                <option value="">
                  {activePlaybooks.length === 0 ? "No playbooks available" : "Select strategy"}
                </option>
                {activePlaybooks.map((playbook) => (
                  <option key={playbook.id} value={playbook.id}>
                    {playbook.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
              Followed Plan
              <select
                value={followedPlan}
                onChange={(event) => setFollowedPlan(event.target.value as FollowedPlanStatus)}
                className={inputClass}
              >
                {followedPlanOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
              {review ? "Reload Snapshot" : "Assign"}
            </button>
            <button
              type="button"
              onClick={saveReview}
              disabled={saving || !review}
              className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving" : "Save"}
            </button>
          </div>

          {activePlaybooks.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-[#111827] px-4 py-8 text-center">
              <BookOpenCheck className="mx-auto h-8 w-8 text-slate-500" />
              <h3 className="mt-3 text-base font-semibold text-white">No playbooks available</h3>
              <p className="mt-1 text-sm text-slate-400">
                Create a strategy playbook before assigning one to this trade.
              </p>
            </div>
          ) : null}

          {review ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-slate-800 bg-[#111827] p-3">
                  <div className="text-xs font-medium uppercase text-slate-400">Strategy Snapshot</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {review.strategyNameSnapshot || "Strategy"}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#111827] p-3">
                  <div className="text-xs font-medium uppercase text-slate-400">Rules Followed</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {review.followedRules}/{review.totalRules}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#111827] p-3">
                  <div className="text-xs font-medium uppercase text-slate-400">Required Followed</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {review.requiredFollowedRules}/{review.requiredRules}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#111827] p-3">
                  <div className="text-xs font-medium uppercase text-slate-400">Required Compliance</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {Math.round(review.requiredCompliancePercent)}%
                  </div>
                </div>
              </div>

              <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
                Strategy Review Notes
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
                      <h3 className="text-sm font-semibold text-white">{RULE_SECTION_LABELS[section]}</h3>
                      <div className="mt-3 space-y-3">
                        {rules.map((rule) => (
                          <div key={rule.id} className="rounded-lg border border-slate-800 bg-[#0F172A] p-3">
                            <div className="grid gap-3 lg:grid-cols-[1fr_180px]">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="text-sm font-semibold text-white">{rule.ruleTitleSnapshot}</div>
                                  {rule.isRequiredSnapshot ? (
                                    <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
                                      Required
                                    </span>
                                  ) : null}
                                  <span className={cn("rounded-md border px-2 py-0.5 text-xs font-semibold", statusTone(rule.status))}>
                                    {rule.status.replace("_", " ")}
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
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <textarea
                              value={rule.note || ""}
                              onChange={(event) => updateRuleReview(rule.id, { note: event.target.value })}
                              placeholder="Optional rule note"
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
                  Remove Review
                </button>
                <button
                  type="button"
                  onClick={saveReview}
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving" : "Save Review"}
                </button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
