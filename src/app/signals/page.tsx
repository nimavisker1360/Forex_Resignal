"use client";

import { Button } from "@/components/ui/button";
import { SignalCard } from "@/components/ui/signal-card";
import { MonthlySignalsTable } from "@/components/ui/monthly-signals-table";
import type { MonthlySignal } from "@/components/ui/monthly-signals-table";
import { DailySignalsTable } from "@/components/ui/daily-signals-table";
import type { DailySignal } from "@/components/ui/daily-signals-table";
import { SearchIcon, Filter, ArrowDownUp, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { MotionDiv } from "@/components/ui/motion-content";
import { useLanguage } from "@/lib/language-context";

// Define types for signal data
interface Signal {
  id: string;
  pair: string;
  type: "buy" | "sell";
  price: number;
  takeProfit: number[];
  stopLoss: number;
  timestamp: string;
  success?: boolean;
  isPremium: boolean;
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [monthlySignals, setMonthlySignals] = useState<MonthlySignal[]>([]);
  const [dailySignals, setDailySignals] = useState<DailySignal[]>([]);
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [dailyTotalProfit, setDailyTotalProfit] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<
    "daily" | "weekly" | "monthly" | "all"
  >("all");
  const { t } = useLanguage();

  // Fetch signals from API
  const fetchSignals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (timeFilter === "monthly") {
        // Fetch monthly signals
        const params = new URLSearchParams({
          search: searchQuery,
          limit: "50",
        });

        const response = await fetch(`/api/signals/monthly?${params}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error ||
            errorData.details ||
            `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setMonthlySignals(data.signals || []);
        setTotalProfit(data.totalProfit || 0);
        setSignals([]); // Clear regular signals when showing monthly
        setDailySignals([]); // Clear daily signals
        setDailyTotalProfit(0);
      } else if (timeFilter === "daily") {
        // Fetch daily signals
        const params = new URLSearchParams({
          search: searchQuery,
          limit: "50",
        });

        const response = await fetch(`/api/signals/daily?${params}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error ||
            errorData.details ||
            `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setDailySignals(data.signals || []);
        setDailyTotalProfit(data.totalProfit || 0);
        setSignals([]); // Clear regular signals
        setMonthlySignals([]); // Clear monthly signals
        setTotalProfit(0);
      } else if (timeFilter === "all") {
        // Fetch regular signals only for "all" filter
        const params = new URLSearchParams({
          search: searchQuery,
          timeFilter: timeFilter,
          limit: "50",
        });

        const response = await fetch(`/api/signals/data?${params}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error ||
            errorData.details ||
            `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setSignals(data.signals || []);
        setMonthlySignals([]); // Clear monthly signals when showing regular
        setDailySignals([]); // Clear daily signals
        setTotalProfit(0);
        setDailyTotalProfit(0);
      } else {
        // For weekly filter, clear all signals
        setSignals([]);
        setMonthlySignals([]);
        setDailySignals([]);
        setTotalProfit(0);
        setDailyTotalProfit(0);
      }
    } catch (err) {
      console.error("Error fetching signals:", err);
      setError(t("failedToLoadSignals") || "Failed to load signals");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, timeFilter, t]);

  // Fetch signals on component mount and when filters change
  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  // Filter signals for display (additional client-side filtering if needed)
  const filteredSignals = signals;
  const isMonthlyView = timeFilter === "monthly";
  const isDailyView = timeFilter === "daily";
  const isWeeklyView = timeFilter === "weekly";
  const isAllView = timeFilter === "all";

  // Only show cards for "all" filter, hide cards for daily, weekly, monthly
  const shouldShowCards = false; // Disabled cards for all views

  return (
    <div className="bg-black text-white relative">
      <div
        className="absolute inset-0 mx-auto bg-[url('/images/back.jpg')] bg-no-repeat bg-center opacity-20 z-0"
        style={{
          width: "100%",
          height: "100%",
          backgroundSize: "cover",
        }}
      ></div>
      <div className="max-w-screen-xl mx-auto px-4 py-16 relative z-10">
        <MotionDiv className="flex justify-center items-center mb-8">
          <h1 className="text-4xl font-bold">{t("forexSignals")}</h1>
        </MotionDiv>

        {/* Search and filters */}
        <div className="flex flex-col mb-10 mx-auto max-w-5xl">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("signalSearch")}
                className="w-full h-10 pr-3 pl-10 rounded-md border border-gray-800 bg-gray-900 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter buttons row */}
          <div className="flex flex-row gap-2 overflow-x-auto pb-1">
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 px-4 ${
                timeFilter === "daily"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-800 text-gray-300 hover:text-white"
              }`}
              onClick={() => setTimeFilter("daily")}
            >
              <Filter className="h-4 w-4" />
              {t("daily")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 px-4 ${
                timeFilter === "weekly"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-800 text-gray-300 hover:text-white"
              }`}
              onClick={() => setTimeFilter("weekly")}
            >
              <Filter className="h-4 w-4" />
              {t("weekly")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 px-4 ${
                timeFilter === "monthly"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-800 text-gray-300 hover:text-white"
              }`}
              onClick={() => setTimeFilter("monthly")}
            >
              <Filter className="h-4 w-4" />
              {t("monthly")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 px-4 ${
                timeFilter === "all"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-800 text-gray-300 hover:text-white"
              }`}
              onClick={() => setTimeFilter("all")}
            >
              <Filter className="h-4 w-4" />
              {t("allSignals")}
            </Button>
          </div>
        </div>

        {/* Signals Display */}
        <div className="max-w-7xl mx-auto mb-12">
          {loading ? (
            <div className="min-h-[400px] flex items-center justify-center text-center p-8">
              <div>
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-500" />
                <p className="text-lg text-gray-300">
                  {t("loadingSignals") || "Loading signals..."}
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="min-h-[300px] flex items-center justify-center text-center p-8 text-red-400 bg-red-900/20 backdrop-blur-sm rounded-lg border border-red-800 w-full">
              <div>
                <p className="text-lg mb-4">{error}</p>
                <Button
                  onClick={fetchSignals}
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  {t("tryAgain") || "Try Again"}
                </Button>
              </div>
            </div>
          ) : isMonthlyView && monthlySignals.length > 0 ? (
            // Show monthly signals table
            <MonthlySignalsTable
              signals={monthlySignals}
              loading={loading}
              totalProfit={totalProfit}
            />
          ) : isMonthlyView && monthlySignals.length === 0 ? (
            // Show empty state for monthly view
            <div className="min-h-[300px] flex items-center justify-center text-center p-8 text-gray-400 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-800 w-full">
              <div>
                <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No monthly signals found</p>
                <p className="text-sm mt-2 text-gray-500">
                  Loading monthly data...
                </p>
              </div>
            </div>
          ) : isDailyView && dailySignals.length > 0 ? (
            // Show daily signals table
            <DailySignalsTable
              signals={dailySignals}
              loading={loading}
              totalProfit={dailyTotalProfit}
            />
          ) : isDailyView && dailySignals.length === 0 ? (
            // Show empty state for daily view
            <div className="min-h-[300px] flex items-center justify-center text-center p-8 text-gray-400 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-800 w-full">
              <div>
                <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No daily signals found</p>
                <p className="text-sm mt-2 text-gray-500">
                  Loading daily data...
                </p>
              </div>
            </div>
          ) : isWeeklyView ? (
            // Show empty state for weekly view
            <div className="min-h-[300px] flex items-center justify-center text-center p-8 text-gray-400 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-800 w-full">
              <div>
                <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">
                  {t("noWeeklySignalsFound") || "No weekly signals found"}
                </p>
                <p className="text-sm mt-2 text-gray-500">
                  {t("weeklySignalsNotAvailable") ||
                    "Weekly signals are not available yet"}
                </p>
              </div>
            </div>
          ) : isAllView ? (
            // Show empty state for all signals view
            <div className="min-h-[300px] flex items-center justify-center text-center p-8 text-gray-400 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-800 w-full">
              <div>
                <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">
                  {t("noAllSignalsFound") || "No signals found"}
                </p>
                <p className="text-sm mt-2 text-gray-500">
                  {t("allSignalsNotAvailable") ||
                    "All signals are not available yet"}
                </p>
              </div>
            </div>
          ) : (
            <div className="min-h-[300px] flex items-center justify-center text-center p-8 text-gray-400 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-800 w-full">
              <div>
                <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">{t("noSignalsFound")}</p>
                <p className="text-sm mt-2 text-gray-500">
                  {t("tryDifferentPair")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
