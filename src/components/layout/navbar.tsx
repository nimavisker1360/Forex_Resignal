"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const ctaClass =
    "bg-blue-600 text-white border-blue-500/50 hover:bg-blue-500 hover:text-white rounded-md shadow-sm";
  const navLinkClass = "text-white hover:text-blue-300 transition";

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/journal")) {
    return null;
  }

  return (
    <nav className="relative bg-gradient-to-r from-black to-black/95 w-full z-30 border-b border-gray-800/30">
      <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 md:px-16 lg:px-24 mx-auto max-w-[1400px] relative z-10">
        {/* Left Side - Logo (EN mode) or Telegram Button & Language Switcher (FA mode) */}
        <div className="flex items-center">
          {language === "fa" ? (
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="outline"
                asChild
                className={ctaClass}
              >
                <Link
                  href="https://t.me/+uRJNzAveahQ0NjM0"
                  className="flex items-center gap-1"
                >
                  ربات تلگرام <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <LanguageSwitcher />
            </div>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <div>
                <span className="text-2xl font-bold text-white">
                  Signal<span className="text-blue-400">Max</span>
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <div
            className={`flex items-center ${
              language === "en"
                ? "space-x-reverse space-x-16 flex-row-reverse"
                : "space-x-16"
            }`}
          >
            {/* Order is important here */}
            <Link href="/" className={navLinkClass}>
              {t("home")}
            </Link>
            <Link href="/signals" className={navLinkClass}>
              {t("signals") === "signals" ? "Signals" : t("signals")}
            </Link>
            <Link href="/journal" className={navLinkClass}>
              Journal
            </Link>
            <Link href="/blog" className={navLinkClass}>
              {t("blog")}
            </Link>
            <Link href="/about" className={navLinkClass}>
              {t("about")}
            </Link>
            <Link href="/contact" className={navLinkClass}>
              {t("contact")}
            </Link>
          </div>
        </div>

        {/* Right Side - Telegram Button & Language Switcher (EN mode) or Logo (FA mode) */}
        <div className="flex items-center">
          {language === "fa" ? (
            <Link href="/" className="flex items-center gap-2">
              <div>
                <span className="text-2xl font-bold text-white">
                  <span className="text-blue-400">سیگنال</span>مکس
                </span>
              </div>
            </Link>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <LanguageSwitcher />
              <Button
                variant="outline"
                asChild
                className={ctaClass}
              >
                <Link
                  href="https://t.me/+uRJNzAveahQ0NjM0"
                  className="flex items-center gap-1"
                >
                  Telegram Bot <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-sm border-t border-gray-800/50 p-4 relative z-10 w-full text-left">
          <div
            className={`flex flex-col space-y-4 w-full ${language === "en" ? "items-end text-right" : ""}`}
          >
            <Link
              href="/"
              className="text-white hover:text-blue-300 px-4 py-2 rounded-md hover:bg-gray-900/50 transition w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("home")}
            </Link>
            <Link
              href="/blog"
              className="text-white hover:text-blue-300 px-4 py-2 rounded-md hover:bg-gray-900/50 transition w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("blog")}
            </Link>
            <Link
              href="/signals"
              className="text-white hover:text-blue-300 px-4 py-2 rounded-md hover:bg-gray-900/50 transition w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("signals") === "signals" ? "Signals" : t("signals")}
            </Link>
            <Link
              href="/journal"
              className="text-white hover:text-blue-300 px-4 py-2 rounded-md hover:bg-gray-900/50 transition w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              Journal
            </Link>
            <Link
              href="/about"
              className="text-white hover:text-blue-300 px-4 py-2 rounded-md hover:bg-gray-900/50 transition w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("about")}
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-blue-300 px-4 py-2 rounded-md hover:bg-gray-900/50 transition w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("contact")}
            </Link>
            <div
              className={`pt-2 flex flex-col space-y-2 w-full ${language === "en" ? "items-end" : ""}`}
            >
              <Button asChild className={`${ctaClass} w-full`}>
                <Link
                  href="https://t.me/+uRJNzAveahQ0NjM0"
                  className="flex items-center justify-center gap-1"
                >
                  {language === "fa" ? "ربات تلگرام" : "Telegram Bot"}{" "}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex justify-center mt-4 w-full">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
