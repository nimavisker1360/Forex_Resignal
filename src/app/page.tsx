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

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-10 md:py-20 bg-black text-white overflow-hidden">
        <MotionImage
          className="absolute inset-0 z-0"
          style={{ transform: "translateX(30%)", width: "80%" }}
        >
          <Image
            src="/images/bg-home03.png"
            alt="Forex Trading Background"
            fill
            className="object-cover object-right"
            priority
          />
        </MotionImage>

        <div className="container relative z-10 mx-auto px-6 md:px-8 lg:px-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left Column - Image */}
            <div className="flex justify-center items-center order-1 md:order-1">
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center z-10"></div>
              </div>
            </div>

            {/* Right Column - Text Content */}
            <MotionStaggerContainer className="space-y-8 text-left order-2 md:order-2 max-w-xl">
              <MotionStaggerItem className="inline-flex items-center bg-gradient-to-r from-blue-600/80 to-blue-500/30 backdrop-blur-sm px-6 py-2.5 rounded-full border border-blue-400/30 mb-4">
                <span className="text-blue-200 font-medium">
                  Forex Signal Platform
                </span>
              </MotionStaggerItem>

              <MotionHeading className="text-5xl font-extrabold tracking-tight leading-none text-white/90 mb-6 mt-4">
                Trading Alerts From Expert Analysts
              </MotionHeading>

              <MotionParagraph className="text-lg md:text-xl text-white/70 mt-4">
                Get accurate Forex signals straight from expert analysts. Stay
                ahead in the market with real-time updates
              </MotionParagraph>

              <div className="flex flex-col items-end sm:flex-row sm:justify-end sm:flex-wrap sm:gap-8 gap-4 mt-6 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-base">When to Sell</span>
                  <div className="bg-blue-600 p-1 rounded-full flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">When to Buy</span>
                  <div className="bg-blue-600 p-1 rounded-full flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">Add stop loss points</span>
                  <div className="bg-blue-600 p-1 rounded-full flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>

              <MotionStaggerItem className="pt-2">
                <Button
                  size="lg"
                  className="px-8 from-blue-600/80 to-blue-500/30 hover:bg-primary/90"
                  asChild
                >
                  <Link href="/signals" className="flex items-center">
                    <span className="mr-1">→</span> Explore Now
                  </Link>
                </Button>
              </MotionStaggerItem>
            </MotionStaggerContainer>
          </div>

          {/* TradingView Ticker Tape Widget */}
          <div className="mt-10 relative z-30">
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
                  Why Choose Us
                </span>
              </MotionDiv>
            </div>
            <MotionHeading className="text-3xl font-bold text-center mb-8">
              Why Traders Trust Us
            </MotionHeading>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-5xl mx-auto my-2">
            <MotionStaggerContainer>
              {/* Feature 2 */}
              <MotionStaggerItem className="bg-gray-900/80 rounded-xl p-8 mb-10 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="flex justify-center">
                  <div className="bg-blue-600 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                    <Coins className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3">
                  Low Cost Service
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
                  In-depth Information
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
                  Success Ratio Is 80-90%
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
                  Quality Over Quantity
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
                  Strong Technical Analysis
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
                  Telegram Signals
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
            Join Us Today
          </MotionDiv>
          <MotionDiv
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            delay={0.2}
          >
            Sign up on our site to access the best forex signals and take your
            trading to the next level.
          </MotionDiv>
          <MotionDiv delay={0.4}>
            <Button size="lg" asChild>
              <Link href="https://t.me/+uRJNzAveahQ0NjM0">
                Free Registration
              </Link>
            </Button>
          </MotionDiv>
        </div>
      </section>
    </div>
  );
}
