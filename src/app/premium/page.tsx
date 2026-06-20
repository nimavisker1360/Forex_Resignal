import { PricingCard } from "@/components/ui/pricing-card";
import {
  CheckCircle2,
  CreditCard,
  Headphones,
  HelpCircle,
  RotateCcw,
  Send,
} from "lucide-react";

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

const faqItems = [
  {
    question: "How does the subscription work?",
    answer:
      "Choose a plan, complete the payment, and your access will be activated after confirmation.",
    icon: CreditCard,
  },
  {
    question: "Is there a refund option?",
    answer:
      "Yes. If you are not satisfied during the first 7 days, you can request a refund.",
    icon: RotateCcw,
  },
  {
    question: "How are signals delivered?",
    answer:
      "Signals are delivered through the website, email, and the exclusive Telegram channel.",
    icon: Send,
  },
  {
    question: "Is support available on holidays?",
    answer:
      "Yes. Our support team is available every day of the week, including holidays.",
    icon: Headphones,
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
            period={plan.period as "monthly" | "quarterly" | "yearly"}
            features={plan.features}
            isPopular={plan.isPopular}
          />
        ))}
      </div>

      {/* FAQ */}
      <section className="mb-16 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white">
            <HelpCircle className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-slate-950">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Clear answers about membership, payments, signal delivery, and support.
          </p>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          {faqItems.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.question}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-950">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.answer}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <div className="mb-16">
        <div className="text-2xl font-bold mb-8 text-center">
          Premium Membership Benefits
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {premiumFeatures.map((feature, index) => (
            <div key={index} className="flex space-x-4">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
