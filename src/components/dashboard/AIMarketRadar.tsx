"use client";

import { Activity, BrainCircuit, LineChart, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { TradingViewAdvancedChart } from "@/components/dashboard/TradingViewAdvancedChart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SymbolOption = {
  value: string;
  label: string;
};

type TimeframeOption = {
  value: string;
  label: string;
};

const SYMBOL_OPTIONS: SymbolOption[] = [
  { value: "OANDA:XAUUSD", label: "XAUUSD / Gold" },
  { value: "OANDA:EURUSD", label: "EURUSD" },
  { value: "OANDA:GBPUSD", label: "GBPUSD" },
  { value: "OANDA:USDJPY", label: "USDJPY" },
  { value: "OANDA:AUDUSD", label: "AUDUSD" },
  { value: "OANDA:USDCAD", label: "USDCAD" },
  { value: "OANDA:EURJPY", label: "EURJPY" },
  { value: "OANDA:GBPJPY", label: "GBPJPY" },
  { value: "BINANCE:BTCUSDT", label: "BTCUSD / Bitcoin" },
  { value: "BINANCE:ETHUSDT", label: "ETHUSD / Ethereum" },
  { value: "CAPITALCOM:US100", label: "NAS100" },
  { value: "CAPITALCOM:US30", label: "US30" },
  { value: "TVC:DXY", label: "DXY" },
];

const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { label: "M5", value: "5" },
  { label: "M15", value: "15" },
  { label: "H1", value: "60" },
  { label: "H4", value: "240" },
  { label: "D1", value: "D" },
];

export function AIMarketRadar() {
  const [selectedSymbol, setSelectedSymbol] = useState("OANDA:XAUUSD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("60");

  const selectedSymbolLabel = useMemo(
    () => SYMBOL_OPTIONS.find((option) => option.value === selectedSymbol)?.label ?? selectedSymbol,
    [selectedSymbol]
  );
  const selectedTimeframeLabel = useMemo(
    () => TIMEFRAME_OPTIONS.find((option) => option.value === selectedTimeframe)?.label ?? selectedTimeframe,
    [selectedTimeframe]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">AI Market Radar</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Live chart and AI-assisted market analysis for selected symbols.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
          <Activity className="h-4 w-4" />
          {selectedSymbolLabel} - {selectedTimeframeLabel}
        </div>
      </div>

      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0F172A] md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Symbol</span>
          <select
            value={selectedSymbol}
            onChange={(event) => setSelectedSymbol(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-[#111827] dark:text-white"
          >
            {SYMBOL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div>
          <div className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Timeframe</div>
          <div className="mt-2 grid grid-cols-5 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-[#111827]">
            {TIMEFRAME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedTimeframe(option.value)}
                className={cn(
                  "h-9 rounded-lg px-2 text-xs font-semibold transition",
                  selectedTimeframe === option.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
            <LineChart className="h-4 w-4 text-blue-500 dark:text-blue-300" />
            TradingView Advanced Chart
          </div>
          <TradingViewAdvancedChart symbol={selectedSymbol} interval={selectedTimeframe} />
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0F172A] lg:sticky lg:top-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Gemini AI Analysis</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Ready to analyze the selected symbol and timeframe.
              </p>
            </div>
          </div>

          <Button type="button" className="mt-6 h-11 w-full gap-2 rounded-xl">
            <Sparkles className="h-4 w-4" />
            Analyze with AI
          </Button>

          <p className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
            AI analysis is for educational purposes only and does not execute trades.
          </p>
        </aside>
      </section>
    </div>
  );
}
