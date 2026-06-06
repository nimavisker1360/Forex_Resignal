"use client";

import type { FormEvent } from "react";
import type {
  TagDto,
  TradeDto,
  TradingAccountDto,
} from "@/components/dashboard/types";

type TradePayload = Record<string, string | string[]>;

function toDateTimeValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}

export function TradeForm({
  trade,
  accounts,
  tags,
  defaultStatus,
  onSubmit,
  onCancel,
}: {
  trade?: TradeDto | null;
  accounts: TradingAccountDto[];
  tags: TagDto[];
  defaultStatus?: "OPEN" | "CLOSED" | "CANCELLED";
  onSubmit: (payload: TradePayload) => Promise<void>;
  onCancel?: () => void;
}) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const selectedTagIds = formData
      .getAll("tagIds")
      .map(String)
      .filter(Boolean);
    const payload: TradePayload = {
      accountId: String(formData.get("accountId") || ""),
      symbol: String(formData.get("symbol") || ""),
      direction: String(formData.get("direction") || "BUY"),
      status: String(formData.get("status") || "OPEN"),
      entryPrice: String(formData.get("entryPrice") || ""),
      exitPrice: String(formData.get("exitPrice") || ""),
      stopLoss: String(formData.get("stopLoss") || ""),
      takeProfit: String(formData.get("takeProfit") || ""),
      lotSize: String(formData.get("lotSize") || ""),
      riskAmount: String(formData.get("riskAmount") || ""),
      profitLoss: String(formData.get("profitLoss") || ""),
      rr: String(formData.get("rr") || ""),
      setup: String(formData.get("setup") || ""),
      session: String(formData.get("session") || ""),
      emotion: String(formData.get("emotion") || ""),
      mistake: String(formData.get("mistake") || ""),
      notes: String(formData.get("notes") || ""),
      openedAt: String(formData.get("openedAt") || ""),
      closedAt: String(formData.get("closedAt") || ""),
      tagIds: selectedTagIds,
    };

    await onSubmit(payload);
  }

  const selectedTags = new Set(trade?.tags?.map((item) => item.tagId) || []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          Account
          <select
            name="accountId"
            required
            defaultValue={trade?.accountId || accounts[0]?.id || ""}
            className="h-10 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          Symbol
          <input
            name="symbol"
            required
            defaultValue={trade?.symbol || ""}
            placeholder="EURUSD"
            className="h-10 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm uppercase text-[#E5E7EB] outline-none focus:border-blue-600"
          />
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          Direction
          <select
            name="direction"
            required
            defaultValue={trade?.direction || "BUY"}
            className="h-10 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          Status
          <select
            name="status"
            defaultValue={defaultStatus || trade?.status || "OPEN"}
            className="h-10 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          >
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </label>
        {[
          ["entryPrice", "Entry Price", "0.00001"],
          ["exitPrice", "Exit Price", "0.00001"],
          ["stopLoss", "Stop Loss", "0.00001"],
          ["takeProfit", "Take Profit", "0.00001"],
          ["lotSize", "Lot Size", "0.01"],
          ["riskAmount", "Risk Amount", "0.01"],
          ["profitLoss", "Profit/Loss", "0.01"],
          ["rr", "R/R", "0.01"],
        ].map(([name, label, step]) => (
          <label key={name} className="space-y-1 text-xs font-medium uppercase text-slate-400">
            {label}
            <input
              name={name}
              type="number"
              step={step}
              defaultValue={trade?.[name as keyof TradeDto] ? String(trade[name as keyof TradeDto]) : ""}
              className="h-10 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            />
          </label>
        ))}
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          Opened At
          <input
            name="openedAt"
            type="datetime-local"
            defaultValue={toDateTimeValue(trade?.openedAt)}
            className="h-10 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          />
        </label>
        <label className="space-y-1 text-xs font-medium uppercase text-slate-400">
          Closed At
          <input
            name="closedAt"
            type="datetime-local"
            defaultValue={toDateTimeValue(trade?.closedAt)}
            className="h-10 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {[
          ["setup", "Setup"],
          ["session", "Session"],
          ["emotion", "Emotion"],
          ["mistake", "Mistake"],
        ].map(([name, label]) => (
          <label key={name} className="space-y-1 text-xs font-medium uppercase text-slate-400">
            {label}
            <input
              name={name}
              defaultValue={String(trade?.[name as keyof TradeDto] || "")}
              className="h-10 w-full rounded-xl border border-slate-800 bg-[#111827] px-3 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
            />
          </label>
        ))}
      </div>

      <label className="block space-y-1 text-xs font-medium uppercase text-slate-400">
        Notes
        <textarea
          name="notes"
          defaultValue={trade?.notes || ""}
          rows={4}
          className="w-full rounded-xl border border-slate-800 bg-[#111827] px-3 py-2 text-sm normal-case text-[#E5E7EB] outline-none focus:border-blue-600"
        />
      </label>

      <div className="space-y-2">
        <div className="text-xs font-medium uppercase text-slate-400">Tags</div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label
              key={tag.id}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-800 bg-[#111827] px-3 py-2 text-sm text-gray-200"
            >
              <input
                name="tagIds"
                type="checkbox"
                value={tag.id}
                defaultChecked={selectedTags.has(tag.id)}
                className="h-4 w-4"
              />
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: tag.color || "#60a5fa" }}
              />
              {tag.name}
            </label>
          ))}
          {tags.length === 0 ? (
            <span className="text-sm text-slate-400">No tags yet</span>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center rounded-xl border border-slate-800 px-4 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Save Trade
        </button>
      </div>
    </form>
  );
}
