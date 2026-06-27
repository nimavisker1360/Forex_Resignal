"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecentSignals } from "@/components/RecentSignals";
import { Testimonials } from "@/components/Testimonials";
import Image from "next/image";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ClipboardCheck,
  ShieldCheck,
  BarChart3,
  FileCheck2,
  PlayCircle,
  Sparkles,
  Users,
  Eye,
} from "lucide-react";
import {
  MotionDiv,
  MotionHeading,
  MotionParagraph,
} from "@/components/ui/motion-content";
import { useLanguage } from "@/lib/language-context";

export default function Home() {
  const { t } = useLanguage();
  const translate = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const faqs = [
    {
      question: translate("faqProfitQuestion", "Are profits guaranteed?"),
      answer: translate(
        "faqProfitAnswer",
        "No. Forex and gold trading carry risk. Signals provide structured trade ideas, but every trader is responsible for position sizing and execution."
      ),
    },
    {
      question: translate(
        "faqSignalIncludesQuestion",
        "What does each signal include?"
      ),
      answer: translate(
        "faqSignalIncludesAnswer",
        "Each signal includes symbol, direction, entry, stop loss, take profit, timing, and tracked result where available."
      ),
    },
    {
      question: translate(
        "faqHomepageSignalsQuestion",
        "How many signals are shown on the homepage?"
      ),
      answer: translate(
        "faqHomepageSignalsAnswer",
        "The homepage only shows the latest three signals. The full paginated list is available on the Signals page."
      ),
    },
    {
      question: translate(
        "faqRiskQuestion",
        "Why is risk management emphasized?"
      ),
      answer: translate(
        "faqRiskAnswer",
        "A clear stop loss and position size help keep one losing trade from damaging the entire account."
      ),
    },
  ];

  const heroTools = [
    "Automated Journaling",
    "Backtesting",
    "Trade Replay",
    "AI Insights",
    "Reports",
    "Strategy Tracking",
  ];

  const productTools = [
    { icon: FileCheck2, label: "Live Signals", active: true },
    { icon: BarChart3, label: "Gold Signals" },
    { icon: PlayCircle, label: "Market Replay" },
    { icon: Sparkles, label: "AI Analysis" },
    { icon: Users, label: "Telegram Alerts" },
    { icon: ClipboardCheck, label: "Signal Archive" },
  ];

  const productBullets = [
    "Live XAU/USD and forex trade ideas",
    "Entry, stop loss, and take profit levels",
    "Telegram alerts with compact trade details",
    "Closed results tracked with full transparency",
  ];

  const productRows = [
    {
      time: "09 Jun 2026, 14:59",
      direction: "Buy",
      strategy: "-",
      plan: "Not Reviewed",
      compliance: "Not Reviewed",
      entry: "4,340.63",
      exit: "4,343.7",
      pnl: "9.21",
      rr: "0.97",
    },
    {
      time: "09 Jun 2026, 14:49",
      direction: "Buy",
      strategy: "SMC_EMA",
      plan: "YES",
      compliance: "100%",
      entry: "4,339.9",
      exit: "4,342.6",
      pnl: "8.1",
      rr: "0.62",
    },
    {
      time: "09 Jun 2026, 13:33",
      direction: "Buy",
      strategy: "-",
      plan: "Not Reviewed",
      compliance: "Not Reviewed",
      entry: "4,334.04",
      exit: "4,336.24",
      pnl: "6.6",
      rr: "0.47",
    },
    {
      time: "09 Jun 2026, 12:50",
      direction: "Sell",
      strategy: "London/New York",
      plan: "Not Reviewed",
      compliance: "Not Reviewed",
      entry: "4,329.95",
      exit: "4,331.94",
      pnl: "-5.97",
      rr: "-1.01",
    },
    {
      time: "09 Jun 2026, 11:21",
      direction: "Buy",
      strategy: "London",
      plan: "Not Reviewed",
      compliance: "Not Reviewed",
      entry: "4,332.82",
      exit: "4,336.64",
      pnl: "11.46",
      rr: "1.26",
    },
  ];

  const integrationLogos = [
    {
      label: "Meta 5",
      image: "/images/meta5.png",
      width: 70,
      height: 70,
      alpha: true,
    },
    {
      label: "NinjaTrader",
      image: "/images/ninjatrader.png",
      width: 140,
      height: 42,
    },
    {
      label: "MetaTrader 4",
      image: "/images/meta04.png?v=2",
      width: 74,
      height: 74,
      alpha: true,
    },
    {
      label: "Tradovate",
      image: "/images/tradeovate.png",
      width: 140,
      height: 38,
    },
  ];

  const journalFeatureCards = [
    {
      title: "Performance Analytics",
      description: "Stats, calendar performance, and day totals from your journal.",
      image: "/images/004.png",
      imagePosition: "center top",
    },
    {
      title: "Trade Review",
      description: "Review trades with real journal context and saved records.",
      image: "/images/002.png",
      imagePosition: "center center",
    },
    {
      title: "Visual Reports",
      description: "See equity, drawdown, and journal score in one workspace.",
      image: "/images/003.png",
      imagePosition: "center center",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#fbfbff] text-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,#ffffff_0%,#f7f9ff_38%,#f3efff_70%,#ffeaf7_100%)]"></div>
        <div className="absolute inset-x-0 top-0 h-24 bg-white/80 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white to-transparent"></div>

        <div className="container relative z-10 mx-auto max-w-[1480px] px-4 py-10 sm:px-6 md:px-16 lg:px-24 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] xl:gap-14">
            <div className="order-2 max-w-xl text-left lg:order-1">
              <h1 className="max-w-2xl text-5xl font-extrabold leading-[0.96] tracking-normal text-[#10132f] sm:text-6xl lg:text-7xl">
                Meet Your AI Trading Partner
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-700 sm:text-xl">
                The AI trading journal that knows your trades, builds your game
                plan, and reviews every session automatically while you focus on
                the next one. Trusted by{" "}
                <span className="font-bold text-slate-950">100K+ traders.</span>
              </p>

              <div className="mt-9">
                <Button
                  size="lg"
                  className="h-14 rounded-full bg-[#11132c] px-8 text-base font-bold text-white shadow-[0_18px_35px_rgba(17,19,44,0.25)] hover:bg-[#25285a]"
                  asChild
                >
                  <Link href="/dashboard-loading" className="flex items-center">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-10">
                <div className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  Everything in one place - 6 tools
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {heroTools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative order-1 min-h-[360px] lg:order-2 lg:min-h-[620px]">
              <div className="relative ml-auto max-w-[900px]">
                <Image
                  src="/images/001.png"
                  alt="SignalLedger trading journal dashboard"
                  width={1448}
                  height={1086}
                  priority
                  className="h-auto w-full rounded-lg object-contain drop-shadow-[0_34px_70px_rgba(61,45,141,0.25)]"
                />
              </div>

              <div className="absolute right-0 top-3 hidden max-w-sm rounded-lg border border-violet-300/90 bg-white/70 p-5 shadow-[0_22px_60px_rgba(168,85,247,0.22)] backdrop-blur-xl md:block lg:right-4 lg:top-0">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="text-sm font-bold uppercase text-slate-500">
                    AI Insight
                  </span>
                  <span className="rounded-md bg-violet-600 px-2 py-1 text-xs font-bold text-white">
                    New
                  </span>
                </div>
                <p className="text-base font-semibold leading-6 text-slate-950">
                  Your win rate improves 18% on Tuesdays. Consider trading more
                  during this window.
                </p>
              </div>

            </div>
          </div>

          {/* TradingView Ticker Tape Widget */}
          <div className="relative z-30 mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white/85 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
            <TradingViewTicker />
          </div>
        </div>
      </section>
      {/* Recent Signals */}
      <RecentSignals />

      {/* Gradient divider to hide the line between sections */}
      <div className="relative z-10 h-16 bg-gradient-to-b from-[#fbfbff] via-[#f8f6ff] to-white"></div>

      {/* Features */}
      <section className="relative overflow-hidden bg-white py-20 text-[#10132f]">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#f8f6ff] to-white" />
        <div className="container relative z-10 mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
              Signal service
            </div>
            <MotionHeading className="text-4xl font-extrabold tracking-normal text-[#080b29] sm:text-5xl lg:text-6xl">
              Complete signals.{" "}
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                One hub.
              </span>
            </MotionHeading>
            <MotionParagraph className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-500">
              Forex and gold trade setups organized in one place - from alert
              to result tracking.
            </MotionParagraph>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-2.5">
            {productTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <button
                  key={tool.label}
                  type="button"
                  className={`inline-flex h-12 items-center gap-2 rounded-full border px-4 text-sm font-semibold shadow-sm transition-colors ${
                    tool.active
                      ? "border-violet-300 bg-white text-slate-950 shadow-[0_10px_24px_rgba(99,102,241,0.14)]"
                      : "border-slate-200 bg-white/80 text-slate-700 hover:border-violet-200"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                      tool.active
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {tool.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#fbfbff_55%,#ece9ff_100%)] shadow-[0_28px_80px_rgba(79,70,229,0.12)]">
            <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[0.8fr_1.35fr] lg:items-center lg:p-12">
              <div className="max-w-xl">
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-violet-500">
                  Signal Dashboard
                </div>
                <h2 className="mt-5 max-w-md text-3xl font-extrabold leading-tight text-[#080b29] sm:text-4xl">
                  Every signal, clear before entry.
                </h2>
                <p className="mt-6 max-w-lg text-base leading-7 text-slate-500">
                  Follow structured trade ideas with direction, entry, stop
                  loss, take profit, status, and closing result visible in one
                  live dashboard.
                </p>

                <ul className="mt-7 space-y-3 text-sm font-medium text-slate-600">
                  {productBullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="min-w-0 overflow-hidden rounded-lg border border-slate-800 bg-[#0f172a] shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[960px] border-collapse text-left text-sm text-white">
                    <thead className="bg-[#111827] text-xs uppercase tracking-normal text-blue-200/80">
                      <tr>
                        <th className="px-4 py-4 font-bold">Open Time</th>
                        <th className="px-4 py-4 font-bold">Symbol</th>
                        <th className="px-4 py-4 font-bold">Direction</th>
                        <th className="px-4 py-4 font-bold">Account</th>
                        <th className="px-4 py-4 font-bold">Strategy</th>
                        <th className="px-4 py-4 font-bold">Plan</th>
                        <th className="px-4 py-4 font-bold">Compliance</th>
                        <th className="px-4 py-4 font-bold">Entry</th>
                        <th className="px-4 py-4 font-bold">Exit</th>
                        <th className="px-4 py-4 font-bold">PNL</th>
                        <th className="px-4 py-4 font-bold">R:R</th>
                        <th className="px-4 py-4 font-bold">Status</th>
                        <th className="px-4 py-4 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productRows.map((row) => {
                        const isBuy = row.direction === "Buy";
                        const isProfit = !row.pnl.startsWith("-");

                        return (
                          <tr
                            key={`${row.time}-${row.pnl}`}
                            className="border-t border-slate-700/70 bg-[#0f172a]"
                          >
                            <td className="whitespace-nowrap px-4 py-4 font-medium text-blue-50">
                              {row.time}
                            </td>
                            <td className="px-4 py-4 font-bold">XAUUSD</td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold ${
                                  isBuy
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                    : "border-red-500/30 bg-red-500/10 text-red-400"
                                }`}
                              >
                                {isBuy ? (
                                  <ArrowUp className="h-3.5 w-3.5" />
                                ) : (
                                  <ArrowDown className="h-3.5 w-3.5" />
                                )}
                                {row.direction}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-blue-50">600118542</td>
                            <td className="whitespace-nowrap px-4 py-4 text-blue-50">
                              {row.strategy}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex h-8 items-center rounded-lg border px-3 text-xs font-bold ${
                                  row.plan === "YES"
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                    : "border-slate-600 bg-slate-900 text-blue-50"
                                }`}
                              >
                                {row.plan}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex h-8 items-center rounded-lg border px-3 text-xs font-bold ${
                                  row.compliance === "100%"
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                    : "border-slate-600 bg-slate-900 text-blue-50"
                                }`}
                              >
                                {row.compliance}
                              </span>
                            </td>
                            <td className="px-4 py-4 font-semibold text-blue-50">
                              {row.entry}
                            </td>
                            <td className="px-4 py-4 font-semibold text-blue-50">
                              {row.exit}
                            </td>
                            <td
                              className={`px-4 py-4 font-bold ${
                                isProfit ? "text-emerald-400" : "text-red-400"
                              }`}
                            >
                              {row.pnl}
                            </td>
                            <td className="px-4 py-4 font-semibold text-blue-50">
                              {row.rr}
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex h-8 items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-bold text-emerald-400">
                                Closed
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-blue-100">
                                <Eye className="h-4 w-4" />
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Automated Journaling */}
      <section
        id="automated-journaling"
        className="relative overflow-hidden bg-white py-20 text-[#10132f]"
      >
        <div className="pointer-events-none absolute left-[8%] top-0 text-[11rem] font-extrabold leading-none text-violet-100/70 sm:text-[15rem]">
          1
        </div>
        <div className="container relative z-10 mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="text-xs font-extrabold uppercase tracking-[0.28em] text-violet-600">
              Automated Journaling
            </div>
            <MotionHeading className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-normal text-[#11142d] sm:text-5xl lg:text-6xl">
              Powerful and Automated{" "}
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                Trade Journaling
              </span>
            </MotionHeading>
            <MotionParagraph className="mx-auto mt-5 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              You focus on trading while SignalLedger organizes stats, trade
              reviews, screenshots, and performance insights in one place.
            </MotionParagraph>
            <Button
              size="lg"
              className="mt-8 h-12 rounded-md bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 text-sm font-bold text-white shadow-[0_16px_36px_rgba(168,85,247,0.24)] hover:from-violet-500 hover:to-fuchsia-500"
              asChild
            >
              <Link href="/journal" className="flex items-center">
                Open trade journal <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mx-auto mt-14 flex max-w-5xl flex-wrap items-center justify-center gap-x-16 gap-y-6 sm:gap-x-20 lg:gap-x-24">
            {integrationLogos.map((logo) => (
              <span
                key={logo.label}
                className="flex h-16 min-w-36 items-center justify-center"
              >
                {logo.image ? (
                  <Image
                    src={logo.image}
                    alt={`${logo.label} logo`}
                    width={logo.width}
                    height={logo.height}
                    className={`max-h-14 w-auto object-contain ${
                      logo.alpha ? "mix-blend-multiply" : ""
                    }`}
                  />
                ) : (
                  <span className="whitespace-nowrap text-sm font-bold text-slate-400">
                    {logo.label}
                  </span>
                )}
              </span>
            ))}
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
            {journalFeatureCards.map((card, index) => (
              <MotionDiv
                key={card.title}
                className="overflow-hidden rounded-lg bg-[linear-gradient(145deg,#6d39f4_0%,#292d72_58%,#11142d_100%)] text-white shadow-[0_18px_45px_rgba(59,40,139,0.16)]"
                delay={index * 0.08}
              >
                <div className="p-5 pb-4">
                  <h3 className="text-lg font-extrabold">{card.title}</h3>
                  <p className="mt-2 min-h-12 text-sm font-semibold leading-6 text-white/85">
                    {card.description}
                  </p>
                </div>
                <div className="px-5 pb-5">
                  <div className="relative h-44 overflow-hidden rounded-lg border border-white/15 bg-slate-950 shadow-[0_18px_40px_rgba(2,6,23,0.3)] sm:h-48">
                    <Image
                      src={card.image}
                      alt={`${card.title} journal screenshot`}
                      fill
                      sizes="(min-width: 1024px) 300px, (min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                      style={{ objectPosition: card.imagePosition }}
                    />
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ and Risk */}
      <section className="bg-black py-16 text-white">
        <div className="container mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-[1fr_0.75fr]">
          <div>
            <MotionHeading className="mb-6 text-3xl font-bold">
              {translate("faq", "FAQ")}
            </MotionHeading>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-lg border border-gray-800 bg-gray-950/85 p-5"
                >
                  <h3 className="font-semibold text-white">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-blue-500/25 bg-blue-500/10 p-6">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md bg-blue-600">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {translate("riskDisclaimer", "Risk Disclaimer")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-blue-100/90">
              {translate(
                "riskDisclaimerText",
                "Forex and CFD trading involve significant risk and may not be suitable for every trader. Signals are market analysis, not guaranteed outcomes. Use appropriate position sizing, review each setup independently, and never risk money you cannot afford to lose."
              )}
            </p>
            <Button asChild className="mt-6 bg-blue-600 hover:bg-blue-500">
              <Link href="/signals">
                {translate("viewSignals", "View Signals")}{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-black border-none text-white">
        <div className="container mx-auto px-4 text-center">
          <MotionDiv className="text-3xl font-bold mb-6">
            {t("joinUsToday")}
          </MotionDiv>
          <MotionDiv
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            delay={0.2}
          >
            {t("signUpText")}
          </MotionDiv>
          <MotionDiv delay={0.4}>
            <Button size="lg" asChild>
              <Link href="https://t.me/+uRJNzAveahQ0NjM0">
                {t("freeRegistration")}
              </Link>
            </Button>
          </MotionDiv>
        </div>
      </section>
    </div>
  );
}
