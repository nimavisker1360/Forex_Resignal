"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Gauge,
  LineChart,
  ListChecks,
  PlaySquare,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const sidebarItems = [
  { labelKey: "dashboard.nav.dashboard", href: "/dashboard", icon: Gauge },
  { labelKey: "dashboard.nav.accounts", href: "/dashboard/accounts", icon: BriefcaseBusiness },
  { labelKey: "dashboard.nav.trades", href: "/journal", icon: ListChecks },
  { labelKey: "journal.nav.checklists", href: "/journal/checklists", icon: ClipboardCheck },
  { labelKey: "dashboard.nav.calendar", href: "/journal/calendar", icon: CalendarDays },
  { labelKey: "dashboard.nav.analytics", href: "/journal/analytics", icon: BarChart3 },
  { labelKey: "dashboard.nav.dailyJournal", href: "/dashboard/daily-journal", icon: BookOpenCheck },
  { labelKey: "dashboard.nav.playbooks", href: "/journal/playbooks", icon: PlaySquare },
  { labelKey: "dashboard.nav.propFirms", href: "/dashboard/prop-firms", icon: ShieldCheck },
  { labelKey: "dashboard.nav.reports", href: "/dashboard/reports", icon: FileText },
  { labelKey: "dashboard.nav.settings", href: "/dashboard/settings", icon: Settings },
];

export function JournalShell({
  children,
}: {
  children: ReactNode;
}) {
  const { language, t } = useLanguage();

  return (
    <section className="min-h-screen bg-[#020617] text-[#E5E7EB]" dir={language === "fa" ? "rtl" : "ltr"}>
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-slate-800 bg-[#0F172A] lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
                <LineChart className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">SignalMax</div>
                <div className="text-xs text-slate-400">{t("dashboard.shell.tradingJournal")}</div>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto px-4 py-4 lg:flex-1 lg:flex-col lg:overflow-visible">
              {sidebarItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex h-10 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white lg:w-full"
                  >
                    <Icon className="h-4 w-4 text-slate-400" />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-800 bg-[#020617]/90 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-6">
              <div>
                <div className="text-sm font-semibold text-white">{t("dashboard.shell.workspace")}</div>
                <div className="text-xs text-slate-400">{t("journal.shell.subtitle")}</div>
              </div>
              <Link
                href="/"
                className="inline-flex h-9 items-center rounded-xl border border-slate-800 px-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                {t("dashboard.nav.publicSite")}
              </Link>
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
