"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, language } = useLanguage();

  return (
    <nav className="relative bg-gradient-to-r from-black to-black/95 w-full z-30 border-b border-gray-800/30">
      <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 md:px-16 lg:px-24 mx-auto max-w-[1400px] relative z-10">
        {/* Left Side - Logo (EN mode) or Mobile Menu + Language Switcher + Logo (FA mode) */}
        <div className="flex items-center">
          {language === "fa" ? (
            <>
              {/* Mobile Menu Button for Persian - Left side of container */}
              <div className="flex items-center md:hidden mr-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white"
                >
                  {isMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <LanguageSwitcher />
                <Button
                  variant="outline"
                  asChild
                  className="bg-blue-600/80 text-white border-blue-700/30 hover:bg-blue-700/50 rounded-lg"
                >
                  <Link
                    href="https://t.me/+uRJNzAveahQ0NjM0"
                    className="flex items-center gap-1"
                  >
                    ربات تلگرام <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
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
            <Link
              href="/"
              className="text-white hover:text-blue-300 transition"
            >
              {t("home")}
            </Link>
            <Link
              href="/blog"
              className="text-white hover:text-blue-300 transition"
            >
              {t("blog")}
            </Link>
            <Link
              href="/about"
              className="text-white hover:text-blue-300 transition"
            >
              {t("about")}
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-blue-300 transition"
            >
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
            <>
              <div className="hidden md:flex items-center space-x-4">
                <LanguageSwitcher />
                <Button
                  variant="outline"
                  asChild
                  className="bg-blue-600/80 text-white border-blue-700/30 hover:bg-blue-700/50 rounded-lg"
                >
                  <Link
                    href="https://t.me/+uRJNzAveahQ0NjM0"
                    className="flex items-center gap-1"
                  >
                    Telegram Bot <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              {/* Mobile Menu Button for English - Right side */}
              <div className="flex items-center md:hidden ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white"
                >
                  {isMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden bg-black/95 backdrop-blur-sm border-t border-gray-800/50 p-4 relative z-10 w-full transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen
            ? "max-h-screen opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-4"
        } ${language === "fa" ? "text-right" : "text-left"}`}
      >
        <div
          className={`flex flex-col space-y-4 w-full ${language === "fa" ? "items-end" : "items-start"}`}
        >
          {/* Home Link with Language Switcher */}
          <div className="w-full">
            <div className="flex items-center justify-between w-full">
              <Link
                href="/"
                className={`text-white hover:text-blue-300 px-4 py-2 rounded-md hover:bg-gray-900/50 transition-all duration-300 ease-out transform ${
                  isMenuOpen
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-4 opacity-0"
                } ${language === "fa" ? "text-right" : "text-left"} flex-1`}
                style={{
                  transitionDelay: isMenuOpen ? "100ms" : "0ms",
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("home")}
              </Link>

              {/* Language Switcher - Top Right */}
              <div
                className={`transition-all duration-300 ease-out transform ${
                  isMenuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
                style={{
                  transitionDelay: isMenuOpen ? "100ms" : "0ms",
                }}
              >
                <LanguageSwitcher />
              </div>
            </div>
          </div>
          <Link
            href="/blog"
            className={`text-white hover:text-blue-300 px-4 py-2 rounded-md hover:bg-gray-900/50 transition-all duration-300 ease-out transform ${
              isMenuOpen
                ? "translate-y-0 opacity-100"
                : "-translate-y-4 opacity-0"
            } ${language === "fa" ? "text-right" : "text-left"} w-full`}
            style={{
              transitionDelay: isMenuOpen ? "150ms" : "0ms",
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            {t("blog")}
          </Link>
          <Link
            href="/about"
            className={`text-white hover:text-blue-300 px-4 py-2 rounded-md hover:bg-gray-900/50 transition-all duration-300 ease-out transform ${
              isMenuOpen
                ? "translate-y-0 opacity-100"
                : "-translate-y-4 opacity-0"
            } ${language === "fa" ? "text-right" : "text-left"} w-full`}
            style={{
              transitionDelay: isMenuOpen ? "200ms" : "0ms",
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            {t("about")}
          </Link>
          <Link
            href="/contact"
            className={`text-white hover:text-blue-300 px-4 py-2 rounded-md hover:bg-gray-900/50 transition-all duration-300 ease-out transform ${
              isMenuOpen
                ? "translate-y-0 opacity-100"
                : "-translate-y-4 opacity-0"
            } ${language === "fa" ? "text-right" : "text-left"} w-full`}
            style={{
              transitionDelay: isMenuOpen ? "250ms" : "0ms",
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            {t("contact")}
          </Link>
          <div
            className={`pt-2 flex flex-col space-y-2 w-full transition-all duration-300 ease-out transform ${
              isMenuOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            } ${language === "fa" ? "items-end" : "items-start"}`}
            style={{
              transitionDelay: isMenuOpen ? "300ms" : "0ms",
            }}
          >
            <Button asChild className="bg-blue-600/80 text-white w-full">
              <Link
                href="https://t.me/+uRJNzAveahQ0NjM0"
                className="flex items-center justify-center gap-1"
              >
                {language === "fa" ? "ربات تلگرام" : "Telegram Bot"}{" "}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
