"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useLanguage } from "@/lib/language-context";
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
  const { t } = useLanguage();
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const loadFailedText = t("journal.checklistsPage.loadFailed");
  const loadTimeoutText = t("journal.checklistsPage.loadTimeout");
  const categoryLabel = (value: string | null | undefined) => {
    const key = String(value || "Custom").replace(/\s+/g, "");
    const translated = t(`journal.checklistsPage.categories.${key}`);
    return translated.startsWith("journal.") ? value || t("journal.checklistsPage.categories.Custom") : translated;
  };
  const templateTitle = (value: string) => {
    const key = value.replace(/\s+/g, "");
    const translated = t(`journal.checklistsPage.templateTitles.${key}`);
    return translated.startsWith("journal.") ? value : translated;
  };
  const templateDescription = (value: string | null) => {
    if (!value) {
      return t("journal.common.noDescription");
    }

    const key = value.replace(/[^a-zA-Z0-9]+/g, "");
    const translated = t(`journal.checklistsPage.templateDescriptions.${key}`);
    return translated.startsWith("journal.") ? value : translated;
  };

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

  const loadChecklists = useCallback(async () => {
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
        const message = data.message || loadFailedText;
        setLoadError(message);
        toast.error(message);
        return;
      }

      setChecklists(data.checklists || []);
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === "AbortError"
          ? loadTimeoutText
          : loadFailedText;
      setLoadError(message);
      toast.error(message);
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }, [loadFailedText, loadTimeoutText]);

  useEffect(() => {
    void loadChecklists();
  }, [loadChecklists]);

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
      toast.error(t("journal.checklistsPage.titleRequired"));
      return;
    }

    if (items.length === 0) {
      toast.error(t("journal.checklistsPage.itemRequired"));
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

      toast.success(form.id ? t("journal.checklistsPage.updated") : t("journal.checklistsPage.created"));
      setFormOpen(false);
      await loadChecklists();
    } catch {
      toast.error(t("journal.checklistsPage.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteChecklist(checklist: ChecklistTemplate) {
    const confirmed = window.confirm(
      t("journal.checklistsPage.confirmDelete").replace("{title}", checklist.title)
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
        toast.error(data.message || t("journal.checklistsPage.deleteFailed"));
        return;
      }

      toast.success(data.message || t("journal.checklistsPage.updated"));
      await loadChecklists();
    } catch {
      toast.error(t("journal.checklistsPage.deleteFailed"));
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">{t("journal.checklistsPage.title")}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {t("journal.checklistsPage.subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          {t("journal.checklistsPage.create")}
        </button>
      </div>

      <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            {t("journal.common.search")}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("journal.checklistsPage.searchPlaceholder")}
                className="h-10 w-full rounded-lg border border-slate-800 bg-[#111827] pl-9 pr-3 text-sm text-[#E5E7EB] outline-none focus:border-blue-600"
              />
            </div>
          </label>
          <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
            {t("journal.checklistsPage.category")}
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={inputClass}
            >
              <option value="">{t("journal.checklistsPage.allCategories")}</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {categoryLabel(item)}
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
                  {templateTitle(checklist.title)}
                </h2>
                <p className="mt-1 line-clamp-2 min-h-[40px] text-sm text-slate-400">
                  {templateDescription(checklist.description)}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-[#111827] text-blue-300">
                <ListChecks className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{categoryLabel(checklist.category)}</Badge>
              <Badge tone={checklist.isActive ? "green" : "amber"}>
                {checklist.isActive ? t("journal.common.active") : t("journal.common.inactive")}
              </Badge>
              {checklist.isDefault ? <Badge tone="blue">{t("journal.checklistsPage.default")}</Badge> : null}
              <Badge>{t("journal.checklistsPage.itemsCount").replace("{count}", String(checklist.itemCount))}</Badge>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => openEditForm(checklist)}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-800 px-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                {t("journal.tradeDetail.edit")}
              </button>
              <button
                type="button"
                onClick={() => deleteChecklist(checklist)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-500/30 px-3 text-sm font-semibold text-[#EF4444] hover:bg-red-500/10"
                aria-label={t("journal.checklistsPage.deleteChecklist")}
                title={t("journal.checklistsPage.deleteChecklist")}
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
            {loadError ? t("journal.checklistsPage.couldNotLoad") : t("journal.checklistsPage.emptyTitle")}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {loadError || t("journal.checklistsPage.emptyDescription")}
          </p>
          {loadError ? (
            <button
              type="button"
              onClick={loadChecklists}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-slate-800 px-4 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              {t("journal.common.retry")}
            </button>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-slate-800 bg-[#0F172A] p-6 text-sm text-slate-400">
          {t("journal.checklistsPage.loading")}
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
                  {form.id ? t("journal.checklistsPage.editTitle") : t("journal.checklistsPage.createTitle")}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {t("journal.checklistsPage.formSubtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800"
                aria-label={t("journal.manualTrade.close")}
                title={t("journal.manualTrade.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
                {t("journal.checklistsPage.formTitle")}
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
                {t("journal.checklistsPage.category")}
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, category: event.target.value }))
                  }
                  className={inputClass}
                >
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {categoryLabel(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs font-medium uppercase text-slate-400 md:col-span-2">
                {t("journal.playbooks.description")}
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
                {t("journal.common.active")}
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
                {t("journal.checklistsPage.defaultManualTrades")}
              </label>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white">{t("journal.checklistsPage.checklistItems")}</h3>
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
                  {t("journal.checklistsPage.addItem")}
                </button>
              </div>

              {form.items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-800 bg-[#111827] p-3"
                >
                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
                      {t("journal.checklistsPage.itemTitle")}
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
                      {t("journal.playbooks.description")}
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
                        aria-label={t("journal.playbooks.moveRuleUp")}
                        title={t("journal.playbooks.moveRuleUp")}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === form.items.length - 1}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                        aria-label={t("journal.playbooks.moveRuleDown")}
                        title={t("journal.playbooks.moveRuleDown")}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={form.items.length === 1}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/30 text-[#EF4444] hover:bg-red-500/10 disabled:opacity-40"
                        aria-label={t("journal.checklistsPage.deleteItem")}
                        title={t("journal.checklistsPage.deleteItem")}
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
                    {t("journal.checklistsPage.requiredItem")}
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
                {t("journal.tradeDetail.cancel")}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {saving ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saving ? t("journal.tradeDetail.saving") : t("journal.checklistsPage.saveChecklist")}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
