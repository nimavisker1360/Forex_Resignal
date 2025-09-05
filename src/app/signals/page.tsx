"use client";

import { Button } from "@/components/ui/button";
import { SignalCard } from "@/components/ui/signal-card";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [signalTypeFilter, setSignalTypeFilter] = useState<
    "all" | "buy" | "sell"
  >("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "pair">(
    "newest"
  );
  const { t } = useLanguage();

  // Fetch signals from API
  const fetchSignals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        search: searchQuery,
        type: signalTypeFilter,
        sort: sortOrder,
        limit: "50", // Fetch more signals for client-side filtering
      });

      const response = await fetch(`/api/signals/data?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSignals(data.signals || []);
    } catch (err) {
      console.error("Error fetching signals:", err);
      setError(t("failedToLoadSignals") || "Failed to load signals");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, signalTypeFilter, sortOrder, t]);

  // Fetch signals on component mount and when filters change
  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  // Filter signals for display (additional client-side filtering if needed)
  const filteredSignals = signals;

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
                sortOrder === "newest"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-800 text-gray-300 hover:text-white"
              }`}
              onClick={() => setSortOrder("newest")}
            >
              <ArrowDownUp className="h-4 w-4" />
              {t("newest")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 px-4 ${
                signalTypeFilter === "all"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-800 text-gray-300 hover:text-white"
              }`}
              onClick={() => setSignalTypeFilter("all")}
            >
              <Filter className="h-4 w-4" />
              {t("allSignals")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 px-4 ${
                signalTypeFilter === "buy"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-800 text-gray-300 hover:text-white"
              }`}
              onClick={() => setSignalTypeFilter("buy")}
            >
              {t("buySignals")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 px-4 ${
                signalTypeFilter === "sell"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-800 text-gray-300 hover:text-white"
              }`}
              onClick={() => setSignalTypeFilter("sell")}
            >
              {t("sellSignals")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 px-4 ${
                sortOrder === "oldest"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-800 text-gray-300 hover:text-white"
              }`}
              onClick={() => setSortOrder("oldest")}
            >
              {t("oldest")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 px-4 ${
                sortOrder === "pair"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-800 text-gray-300 hover:text-white"
              }`}
              onClick={() => setSortOrder("pair")}
            >
              {t("symbolAZ")}
            </Button>
          </div>
        </div>

        {/* Signals Grid */}
        <div className="max-w-6xl mx-auto mb-12">
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
          ) : filteredSignals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSignals.map((signal) => (
                <div key={signal.id} className="h-full">
                  <SignalCard {...signal} />
                </div>
              ))}
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
