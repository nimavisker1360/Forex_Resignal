"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

export type DashboardTheme = "dark" | "light";

const THEME_STORAGE_KEY = "signalmax-dashboard-theme";

export function useDashboardTheme() {
  const [theme, setTheme] = useState<DashboardTheme>("dark");

  const applyTheme = useCallback((nextTheme: DashboardTheme) => {
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    document.documentElement.dataset.dashboardTheme = nextTheme;
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    applyTheme(savedTheme === "light" ? "light" : "dark");
  }, [applyTheme]);

  return {
    theme,
    isDark: theme === "dark",
    applyTheme,
  };
}

export function DashboardThemeToggle({
  className,
  isDark,
  onThemeChange,
}: {
  className?: string;
  isDark: boolean;
  onThemeChange: (theme: DashboardTheme) => void;
}) {
  const { t } = useLanguage();

  const themeButtonClass = useMemo(
    () =>
      "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
    []
  );

  return (
    <div
      className={cn(
        "flex rounded-xl border p-1",
        isDark
          ? "border-slate-800 bg-slate-950"
          : "border-slate-200 bg-white shadow-sm",
        className
      )}
      aria-label={t("dashboard.shell.theme")}
    >
      <button
        type="button"
        aria-pressed={!isDark}
        onClick={() => onThemeChange("light")}
        className={cn(
          themeButtonClass,
          !isDark
            ? "bg-slate-100 text-slate-950"
            : "text-slate-400 hover:bg-slate-900 hover:text-white"
        )}
      >
        <Sun className="h-4 w-4" />
        {t("dashboard.shell.light")}
      </button>
      <button
        type="button"
        aria-pressed={isDark}
        onClick={() => onThemeChange("dark")}
        className={cn(
          themeButtonClass,
          isDark
            ? "bg-slate-800 text-white"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
        )}
      >
        <Moon className="h-4 w-4" />
        {t("dashboard.shell.dark")}
      </button>
    </div>
  );
}
