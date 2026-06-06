"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignalCard } from "@/components/ui/signal-card";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  MotionDiv,
  MotionHeading,
} from "@/components/ui/motion-content";
import { useLanguage } from "@/lib/language-context";
import { fetchWebsiteSignals } from "@/lib/fetch-signals";
import type { DisplaySignal } from "@/lib/signal-types";

const RECENT_SIGNALS_REFRESH_INTERVAL = 5000;

export function RecentSignals() {
  const { t } = useLanguage();
  const [recentSignals, setRecentSignals] = useState<DisplaySignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSignals = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await fetchWebsiteSignals({ limit: 3, page: 1 }, signal);

      setRecentSignals(data.signals);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.warn(
        "Recent signals are temporarily unavailable.",
        error instanceof Error ? error.message : error
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadSignals(controller.signal);

    const intervalId = window.setInterval(() => {
      loadSignals();
    }, RECENT_SIGNALS_REFRESH_INTERVAL);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [loadSignals]);

  return (
    <section className="py-14 bg-black relative">
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
        <div className="flex flex-col items-center justify-center mb-8 border-b border-gray-800 pb-6">
          <MotionHeading className="text-3xl md:text-4xl font-bold text-white mb-5 text-center">
            {t("latestSignals")}
          </MotionHeading>
          <Button
            variant="outline"
            asChild
            className="border border-blue-500/40 bg-blue-500/10 shadow-md text-blue-100 hover:text-white hover:bg-blue-500/20 px-5 py-2 mx-auto"
          >
            <Link href="/signals" className="flex items-center justify-center">
              {t("viewAllSignals") === "viewAllSignals"
                ? "View All Signals"
                : t("viewAllSignals")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {isLoading &&
            recentSignals.length === 0 &&
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[124px] animate-pulse rounded-lg border border-gray-800 bg-gray-950/80 p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 rounded bg-gray-800" />
                  <div className="h-7 w-28 rounded bg-gray-800" />
                </div>
                <div className="mt-3 h-11 rounded bg-gray-900" />
                <div className="mt-3 h-6 rounded bg-gray-800" />
              </div>
            ))}

          {recentSignals.length > 0 ? (
            recentSignals.map((signal, index) => (
              <MotionDiv
                key={signal.id}
                className="rounded-lg overflow-hidden"
                delay={index * 0.1}
              >
                <SignalCard {...signal} detailsHref="/signals" />
              </MotionDiv>
            ))
          ) : !isLoading ? (
            <div className="md:col-span-3 min-h-[120px] flex items-center justify-center text-center p-6 text-gray-400 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-800">
              {t("noSignalsFound")}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
