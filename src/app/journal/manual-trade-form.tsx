"use client";

import { useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
      {label}
      {children}
    </label>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600";
const textareaClass =
  "w-full rounded-lg border border-slate-800 bg-[#111827] px-3 py-2 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600";

function formValue(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text ? text : undefined;
}

export function ManualTradeForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submitTrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      symbol: formValue(formData.get("symbol")),
      side: formValue(formData.get("side")),
      entryPrice: formValue(formData.get("entryPrice")),
      exitPrice: formValue(formData.get("exitPrice")),
      stopLoss: formValue(formData.get("stopLoss")),
      takeProfit: formValue(formData.get("takeProfit")),
      lotSize: formValue(formData.get("lotSize")),
      riskAmount: formValue(formData.get("riskAmount")),
      profitLoss: formValue(formData.get("profitLoss")),
      entryTime: formValue(formData.get("entryTime")),
      exitTime: formValue(formData.get("exitTime")),
      status: formValue(formData.get("status")),
      strategy: formValue(formData.get("strategy")),
      setup: formValue(formData.get("setup")),
      emotion: formValue(formData.get("emotion")),
      mistakes: formValue(formData.get("mistakes")),
      notes: formValue(formData.get("notes")),
    };

    try {
      const response = await fetch("/api/journal/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(
          Array.isArray(data.errors) ? data.errors.join(", ") : data.message
        );
        return;
      }

      toast.success("Trade created");
      formRef.current?.reset();
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to create trade");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500"
      >
        {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {open ? "Close" : "New Trade"}
      </button>

      {open && (
        <form
          ref={formRef}
          onSubmit={submitTrade}
          className="rounded-lg border border-slate-800 bg-[#0F172A] p-4 shadow-sm"
        >
          <div className="grid gap-3 md:grid-cols-4">
            <Field label="Symbol">
              <input name="symbol" required placeholder="XAUUSD" className={inputClass} />
            </Field>
            <Field label="Side">
              <select name="side" required defaultValue="BUY" className={inputClass}>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </Field>
            <Field label="Entry Price">
              <input name="entryPrice" required type="number" step="any" className={inputClass} />
            </Field>
            <Field label="Exit Price">
              <input name="exitPrice" type="number" step="any" className={inputClass} />
            </Field>
            <Field label="Stop Loss">
              <input name="stopLoss" type="number" step="any" className={inputClass} />
            </Field>
            <Field label="Take Profit">
              <input name="takeProfit" type="number" step="any" className={inputClass} />
            </Field>
            <Field label="Lot Size">
              <input name="lotSize" type="number" step="any" className={inputClass} />
            </Field>
            <Field label="Risk Amount">
              <input name="riskAmount" type="number" step="any" className={inputClass} />
            </Field>
            <Field label="PnL">
              <input name="profitLoss" type="number" step="any" className={inputClass} />
            </Field>
            <Field label="Entry Time">
              <input name="entryTime" required type="datetime-local" className={inputClass} />
            </Field>
            <Field label="Exit Time">
              <input name="exitTime" type="datetime-local" className={inputClass} />
            </Field>
            <Field label="Status">
              <select name="status" defaultValue="OPEN" className={inputClass}>
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </Field>
            <Field label="Strategy">
              <input name="strategy" placeholder="SMC + EMA" className={inputClass} />
            </Field>
            <Field label="Setup">
              <input name="setup" placeholder="Order Block" className={inputClass} />
            </Field>
            <Field label="Emotion">
              <input name="emotion" placeholder="Calm" className={inputClass} />
            </Field>
            <Field label="Mistakes">
              <input name="mistakes" placeholder="None" className={inputClass} />
            </Field>
          </div>

          <div className="mt-3">
            <Field label="Notes">
              <textarea name="notes" rows={3} className={textareaClass} />
            </Field>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
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
              {saving ? "Saving" : "Save Trade"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
