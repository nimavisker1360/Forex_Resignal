"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ListChecks,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Pre Trade",
  "Entry Confirmation",
  "Risk Management",
  "Psychology",
  "Trade Management",
  "Exit Review",
  "Custom",
];

type ChecklistItem = {
  id?: string;
  title: string;
  description: string;
  isRequired: boolean;
  sortOrder: number;
};

type ChecklistTemplate = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  isActive: boolean;
  isDefault: boolean;
  itemCount: number;
  items: ChecklistItem[];
};

type FormState = {
  id?: string;
  title: string;
  description: string;
  category: string;
  isActive: boolean;
  isDefault: boolean;
  items: ChecklistItem[];
};

const emptyItem = (sortOrder: number): ChecklistItem => ({
  title: "",
  description: "",
  isRequired: false,
  sortOrder,
});

const emptyForm = (): FormState => ({
  title: "",
  description: "",
  category: "Pre Trade",
  isActive: true,
  isDefault: false,
  items: [emptyItem(0)],
});

const inputClass =
  "h-10 w-full rounded-lg border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600";
const textareaClass =
  "w-full rounded-lg border border-slate-800 bg-[#111827] px-3 py-2 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600";

function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "green" | "blue" | "amber";
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : tone === "blue"
        ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
        : tone === "amber"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
          : "border-slate-700 bg-slate-900 text-slate-300";

  return (
    <span className={cn("inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold", toneClass)}>
      {children}
    </span>
  );
}

function normalizeItems(items: ChecklistItem[]) {
  return items.map((item, index) => ({
    ...item,
    title: item.title.trim(),
    description: item.description.trim(),
    sortOrder: index,
  }));
}

export default function ChecklistManagementPage() {
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filteredChecklists = useMemo(() => {
    const query = search.trim().toLowerCase();

    return checklists.filter((checklist) => {
      const matchesSearch =
        !query ||
        checklist.title.toLowerCase().includes(query) ||
        checklist.description?.toLowerCase().includes(query);
      const matchesCategory = !category || checklist.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [category, checklists, search]);

  async function loadChecklists() {
    setLoading(true);
    setLoadError(null);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch("/api/journal/checklists?includeInactive=true", {
        signal: controller.signal,
      });
      const data = await response.json();

      if (!response.ok) {
        const message = data.message || "Failed to load checklists";
        setLoadError(message);
        toast.error(message);
        return;
      }

      setChecklists(data.checklists || []);
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === "AbortError"
          ? "Checklist loading timed out. Check the database connection and retry."
          : "Failed to load checklists";
      setLoadError(message);
      toast.error(message);
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadChecklists();
  }, []);

  function openCreateForm() {
    setForm(emptyForm());
    setFormOpen(true);
  }

  function openEditForm(checklist: ChecklistTemplate) {
    setForm({
      id: checklist.id,
      title: checklist.title,
      description: checklist.description || "",
      category: checklist.category || "Custom",
      isActive: checklist.isActive,
      isDefault: checklist.isDefault,
      items: checklist.items.map((item, index) => ({
        id: item.id,
        title: item.title,
        description: item.description || "",
        isRequired: item.isRequired,
        sortOrder: index,
      })),
    });
    setFormOpen(true);
  }

  function updateItem(index: number, patch: Partial<ChecklistItem>) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  function moveItem(index: number, direction: -1 | 1) {
    setForm((current) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= current.items.length) {
        return current;
      }

      const items = [...current.items];
      const [item] = items.splice(index, 1);
      items.splice(nextIndex, 0, item);

      return {
        ...current,
        items: normalizeItems(items),
      };
    });
  }

  function removeItem(index: number) {
    setForm((current) => ({
      ...current,
      items:
        current.items.length > 1
          ? normalizeItems(current.items.filter((_, itemIndex) => itemIndex !== index))
          : current.items,
    }));
  }

  async function saveChecklist(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const items = normalizeItems(form.items).filter((item) => item.title);

    if (!form.title.trim()) {
      toast.error("Checklist title is required");
      return;
    }

    if (items.length === 0) {
      toast.error("A checklist must have at least one item");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        form.id ? `/api/journal/checklists/${form.id}` : "/api/journal/checklists",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            category: form.category,
            isActive: form.isActive,
            isDefault: form.isDefault,
            items,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        toast.error(
          Array.isArray(data.errors) ? data.errors.join(", ") : data.message
        );
        return;
      }

      toast.success(form.id ? "Checklist updated" : "Checklist created");
      setFormOpen(false);
      await loadChecklists();
    } catch {
      toast.error("Failed to save checklist");
    } finally {
      setSaving(false);
    }
  }

  async function deleteChecklist(checklist: ChecklistTemplate) {
    const confirmed = window.confirm(
      `Delete or disable "${checklist.title}"? Used templates are disabled to preserve trade history.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/journal/checklists/${checklist.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to delete checklist");
        return;
      }

      toast.success(data.message || "Checklist updated");
      await loadChecklists();
    } catch {
      toast.error("Failed to delete checklist");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Trade Checklists</h1>
          <p className="mt-1 text-sm text-slate-400">
            Build reusable execution rules and attach them to trade journal entries.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Create Checklist
        </button>
      </div>

      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            Search
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search checklist templates"
                className="h-10 w-full rounded-lg border border-slate-800 bg-[#111827] pl-9 pr-3 text-sm text-[#E5E7EB] outline-none focus:border-blue-600"
              />
            </div>
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={inputClass}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredChecklists.map((checklist) => (
          <article
            key={checklist.id}
            className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-white">
                  {checklist.title}
                </h2>
                <p className="mt-1 line-clamp-2 min-h-[40px] text-sm text-slate-400">
                  {checklist.description || "No description"}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-[#111827] text-blue-300">
                <ListChecks className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{checklist.category || "Custom"}</Badge>
              <Badge tone={checklist.isActive ? "green" : "amber"}>
                {checklist.isActive ? "Active" : "Inactive"}
              </Badge>
              {checklist.isDefault ? <Badge tone="blue">Default</Badge> : null}
              <Badge>{checklist.itemCount} items</Badge>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => openEditForm(checklist)}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-800 px-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => deleteChecklist(checklist)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-500/30 px-3 text-sm font-semibold text-[#EF4444] hover:bg-red-500/10"
                aria-label="Delete checklist"
                title="Delete checklist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {!loading && filteredChecklists.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-[#0F172A] px-4 py-12 text-center">
          <ListChecks className="mx-auto h-8 w-8 text-slate-500" />
          <h2 className="mt-3 text-base font-semibold text-white">
            {loadError ? "Could not load checklists" : "No checklists found"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {loadError || "Create a reusable checklist or clear the current filters."}
          </p>
          {loadError ? (
            <button
              type="button"
              onClick={loadChecklists}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-slate-800 px-4 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-6 text-sm text-slate-400">
          Loading checklists...
        </div>
      ) : null}

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-8">
          <form
            onSubmit={saveChecklist}
            className="w-full max-w-4xl rounded-lg border border-slate-800 bg-[#0F172A] p-5 shadow-xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {form.id ? "Edit Checklist" : "Create Checklist"}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Define the ordered checks that will be snapshotted into each trade.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800"
                aria-label="Close"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
                Title
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  required
                  className={inputClass}
                />
              </label>
              <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
                Category
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, category: event.target.value }))
                  }
                  className={inputClass}
                >
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs font-medium uppercase text-slate-400 md:col-span-2">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={3}
                  className={textareaClass}
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-700 bg-[#111827]"
                />
                Active
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isDefault: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-700 bg-[#111827]"
                />
                Default for new manual trades
              </label>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white">Checklist Items</h3>
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      items: [...current.items, emptyItem(current.items.length)],
                    }))
                  }
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-800 px-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>

              {form.items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-800 bg-[#111827] p-3"
                >
                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
                      Item Title
                      <input
                        value={item.title}
                        onChange={(event) =>
                          updateItem(index, { title: event.target.value })
                        }
                        required
                        className={inputClass}
                      />
                    </label>
                    <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
                      Description
                      <input
                        value={item.description}
                        onChange={(event) =>
                          updateItem(index, { description: event.target.value })
                        }
                        className={inputClass}
                      />
                    </label>
                    <div className="flex items-end gap-2">
                      <button
                        type="button"
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                        aria-label="Move item up"
                        title="Move item up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === form.items.length - 1}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                        aria-label="Move item down"
                        title="Move item down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={form.items.length === 1}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/30 text-[#EF4444] hover:bg-red-500/10 disabled:opacity-40"
                        aria-label="Delete item"
                        title="Delete item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <label className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-300">
                    <input
                      type="checkbox"
                      checked={item.isRequired}
                      onChange={(event) =>
                        updateItem(index, { isRequired: event.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-700 bg-[#111827]"
                    />
                    Required item
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-800 px-4 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {saving ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving" : "Save Checklist"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
