"use client";

import { Button } from "@/components/ui/button";
import { SignalCard } from "@/components/ui/signal-card";
import {
  SearchIcon,
  Filter,
  ArrowUpDown,
  Check,
  ChevronDown,
  ArrowDownUp,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MotionDiv,
  MotionStaggerContainer,
  MotionStaggerItem,
} from "@/components/ui/motion-content";

// Sample data for signals
const signals = [
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
  {
    id: "4",
    pair: "USD/JPY",
    type: "buy" as const,
    price: 154.5,
    takeProfit: [154.8, 155.1],
    stopLoss: 154.2,
    timestamp: "Yesterday - 12:20",
    success: true,
    isPremium: false,
  },
  {
    id: "5",
    pair: "EUR/GBP",
    type: "sell" as const,
    price: 0.855,
    takeProfit: [0.853, 0.851],
    stopLoss: 0.857,
    timestamp: "Yesterday - 09:45",
    success: true,
    isPremium: false,
  },
  {
    id: "6",
    pair: "AUD/USD",
    type: "buy" as const,
    price: 0.6625,
    takeProfit: [0.6645, 0.6665],
    stopLoss: 0.6605,
    timestamp: "2 days ago - 14:30",
    isPremium: true,
  },
  {
    id: "7",
    pair: "USD/CAD",
    type: "sell" as const,
    price: 1.365,
    takeProfit: [1.363, 1.361, 1.359],
    stopLoss: 1.367,
    timestamp: "2 days ago - 11:15",
    success: false,
    isPremium: false,
  },
  {
    id: "8",
    pair: "NZD/USD",
    type: "buy" as const,
    price: 0.5985,
    takeProfit: [0.6005, 0.6025],
    stopLoss: 0.5965,
    timestamp: "3 days ago - 16:40",
    success: true,
    isPremium: false,
  },
  {
    id: "9",
    pair: "GBP/USD",
    type: "sell" as const,
    price: 1.2485,
    takeProfit: [1.2465, 1.2445, 1.2425],
    stopLoss: 1.2505,
    timestamp: "3 days ago - 13:20",
    success: true,
    isPremium: false,
  },
  {
    id: "10",
    pair: "USD/CHF",
    type: "buy" as const,
    price: 0.9045,
    takeProfit: [0.9065, 0.9085],
    stopLoss: 0.9025,
    timestamp: "4 days ago - 09:15",
    success: true,
    isPremium: false,
  },
  {
    id: "11",
    pair: "EUR/JPY",
    type: "sell" as const,
    price: 164.75,
    takeProfit: [164.55, 164.35, 164.15],
    stopLoss: 164.95,
    timestamp: "4 days ago - 14:50",
    success: false,
    isPremium: false,
  },
  {
    id: "12",
    pair: "CAD/JPY",
    type: "buy" as const,
    price: 113.25,
    takeProfit: [113.45, 113.65],
    stopLoss: 113.05,
    timestamp: "5 days ago - 11:30",
    isPremium: true,
  },
];

export default function SignalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [signalTypeFilter, setSignalTypeFilter] = useState<
    "all" | "buy" | "sell"
  >("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "pair">(
    "newest"
  );

  // Filter signals based on search query and type filter
  let filteredSignals = signals.filter(
    (signal) =>
      signal.pair.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (signalTypeFilter === "all" || signal.type === signalTypeFilter)
  );

  // Sort signals based on the selected sort order
  filteredSignals = [...filteredSignals].sort((a, b) => {
    if (sortOrder === "pair") {
      return a.pair.localeCompare(b.pair);
    } else if (sortOrder === "newest") {
      // For simplicity, we'll sort by ID in reverse (assuming higher ID = newer)
      return parseInt(b.id) - parseInt(a.id);
    } else {
      // oldest first
      return parseInt(a.id) - parseInt(b.id);
    }
  });

  return (
    <div className="bg-black text-white relative">
      <div
        className="absolute inset-0 mx-auto bg-[url('/images/back.jpg')] bg-no-repeat bg-center opacity-20 z-0"
        style={{
          width: "100%",
          height: "100%",
          backgroundSize: "cover",
        }}
      ></div>
      <div className="max-w-screen-xl mx-auto px-4 py-16 relative z-10">
        <MotionDiv className="flex justify-center items-center mb-8">
          <h1 className="text-4xl font-bold">Forex Signals</h1>
        </MotionDiv>

        {/* Search and filters */}
        <div className="flex flex-col mb-10 mx-auto max-w-5xl">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="...Signal Search"
                className="w-full h-10 pr-3 pl-10 rounded-md border border-gray-800 bg-gray-900 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter buttons row */}
          <div className="flex flex-row gap-2 overflow-x-auto pb-1">
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 px-4 ${
                sortOrder === "newest"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-800 text-gray-300 hover:text-white"
              }`}
              onClick={() => setSortOrder("newest")}
            >
              <ArrowDownUp className="h-4 w-4" />
              Newest
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 px-4 ${
                signalTypeFilter === "all"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-800 text-gray-300 hover:text-white"
              }`}
              onClick={() => setSignalTypeFilter("all")}
            >
              <Filter className="h-4 w-4" />
              All Signals
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 px-4 ${
                signalTypeFilter === "buy"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-800 text-gray-300 hover:text-white"
              }`}
              onClick={() => setSignalTypeFilter("buy")}
            >
              Buy Signals
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 px-4 ${
                signalTypeFilter === "sell"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-800 text-gray-300 hover:text-white"
              }`}
              onClick={() => setSignalTypeFilter("sell")}
            >
              Sell Signals
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 px-4 ${
                sortOrder === "oldest"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-800 text-gray-300 hover:text-white"
              }`}
              onClick={() => setSortOrder("oldest")}
            >
              Oldest
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 px-4 ${
                sortOrder === "pair"
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-800 text-gray-300 hover:text-white"
              }`}
              onClick={() => setSortOrder("pair")}
            >
              Symbol A-Z
            </Button>
          </div>
        </div>

        {/* Signals Grid */}
        <div className="max-w-6xl mx-auto mb-12">
          {filteredSignals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSignals.map((signal) => (
                <div key={signal.id} className="h-full">
                  <SignalCard {...signal} />
                </div>
              ))}
            </div>
          ) : (
            <div className="min-h-[300px] flex items-center justify-center text-center p-8 text-gray-400 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-800 w-full">
              <div>
                <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No signals found with this symbol</p>
                <p className="text-sm mt-2 text-gray-500">
                  Try searching for a different currency pair
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
