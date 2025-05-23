import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignalCard } from "@/components/ui/signal-card";
import { ArrowRight } from "lucide-react";
import {
  MotionDiv,
  MotionStaggerContainer,
  MotionStaggerItem,
  MotionHeading,
} from "@/components/ui/motion-content";
import { useLanguage } from "@/lib/language-context";

// Sample data for signals with orange color styling for pairs
const recentSignals = [
  {
    id: "1",
    pair: "XAU/USD",
    type: "buy" as const,
    price: 2352.0,
    takeProfit: [2360.0, 2370.0, 2380.0],
    stopLoss: 2340.0,
    timestamp: "Yesterday - 15:45",
    success: true,
    pairColor: "text-white", // Changed from orange to white
    isOpen: false, // Position is closed
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
    pairColor: "text-white", // Changed from orange to white
    isOpen: false, // Position is closed
  },
  {
    id: "3",
    pair: "EUR/USD",
    type: "buy" as const,
    price: 1.0825,
    takeProfit: [1.0845, 1.0865, 1.0885],
    stopLoss: 1.0805,
    timestamp: "Today - 10:30",
    pairColor: "text-white", // Changed from orange to white
    isOpen: true, // Position is open
  },
];

export function RecentSignals() {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-black relative">
      <div
        className="absolute inset-0 mx-auto my-auto bg-[url('/images/back.jpg')] bg-contain bg-center opacity-20 z-0"
        style={{
          width: "100%",
          height: "100%",
          top: "0%",
          left: "0%",
          transform: "rotate(8deg) scale(1.2)",
        }}
      ></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center mb-12 border-b border-gray-800 pb-6">
          <MotionHeading className="text-5xl font-bold text-white mb-6 text-center">
            {t("latestSignals")}
          </MotionHeading>
          <Button
            variant="outline"
            asChild
            className="border border-gray-700 shadow-md text-gray-300 hover:text-white hover:bg-gray-800 px-6 py-2 mb-8 mx-auto"
          >
            <Link href="/signals" className="flex items-center justify-center">
              {t("viewAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {recentSignals.map((signal, index) => (
            <MotionDiv
              key={signal.id}
              className="rounded-lg overflow-hidden shadow-lg"
              delay={index * 0.1}
            >
              <SignalCard {...signal} />
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
