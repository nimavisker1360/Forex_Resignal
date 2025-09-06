"use client";

import {
  MotionDiv,
  MotionStaggerContainer,
  MotionStaggerItem,
} from "@/components/ui/motion-content";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";

export function Testimonials() {
  const { language } = useLanguage();

  return (
    <section
      dir={language === "fa" ? "rtl" : "ltr"}
      className="py-20 bg-transparent relative border border-blue-500/20 rounded-3xl mx-4 my-8"
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 mx-auto my-auto bg-[url('/images/back.jpg')] bg-contain bg-center opacity-5 z-0"
        style={{
          width: "120%",
          height: "120%",
          top: "0%",
          left: "0%",
          transform: "rotate(10deg) scale(1.4)",
        }}
      ></div>

      <div className="container mx-auto px-6 sm:px-10 relative z-10">
        {/* Section Header */}
        <MotionDiv className="text-center mb-16">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-400/20 rounded-full blur-xl"></div>
            <h2
              className={`relative text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent ${language === "fa" ? "font-[BYekan]" : ""}`}
            >
              {language === "fa" ? "مزایای بروکر CPT" : "CPT Broker Advantages"}
            </h2>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-300 mx-auto rounded-full"></div>
        </MotionDiv>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Side - CPT Image */}
          <MotionStaggerContainer className="order-2 lg:order-1">
            <MotionStaggerItem>
              <CptImageCard />
            </MotionStaggerItem>
          </MotionStaggerContainer>

          {/* Right Side - Key Benefits */}
          <MotionStaggerContainer
            className={`order-1 lg:order-2 ${language === "fa" ? "text-right" : "text-left"}`}
          >
            <div className="space-y-6">
              <div className="grid gap-8">
                <MotionStaggerItem className="border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all duration-300">
                  <div
                    className={`flex items-start gap-4 ${language === "fa" ? "flex-row-reverse" : ""}`}
                  >
                    <div className="w-3 h-3 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4
                        className={`text-lg font-semibold text-white mb-2 ${language === "fa" ? "font-[BYekan]" : ""}`}
                      >
                        {language === "fa"
                          ? "پلتفرم‌های معاملاتی قدرتمند"
                          : "Powerful Trading Platforms"}
                      </h4>
                      <p
                        className={`text-gray-300 text-sm leading-relaxed ${language === "fa" ? "font-[BYekan]" : ""}`}
                      >
                        {language === "fa"
                          ? "MT4 و MT5 با تمام امکانات پیشرفته"
                          : "MT4 & MT5 with all advanced features"}
                      </p>
                    </div>
                  </div>
                </MotionStaggerItem>

                <MotionStaggerItem className="border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all duration-300">
                  <div
                    className={`flex items-start gap-4 ${language === "fa" ? "flex-row-reverse" : ""}`}
                  >
                    <div className="w-3 h-3 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4
                        className={`text-lg font-semibold text-white mb-2 ${language === "fa" ? "font-[BYekan]" : ""}`}
                      >
                        {language === "fa"
                          ? "کپی تریدینگ حرفه‌ای"
                          : "Professional Copy Trading"}
                      </h4>
                      <p
                        className={`text-gray-300 text-sm leading-relaxed ${language === "fa" ? "font-[BYekan]" : ""}`}
                      >
                        {language === "fa"
                          ? "دنبال کردن بهترین معامله‌گران جهان"
                          : "Follow the world's best traders"}
                      </p>
                    </div>
                  </div>
                </MotionStaggerItem>

                <MotionStaggerItem className="border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all duration-300">
                  <div
                    className={`flex items-start gap-4 ${language === "fa" ? "flex-row-reverse" : ""}`}
                  >
                    <div className="w-3 h-3 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4
                        className={`text-lg font-semibold text-white mb-2 ${language === "fa" ? "font-[BYekan]" : ""}`}
                      >
                        {language === "fa"
                          ? "رگولاتوری معتبر"
                          : "Trusted Regulation"}
                      </h4>
                      <p
                        className={`text-gray-300 text-sm leading-relaxed ${language === "fa" ? "font-[BYekan]" : ""}`}
                      >
                        {language === "fa"
                          ? "FCA، FSCA، FSC، SCA"
                          : "FCA, FSCA, FSC, SCA"}
                      </p>
                    </div>
                  </div>
                </MotionStaggerItem>

                <MotionStaggerItem className="border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all duration-300">
                  <div
                    className={`flex items-start gap-4 ${language === "fa" ? "flex-row-reverse" : ""}`}
                  >
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4
                        className={`text-lg font-semibold text-white mb-2 ${language === "fa" ? "font-[BYekan]" : ""}`}
                      >
                        {language === "fa"
                          ? "اسپرد کم و کمیسیون صفر"
                          : "Low Spread & Zero Commission"}
                      </h4>
                      <p
                        className={`text-gray-300 text-sm leading-relaxed ${language === "fa" ? "font-[BYekan]" : ""}`}
                      >
                        {language === "fa"
                          ? "بهترین شرایط معاملاتی در بازار"
                          : "Best trading conditions in the market"}
                      </p>
                    </div>
                  </div>
                </MotionStaggerItem>
              </div>
            </div>
          </MotionStaggerContainer>
        </div>
      </div>
    </section>
  );
}

// Reusable CPT image block
export function CptImageCard() {
  return (
    <div className="relative">
      <MotionDiv>
        <div className="relative max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105">
            <Image
              src="/images/cpt.jpg"
              alt="Copy Trading Performance"
              width={500}
              height={500}
              className="w-full h-auto rounded-xl shadow-2xl border-2 border-blue-500/40 hover:border-blue-400/60 transition-all duration-300"
              priority
            />
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              CPT
            </div>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
