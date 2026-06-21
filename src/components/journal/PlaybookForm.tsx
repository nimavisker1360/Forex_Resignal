"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RULE_SECTION_ORDER } from "@/components/journal/PlaybookRuleSection";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import type {
  PlaybookChecklistDto,
  PlaybookRuleDto,
  PlaybookRuleSection,
  PlaybookStrategyDto,
} from "@/types/playbooks";

type ChecklistTemplate = PlaybookChecklistDto;

type FormState = {
  name: string;
  description: string;
  marketType: string;
  symbols: string;
  timeframes: string;
  riskPerTrade: string;
  minRiskReward: string;
  tags: string;
  isActive: boolean;
  rules: PlaybookRuleDto[];
  checklistTemplateIds: string[];
};

const MARKET_TYPES = ["Forex", "Crypto", "Indices", "Stocks", "Futures", "Custom"];

const inputClass =
  "h-10 w-full rounded-lg border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600";
const textareaClass =
  "w-full rounded-lg border border-slate-800 bg-[#111827] px-3 py-2 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600";

function emptyRule(section: PlaybookRuleSection, sortOrder: number): PlaybookRuleDto {
  return {
    title: "",
    description: "",
    section,
    isRequired: false,
    sortOrder,
  };
}

function initialForm(playbook?: PlaybookStrategyDto): FormState {
  if (!playbook) {
    return {
      name: "",
      description: "",
      marketType: "Forex",
      symbols: "",
      timeframes: "",
      riskPerTrade: "",
      minRiskReward: "",
      tags: "",
      isActive: true,
      rules: [
        emptyRule("SETUP", 0),
        emptyRule("ENTRY", 1),
        emptyRule("EXIT", 2),
        emptyRule("RISK", 3),
        emptyRule("MANAGEMENT", 4),
        emptyRule("PSYCHOLOGY", 5),
      ],
      checklistTemplateIds: [],
    };
  }

  return {
    name: playbook.name,
    description: playbook.description || "",
    marketType: playbook.marketType || "Forex",
    symbols: playbook.symbols || "",
    timeframes: playbook.timeframes || "",
    riskPerTrade: playbook.riskPerTrade === null ? "" : String(playbook.riskPerTrade),
    minRiskReward: playbook.minRiskReward === null ? "" : String(playbook.minRiskReward),
    tags: playbook.tags || "",
    isActive: playbook.isActive,
    rules: playbook.rules.map((rule, index) => ({
      id: rule.id,
      title: rule.title,
      description: rule.description || "",
      section: rule.section,
      isRequired: rule.isRequired,
      sortOrder: index,
    })),
    checklistTemplateIds: playbook.checklists.map((checklist) => checklist.id),
  };
}

function normalizeRules(rules: PlaybookRuleDto[]) {
  return rules
    .filter((rule) => rule.title.trim())
    .map((rule, index) => ({
      ...rule,
      title: rule.title.trim(),
      description: rule.description?.trim() || null,
      sortOrder: index,
    }));
}

export function LinkedChecklistSelector({
  templates,
  selectedIds,
  onChange,
  loading,
}: {
  templates: ChecklistTemplate[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  loading: boolean;
}) {
  const { t } = useLanguage();
  const selected = new Set(selectedIds);

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-800 bg-[#111827] p-4 text-sm text-slate-400">
        {t("journal.playbooks.loadingChecklistTemplates")}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-[#111827] p-4 text-sm text-slate-400">
        {t("journal.playbooks.noChecklistTemplates")}
      </div>
    );
  }

  return (
    <div className="grid gap-2 md:grid-cols-2">
      {templates.map((template) => (
        <label
          key={template.id}
          className="flex items-start gap-3 rounded-lg border border-slate-800 bg-[#111827] p-3"
        >
          <input
            type="checkbox"
            checked={selected.has(template.id)}
            onChange={(event) => {
              const next = event.target.checked
                ? [...selectedIds, template.id]
                : selectedIds.filter((id) => id !== template.id);
              onChange(next);
            }}
            className="mt-1 h-4 w-4 rounded border-slate-700 bg-[#0F172A]"
          />
          <span>
            <span className="block text-sm font-semibold text-white">{template.title}</span>
            <span className="mt-1 block text-xs text-slate-400">
              {template.category || t("journal.playbooks.customMarket")} / {t("journal.playbooks.itemsCount").replace("{count}", String(template.itemCount))}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}

export function PlaybookRuleEditor({
  rules,
  onChange,
}: {
  rules: PlaybookRuleDto[];
  onChange: (rules: PlaybookRuleDto[]) => void;
}) {
  const { t } = useLanguage();
  const sectionLabels: Record<PlaybookRuleSection, string> = {
    SETUP: t("journal.playbooks.setup"),
    ENTRY: t("journal.playbooks.entry"),
    EXIT: t("journal.playbooks.exit"),
    RISK: t("journal.playbooks.risk"),
    MANAGEMENT: t("journal.playbooks.management"),
    PSYCHOLOGY: t("journal.playbooks.psychology"),
  };

  function updateRule(index: number, patch: Partial<PlaybookRuleDto>) {
    onChange(
      rules.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, ...patch } : rule
      )
    );
  }

  function moveRule(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= rules.length) {
      return;
    }

    const next = [...rules];
    const [rule] = next.splice(index, 1);
    next.splice(nextIndex, 0, rule);
    onChange(next.map((item, itemIndex) => ({ ...item, sortOrder: itemIndex })));
  }

  function removeRule(index: number) {
    if (rules.length === 1) {
      return;
    }

    onChange(
      rules
        .filter((_, ruleIndex) => ruleIndex !== index)
        .map((rule, ruleIndex) => ({ ...rule, sortOrder: ruleIndex }))
    );
  }

  return (
    <div className="space-y-3">
      {rules.map((rule, index) => (
        <div key={`${rule.id || "new"}-${index}`} className="rounded-lg border border-slate-800 bg-[#111827] p-3">
          <div className="grid gap-3 lg:grid-cols-[180px_1fr_1fr_auto]">
            <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
              {t("journal.playbooks.section")}
              <select
                value={rule.section}
                onChange={(event) =>
                  updateRule(index, { section: event.target.value as PlaybookRuleSection })
                }
                className={inputClass}
              >
                {RULE_SECTION_ORDER.map((section) => (
                  <option key={section} value={section}>
                    {sectionLabels[section]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
              {t("journal.playbooks.ruleTitle")}
              <input
                value={rule.title}
                onChange={(event) => updateRule(index, { title: event.target.value })}
                placeholder={t("journal.playbooks.ruleTitlePlaceholder")}
                className={inputClass}
              />
            </label>
            <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
              {t("journal.playbooks.description")}
              <input
                value={rule.description || ""}
                onChange={(event) => updateRule(index, { description: event.target.value })}
                placeholder={t("journal.playbooks.ruleDescriptionPlaceholder")}
                className={inputClass}
              />
            </label>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => moveRule(index, -1)}
                disabled={index === 0}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                aria-label={t("journal.playbooks.moveRuleUp")}
                title={t("journal.playbooks.moveRuleUp")}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => moveRule(index, 1)}
                disabled={index === rules.length - 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                aria-label={t("journal.playbooks.moveRuleDown")}
                title={t("journal.playbooks.moveRuleDown")}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeRule(index)}
                disabled={rules.length === 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/30 text-[#EF4444] hover:bg-red-500/10 disabled:opacity-40"
                aria-label={t("journal.playbooks.deleteRule")}
                title={t("journal.playbooks.deleteRule")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <label className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-300">
            <input
              type="checkbox"
              checked={rule.isRequired}
              onChange={(event) => updateRule(index, { isRequired: event.target.checked })}
              className="h-4 w-4 rounded border-slate-700 bg-[#0F172A]"
            />
            {t("journal.playbooks.requiredRule")}
          </label>
        </div>
      ))}
    </div>
  );
}

export function PlaybookForm({ playbook }: { playbook?: PlaybookStrategyDto }) {
  const router = useRouter();
  const { t } = useLanguage();
  const loadChecklistFailedText = t("journal.playbooks.loadChecklistTemplatesFailed");
  const [form, setForm] = useState<FormState>(() => initialForm(playbook));
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [saving, setSaving] = useState(false);
  const formTitle = playbook ? t("journal.playbooks.editTitle") : t("journal.playbooks.createTitle");
  const validRules = useMemo(() => normalizeRules(form.rules), [form.rules]);

  useEffect(() => {
    let cancelled = false;

    async function loadTemplates() {
      setLoadingTemplates(true);

      try {
        const response = await fetch("/api/journal/checklists");
        const data = await response.json();

        if (!response.ok) {
          toast.error(data.message || loadChecklistFailedText);
          return;
        }

        if (!cancelled) {
          setTemplates(data.checklists || []);
        }
      } catch {
        toast.error(loadChecklistFailedText);
      } finally {
        if (!cancelled) {
          setLoadingTemplates(false);
        }
      }
    }

    void loadTemplates();

    return () => {
      cancelled = true;
    };
  }, [loadChecklistFailedText]);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addTemplateRules() {
    const start = form.rules.length;
    const titles: Array<[PlaybookRuleSection, string, boolean]> = [
      ["SETUP", t("journal.playbooks.exampleRuleMarketStructure"), true],
      ["SETUP", t("journal.playbooks.exampleRuleKeyZone"), false],
      ["ENTRY", t("journal.playbooks.exampleRuleConfirmation"), true],
      ["ENTRY", t("journal.playbooks.exampleRuleNotLate"), true],
      ["EXIT", t("journal.playbooks.exampleRuleStopLoss"), true],
      ["EXIT", t("journal.playbooks.exampleRuleTakeProfit"), true],
      ["RISK", t("journal.playbooks.exampleRuleMinimumRr"), true],
      ["RISK", t("journal.playbooks.exampleRuleLotSize"), true],
      ["MANAGEMENT", t("journal.playbooks.exampleRuleManagement"), false],
      ["PSYCHOLOGY", t("journal.playbooks.exampleRuleFomo"), true],
      ["PSYCHOLOGY", t("journal.playbooks.exampleRuleAcceptRisk"), true],
    ];

    setField("rules", [
      ...form.rules.filter((rule) => rule.title.trim()),
      ...titles.map(([section, title, isRequired], index) => ({
        title,
        description: "",
        section,
        isRequired,
        sortOrder: start + index,
      })),
    ]);
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error(t("journal.playbooks.strategyNameRequired"));
      return;
    }

    if (validRules.length === 0) {
      toast.error(t("journal.playbooks.addRuleRequired"));
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        playbook ? `/api/journal/playbooks/${playbook.id}` : "/api/journal/playbooks",
        {
          method: playbook ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            name: form.name.trim(),
            description: form.description.trim(),
            rules: validRules,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        toast.error(Array.isArray(data.errors) ? data.errors.join(", ") : data.message);
        return;
      }

      toast.success(playbook ? t("journal.playbooks.updated") : t("journal.playbooks.created"));
      router.push(`/journal/playbooks/${data.playbook.id}`);
      router.refresh();
    } catch {
      toast.error(t("journal.playbooks.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => router.push("/journal/playbooks")}
        className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("journal.playbooks.back")}
      </button>

      <form onSubmit={submitForm} className="space-y-5">
        <section className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">{formTitle}</h1>
              <p className="mt-1 text-sm text-slate-400">
                {t("journal.playbooks.formSubtitle")}
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? t("journal.playbooks.saving") : t("journal.playbooks.save")}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1 text-xs font-medium uppercase text-slate-400 md:col-span-2">
              {t("journal.playbooks.strategyName")}
              <input
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                required
                placeholder={t("journal.playbooks.strategyNamePlaceholder")}
                className={inputClass}
              />
            </label>
            <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
              {t("journal.playbooks.market")}
              <select
                value={form.marketType}
                onChange={(event) => setField("marketType", event.target.value)}
                className={inputClass}
              >
                {MARKET_TYPES.map((market) => (
                  <option key={market} value={market}>
                    {market}
                  </option>
                ))}
              </select>
            </label>
            <label className="inline-flex items-center gap-2 self-end text-sm font-medium text-slate-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setField("isActive", event.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-[#111827]"
              />
              {t("journal.playbooks.activeStrategy")}
            </label>
            <label className="space-y-1 text-xs font-medium uppercase text-slate-400 md:col-span-2">
              {t("journal.playbooks.description")}
              <textarea
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                rows={3}
                className={textareaClass}
              />
            </label>
            <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
              {t("journal.playbooks.symbols")}
              <input
                value={form.symbols}
                onChange={(event) => setField("symbols", event.target.value)}
                placeholder={t("journal.playbooks.symbolsPlaceholder")}
                className={inputClass}
              />
            </label>
            <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
              {t("journal.playbooks.timeframes")}
              <input
                value={form.timeframes}
                onChange={(event) => setField("timeframes", event.target.value)}
                placeholder={t("journal.playbooks.timeframesPlaceholder")}
                className={inputClass}
              />
            </label>
            <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
              {t("journal.playbooks.riskPerTrade")}
              <input
                type="number"
                step="any"
                value={form.riskPerTrade}
                onChange={(event) => setField("riskPerTrade", event.target.value)}
                placeholder={t("journal.playbooks.riskPerTradePlaceholder")}
                className={inputClass}
              />
            </label>
            <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
              {t("journal.playbooks.minimumRr")}
              <input
                type="number"
                step="any"
                value={form.minRiskReward}
                onChange={(event) => setField("minRiskReward", event.target.value)}
                placeholder={t("journal.playbooks.minimumRrPlaceholder")}
                className={inputClass}
              />
            </label>
            <label className="space-y-1 text-xs font-medium uppercase text-slate-400 md:col-span-2">
              {t("dashboard.form.tags")}
              <input
                value={form.tags}
                onChange={(event) => setField("tags", event.target.value)}
                placeholder={t("journal.playbooks.tagsPlaceholder")}
                className={inputClass}
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{t("journal.playbooks.strategyRules")}</h2>
              <p className="mt-1 text-sm text-slate-400">
                {t("journal.playbooks.rulesSubtitle")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setField("rules", [
                    ...form.rules,
                    emptyRule("SETUP", form.rules.length),
                  ])
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-800 px-4 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                {t("journal.playbooks.addRule")}
              </button>
              <button
                type="button"
                onClick={addTemplateRules}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-800 px-4 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                {t("journal.playbooks.addExampleRules")}
              </button>
            </div>
          </div>
          <PlaybookRuleEditor rules={form.rules} onChange={(rules) => setField("rules", rules)} />
        </section>

        <section className="rounded-lg border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">{t("journal.playbooks.linkedChecklistTemplates")}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {t("journal.playbooks.linkedChecklistSubtitle")}
            </p>
          </div>
          <LinkedChecklistSelector
            templates={templates}
            selectedIds={form.checklistTemplateIds}
            onChange={(ids) => setField("checklistTemplateIds", ids)}
            loading={loadingTemplates}
          />
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            )}
          >
            <Save className="h-4 w-4" />
            {saving ? t("journal.playbooks.saving") : t("journal.playbooks.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
