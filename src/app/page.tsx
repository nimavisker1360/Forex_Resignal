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
  Coins,
  LineChart,
  Info,
  MessageSquare,
  Trophy,
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
                        {t("exploreNow")} <span className="ml-1">←</span>
                      </>
                    ) : (
                      <>
                        <span className="mr-1">→</span> {t("exploreNow")}
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

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-5xl mx-auto my-2 ${language === "fa" ? "text-right" : "text-left"}`}
          >
            <MotionStaggerContainer>
              {/* Feature 2 */}
              <MotionStaggerItem className="bg-gray-900/80 rounded-xl p-8 mb-10 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="flex justify-center">
                  <div className="bg-blue-600 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                    <Coins className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">
                  {t("lowCostService")}
                </h3>
              </MotionStaggerItem>

              {/* Feature 4 */}
              <MotionStaggerItem className="bg-gray-900/80 rounded-xl p-8 mb-10 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="flex justify-center">
                  <div className="bg-blue-600 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                    <Info className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">
                  {t("inDepthInformation")}
                </h3>
              </MotionStaggerItem>

              {/* Feature 6 */}
              <MotionStaggerItem className="bg-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="flex justify-center">
                  <div className="bg-blue-600 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">
                  {t("successRatio")}
                </h3>
              </MotionStaggerItem>
            </MotionStaggerContainer>

            <MotionStaggerContainer>
              {/* Feature 1 */}
              <MotionStaggerItem className="bg-gray-900/80 rounded-xl p-8 mb-10 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="flex justify-center">
                  <div className="bg-blue-600 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                    <Diamond className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">
                  {t("qualityOverQuantity")}
                </h3>
              </MotionStaggerItem>

              {/* Feature 3 */}
              <MotionStaggerItem className="bg-gray-900/80 rounded-xl p-8 mb-10 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="flex justify-center">
                  <div className="bg-blue-600 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                    <LineChart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">
                  {t("strongTechnicalAnalysis")}
                </h3>
              </MotionStaggerItem>

              {/* Feature 5 */}
              <MotionStaggerItem className="bg-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="flex justify-center">
                  <div className="bg-blue-600 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">
                  {t("telegramSignals")}
                </h3>
              </MotionStaggerItem>
            </MotionStaggerContainer>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

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
