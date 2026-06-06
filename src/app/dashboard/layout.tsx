import Link from "next/link";
import type { ReactNode } from "react";
import {
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  Gauge,
  LineChart,
  ListChecks,
  PlaySquare,
  Settings,
  ShieldCheck,
} from "lucide-react";

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Accounts", href: "/dashboard/accounts", icon: BriefcaseBusiness },
  { label: "Trades", href: "/dashboard/trades", icon: ListChecks },
  { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Daily Journal", href: "/dashboard/daily-journal", icon: BookOpenCheck },
  { label: "Playbooks", href: "/dashboard/playbooks", icon: PlaySquare },
  { label: "Prop Firms", href: "/dashboard/prop-firms", icon: ShieldCheck },
  { label: "Reports", href: "/dashboard/reports", icon: FileText },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen bg-[#020617] text-[#E5E7EB]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-slate-800 bg-[#0F172A] lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
                <LineChart className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">SignalMax</div>
                <div className="text-xs text-slate-400">Trading Journal</div>
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
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden border-t border-slate-800 p-4 lg:block">
              <div className="rounded-xl border border-slate-800 bg-[#111827] p-4">
                <div className="text-sm font-semibold text-white">Phase 1</div>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Manual trades, accounts, tags, screenshots, and review structure.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-800 bg-[#020617]/90 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-6">
              <div>
                <div className="text-sm font-semibold text-white">Journal Workspace</div>
                <div className="text-xs text-slate-400">Dark-mode trading operations dashboard</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden rounded-xl border border-slate-800 bg-[#0F172A] px-3 py-2 text-xs text-slate-400 sm:block">
                  User: demo-user
                </div>
                <Link
                  href="/"
                  className="inline-flex h-9 items-center rounded-xl border border-slate-800 px-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Public Site
                </Link>
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
