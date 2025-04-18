import { PricingCard } from "@/components/ui/pricing-card";
import { CheckCircle2 } from "lucide-react";
import {
  MotionDiv,
  MotionStaggerContainer,
  MotionStaggerItem,
  justFadeIn,
} from "@/components/ui/motion-content";
import { motion } from "framer-motion";
import { ReactNode, CSSProperties } from "react";

// Custom motion component for feature items with just fade in effect
interface FeatureItemProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const FeatureItem = ({ children, className, style }: FeatureItemProps) => {
  return (
    <motion.div className={className} style={style} variants={justFadeIn}>
      {children}
    </motion.div>
  );
};

const pricingPlans = [
  {
    title: "Basic Plan",
    price: 29,
    period: "monthly",
    features: [
      "Access to public signals",
      "Daily market analysis",
      "Email support",
      "Weekly updates",
    ],
    isPopular: false,
  },
  {
    title: "Professional Plan",
    price: 79,
    period: "monthly",
    features: [
      "Access to all public and premium signals",
      "Daily specialized analysis",
      "24/7 Telegram support",
      "Daily updates",
      "Trading strategy education",
      "Access to signal archive",
    ],
    isPopular: true,
  },
  {
    title: "Elite Plan",
    price: 199,
    period: "quarterly",
    features: [
      "All Professional plan features",
      "Access to VIP signals",
      "Exclusive analyst consultation",
      "Custom symbol analysis",
      "Access to educational webinars",
      "Real-time updates",
    ],
    isPopular: false,
  },
];

const premiumFeatures = [
  {
    title: "Exclusive Signals",
    description: "Access to premium signals with high accuracy",
  },
  {
    title: "Market Analysis",
    description: "Daily and weekly analysis of financial markets",
  },
  {
    title: "24/7 Support",
    description: "Support team ready to answer your questions",
  },
  {
    title: "Specialized Training",
    description: "Professional training courses for traders",
  },
  {
    title: "High Success Rate",
    description: "Over 85% of our signals reach their targets",
  },
  {
    title: "Fully Localized",
    description: "Analysis and signals tailored to global market conditions",
  },
];

export default function PremiumPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold mb-6">Premium Membership</h1>
        <p className="text-lg text-muted-foreground">
          With a premium membership on Signal Forex, you will have access to all
          features and exclusive signals. Our professional team is ready to
          provide you with the best service.
        </p>
      </div>

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {pricingPlans.map((plan, index) => (
          <PricingCard
            key={index}
            title={plan.title}
            price={plan.price}
            period={plan.period as any}
            features={plan.features}
            isPopular={plan.isPopular}
          />
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-card border rounded-lg p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              How does the subscription work?
            </h3>
            <p className="text-muted-foreground">
              You can quickly activate your membership by selecting one of the
              above plans and making an online payment. Immediately after
              payment confirmation, the necessary access will be activated for
              you.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Is there a refund option?
            </h3>
            <p className="text-muted-foreground">
              Yes, if you are not satisfied with our services during the first 7
              days, you can request a refund.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              How are signals delivered?
            </h3>
            <p className="text-muted-foreground">
              Signals are delivered through the website, email, and exclusive
              Telegram channel. You can set your preferred communication method
              in your user dashboard.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Is support available on holidays?
            </h3>
            <p className="text-muted-foreground">
              Yes, our support team is ready to answer your questions every day
              of the week (including holidays).
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-16">
        <MotionDiv className="text-2xl font-bold mb-8 text-center">
          Premium Membership Benefits
        </MotionDiv>

        <MotionStaggerContainer className="grid md:grid-cols-3 gap-8">
          {premiumFeatures.map((feature, index) => (
            <FeatureItem key={index} className="flex space-x-4">
              <div className="flex-shrink-0">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            </FeatureItem>
          ))}
        </MotionStaggerContainer>
      </div>

      {/* Testimonial */}
      <MotionDiv
        className="bg-primary/5 rounded-lg p-8 text-center"
        delay={0.4}
      >
        <blockquote className="max-w-2xl mx-auto">
          <p className="text-xl font-medium mb-6">
            "Since becoming a premium member, my trading profit has more than
            tripled. The accurate and timely signals are truly valuable."
          </p>
          <footer className="font-semibold">
            Masoud Rezaei - Forex Trader
          </footer>
        </blockquote>
      </MotionDiv>
    </div>
  );
}
