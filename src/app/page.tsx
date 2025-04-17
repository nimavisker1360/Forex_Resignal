import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignalCard } from "@/components/ui/signal-card";
import Image from "next/image";
import { ArrowRight, CheckCircle2, BarChart4, Zap, Users } from "lucide-react";
import {
  MotionDiv,
  MotionStaggerContainer,
  MotionStaggerItem,
  MotionHeading,
  MotionParagraph,
  MotionImage,
} from "@/components/ui/motion-content";

// Sample data for signals
const recentSignals = [
  {
    id: "1",
    pair: "EUR/USD",
    type: "buy" as const,
    price: 1.0825,
    takeProfit: [1.0845, 1.0865, 1.0885],
    stopLoss: 1.0805,
    timestamp: "Today - 10:30",
    success: true,
    isPremium: false,
  },
  {
    id: "2",
    pair: "GBP/JPY",
    type: "sell" as const,
    price: 168.45,
    takeProfit: [168.25, 168.05],
    stopLoss: 168.65,
    timestamp: "Today - 08:15",
    success: false,
    isPremium: false,
  },
  {
    id: "3",
    pair: "XAU/USD",
    type: "buy" as const,
    price: 2352.0,
    takeProfit: [2360.0, 2370.0, 2380.0],
    stopLoss: 2340.0,
    timestamp: "Yesterday - 15:45",
    isPremium: true,
  },
];

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

      {/* Features */}
      <section className="py-16 bg-accent/50 border-none">
        <div className="container mx-auto px-4">
          <MotionStaggerContainer className="text-center mb-12">
            <MotionHeading className="text-3xl font-bold">
              Why Choose Our Signals
            </MotionHeading>
            <MotionParagraph className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              We provide the best signals with high accuracy using advanced
              market analysis techniques
            </MotionParagraph>
          </MotionStaggerContainer>

          <div className="grid md:grid-cols-3 gap-8">
            <MotionDiv className="bg-card border-0 shadow-lg rounded-lg p-6 text-center">
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">High Accuracy</h3>
              <p className="text-muted-foreground">
                Over 85% of our signals successfully reach the specified targets
              </p>
            </MotionDiv>

            <MotionDiv
              className="bg-card border-0 shadow-lg rounded-lg p-6 text-center"
              delay={0.2}
            >
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <BarChart4 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Professional Analysis</h3>
              <p className="text-muted-foreground">
                Each signal includes technical and fundamental analysis by
                experts
              </p>
            </MotionDiv>

            <MotionDiv
              className="bg-card border-0 shadow-lg rounded-lg p-6 text-center"
              delay={0.4}
            >
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Quick signal delivery at the perfect moment to enter the market
              </p>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* Recent Signals */}
      <section className="py-16 border-none">
        <div className="container mx-auto px-4">
          <MotionStaggerContainer className="flex justify-between items-center mb-8">
            <MotionHeading className="text-3xl font-bold">
              Latest Signals
            </MotionHeading>
            <MotionStaggerItem>
              <Button variant="outline" asChild className="border-0 shadow">
                <Link href="/signals">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </MotionStaggerItem>
          </MotionStaggerContainer>

          <div className="grid md:grid-cols-3 gap-6">
            {recentSignals.map((signal, index) => (
              <MotionDiv key={signal.id} className="" delay={index * 0.1}>
                <SignalCard {...signal} />
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30 border-none">
        <div className="container mx-auto px-4">
          <MotionStaggerContainer className="text-center mb-12">
            <MotionHeading className="text-3xl font-bold">
              User Testimonials
            </MotionHeading>
            <MotionParagraph className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              What our users say about our signals
            </MotionParagraph>
          </MotionStaggerContainer>

          <div className="grid md:grid-cols-3 gap-8">
            <MotionDiv className="bg-card border-0 shadow-lg rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                  <Users className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Ali Mohammadi</h4>
                  <p className="text-sm text-muted-foreground">Forex Trader</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                &ldquo;After using the signals from this site, my trading
                profits increased significantly. I&apos;m really
                satisfied!&rdquo;
              </p>
            </MotionDiv>

            <MotionDiv
              className="bg-card border-0 shadow-lg rounded-lg p-6"
              delay={0.2}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                  <Users className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Sara Ahmadi</h4>
                  <p className="text-sm text-muted-foreground">
                    Beginner in Currency Market
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">
                &ldquo;As a beginner, these signals helped me enter trades with
                more confidence. Great support and accurate analysis!&rdquo;
              </p>
            </MotionDiv>

            <MotionDiv
              className="bg-card border-0 shadow-lg rounded-lg p-6"
              delay={0.4}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                  <Users className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Reza Karimi</h4>
                  <p className="text-sm text-muted-foreground">
                    Professional Trader
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">
                &ldquo;The accuracy of the signals is exceptional. I&apos;ve
                used various sites, but none have been as successful as this
                one.&rdquo;
              </p>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary/10 border-none">
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
              <Link href="/sign-up">Free Registration</Link>
            </Button>
          </MotionDiv>
        </div>
      </section>
    </div>
  );
}
