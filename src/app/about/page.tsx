import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Award, Users, TrendingUp, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto mb-16 text-center">
        <h1 className="text-4xl font-bold mb-6">About Us</h1>
        <p className="text-lg text-muted-foreground">
          Signal Forex was established with the goal of providing the best
          trading signals and accurate analysis of financial markets
        </p>
      </div>

      {/* Who We Are */}
      <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
          <p className="text-muted-foreground mb-4">
            Signal Forex is a team of professional analysts and experienced
            traders in financial markets that started its activities in 2016.
            Our goal is to provide the best trading signals with high accuracy
            for currency, gold, stock, and other financial markets.
          </p>
          <p className="text-muted-foreground mb-4">
            We provide the best entry and exit points for traders using advanced
            technical and fundamental analysis techniques. Our team consists of
            specialists in various areas of financial markets who monitor
            markets around the clock.
          </p>
          <div className="mt-8">
            <Button asChild>
              <Link href="/signals">
                View Signals
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="order-first md:order-last">
          <div className="relative rounded-lg overflow-hidden border shadow-lg">
            <Image
              src="https://placehold.co/800x600/2087c0/ffffff?text=Our+Team"
              alt="Signal Forex Team"
              width={800}
              height={600}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Our Mission */}
      <div className="bg-card border rounded-lg p-8 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our mission is to help traders achieve sustainable profitability in
            financial markets by providing accurate signals and professional
            training
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <Award className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Quality</h3>
            <p className="text-muted-foreground">
              Providing high-quality and accurate signals to ensure customer
              profitability
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Education</h3>
            <p className="text-muted-foreground">
              Continuous training of traders to increase their skills and
              knowledge in financial markets
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <TrendingUp className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Innovation</h3>
            <p className="text-muted-foreground">
              Continuous updating of analysis methods and providing the latest
              trading techniques
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <Zap className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Support</h3>
            <p className="text-muted-foreground">
              Providing 24-hour support to customers to answer questions and
              guide them
            </p>
          </div>
        </div>
      </div>

      {/* Our Team */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">Our Team</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="aspect-[4/3] relative">
              <Image
                src="https://placehold.co/400x300/2087c0/ffffff?text=Team+Member+1"
                alt="Team Member"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">Ali Mohammadi</h3>
              <p className="text-primary mb-4">CEO & Senior Analyst</p>
              <p className="text-muted-foreground">
                Over 15 years of experience in financial markets and investment
                fund management
              </p>
            </div>
          </div>

          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="aspect-[4/3] relative">
              <Image
                src="https://placehold.co/400x300/2087c0/ffffff?text=Team+Member+2"
                alt="Team Member"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">Sara Karimi</h3>
              <p className="text-primary mb-4">Technical Analyst</p>
              <p className="text-muted-foreground">
                Specialist in technical analysis and trading strategies with 10
                years of experience in the forex market
              </p>
            </div>
          </div>

          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="aspect-[4/3] relative">
              <Image
                src="https://placehold.co/400x300/2087c0/ffffff?text=Team+Member+3"
                alt="Team Member"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">Reza Ahmadi</h3>
              <p className="text-primary mb-4">Fundamental Analyst</p>
              <p className="text-muted-foreground">
                Specialist in fundamental and economic analysis, with experience
                working in international banks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-8 mb-20">
        <div className="bg-card border rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">+8</div>
          <p className="text-muted-foreground">Years Active</p>
        </div>

        <div className="bg-card border rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">+5000</div>
          <p className="text-muted-foreground">Active Users</p>
        </div>

        <div className="bg-card border rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">+85%</div>
          <p className="text-muted-foreground">Signal Success Rate</p>
        </div>

        <div className="bg-card border rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">24/7</div>
          <p className="text-muted-foreground">Support</p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary/10 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Join Us</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          By signing up on the Signal Forex site, benefit from the best trading
          signals and specialized analysis to increase your profitability.
        </p>
        <Button size="lg" asChild>
          <Link href="/sign-up">Get Started</Link>
        </Button>
      </div>
    </div>
  );
}
