"use client";

import { RotateCw, WifiOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type TradingViewTheme = "light" | "dark";

type TradingViewAdvancedChartProps = {
  symbol: string;
  interval: string;
};

const WIDGET_LOAD_TIMEOUT_MS = 8000;
const MAX_AUTO_RETRIES = 2;

function getDashboardTheme(): TradingViewTheme {
  if (typeof document === "undefined") {
    return "dark";
  }

  const theme = document.documentElement.dataset.dashboardTheme;
  if (theme === "light" || theme === "dark") {
    return theme;
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function TradingViewAdvancedChart({ symbol, interval }: TradingViewAdvancedChartProps) {
  const [theme, setTheme] = useState<TradingViewTheme>(() => getDashboardTheme());
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(getDashboardTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-dashboard-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      symbol,
      interval,
      timezone: "Etc/UTC",
      theme,
      style: "1",
      locale: "en",
      toolbarbg: "F1F3F6",
      hidesidetoolbar: "0",
      symboledit: "1",
      saveimage: "1",
      withdateranges: "1",
      hideideas: "1",
      studies: "[]",
      overrides: "{}",
      studies_overrides: "{}",
      enabled_features: "[]",
      disabled_features: "[]",
      support_host: "https://www.tradingview.com",
      retry: String(retryAttempt),
    });

    return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
  }, [interval, retryAttempt, symbol, theme]);

  useEffect(() => {
    setStatus("loading");
    setRetryAttempt(0);
  }, [interval, symbol, theme]);

  useEffect(() => {
    if (status !== "loading") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (retryAttempt < MAX_AUTO_RETRIES) {
        setRetryAttempt((attempt) => attempt + 1);
        return;
      }

      setStatus("failed");
    }, WIDGET_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [retryAttempt, status]);

  const handleRetry = () => {
    setStatus("loading");
    setRetryAttempt((attempt) => attempt + 1);
  };

  return (
    <div className="relative h-[500px] min-h-[420px] w-full overflow-hidden rounded-lg bg-white dark:bg-[#0F172A] lg:h-[620px]">
      <iframe
        key={iframeSrc}
        src={iframeSrc}
        title={`${symbol} TradingView advanced chart`}
        className="h-full w-full border-0"
        allowFullScreen
        onLoad={() => setStatus("ready")}
      />
      {status === "loading" ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/80 text-sm font-medium text-slate-500 dark:bg-[#0F172A]/80 dark:text-slate-300">
          <RotateCw className="mr-2 h-4 w-4 animate-spin text-blue-500" />
          Loading TradingView chart...
        </div>
      ) : null}
      {status === "failed" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white px-6 text-center dark:bg-[#0F172A]">
          <WifiOff className="h-8 w-8 text-blue-500 dark:text-blue-300" />
          <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">TradingView chart did not load.</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            This usually happens when TradingView or its CDN is blocked, slow, or reset by the current network.
          </p>
          <Button type="button" onClick={handleRetry} className="mt-5 gap-2 rounded-xl">
            <RotateCw className="h-4 w-4" />
            Retry chart
          </Button>
        </div>
      ) : null}
    </div>
  );
}
