"use client";

import { SignalsTable } from "@/components/ui/signals-table";
import { MotionHeading } from "@/components/ui/motion-content";
import { useLanguage } from "@/lib/language-context";
import { useState, useEffect } from "react";

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
  profit?: number;
  volume?: number;
}

export function RecentSignals() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<string>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { t } = useLanguage();

  // Handle sorting
  const handleSort = (field: string, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);

    // Sort the signals locally
    const sortedSignals = [...signals].sort((a, b) => {
      let aValue: any = a[field as keyof Signal];
      let bValue: any = b[field as keyof Signal];

      if (field === "timestamp") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (field === "price" || field === "stopLoss") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setSignals(sortedSignals);
  };

  // Fetch recent signals from API
  useEffect(() => {
    const fetchRecentSignals = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/signals/data?limit=10&sort=newest");

        if (response.ok) {
          const data = await response.json();
          setSignals(data.signals || []);
        } else {
          console.error("API response not ok:", response.status);
        }
      } catch (err) {
        console.error("Error fetching recent signals:", err);
        // Keep empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSignals();
  }, []);

  return (
    <section className="py-16 bg-transparent relative border border-blue-500/20 rounded-3xl mx-4 my-8">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center mb-12 border-b border-gray-800 pb-6">
          <MotionHeading className="text-5xl font-bold text-white mb-6 text-center">
            {t("latestSignals")}
          </MotionHeading>
        </div>

        <div className="max-w-7xl mx-auto">
          <SignalsTable
            signals={signals}
            loading={loading}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
          />

          {/* Summary Box */}
          {signals.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-gray-800/60 to-gray-700/60 rounded-lg p-6 border border-gray-600/30 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4 text-center">
                {t("tradingSummary") || "خلاصه معاملات"}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {signals.length}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {t("totalSignals") || "کل سیگنال‌ها"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {signals.filter((s) => s.success).length}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {t("successfulTrades") || "معاملات موفق"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    {signals.filter((s) => s.success === false).length}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {t("failedTrades") || "معاملات ناموفق"}
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold mb-2 ${
                      signals.reduce((sum, s) => sum + (s.profit ?? 0), 0) >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {signals
                      .reduce((sum, s) => sum + (s.profit ?? 0), 0)
                      .toFixed(2)}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {t("totalProfit") || "کل سود/ضرر"}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-600/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      {t("successRate") || "نرخ موفقیت"}:
                    </span>
                    <span className="text-white font-medium">
                      {signals.length > 0
                        ? (
                            (signals.filter((s) => s.success).length /
                              signals.length) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      {t("averageProfit") || "میانگین سود"}:
                    </span>
                    <span className="text-white font-medium">
                      {signals.length > 0
                        ? (
                            signals.reduce(
                              (sum, s) => sum + (s.profit ?? 0),
                              0
                            ) / signals.length
                          ).toFixed(2)
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      {t("totalVolume") || "کل حجم"}:
                    </span>
                    <span className="text-white font-medium">
                      {signals
                        .reduce((sum, s) => sum + (s.volume ?? 0), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      {t("premiumSignals") || "سیگنال‌های پریمیوم"}:
                    </span>
                    <span className="text-white font-medium">
                      {signals.filter((s) => s.isPremium).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
