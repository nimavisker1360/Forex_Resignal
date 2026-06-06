"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_DASHBOARD_USER_ID } from "@/components/dashboard/types";

export function PsychologyReviewCard({
  tradeId,
  setup,
  emotion,
  mistake,
  notes,
  userId = DEFAULT_DASHBOARD_USER_ID,
}: {
  tradeId: string;
  setup?: string | null;
  emotion?: string | null;
  mistake?: string | null;
  notes?: string | null;
  userId?: string;
}) {
  const router = useRouter();
  const [confidence, setConfidence] = useState(70);

  async function saveReview(formData: FormData) {
    await fetch(`/api/trades/${tradeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        setup: String(formData.get("entryReason") || ""),
        emotion: String(formData.get("emotionBefore") || ""),
        mistake: String(formData.get("mistakeTag") || ""),
        notes: String(formData.get("personalNote") || ""),
      }),
    });
    router.refresh();
  }

  return (
    <form
      action={saveReview}
      className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm"
    >
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Psychology Review</h3>
          <p className="text-sm text-slate-400">Structured review fields for later AI reports.</p>
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Save Review
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="space-y-2 text-xs font-medium uppercase text-slate-400">
          Confidence
          <div className="rounded-xl border border-slate-800 bg-[#111827] p-3">
            <div className="mb-2 flex justify-between text-sm normal-case text-slate-300">
              <span>Execution confidence</span>
              <span>{confidence}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={confidence}
              onChange={(event) => setConfidence(Number(event.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </label>

        {[
          ["followedPlan", "Followed Plan", ["Yes", "Partial", "No"]],
          ["emotionBefore", "Emotion Before", ["Focused", "Calm", "Anxious", "Impatient"]],
          ["emotionAfter", "Emotion After", ["Calm", "Satisfied", "Frustrated", "Neutral"]],
          ["mistakeTag", "Mistake Tag", ["", "Late entry", "Early exit", "Moved stop", "Over-risked"]],
        ].map(([name, label, options]) => (
          <label key={String(name)} className="space-y-1 text-xs font-medium uppercase text-slate-400">
            {String(label)}
            <select
              name={String(name)}
              defaultValue={
                name === "emotionBefore"
                  ? emotion || ""
                  : name === "mistakeTag"
                    ? mistake || ""
                    : ""
              }
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            >
              {(options as string[]).map((option) => (
                <option key={option || "none"} value={option}>
                  {option || "None"}
                </option>
              ))}
            </select>
          </label>
        ))}

        {[
          ["entryReason", "Entry Reason", setup],
          ["personalNote", "Personal Note", notes],
          ["lessonLearned", "Lesson Learned", ""],
        ].map(([name, label, value]) => (
          <label key={String(name)} className="space-y-1 text-xs font-medium uppercase text-slate-400 lg:col-span-1">
            {String(label)}
            <textarea
              name={String(name)}
              defaultValue={String(value || "")}
              rows={4}
              className="w-full rounded-xl border border-slate-800 bg-[#111827] px-3 py-2 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            />
          </label>
        ))}
      </div>
    </form>
  );
}
