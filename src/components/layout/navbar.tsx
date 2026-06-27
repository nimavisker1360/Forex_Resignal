"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useSession } from "@/lib/auth-client";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolledAway, setIsScrolledAway] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();
  const { data: session } = useSession();

  const ctaClass =
    "h-12 rounded-md border-0 bg-gradient-to-r from-violet-600 to-pink-500 px-7 text-base font-bold text-white shadow-[0_10px_25px_rgba(168,85,247,0.28)] hover:from-violet-500 hover:to-pink-500 hover:text-white";
  const navLinkClass =
    "inline-flex items-center gap-1 text-base font-semibold text-slate-900 transition hover:text-violet-600";
  const dashboardLoadingHref = "/dashboard-loading";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledAway(window.scrollY > 72);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname !== "/") {
    return null;
  }

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white text-slate-950 shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-transform duration-300 ${
        isScrolledAway && !isMenuOpen ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="container relative z-10 mx-auto flex h-20 max-w-[1400px] items-center justify-between px-4 sm:px-6 md:px-16 lg:px-24">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl font-extrabold tracking-normal text-slate-950">
            Signal<span className="text-blue-500">Ledger</span>
          </span>
        </Link>

        <div className="hidden items-center md:flex">
          <div className="flex items-center gap-9">
            <Link href="/signals" className={navLinkClass}>
              Products <ChevronDown className="h-4 w-4" />
            </Link>
            <Link href="/premium" className={navLinkClass}>
              Pricing
            </Link>
            <Link href="/blog" className={navLinkClass}>
              {t("blog")}
            </Link>
            <Link href="/journal" className={navLinkClass}>
              Journal
            </Link>
            <Link href="/signals" className={navLinkClass}>
              {t("signals") === "signals" ? "Signals" : t("signals")}
            </Link>
            <Link href="/" className={navLinkClass}>
              {t("home")}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-5 md:flex">
            <LanguageSwitcher />
            {session ? (
              <Button asChild className={ctaClass}>
                <Link href={dashboardLoadingHref} className="flex items-center gap-2">
                  Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild className={ctaClass}>
                  <Link href={dashboardLoadingHref} className="flex items-center gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-950 hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="relative z-10 w-full border-t border-slate-200 bg-white p-4 text-left shadow-[0_16px_30px_rgba(15,23,42,0.08)] md:hidden">
          <div className="flex w-full flex-col space-y-2">
            <Link
              href="/signals"
              className="flex w-full items-center justify-between rounded-md px-4 py-3 text-slate-900 transition hover:bg-slate-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Products <ChevronDown className="h-4 w-4" />
            </Link>
            <Link
              href="/premium"
              className="w-full rounded-md px-4 py-3 text-slate-900 transition hover:bg-slate-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="w-full rounded-md px-4 py-3 text-slate-900 transition hover:bg-slate-100"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("blog")}
            </Link>
            <Link
              href="/journal"
              className="w-full rounded-md px-4 py-3 text-slate-900 transition hover:bg-slate-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Journal
            </Link>
            <Link
              href="/signals"
              className="w-full rounded-md px-4 py-3 text-slate-900 transition hover:bg-slate-100"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("signals") === "signals" ? "Signals" : t("signals")}
            </Link>
            <Link
              href="/"
              className="w-full rounded-md px-4 py-3 text-slate-900 transition hover:bg-slate-100"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("home")}
            </Link>

            <div className="flex w-full flex-col gap-3 pt-3">
              {session ? (
                <Button asChild className={`${ctaClass} w-full`}>
                  <Link
                    href={dashboardLoadingHref}
                    className="flex items-center justify-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild className={`${ctaClass} w-full`}>
                    <Link
                      href={dashboardLoadingHref}
                      className="flex items-center justify-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
              <div className="flex w-full justify-center pt-1">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
