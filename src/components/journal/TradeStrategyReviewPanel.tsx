"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpenCheck, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  FollowedPlanStatus,
  PlaybookStrategyDto,
  TradeStrategyReviewDto,
} from "@/types/playbooks";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600";
const textareaClass =
  "w-full rounded-lg border border-slate-800 bg-[#0F172A] px-3 py-2 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600";

function followedPlanLabel(status: FollowedPlanStatus | null | undefined) {
  if (status === "YES") return "Yes";
  if (status === "PARTIAL") return "Partially";
  if (status === "NO") return "No";
  return "Not Reviewed";
}

function followedPlanTone(status: FollowedPlanStatus | null | undefined) {
  if (status === "YES") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (status === "PARTIAL") return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  if (status === "NO") return "border-red-500/30 bg-red-500/10 text-red-300";
  return "border-slate-700 bg-slate-900 text-slate-300";
}

function statusFromPercent(percent: number): FollowedPlanStatus {
  if (percent >= 80) return "YES";
  if (percent >= 50) return "PARTIAL";
  return "NO";
}

export function TradeStrategyReviewPanel({ tradeId }: { tradeId: string }) {
  const [playbooks, setPlaybooks] = useState<PlaybookStrategyDto[]>([]);
  const [review, setReview] = useState<TradeStrategyReviewDto | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activePlaybooks = useMemo(
    () => playbooks.filter((playbook) => playbook.isActive || playbook.id === review?.strategyId),
    [playbooks, review?.strategyId]
  );

  const checkedCount = review?.ruleReviews.filter((item) => item.status === "FOLLOWED").length || 0;
  const totalCount = review?.ruleReviews.length || 0;
  const compliance = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
  const followedPlan = totalCount > 0 ? statusFromPercent(compliance) : "NOT_REVIEWED";

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
        toast.error(reviewData.message || "Failed to load trade review");
      } else {
        const nextReview = reviewData.review || null;
        setReview(nextReview);
        setSelectedStrategyId(nextReview?.strategyId || "");
        setNotes(nextReview?.notes || "");
      }
    } catch {
      toast.error("Failed to load trade review");
    } finally {
      setLoading(false);
    }
  }, [tradeId]);

  useEffect(() => {
    void loadPanel();
  }, [loadPanel]);

  async function loadPlaybookChecklist(strategyId: string) {
    setSelectedStrategyId(strategyId);

    if (!strategyId) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/journal/trades/${tradeId}/strategy-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategyId,
          followedPlan: "NO",
          notes,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(Array.isArray(data.errors) ? data.errors.join(", ") : data.message);
        return;
      }

      setReview(data.review);
      setNotes(data.review.notes || "");
      toast.success("Playbook checklist loaded");
    } catch {
      toast.error("Failed to load playbook checklist");
    } finally {
      setSaving(false);
    }
  }

  function updateChecklistItem(id: string, checked: boolean) {
    setReview((current) =>
      current
        ? {
            ...current,
            ruleReviews: current.ruleReviews.map((item) =>
              item.id === id ? { ...item, status: checked ? "FOLLOWED" : "VIOLATED" } : item
            ),
          }
        : current
    );
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
          notes,
          followedPlan,
          checklistItems: review.ruleReviews.map((item) => ({
            id: item.id,
            checked: item.status === "FOLLOWED",
            note: item.note,
          })),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(Array.isArray(data.errors) ? data.errors.join(", ") : data.message);
        return;
      }

      setReview(data.review);
      toast.success("Trade review saved");
    } catch {
      toast.error("Failed to save trade review");
    } finally {
      setSaving(false);
    }
  }

  async function removeReview() {
    if (!review) {
      return;
    }

    const confirmed = window.confirm("Remove this trade review?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/journal/trades/${tradeId}/strategy-review`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to remove trade review");
        return;
      }

      setReview(null);
      setSelectedStrategyId("");
      setNotes("");
      toast.success("Trade review removed");
    } catch {
      toast.error("Failed to remove trade review");
    }
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Trade Review</h2>
          <p className="mt-1 text-sm text-slate-400">
            Select the playbook used for this trade, check the plan items, and let the system calculate compliance.
          </p>
        </div>
        {review ? (
          <div className="grid gap-2 text-right text-sm">
            <div className="font-semibold text-white">Plan Compliance: {Math.round(compliance)}%</div>
            <div>
              <span className={cn("inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold", followedPlanTone(followedPlan))}>
                Followed Plan: {followedPlanLabel(followedPlan)}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-800 bg-[#111827] p-4 text-sm text-slate-400">
          Loading review...
        </div>
      ) : null}

      {!loading ? (
        <div className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
              Playbook
              <select
                value={selectedStrategyId}
                onChange={(event) => loadPlaybookChecklist(event.target.value)}
                className={inputClass}
                disabled={saving || activePlaybooks.length === 0}
              >
                <option value="">
                  {activePlaybooks.length === 0 ? "No playbooks available" : "Select a playbook"}
                </option>
                {activePlaybooks.map((playbook) => (
                  <option key={playbook.id} value={playbook.id}>
                    {playbook.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={saveReview}
              disabled={saving || !review}
              className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Review"}
            </button>
          </div>

          {activePlaybooks.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-[#111827] px-4 py-8 text-center">
              <BookOpenCheck className="mx-auto h-8 w-8 text-slate-500" />
              <h3 className="mt-3 text-base font-semibold text-white">No playbooks available</h3>
              <p className="mt-1 text-sm text-slate-400">
                Create a playbook first, then return to review this trade.
              </p>
            </div>
          ) : null}

          {review ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-800 bg-[#111827] p-3">
                  <div className="text-xs font-medium uppercase text-slate-400">Playbook</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {review.strategyNameSnapshot || "Selected playbook"}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#111827] p-3">
                  <div className="text-xs font-medium uppercase text-slate-400">Checklist</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {checkedCount}/{totalCount} checked
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#111827] p-3">
                  <div className="text-xs font-medium uppercase text-slate-400">Followed Plan</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {followedPlanLabel(followedPlan)}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#111827] p-4">
                <h3 className="text-sm font-semibold text-white">Plan Review</h3>
                <div className="mt-3 space-y-2">
                  {review.ruleReviews.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 rounded-lg border border-slate-800 bg-[#0F172A] p-3 text-sm text-slate-200"
                    >
                      <input
                        type="checkbox"
                        checked={item.status === "FOLLOWED"}
                        onChange={(event) => updateChecklistItem(item.id, event.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-[#111827] accent-blue-600"
                      />
                      <span>
                        <span className="block font-semibold text-white">{item.ruleTitleSnapshot}</span>
                        {item.ruleDescriptionSnapshot ? (
                          <span className="mt-1 block text-xs text-slate-400">{item.ruleDescriptionSnapshot}</span>
                        ) : null}
                      </span>
                    </label>
                  ))}
                  {review.ruleReviews.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-800 bg-[#0F172A] p-4 text-sm text-slate-400">
                      This playbook has no checklist items yet.
                    </div>
                  ) : null}
                </div>
              </div>

              <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
                Review Notes
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  className={textareaClass}
                />
              </label>

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
                  {saving ? "Saving..." : "Save Review"}
                </button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
