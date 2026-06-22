"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Save,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

type JournalForm = {
  marketBias: string;
  todayFocus: string;
  maxTradesAllowed: string;
  maxDailyLoss: string;
  mainPlaybookId: string;
  symbolsToTrade: string;
  newsToWatch: string;
  preMarketNotes: string;
  mood: string;
  focusLevel: string;
  confidenceLevel: string;
  stressLevel: string;
  sleepQuality: string;
  disciplineScore: string;
  checklistNotes: string;
  respectedRisk: boolean;
  waitedForConfirmation: boolean;
  avoidedRevengeTrading: boolean;
  stoppedAfterDailyLimit: boolean;
  followedPlaybook: boolean;
  avoidedOvertrading: boolean;
  whatWentWell: string;
  mistakesSummary: string;
  followedPlanReview: string;
  improvementPlan: string;
  tomorrowPlan: string;
  endOfDayNotes: string;
};

type DailyJournalRecord = Partial<JournalForm> & {
  id: string;
  date: string;
};

type PlaybookOption = {
  id: string;
  name: string;
};

type AccountOption = {
  id: string;
  name: string;
};

type SaveStatus = "idle" | "loading" | "saving" | "saved" | "error";

const emptyForm: JournalForm = {
  marketBias: "",
  todayFocus: "",
  maxTradesAllowed: "",
  maxDailyLoss: "",
  mainPlaybookId: "",
  symbolsToTrade: "",
  newsToWatch: "",
  preMarketNotes: "",
  mood: "",
  focusLevel: "",
  confidenceLevel: "",
  stressLevel: "",
  sleepQuality: "",
  disciplineScore: "",
  checklistNotes: "",
  respectedRisk: false,
  waitedForConfirmation: false,
  avoidedRevengeTrading: false,
  stoppedAfterDailyLimit: false,
  followedPlaybook: false,
  avoidedOvertrading: false,
  whatWentWell: "",
  mistakesSummary: "",
  followedPlanReview: "",
  improvementPlan: "",
  tomorrowPlan: "",
  endOfDayNotes: "",
};

const formFieldKeys = Object.keys(emptyForm) as Array<keyof JournalForm>;

const inputClass =
  "h-10 w-full rounded-lg border border-slate-800 bg-[#111827] px-3 text-sm text-[#E5E7EB] outline-none focus:border-blue-600";
const textareaClass =
  "w-full rounded-lg border border-slate-800 bg-[#111827] px-3 py-2 text-sm leading-6 text-[#E5E7EB] outline-none focus:border-blue-600";

const copy = {
  en: {
    title: "Daily Journal",
    subtitle: "Plan the day, track your mindset, and review what to improve tomorrow.",
    loading: "Loading...",
    saving: "Saving...",
    saved: "Saved",
    errorSaving: "Error saving",
    save: "Save",
    date: "Date",
    account: "Account",
    allAccounts: "All accounts",
    previousDay: "Previous Day",
    today: "Today",
    nextDay: "Next Day",
    netPnl: "Net P&L",
    totalTrades: "Total Trades",
    winRate: "Win Rate",
    averageRr: "Average R:R",
    bestTrade: "Best Trade",
    worstTrade: "Worst Trade",
    dailyPlan: "Morning Plan",
    marketBias: "Market Bias",
    selectBias: "Select bias",
    todayFocus: "Today's Focus",
    maxTradesAllowed: "Max Trades Allowed",
    maxDailyLoss: "Max Daily Loss",
    mainPlaybook: "Main Playbook",
    noPlaybookSelected: "No playbook selected",
    symbolsToTrade: "Symbols to Trade",
    newsToWatch: "News to Watch",
    preMarketNotes: "Pre-Market Notes",
    dailyPsychology: "Daily Psychology",
    mood: "Mood",
    selectMood: "Select mood",
    focusLevel: "Focus Level",
    confidenceLevel: "Confidence Level",
    stressLevel: "Stress Level",
    disciplineScore: "Discipline Score",
    sleepQuality: "Sleep Quality",
    selectSleepQuality: "Select sleep quality",
    dailyChecklist: "Daily Discipline Checklist",
    respectedRisk: "I respected my risk",
    waitedForConfirmation: "I waited for confirmation",
    avoidedRevengeTrading: "I avoided revenge trading",
    stoppedAfterDailyLimit: "I stopped after daily limit",
    followedPlaybook: "I followed my playbook",
    avoidedOvertrading: "I avoided overtrading",
    checklistNotes: "Checklist Notes",
    endOfDayReview: "End of Day Review",
    whatWentWell: "What went well today?",
    mistakesSummary: "What mistakes did I make?",
    followedPlanReview: "Did I follow my plan?",
    improvementPlan: "What should I improve tomorrow?",
    tomorrowPlan: "Tomorrow Plan",
    endOfDayNotes: "End of Day Notes",
    linkedTrades: "Linked Trades",
    time: "Time",
    symbol: "Symbol",
    direction: "Direction",
    entry: "Entry",
    exit: "Exit",
    pnl: "PnL",
    rr: "R:R",
    status: "Status",
    openReview: "Open Review",
    noTrades: "No trades found for this date. You can still write your plan and review.",
    biasOptions: ["Bullish", "Bearish", "Neutral", "Range", "Waiting"],
    moodOptions: ["Calm", "Confident", "Stressed", "Fearful", "Angry", "Tired", "Distracted"],
    sleepOptions: ["Good", "Normal", "Bad"],
  },
  fa: {
    title: "ژورنال روزانه",
    subtitle: "برنامه روز را بنویس، ذهنیتت را ثبت کن و مرور کن فردا چه چیزی باید بهتر شود.",
    loading: "در حال بارگذاری...",
    saving: "در حال ذخیره...",
    saved: "ذخیره شد",
    errorSaving: "خطا در ذخیره",
    save: "ذخیره",
    date: "تاریخ",
    account: "حساب",
    allAccounts: "همه حساب‌ها",
    previousDay: "روز قبل",
    today: "امروز",
    nextDay: "روز بعد",
    netPnl: "سود و زیان خالص",
    totalTrades: "تعداد معاملات",
    winRate: "نرخ برد",
    averageRr: "میانگین R:R",
    bestTrade: "بهترین معامله",
    worstTrade: "بدترین معامله",
    dailyPlan: "برنامه روزانه",
    marketBias: "جهت بازار",
    selectBias: "انتخاب جهت",
    todayFocus: "تمرکز امروز",
    maxTradesAllowed: "حداکثر تعداد معاملات",
    maxDailyLoss: "حداکثر ضرر روزانه",
    mainPlaybook: "پلی‌بوک اصلی",
    noPlaybookSelected: "پلی‌بوکی انتخاب نشده",
    symbolsToTrade: "نمادهای قابل معامله",
    newsToWatch: "اخبار مهم",
    preMarketNotes: "یادداشت‌های قبل بازار",
    dailyPsychology: "روانشناسی روزانه",
    mood: "حال روحی",
    selectMood: "انتخاب حال روحی",
    focusLevel: "سطح تمرکز",
    confidenceLevel: "سطح اعتمادبه‌نفس",
    stressLevel: "سطح استرس",
    disciplineScore: "امتیاز نظم",
    sleepQuality: "کیفیت خواب",
    selectSleepQuality: "انتخاب کیفیت خواب",
    dailyChecklist: "چک‌لیست انضباط روزانه",
    respectedRisk: "ریسک خودم را رعایت کردم",
    waitedForConfirmation: "برای تایید صبر کردم",
    avoidedRevengeTrading: "از معامله انتقامی دوری کردم",
    stoppedAfterDailyLimit: "بعد از حد روزانه توقف کردم",
    followedPlaybook: "طبق پلی‌بوک عمل کردم",
    avoidedOvertrading: "از بیش‌معامله‌گری دوری کردم",
    checklistNotes: "یادداشت چک‌لیست",
    endOfDayReview: "مرور پایان روز",
    whatWentWell: "امروز چه چیزهایی خوب پیش رفت؟",
    mistakesSummary: "چه اشتباهاتی داشتم؟",
    followedPlanReview: "آیا طبق برنامه عمل کردم؟",
    improvementPlan: "فردا چه چیزی را بهتر کنم؟",
    tomorrowPlan: "برنامه فردا",
    endOfDayNotes: "یادداشت‌های پایان روز",
    linkedTrades: "معاملات مرتبط",
    time: "زمان",
    symbol: "نماد",
    direction: "جهت",
    entry: "ورود",
    exit: "خروج",
    pnl: "سود/زیان",
    rr: "R:R",
    status: "وضعیت",
    openReview: "باز کردن بررسی",
    noTrades: "برای این تاریخ معامله‌ای پیدا نشد. همچنان می‌توانی برنامه و مرور روزت را بنویسی.",
    biasOptions: ["صعودی", "نزولی", "خنثی", "رنج", "منتظر"],
    moodOptions: ["آرام", "مطمئن", "پراسترس", "ترسان", "عصبانی", "خسته", "حواس‌پرت"],
    sleepOptions: ["خوب", "معمولی", "بد"],
  },
} as const;

const biasValues = ["Bullish", "Bearish", "Neutral", "Range", "Waiting"] as const;
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeDate(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : todayKey();
}

function adjacentDate(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formFromJournal(journal: DailyJournalRecord | null): JournalForm {
  if (!journal) {
    return emptyForm;
  }

  const nextForm = { ...emptyForm };

  for (const key of formFieldKeys) {
    const value = journal[key];

    if (typeof emptyForm[key] === "boolean") {
      nextForm[key] = Boolean(value) as never;
    } else {
      nextForm[key] = (typeof value === "number" ? String(value) : value ?? "") as never;
    }
  }

  return nextForm;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
      {label}
      {children}
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-[#0F172A] p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm dark:border-slate-800 dark:bg-[#111827] dark:text-slate-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 bg-white accent-blue-600 dark:border-slate-700 dark:bg-slate-950"
      />
      {label}
    </label>
  );
}

export default function DailyJournalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const text = copy[language];
  const [date, setDate] = useState(() => normalizeDate(searchParams.get("date")));
  const [accountId, setAccountId] = useState(() => searchParams.get("accountId") || "");
  const [form, setForm] = useState<JournalForm>(emptyForm);
  const [playbooks, setPlaybooks] = useState<PlaybookOption[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [saveError, setSaveError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [dirty, setDirty] = useState(false);
  const latestSaveRef = useRef(0);

  const statusText = useMemo(() => {
    if (status === "loading") return text.loading;
    if (status === "saving") return text.saving;
    if (status === "saved") return text.saved;
    if (status === "error") return saveError || text.errorSaving;
    return "";
  }, [saveError, status, text]);

  const updateUrl = useCallback(
    (nextDate: string, nextAccountId: string) => {
      const params = new URLSearchParams();
      params.set("date", nextDate);

      if (nextAccountId) {
        params.set("accountId", nextAccountId);
      }

      router.push(`/dashboard/daily-journal?${params.toString()}`);
    },
    [router]
  );

  const updateForm = useCallback(<K extends keyof JournalForm>(key: K, value: JournalForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }, []);

  const saveJournal = useCallback(
    async (nextForm: JournalForm) => {
      const saveId = Date.now();
      latestSaveRef.current = saveId;
      setStatus("saving");
      setSaveError("");

      try {
        const response = await fetch("/api/daily-journal", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...nextForm, date }),
        });
        const data = (await response.json()) as { success: boolean; message?: string; errors?: string[] };

        if (!response.ok || !data.success) {
          throw new Error(data.errors?.join(", ") || data.message || "Failed to save daily journal");
        }

        if (latestSaveRef.current === saveId) {
          setStatus("saved");
          setDirty(false);
        }
      } catch (error) {
        if (latestSaveRef.current === saveId) {
          setSaveError(error instanceof Error ? error.message : text.errorSaving);
          setStatus("error");
        }
      }
    },
    [date, text.errorSaving]
  );

  useEffect(() => {
    const nextDate = normalizeDate(searchParams.get("date"));
    const nextAccountId = searchParams.get("accountId") || "";
    setDate(nextDate);
    setAccountId(nextAccountId);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadAccounts() {
      try {
        const response = await fetch("/api/trading-accounts", { cache: "no-store" });
        const data = (await response.json()) as { success: boolean; data?: AccountOption[] };

        if (!cancelled && data.success) {
          setAccounts(data.data || []);
        }
      } catch {
        if (!cancelled) {
          setAccounts([]);
        }
      }
    }

    loadAccounts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadJournal() {
      setHydrated(false);
      setStatus("loading");

      const params = new URLSearchParams({ date });
      if (accountId) {
        params.set("accountId", accountId);
      }

      try {
        const response = await fetch(`/api/daily-journal?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await response.json()) as {
          success: boolean;
          journal: DailyJournalRecord | null;
          stats: unknown;
          trades: unknown[];
          playbooks: PlaybookOption[];
          message?: string;
        };

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load daily journal");
        }

        setForm(formFromJournal(data.journal));
        setPlaybooks(data.playbooks || []);
        setSaveError("");
        setStatus("idle");
        setDirty(false);
        setHydrated(true);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setStatus("error");
          setHydrated(false);
        }
      }
    }

    loadJournal();

    return () => controller.abort();
  }, [accountId, date]);

  useEffect(() => {
    if (!hydrated || !dirty) {
      return;
    }

    setStatus("saving");
    const timeout = window.setTimeout(() => {
      saveJournal(form);
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [dirty, form, hydrated, saveJournal]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">{text.title}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {text.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-400">{statusText}</span>
          <button
            type="button"
            onClick={() => saveJournal(form)}
            disabled={status === "saving" || status === "loading"}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {text.save}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto_auto] md:items-end">
          <Field label={text.date}>
            <input
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                updateUrl(event.target.value, accountId);
              }}
              className={inputClass}
            />
          </Field>
          <Field label={text.account}>
            <select
              value={accountId}
              onChange={(event) => {
                setAccountId(event.target.value);
                updateUrl(date, event.target.value);
              }}
              className={inputClass}
            >
              <option value="">{text.allAccounts}</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="button"
            onClick={() => updateUrl(adjacentDate(date, -1), accountId)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-800 px-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {text.previousDay}
          </button>
          <button
            type="button"
            onClick={() => updateUrl(todayKey(), accountId)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-800 px-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <CalendarDays className="h-4 w-4" />
            {text.today}
          </button>
          <button
            type="button"
            onClick={() => updateUrl(adjacentDate(date, 1), accountId)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-800 px-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {text.nextDay}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Section title={text.dailyPlan}>
          <div className="grid gap-3">
            <Field label={text.marketBias}>
              <select value={form.marketBias} onChange={(event) => updateForm("marketBias", event.target.value)} className={inputClass}>
                <option value="">{text.selectBias}</option>
                {biasValues.map((item, index) => (
                  <option key={item} value={item}>{text.biasOptions[index]}</option>
                ))}
              </select>
            </Field>
            <Field label={text.todayFocus}>
              <input value={form.todayFocus} onChange={(event) => updateForm("todayFocus", event.target.value)} className={inputClass} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={text.maxTradesAllowed}>
                <input type="number" min="0" value={form.maxTradesAllowed} onChange={(event) => updateForm("maxTradesAllowed", event.target.value)} className={inputClass} />
              </Field>
              <Field label={text.maxDailyLoss}>
                <input type="number" step="any" value={form.maxDailyLoss} onChange={(event) => updateForm("maxDailyLoss", event.target.value)} className={inputClass} />
              </Field>
            </div>
            <Field label={text.mainPlaybook}>
              <select value={form.mainPlaybookId} onChange={(event) => updateForm("mainPlaybookId", event.target.value)} className={inputClass}>
                <option value="">{text.noPlaybookSelected}</option>
                {playbooks.map((playbook) => (
                  <option key={playbook.id} value={playbook.id}>{playbook.name}</option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        <Section title={text.dailyChecklist}>
          <div className="grid gap-3">
            <CheckboxField label={text.respectedRisk} checked={form.respectedRisk} onChange={(checked) => updateForm("respectedRisk", checked)} />
            <CheckboxField label={text.waitedForConfirmation} checked={form.waitedForConfirmation} onChange={(checked) => updateForm("waitedForConfirmation", checked)} />
            <CheckboxField label={text.avoidedRevengeTrading} checked={form.avoidedRevengeTrading} onChange={(checked) => updateForm("avoidedRevengeTrading", checked)} />
            <CheckboxField label={text.followedPlaybook} checked={form.followedPlaybook} onChange={(checked) => updateForm("followedPlaybook", checked)} />
            <CheckboxField label={text.stoppedAfterDailyLimit} checked={form.stoppedAfterDailyLimit} onChange={(checked) => updateForm("stoppedAfterDailyLimit", checked)} />
          </div>
        </Section>
      </div>

      <Section title={text.endOfDayReview}>
        <div className="grid gap-3 lg:grid-cols-2">
          <Field label={text.whatWentWell}>
            <textarea rows={4} value={form.whatWentWell} onChange={(event) => updateForm("whatWentWell", event.target.value)} className={textareaClass} />
          </Field>
          <Field label={text.mistakesSummary}>
            <textarea rows={4} value={form.mistakesSummary} onChange={(event) => updateForm("mistakesSummary", event.target.value)} className={textareaClass} />
          </Field>
          <Field label={text.followedPlanReview}>
            <textarea rows={4} value={form.followedPlanReview} onChange={(event) => updateForm("followedPlanReview", event.target.value)} className={textareaClass} />
          </Field>
          <Field label={text.improvementPlan}>
            <textarea rows={4} value={form.improvementPlan} onChange={(event) => updateForm("improvementPlan", event.target.value)} className={textareaClass} />
          </Field>
          <Field label={text.tomorrowPlan}>
            <textarea rows={4} value={form.tomorrowPlan} onChange={(event) => updateForm("tomorrowPlan", event.target.value)} className={textareaClass} />
          </Field>
        </div>
      </Section>
    </div>
  );
}
