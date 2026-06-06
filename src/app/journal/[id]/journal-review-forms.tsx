"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Psychology } from "@/lib/journal/types";

const EMOTIONS_BEFORE = [
  "Normal",
  "Fear",
  "Greed",
  "FOMO",
  "Revenge Trade",
  "Overconfident",
  "Hesitant",
];
const EMOTIONS_AFTER = [
  "Calm",
  "Regret",
  "Angry",
  "Happy",
  "Disappointed",
  "Neutral",
];
const MISTAKES = [
  "No Mistake",
  "Entered Early",
  "Entered Late",
  "No Confirmation",
  "Moved SL",
  "Closed Early",
  "Over Lot",
  "Revenge Trade",
];

function followedPlanToValue(value: Psychology["followedPlan"] | undefined) {
  if (value === true) {
    return "yes";
  }

  if (value === false) {
    return "no";
  }

  if (value === "partially") {
    return "partially";
  }

  return "";
}

function followedPlanFromValue(value: string) {
  if (value === "yes") {
    return true;
  }

  if (value === "no") {
    return false;
  }

  if (value === "partially") {
    return "partially";
  }

  return null;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="space-y-1 text-xs font-medium uppercase text-slate-400">{children}</label>;
}

export function JournalReviewForms({
  tradeId,
  psychology,
  tags,
}: {
  tradeId: string;
  psychology: Psychology | null;
  tags: string[];
}) {
  const router = useRouter();
  const [confidenceScore, setConfidenceScore] = useState(
    psychology?.confidenceScore ?? 5
  );
  const [savingPsychology, setSavingPsychology] = useState(false);
  const [savingTags, setSavingTags] = useState(false);
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [message, setMessage] = useState("");
  const initialTags = useMemo(() => tags.join(", "), [tags]);

  async function submitPsychology(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPsychology(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      confidenceScore,
      emotionBefore: String(formData.get("emotionBefore") || "") || null,
      emotionAfter: String(formData.get("emotionAfter") || "") || null,
      followedPlan: followedPlanFromValue(String(formData.get("followedPlan") || "")),
      mistakeTag: String(formData.get("mistakeTag") || "") || null,
      entryReason: String(formData.get("entryReason") || "") || null,
      personalNote: String(formData.get("personalNote") || "") || null,
      lessonLearned: String(formData.get("lessonLearned") || "") || null,
    };
    const response = await fetch(`/api/journal/trades/${tradeId}/psychology`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setMessage("Psychology review saved.");
      startRefreshTransition(() => {
        router.refresh();
      });
    } else {
      setMessage("Failed to save psychology review.");
    }

    setSavingPsychology(false);
  }

  async function submitTags(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingTags(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const tagsValue = String(formData.get("tags") || "");
    const payload = {
      tags: tagsValue
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };
    const response = await fetch(`/api/journal/trades/${tradeId}/tags`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSavingTags(false);
    setMessage(response.ok ? "Tags saved." : "Failed to save tags.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submitPsychology} className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Psychology Review</h2>
          <button
            type="submit"
            disabled={savingPsychology || isRefreshing}
            className="h-10 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {savingPsychology || isRefreshing ? "Saving" : "Save Review"}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FieldLabel>
            Confidence Score: {confidenceScore}
            <input
              type="range"
              min="1"
              max="10"
              value={confidenceScore}
              onChange={(event) => setConfidenceScore(Number(event.target.value))}
              className="block h-10 w-full accent-blue-600"
            />
          </FieldLabel>
          <FieldLabel>
            Followed Plan
            <select
              name="followedPlan"
              defaultValue={followedPlanToValue(psychology?.followedPlan)}
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="partially">Partially</option>
            </select>
          </FieldLabel>
          <FieldLabel>
            Emotion Before
            <select
              name="emotionBefore"
              defaultValue={psychology?.emotionBefore || ""}
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            >
              <option value="">Select</option>
              {EMOTIONS_BEFORE.map((emotion) => (
                <option key={emotion} value={emotion}>
                  {emotion}
                </option>
              ))}
            </select>
          </FieldLabel>
          <FieldLabel>
            Emotion After
            <select
              name="emotionAfter"
              defaultValue={psychology?.emotionAfter || ""}
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            >
              <option value="">Select</option>
              {EMOTIONS_AFTER.map((emotion) => (
                <option key={emotion} value={emotion}>
                  {emotion}
                </option>
              ))}
            </select>
          </FieldLabel>
          <FieldLabel>
            Mistake Tag
            <select
              name="mistakeTag"
              defaultValue={psychology?.mistakeTag || ""}
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            >
              <option value="">Select</option>
              {MISTAKES.map((mistake) => (
                <option key={mistake} value={mistake}>
                  {mistake}
                </option>
              ))}
            </select>
          </FieldLabel>
        </div>

        <div className="mt-4 grid gap-4">
          <FieldLabel>
            Entry Reason
            <textarea
              name="entryReason"
              defaultValue={psychology?.entryReason || ""}
              rows={3}
              className="w-full rounded-xl border border-slate-800 bg-[#111827] px-3 py-2 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            />
          </FieldLabel>
          <FieldLabel>
            Personal Note
            <textarea
              name="personalNote"
              defaultValue={psychology?.personalNote || ""}
              rows={3}
              className="w-full rounded-xl border border-slate-800 bg-[#111827] px-3 py-2 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            />
          </FieldLabel>
          <FieldLabel>
            Lesson Learned
            <textarea
              name="lessonLearned"
              defaultValue={psychology?.lessonLearned || ""}
              rows={3}
              className="w-full rounded-xl border border-slate-800 bg-[#111827] px-3 py-2 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            />
          </FieldLabel>
        </div>
      </form>

      <form onSubmit={submitTags} className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Tags</h2>
          <button
            type="submit"
            disabled={savingTags}
            className="h-10 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {savingTags ? "Saving" : "Save Tags"}
          </button>
        </div>
        <input
          name="tags"
          defaultValue={initialTags}
          placeholder="breakout, london, clean setup"
          className="h-11 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm text-[#E5E7EB] outline-none focus:border-blue-600"
        />
      </form>

      {message && <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">{message}</div>}
    </div>
  );
}
