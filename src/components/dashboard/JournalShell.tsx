"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Gauge,
  Globe2,
  LineChart,
  ListChecks,
  PlaySquare,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { DashboardSignOutButton } from "@/components/dashboard/DashboardSignOutButton";
import { DashboardThemeToggle, useDashboardTheme } from "@/components/dashboard/dashboard-theme";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { DashboardTheme } from "@/lib/dashboard-theme";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { labelKey: "dashboard.nav.dashboard", href: "/dashboard", icon: Gauge },
  { labelKey: "dashboard.nav.accounts", href: "/dashboard/accounts", icon: BriefcaseBusiness },
  { labelKey: "dashboard.nav.trades", href: "/dashboard/trades", icon: ListChecks },
  { labelKey: "dashboard.nav.calendar", href: "/journal/calendar", icon: CalendarDays },
  { labelKey: "dashboard.nav.economicCalendar", href: "/economic-calendar", icon: CalendarDays },
  { labelKey: "dashboard.nav.analytics", href: "/journal/analytics", icon: BarChart3 },
  { labelKey: "dashboard.nav.dailyJournal", href: "/dashboard/daily-journal", icon: BookOpenCheck },
  { labelKey: "dashboard.nav.playbooks", href: "/journal/playbooks", icon: PlaySquare },
  { labelKey: "dashboard.nav.reports", href: "/dashboard/reports", icon: FileText },
  { labelKey: "dashboard.nav.settings", href: "/dashboard/settings", icon: Settings },
];

const advancedSidebarItems = [
  { labelKey: "dashboard.nav.propFirms", href: "/dashboard/prop-firms", icon: ShieldCheck },
  { labelKey: "dashboard.nav.publicSite", href: "/", icon: Globe2 },
  { labelKey: "journal.nav.checklists", href: "/journal/checklists", icon: ClipboardCheck },
];

export function JournalShell({
  children,
  initialTheme = "dark",
}: {
  children: ReactNode;
  initialTheme?: DashboardTheme;
}) {
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const { theme, isDark, applyTheme } = useDashboardTheme(initialTheme);

  return (
    <section
      className={cn(
        "dashboard-shell themeable-shell min-h-screen transition-colors",
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
                <div className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-950")}>SignalMax</div>
                <div className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                  {t("dashboard.shell.tradingJournal")}
                </div>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto px-4 py-4 lg:flex-1 lg:flex-col lg:overflow-visible">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard" || item.href === "/journal"
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex h-10 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-medium transition lg:w-full",
                      isActive
                        ? isDark
                          ? "bg-blue-600/15 text-blue-100 ring-1 ring-blue-500/30"
                          : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                        : isDark
                          ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isActive
                          ? isDark
                            ? "text-blue-300"
                            : "text-blue-700"
                          : isDark
                            ? "text-slate-400"
                            : "text-slate-500"
                      )}
                    />
                    {t(item.labelKey)}
                  </Link>
                );
              })}

              <div className={cn("hidden pt-3 text-xs font-semibold uppercase tracking-wide lg:block", isDark ? "text-slate-500" : "text-slate-400")}>
                {t("dashboard.nav.advanced")}
              </div>
              {advancedSidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex h-10 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-medium transition lg:w-full",
                      isActive
                        ? isDark
                          ? "bg-blue-600/15 text-blue-100 ring-1 ring-blue-500/30"
                          : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                        : isDark
                          ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? (isDark ? "text-blue-300" : "text-blue-700") : isDark ? "text-slate-400" : "text-slate-500")} />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>

            <div
              className={cn(
                "px-4 pb-5 pt-3 lg:mt-auto lg:border-t",
                isDark ? "lg:border-slate-800" : "lg:border-slate-200"
              )}
            >
              <DashboardSignOutButton
                className={cn(
                  "h-11 w-full rounded-xl px-3",
                  isDark ? "hover:bg-red-500/10" : "hover:bg-red-50"
                )}
              />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className={cn(
              "sticky top-0 z-20 border-b shadow-sm backdrop-blur",
              isDark
                ? "border-slate-800 bg-[#020617]/90"
                : "border-blue-100 bg-gradient-to-r from-blue-50/95 via-white/95 to-cyan-50/95"
            )}
          >
            <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-6">
              <div className="min-w-0">
                <div className={cn("text-base font-extrabold", isDark ? "text-white" : "text-slate-950")}>
                  {t("dashboard.shell.workspace")}
                </div>
                <div className={cn("truncate text-sm font-medium", isDark ? "text-slate-400" : "text-slate-600")}>
                  {t("journal.shell.subtitle")}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <LanguageSwitcher />
                <DashboardThemeToggle isDark={isDark} onThemeChange={applyTheme} />
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
