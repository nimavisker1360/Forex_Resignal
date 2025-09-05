"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignalCard } from "@/components/ui/signal-card";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  MotionDiv,
  MotionStaggerContainer,
  MotionStaggerItem,
  MotionHeading,
} from "@/components/ui/motion-content";
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
}

export function RecentSignals() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Fetch recent signals from API
  useEffect(() => {
    const fetchRecentSignals = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/signals/data?limit=3&sort=newest");

        if (response.ok) {
          const data = await response.json();
          setSignals(data.signals || []);
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
    <section className="py-16 bg-black relative">
      <div
        className="absolute inset-0 mx-auto my-auto bg-[url('/images/back.jpg')] bg-contain bg-center opacity-20 z-0"
        style={{
          width: "100%",
          height: "100%",
          top: "0%",
          left: "0%",
          transform: "rotate(8deg) scale(1.2)",
        }}
      ></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center mb-12 border-b border-gray-800 pb-6">
          <MotionHeading className="text-5xl font-bold text-white mb-6 text-center">
            {t("latestSignals")}
          </MotionHeading>
          <Button
            variant="outline"
            asChild
            className="border border-gray-700 shadow-md text-gray-300 hover:text-white hover:bg-gray-800 px-6 py-2 mb-8 mx-auto"
          >
            <Link href="/signals" className="flex items-center justify-center">
              {t("viewAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {signals.map((signal, index) => (
              <MotionDiv
                key={signal.id}
                className="rounded-lg overflow-hidden shadow-lg"
                delay={index * 0.1}
              >
                <SignalCard {...signal} />
              </MotionDiv>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
