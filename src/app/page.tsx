"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecentSignals } from "@/components/RecentSignals";
import { Testimonials } from "@/components/Testimonials";
import Image from "next/image";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import {
  CheckCircle2,
  Diamond,
  LineChart,
  Info,
  MessageSquare,
  Trophy,
  ArrowRight,
  ClipboardCheck,
  Bell,
  ShieldCheck,
  BarChart3,
  FileCheck2,
} from "lucide-react";
import {
  MotionDiv,
  MotionStaggerContainer,
  MotionStaggerItem,
  MotionHeading,
  MotionParagraph,
  MotionImage,
} from "@/components/ui/motion-content";
import { useLanguage } from "@/lib/language-context";

export default function Home() {
  const { t, language } = useLanguage();
  const translate = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const trustCards = [
    {
      icon: Diamond,
      title: translate("qualityOverQuantity", "Quality Over Quantity"),
      description: translate(
        "trustQualityDescription",
        "Signals are filtered for clear setups instead of filling the feed with low-conviction ideas."
      ),
    },
    {
      icon: LineChart,
      title: translate("strongTechnicalAnalysis", "Strong Technical Analysis"),
      description: translate(
        "trustAnalysisDescription",
        "Each setup is reviewed with price action, market structure, and key support or resistance levels."
      ),
    },
    {
      icon: ShieldCheck,
      title: translate("riskFirstApproach", "Risk-first approach"),
      description: translate(
        "trustRiskDescription",
        "Every signal includes stop loss and take profit levels so risk is visible before entry."
      ),
    },
    {
      icon: MessageSquare,
      title: translate("telegramSignals", "Telegram Signals"),
      description: translate(
        "trustTelegramDescription",
        "Trade alerts are delivered through Telegram with compact entry, exit, and status information."
      ),
    },
    {
      icon: Info,
      title: translate("inDepthInformation", "In-depth Information"),
      description: translate(
        "trustDetailsDescription",
        "Details pages show status, result, timing, and analysis context for easier review."
      ),
    },
    {
      icon: Trophy,
      title: translate(
        "transparentPerformanceTracking",
        "Transparent performance tracking"
      ),
      description: translate(
        "trustTrackingDescription",
        "Closed signals are tracked by result without promising guaranteed profit or fixed win rates."
      ),
    },
  ];

  const workflowSteps = [
    { icon: BarChart3, title: translate("marketAnalyzed", "Market analyzed") },
    {
      icon: ClipboardCheck,
      title: translate("signalPrepared", "Signal prepared"),
    },
    {
      icon: ShieldCheck,
      title: translate("riskLevelsDefined", "Risk levels defined"),
    },
    {
      icon: Bell,
      title: translate("telegramAlertSent", "Telegram alert sent"),
    },
    { icon: FileCheck2, title: translate("resultTracked", "Result tracked") },
  ];

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

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-10 md:py-20 bg-black text-white overflow-hidden">
        <MotionImage
          className="absolute inset-0 z-0"
          style={{
            transform:
              language === "fa" ? "translateX(-30%)" : "translateX(30%)",
            width: "80%",
          }}
        >
          <Image
            src="/images/bg-home03.png"
            alt="Forex Trading Background"
            fill
            className={`object-cover ${language === "fa" ? "object-left" : "object-right"}`}
            priority
          />
        </MotionImage>

        <div className="container relative z-10 mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center px-4 sm:px-6 md:px-16 lg:px-24 max-w-[1400px] mx-auto">
            {/* Text Content - Now on Left */}
            <MotionStaggerContainer
              className={`space-y-8 ${language === "fa" ? "text-right" : "text-left"} order-1 md:order-1 max-w-xl`}
            >
              <MotionStaggerItem
                className={`inline-flex items-center bg-gradient-to-r from-blue-600/80 to-blue-500/30 backdrop-blur-sm px-6 py-2.5 rounded-full border border-blue-400/30 mb-4 ${language === "fa" ? "self-end" : "self-start"}`}
              >
                <span className="text-blue-200 font-medium">
                  {t("forexSignalPlatform")}
                </span>
              </MotionStaggerItem>

              <MotionHeading className="text-5xl font-extrabold tracking-tight leading-none text-white/90 mb-6 mt-4">
                {t("heroTitle")}
              </MotionHeading>

              <MotionParagraph className="text-lg md:text-xl text-white/70 mt-4">
                {t("heroDescription")}
              </MotionParagraph>

              <div
                className={`flex flex-col ${language === "fa" ? "items-end" : "items-start"} sm:flex-row ${language === "fa" ? "sm:justify-end" : "sm:justify-start"} sm:flex-wrap sm:gap-8 gap-4 mt-6 mb-8`}
              >
                <div className="flex items-center gap-2">
                  {language === "en" && (
                    <div className="bg-blue-600 p-1 rounded-full flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <span className="text-base">{t("whenToSell")}</span>
                  {language === "fa" && (
                    <div className="bg-blue-600 p-1 rounded-full flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {language === "en" && (
                    <div className="bg-blue-600 p-1 rounded-full flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <span className="text-base">{t("whenToBuy")}</span>
                  {language === "fa" && (
                    <div className="bg-blue-600 p-1 rounded-full flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {language === "en" && (
                    <div className="bg-blue-600 p-1 rounded-full flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <span className="text-base">{t("stopLossPoints")}</span>
                  {language === "fa" && (
                    <div className="bg-blue-600 p-1 rounded-full flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              </div>

              <MotionStaggerItem
                className={`pt-2 ${language === "fa" ? "self-end" : "self-start"}`}
              >
                <Button
                  size="lg"
                  className="px-8 from-blue-600/80 to-blue-500/30 hover:bg-primary/90"
                  asChild
                >
                  <Link href="/signals" className="flex items-center">
                    {language === "fa" ? (
                      <>
                        {t("exploreNow")}{" "}
                        <ArrowRight className="ml-2 h-4 w-4 rotate-180" />
                      </>
                    ) : (
                      <>
                        {t("exploreNow")}{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Link>
                </Button>
              </MotionStaggerItem>
            </MotionStaggerContainer>

            {/* Right Column - Image or empty area */}
            <div
              className={`flex justify-center items-center order-2 md:order-2`}
            >
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center z-10"></div>
              </div>
            </div>
          </div>

          {/* TradingView Ticker Tape Widget */}
          <div className="mt-10 relative z-30 px-4 sm:px-6 md:px-16 lg:px-24 max-w-[1400px] mx-auto">
            <TradingViewTicker />
          </div>
        </div>
      </section>
      {/* Recent Signals */}
      <RecentSignals />

      {/* Gradient divider to hide the line between sections */}
      <div className="h-24 bg-gradient-to-b from-black via-blue-200/5 to-black/10 relative z-10 -mt-16 -mb-10 backdrop-blur-md"></div>

      {/* Features */}
      <section className="py-20 bg-black text-white border-none relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b to-black/30 z-0"></div>
        <div
          className="absolute inset-0 mx-auto my-auto bg-[url('/images/back.jpg')] bg-contain bg-center opacity-20 z-0"
          style={{
            width: "120%",
            height: "120%",
            top: "0%",
            left: "0%",
            transform: "rotate(10deg) scale(1.4)",
          }}
        ></div>
        <div className="container mx-auto px-6 sm:px-10 relative z-10">
          <div className="flex flex-col items-center mb-12">
            <div className="relative mb-6">
              <MotionDiv className="bg-blue-600 text-white px-7 py-2.5 rounded-lg border-2 border-blue-400/70 mx-auto relative z-10">
                <span className="text-center font-medium text-sm">
                  {t("whyChooseUs")}
                </span>
              </MotionDiv>
            </div>
            <MotionHeading className="text-3xl font-bold text-center mb-8">
              {t("whyTradersTrustUs")}
            </MotionHeading>
          </div>

          <MotionStaggerContainer
            className={`mx-auto flex max-w-3xl flex-col gap-4 ${language === "fa" ? "text-right" : "text-left"}`}
          >
            {trustCards.map((card) => {
              const Icon = card.icon;

              return (
                <MotionStaggerItem
                  key={card.title}
                  className="w-full rounded-lg border border-blue-500/20 bg-gray-950/90 p-5 backdrop-blur-sm transition-all hover:border-blue-500/40 sm:p-6"
                >
                  <div
                    className={`flex flex-col gap-4 sm:flex-row sm:items-start ${language === "fa" ? "sm:flex-row-reverse" : ""}`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-blue-600">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-white">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-400">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </MotionStaggerItem>
              );
            })}
          </MotionStaggerContainer>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-black py-16 text-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <MotionHeading className="text-3xl font-bold">
              {translate("howItWorks", "How It Works")}
            </MotionHeading>
            <MotionParagraph className="mx-auto mt-3 max-w-2xl text-gray-400">
              {translate(
                "howItWorksDescription",
                "A simple workflow keeps each trade idea structured from analysis to result tracking."
              )}
            </MotionParagraph>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <MotionDiv
                  key={step.title}
                  className="rounded-lg border border-gray-800 bg-gray-950/85 p-5 text-center backdrop-blur-sm"
                  delay={index * 0.08}
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-200">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-semibold uppercase text-blue-300">
                    {translate("step", "Step")} {index + 1}
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-white">
                    {step.title}
                  </h3>
                </MotionDiv>
              );
            })}
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
