import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecentSignals } from "@/components/RecentSignals";
import { Testimonials } from "@/components/Testimonials";
import Image from "next/image";
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
              <MotionStaggerItem className="inline-flex items-center bg-gradient-to-r from-blue-700/40 to-blue-500/30 backdrop-blur-sm px-6 py-2.5 rounded-full border border-blue-400/30">
                <span className="text-blue-200 font-medium">
                  Forex Signal Platform
                </span>
              </MotionStaggerItem>

              <MotionHeading className="text-5xl font-extrabold tracking-tight leading-none text-white/90">
                Trading Alerts From Expert Analysts
              </MotionHeading>

              <MotionParagraph className="text-lg md:text-xl text-white/70">
                Get accurate Forex signals straight from expert analysts. Stay
                ahead in the market with real-time updates.
              </MotionParagraph>

              <MotionStaggerItem className="flex flex-wrap justify-center md:justify-end gap-8 mt-6 mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-base">Add stop loss points</span>
                  <div className="bg-primary/20 p-1 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base">When to Sell</span>
                  <div className="bg-primary/20 p-1 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base">When to Buy</span>
                  <div className="bg-primary/20 p-1 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </MotionStaggerItem>

              <MotionStaggerItem className="pt-2">
                <Button
                  size="lg"
                  className="px-8 bg-primary hover:bg-primary/90"
                  asChild
                >
                  <Link href="/signals" className="flex items-center">
                    <span className="mr-1">→</span> Explore Now
                  </Link>
                </Button>
              </MotionStaggerItem>
            </MotionStaggerContainer>
          </div>
        </div>
      </section>

      {/* Gradient divider to hide the line between sections */}
      <div className="h-24 bg-gradient-to-b from-black via-blue-200/5 to-black/10 relative z-20 -mt-16 -mb-10 backdrop-blur-md"></div>

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
        <div className="container mx-auto px-10 relative z-10">
          <MotionStaggerContainer className="flex flex-col items-center mb-10">
            <MotionStaggerItem className="bg-blue-600/60 text-white px-3 py-1.5 rounded-lg mb-3 backdrop-blur-sm">
              <span>Why Choose Us</span>
            </MotionStaggerItem>
            <MotionHeading className="text-3xl font-bold text-center mb-4">
              Why Traders Trust Us
            </MotionHeading>
          </MotionStaggerContainer>

          <MotionStaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto my-2">
            {/* Feature 1 */}
            <MotionStaggerItem className="bg-gray-900/80 rounded-xl p-6 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="flex justify-center">
                <div className="bg-blue-600 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                  <Diamond className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">
                Quality Over Quantity
              </h3>
              {/* <p className="text-gray-400 text-center">
                Lorem ipsum dolor sit amet consectetur adipiscing elit baborum
                nesciunt.
              </p> */}
            </MotionStaggerItem>

            {/* Feature 2 */}
            <MotionStaggerItem className="bg-gray-900/80 rounded-xl p-6 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="flex justify-center">
                <div className="bg-blue-600 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                  <Coins className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">
                Low Cost Service
              </h3>
              {/* <p className="text-gray-400 text-center">
                Lorem ipsum dolor sit amet consectetur adipiscing elit baborum
                nesciunt.
              </p> */}
            </MotionStaggerItem>

            {/* Feature 3 */}
            <MotionStaggerItem className="bg-gray-900/80 rounded-xl p-6 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="flex justify-center">
                <div className="bg-blue-600 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                  <LineChart className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">
                Strong Technical Analysis
              </h3>
              {/* <p className="text-gray-400 text-center">
                Lorem ipsum dolor sit amet consectetur adipiscing elit baborum
                nesciunt.
              </p> */}
            </MotionStaggerItem>

            {/* Feature 4 */}
            <MotionStaggerItem className="bg-gray-900/80 rounded-xl p-6 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="flex justify-center">
                <div className="bg-blue-600 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                  <Info className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">
                In-depth Information
              </h3>
              {/* <p className="text-gray-400 text-center">
                Lorem ipsum dolor sit amet consectetur adipiscing elit baborum
                nesciunt.
              </p> */}
            </MotionStaggerItem>

            {/* Feature 5 */}
            <MotionStaggerItem className="bg-gray-900/80 rounded-xl p-6 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="flex justify-center">
                <div className="bg-blue-600 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">
                Telegram Signals
              </h3>
              {/* <p className="text-gray-400 text-center">
                Lorem ipsum dolor sit amet consectetur adipiscing elit baborum
                nesciunt.
              </p> */}
            </MotionStaggerItem>

            {/* Feature 6 */}
            <MotionStaggerItem className="bg-gray-900/80 rounded-xl p-6 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="flex justify-center">
                <div className="bg-blue-600 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">
                Success Ratio Is 80-90%
              </h3>
              {/* <p className="text-gray-400 text-center">
                Lorem ipsum dolor sit amet consectetur adipiscing elit baborum
                nesciunt.
              </p> */}
            </MotionStaggerItem>
          </MotionStaggerContainer>
        </div>
      </section>

      {/* Recent Signals */}
      <RecentSignals />

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
