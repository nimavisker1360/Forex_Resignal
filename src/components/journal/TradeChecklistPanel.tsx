"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, ListChecks, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ChecklistTemplate = {
  id: string;
  title: string;
  category: string | null;
  isActive: boolean;
  itemCount: number;
};

type TradeChecklistAnswer = {
  id: string;
  titleSnapshot: string;
  descriptionSnapshot: string | null;
  isRequiredSnapshot: boolean;
  checked: boolean;
  note: string | null;
  sortOrder: number;
};

type TradeChecklist = {
  id: string;
  checklistTemplateId: string | null;
  titleSnapshot: string;
  categorySnapshot: string | null;
  completedCount: number;
  totalCount: number;
  requiredCompletedCount: number;
  requiredTotalCount: number;
  completionPercent: number;
  requiredIncompleteCount: number;
  answers: TradeChecklistAnswer[];
};

type TradeChecklistPanelProps = {
  tradeId: string;
};

const inputClass =
  "h-10 w-full rounded-lg border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600";
const textareaClass =
  "w-full rounded-lg border border-slate-800 bg-[#0F172A] px-3 py-2 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600";

function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "green" | "amber" | "blue";
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : tone === "amber"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
        : tone === "blue"
          ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
          : "border-slate-700 bg-slate-900 text-slate-300";

  return (
    <span className={cn("inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold", toneClass)}>
      {children}
    </span>
  );
}

function progressTone(percent: number) {
  if (percent >= 80) {
    return "bg-emerald-500";
  }

  if (percent >= 50) {
    return "bg-blue-500";
  }

  return "bg-amber-500";
}

export function TradeChecklistPanel({ tradeId }: TradeChecklistPanelProps) {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [checklists, setChecklists] = useState<TradeChecklist[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const attachedTemplateIds = useMemo(
    () =>
      new Set(
        checklists
          .map((checklist) => checklist.checklistTemplateId)
          .filter((id): id is string => Boolean(id))
      ),
    [checklists]
  );
  const availableTemplates = templates.filter(
    (template) => !attachedTemplateIds.has(template.id)
  );

  const loadPanelData = useCallback(async () => {
    setLoading(true);

    try {
      const [templatesResponse, tradeChecklistsResponse] = await Promise.all([
        fetch("/api/journal/checklists"),
        fetch(`/api/journal/trades/${tradeId}/checklists`),
      ]);
      const [templatesData, tradeChecklistsData] = await Promise.all([
        templatesResponse.json(),
        tradeChecklistsResponse.json(),
      ]);

      if (!templatesResponse.ok) {
        toast.error(templatesData.message || "Failed to load checklist templates");
      } else {
        setTemplates(templatesData.checklists || []);
      }

      if (!tradeChecklistsResponse.ok) {
        toast.error(tradeChecklistsData.message || "Failed to load trade checklists");
      } else {
        setChecklists(tradeChecklistsData.checklists || []);
      }
    } catch {
      toast.error("Failed to load checklists");
    } finally {
      setLoading(false);
    }
  }, [tradeId]);

  useEffect(() => {
    void loadPanelData();
  }, [loadPanelData]);

  async function addChecklist() {
    if (!selectedTemplateId) {
      toast.error("Select a checklist template");
      return;
    }

    setAdding(true);

    try {
      const response = await fetch(`/api/journal/trades/${tradeId}/checklists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklistTemplateId: selectedTemplateId }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to add checklist");
        return;
      }

      setChecklists((current) => [...current, data.checklist]);
      setSelectedTemplateId("");
      toast.success("Checklist added");
    } catch {
      toast.error("Failed to add checklist");
    } finally {
      setAdding(false);
    }
  }

  function updateAnswer(
    checklistId: string,
    answerId: string,
    patch: Partial<TradeChecklistAnswer>
  ) {
    setChecklists((current) =>
      current.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              answers: checklist.answers.map((answer) =>
                answer.id === answerId ? { ...answer, ...patch } : answer
              ),
            }
          : checklist
      )
    );
  }

  async function saveChecklist(checklist: TradeChecklist) {
    setSavingId(checklist.id);

    try {
      const response = await fetch(
        `/api/journal/trades/${tradeId}/checklists/${checklist.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: checklist.answers.map((answer) => ({
              id: answer.id,
              checked: answer.checked,
              note: answer.note,
            })),
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to save checklist");
        return;
      }

      setChecklists((current) =>
        current.map((item) => (item.id === checklist.id ? data.checklist : item))
      );
      toast.success("Checklist saved");
    } catch {
      toast.error("Failed to save checklist");
    } finally {
      setSavingId(null);
    }
  }

  async function removeChecklist(checklist: TradeChecklist) {
    const confirmed = window.confirm(`Remove "${checklist.titleSnapshot}" from this trade?`);

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/journal/trades/${tradeId}/checklists/${checklist.id}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to remove checklist");
        return;
      }

      setChecklists((current) =>
        current.filter((item) => item.id !== checklist.id)
      );
      toast.success("Checklist removed");
    } catch {
      toast.error("Failed to remove checklist");
    }
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Checklists</h2>
          <p className="mt-1 text-sm text-slate-400">
            Snapshot reusable templates into this trade and track execution quality.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={selectedTemplateId}
            onChange={(event) => setSelectedTemplateId(event.target.value)}
            className={cn(inputClass, "min-w-[240px]")}
            disabled={loading || availableTemplates.length === 0}
          >
            <option value="">
              {availableTemplates.length === 0
                ? "No templates available"
                : "Select checklist"}
            </option>
            {availableTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.title}
                {template.category ? ` / ${template.category}` : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addChecklist}
            disabled={adding || !selectedTemplateId}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {adding ? "Adding" : "Add Checklist"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-800 bg-[#111827] p-4 text-sm text-slate-400">
          Loading checklists...
        </div>
      ) : null}

      {!loading && checklists.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-[#111827] px-4 py-10 text-center">
          <ListChecks className="mx-auto h-8 w-8 text-slate-500" />
          <h3 className="mt-3 text-base font-semibold text-white">No checklist on this trade</h3>
          <p className="mt-1 text-sm text-slate-400">
            Add a template to record execution checks for this journal entry.
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        {checklists.map((checklist) => (
          <article
            key={checklist.id}
            className="rounded-lg border border-slate-800 bg-[#111827] p-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-white">
                    {checklist.titleSnapshot}
                  </h3>
                  <Badge>{checklist.categorySnapshot || "Custom"}</Badge>
                  {checklist.requiredIncompleteCount > 0 ? (
                    <Badge tone="amber">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Required missing
                    </Badge>
                  ) : checklist.requiredTotalCount > 0 ? (
                    <Badge tone="green">
                      <Check className="mr-1 h-3 w-3" />
                      Required complete
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="blue">
                    {checklist.completedCount}/{checklist.totalCount} completed
                  </Badge>
                  <Badge>
                    Required {checklist.requiredCompletedCount}/
                    {checklist.requiredTotalCount}
                  </Badge>
                  <Badge>{Math.round(checklist.completionPercent)}%</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => saveChecklist(checklist)}
                  disabled={savingId === checklist.id}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {savingId === checklist.id ? "Saving" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => removeChecklist(checklist)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 text-[#EF4444] hover:bg-red-500/10"
                  aria-label="Remove checklist"
                  title="Remove checklist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-900">
              <div
                className={cn("h-full rounded-full", progressTone(checklist.completionPercent))}
                style={{ width: `${Math.min(checklist.completionPercent, 100)}%` }}
              />
            </div>

            <div className="mt-4 space-y-3">
              {checklist.answers.map((answer) => (
                <div
                  key={answer.id}
                  className="rounded-lg border border-slate-800 bg-[#0F172A] p-3"
                >
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={answer.checked}
                      onChange={(event) =>
                        updateAnswer(checklist.id, answer.id, {
                          checked: event.target.checked,
                        })
                      }
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-[#111827]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white">
                        {answer.titleSnapshot}
                        {answer.isRequiredSnapshot ? (
                          <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
                            Required
                          </span>
                        ) : null}
                      </span>
                      {answer.descriptionSnapshot ? (
                        <span className="mt-1 block text-sm text-slate-400">
                          {answer.descriptionSnapshot}
                        </span>
                      ) : null}
                    </span>
                  </label>
                  <textarea
                    value={answer.note || ""}
                    onChange={(event) =>
                      updateAnswer(checklist.id, answer.id, {
                        note: event.target.value,
                      })
                    }
                    placeholder="Optional note"
                    rows={2}
                    className={cn(textareaClass, "mt-3")}
                  />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
