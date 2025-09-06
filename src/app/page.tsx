"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecentSignals } from "@/components/RecentSignals";
import { Testimonials } from "@/components/Testimonials";
import Image from "next/image";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { CheckCircle2 } from "lucide-react";
import {
  MotionDiv,
  MotionStaggerContainer,
  MotionStaggerItem,
  MotionHeading,
  MotionParagraph,
  MotionImage,
} from "@/components/ui/motion-content";
import { useLanguage } from "@/lib/language-context";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useState } from "react";

export default function Home() {
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Show loading screen for the first time visiting the page
  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen py-16 md:py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden border border-blue-500/20 rounded-3xl mx-4 my-8">
        {/* Background Image */}
        <MotionImage
          className="absolute inset-0 z-0"
          style={{
            transform:
              language === "fa" ? "translateX(-10%)" : "translateX(30%)",
            width: "80%",
            height: "80%",
          }}
        >
          <Image
            src="/images/bg-home03.png"
            alt="Forex Trading Background"
            fill
            className={`object-cover ${language === "fa" ? "object-left" : "object-right"} opacity-60`}
            priority
          />
        </MotionImage>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30 z-5"></div>

        <div className="container relative z-10 mx-auto h-full flex items-center">
          <div className="grid md:grid-cols-2 gap-12 items-center px-4 sm:px-6 md:px-16 lg:px-24 max-w-[1400px] mx-auto w-full">
            {/* Left Column - Title and Description */}
            <MotionStaggerContainer
              className={`space-y-10 ${language === "fa" ? "text-right" : "text-left"} order-1 md:order-1`}
            >
              <MotionStaggerItem
                className={`inline-flex items-center bg-gradient-to-r from-blue-600/90 to-purple-600/60 backdrop-blur-md px-8 py-3 rounded-full border border-blue-400/40 shadow-xl ${language === "fa" ? "self-end" : "self-start"}`}
              >
                <span className="text-blue-100 font-semibold text-sm tracking-wide">
                  {t("forexSignalPlatform")}
                </span>
              </MotionStaggerItem>

              <MotionHeading
                className={`text-6xl md:text-7xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent mb-8 ${language === "fa" ? "font-[BYekan]" : ""}`}
              >
                {t("heroTitle")}
              </MotionHeading>

              <MotionParagraph
                className={`text-xl md:text-2xl text-gray-300 leading-relaxed max-w-lg ${language === "fa" ? "font-[BYekan]" : ""}`}
              >
                {t("heroDescription")}
              </MotionParagraph>

              <MotionStaggerItem
                className={`pt-4 ${language === "fa" ? "self-end" : "self-start"}`}
              >
                <Button
                  size="lg"
                  className="px-10 py-4 text-lg bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-700 hover:via-blue-600 hover:to-purple-700 shadow-2xl border-0 rounded-xl transition-all duration-300 transform hover:scale-105"
                  asChild
                >
                  <Link href="/signals" className="flex items-center gap-2">
                    {language === "fa" ? (
                      <>
                        <span className="font-bold">{t("exploreNow")}</span>
                        <span className="text-xl">←</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">→</span>
                        <span className="font-bold">{t("exploreNow")}</span>
                      </>
                    )}
                  </Link>
                </Button>
              </MotionStaggerItem>
            </MotionStaggerContainer>

            {/* Right Column - Key Features */}
            <MotionStaggerContainer
              className={`${language === "fa" ? "text-right" : "text-left"} order-2 md:order-2`}
            >
              <div className="">
                <div className="space-y-6">
                  <div
                    className={`flex items-center gap-4 p-4 rounded-xl border border-blue-500/30 ${language === "fa" ? "flex-row-reverse" : ""}`}
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full flex-shrink-0 shadow-lg">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <span
                      className={`text-base text-white font-medium ${language === "fa" ? "font-[BYekan]" : ""}`}
                    >
                      {t("whenToSell")}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-4 p-4 rounded-xl border border-blue-500/30 ${language === "fa" ? "flex-row-reverse" : ""}`}
                  >
                    <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-full flex-shrink-0 shadow-lg">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <span
                      className={`text-base text-white font-medium ${language === "fa" ? "font-[BYekan]" : ""}`}
                    >
                      {t("whenToBuy")}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-4 p-4 rounded-xl border border-blue-500/30 ${language === "fa" ? "flex-row-reverse" : ""}`}
                  >
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-full flex-shrink-0 shadow-lg">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <span
                      className={`text-base text-white font-medium ${language === "fa" ? "font-[BYekan]" : ""}`}
                    >
                      {t("stopLossPoints")}
                    </span>
                  </div>
                </div>
              </div>
            </MotionStaggerContainer>
          </div>

          {/* TradingView Ticker Tape Widget */}
        </div>
        {/* Full-width Ticker below Explore button */}
        <div className="mt-10 md:mt-14 relative z-30 px-4 sm:px-6 md:px-16 lg:px-24 max-w-[1400px] mx-auto">
          <div className="bg-gray-900/40 backdrop-blur-sm  ">
            <TradingViewTicker />
          </div>
        </div>
      </section>
      {/* Recent Signals */}
      <RecentSignals />

      {/* Gradient divider to hide the line between sections */}
      <div className="h-24 bg-gradient-to-b from-transparent via-transparent to-transparent relative z-10 -mt-16 -mb-10"></div>

      {/* CPT Image Section */}
      <Testimonials />
      <section className="py-16 bg-transparent border-none relative overflow-hidden border border-blue-500/20 rounded-3xl mx-4 my-8">
        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Second Row: Benefits Details */}
          <MotionDiv className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30 shadow-2xl">
              <h3 className="text-2xl font-bold text-center text-white mb-8">
                {language === "fa"
                  ? "دلیل انتخاب این بروکر برای کپی ترید"
                  : "Why We Choose This Broker for Copy Trading"}
              </h3>

              <div className="space-y-6">
                {/* First Row */}
                <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
                  <div className="rounded-lg p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mt-1 flex-shrink-0"></div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {language === "fa"
                          ? "پلتفرم معاملاتی MT4 و MT5"
                          : "Trading Platforms MT4 & MT5"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mt-1 flex-shrink-0"></div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {language === "fa"
                          ? "دارا بودن کپی تریدینگ"
                          : "Copy Trading Available"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mt-1 flex-shrink-0"></div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {language === "fa"
                          ? "حساب اسلامی دارد"
                          : "Islamic Account Available"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mt-1 flex-shrink-0"></div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {language === "fa"
                          ? "رگولاتوری قوی: FCA، FSCA، FSC، SCA"
                          : "Strong Regulation: FCA, FSCA, FSC, SCA"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Second Row */}
                <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
                  <div className="rounded-lg p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full mt-1 flex-shrink-0"></div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {language === "fa"
                          ? "اسپرد کم و بدون کامیشن"
                          : "Low Spread, No Commission"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full mt-1 flex-shrink-0"></div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {language === "fa"
                          ? "واید نشدن اسپرد در خبر"
                          : "No Spread Widening in News"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full mt-1 flex-shrink-0"></div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {language === "fa"
                          ? "بدون کمیسیون و سوآپ"
                          : "No Commission & Swap"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full mt-1 flex-shrink-0"></div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {language === "fa"
                          ? "واریز/برداشت سریع USDT"
                          : "Fast USDT Deposit/Withdrawal"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-blue-500/20">
                <div className="rounded-lg p-4 border border-blue-500/30">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <p className="text-gray-300 text-sm text-center">
                      {language === "fa"
                        ? "درگاه‌های بین‌المللی (ویزا، مسترکارت، سوییفت) - برداشت بدون کارمزد یا کمیسیون"
                        : "International Gateways (Visa, Mastercard, SWIFT) - No Fee Withdrawals"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>
    </div>
  );
}
