"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  FileText,
  Gauge,
  LineChart,
  ListChecks,
  Moon,
  PlaySquare,
  Settings,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { DashboardSignOutButton } from "@/components/dashboard/DashboardSignOutButton";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

type DashboardTheme = "dark" | "light";

const THEME_STORAGE_KEY = "signalmax-dashboard-theme";

const sidebarItems = [
  { labelKey: "dashboard.nav.dashboard", href: "/dashboard", icon: Gauge },
  { labelKey: "dashboard.nav.accounts", href: "/dashboard/accounts", icon: BriefcaseBusiness },
  { labelKey: "dashboard.nav.trades", href: "/dashboard/trades", icon: ListChecks },
  { labelKey: "dashboard.nav.calendar", href: "/journal/calendar", icon: CalendarDays },
  { labelKey: "dashboard.nav.analytics", href: "/journal/analytics", icon: BarChart3 },
  { labelKey: "dashboard.nav.dailyJournal", href: "/dashboard/daily-journal", icon: BookOpenCheck },
  { labelKey: "dashboard.nav.playbooks", href: "/journal/playbooks", icon: PlaySquare },
  { labelKey: "dashboard.nav.propFirms", href: "/dashboard/prop-firms", icon: ShieldCheck },
  { labelKey: "dashboard.nav.reports", href: "/dashboard/reports", icon: FileText },
  { labelKey: "dashboard.nav.publicSite", href: "/", icon: ExternalLink },
  { labelKey: "dashboard.nav.settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardShell({ children, showAdmin = false }: { children: ReactNode; showAdmin?: boolean }) {
  const [theme, setTheme] = useState<DashboardTheme>("dark");
  const { language, t } = useLanguage();

  const applyTheme = useCallback((nextTheme: DashboardTheme) => {
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    document.documentElement.dataset.dashboardTheme = nextTheme;
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  const isDark = theme === "dark";

  const themeButtonClass = useMemo(
    () =>
      "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
    []
  );

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    applyTheme(savedTheme === "light" ? "light" : "dark");
  }, [applyTheme]);

  return (
    <section
      className={cn(
        "dashboard-shell min-h-screen transition-colors",
        isDark ? "dark bg-[#020617] text-[#E5E7EB]" : "bg-slate-50 text-slate-950"
      )}
      data-dashboard-theme={theme}
      dir={language === "fa" ? "rtl" : "ltr"}
    >
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside
          className={cn(
            "border-b lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r",
            isDark ? "border-slate-800 bg-[#0F172A]" : "border-slate-200 bg-white"
          )}
        >
          <div className="flex h-full flex-col">
            <div
              className={cn(
                "flex h-16 items-center gap-3 border-b px-6",
                isDark ? "border-slate-800" : "border-slate-200"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  isDark ? "bg-blue-600/15 text-blue-400" : "bg-blue-50 text-blue-700"
                )}
              >
                <LineChart className="h-5 w-5" />
              </div>
              <div>
                <div className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-950")}>
                  SignalMax
                </div>
                <div className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                  {t("dashboard.shell.tradingJournal")}
                </div>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto px-4 py-4 lg:flex-1 lg:flex-col lg:overflow-visible">
              {[...sidebarItems, ...(showAdmin ? [{ labelKey: "dashboard.nav.admin", href: "/admin/dashboard", icon: ShieldCheck }] : [])].map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex h-10 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-medium transition lg:w-full",
                      isDark
                        ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isDark ? "text-slate-400" : "text-slate-500")} />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
              <DashboardSignOutButton className="h-10 w-auto shrink-0 rounded-xl px-3 lg:w-full" />
            </nav>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className={cn(
              "sticky top-0 z-20 border-b backdrop-blur",
              isDark ? "border-slate-800 bg-[#020617]/90" : "border-slate-200 bg-white/90"
            )}
          >
            <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-6">
              <div className="min-w-0">
                <div className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-950")}>
                  {t("dashboard.shell.workspace")}
                </div>
                <div className={cn("truncate text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                  {t("dashboard.shell.subtitle")}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <LanguageSwitcher />
                <div
                  className={cn(
                    "flex rounded-xl border p-1",
                    isDark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-slate-100"
                  )}
                  aria-label={t("dashboard.shell.theme")}
                >
                  <button
                    type="button"
                    aria-pressed={!isDark}
                    onClick={() => applyTheme("light")}
                    className={cn(
                      themeButtonClass,
                      !isDark
                        ? "border-white bg-white text-slate-950 shadow-sm"
                        : "border-transparent text-slate-400 hover:text-white"
                    )}
                  >
                    <Sun className="h-4 w-4" />
                    {t("dashboard.shell.light")}
                  </button>
                  <button
                    type="button"
                    aria-pressed={isDark}
                    onClick={() => applyTheme("dark")}
                    className={cn(
                      themeButtonClass,
                      isDark
                        ? "border-slate-700 bg-slate-800 text-white shadow-sm"
                        : "border-transparent text-slate-500 hover:text-slate-950"
                    )}
                  >
                    <Moon className="h-4 w-4" />
                    {t("dashboard.shell.dark")}
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-6">
            {children}
          </main>
        </div>
      </div>
    </section>
  );
}
