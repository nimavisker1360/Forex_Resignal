"use client";

import { Button } from "@/components/ui/button";
import { SignalCard } from "@/components/ui/signal-card";
import {
  SearchIcon,
  Filter,
  ArrowUpDown,
  Check,
  ChevronDown,
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
      <div className="max-w-screen-xl mx-auto px-4 py-6 relative z-10">
        <MotionDiv className="flex justify-center items-center mb-4">
          <h1 className="text-2xl font-bold">Forex Signals</h1>
        </MotionDiv>

        {/* Filters and Search */}
        <MotionDiv className="flex flex-col sm:flex-row gap-3 mb-6" delay={0.1}>
          <div className="order-2 sm:order-1 relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="...Signal Search"
              className="w-full h-9 pr-3 pl-10 rounded-md border border-gray-800 bg-gray-900 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="order-1 sm:order-2 flex gap-2 justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border-gray-800 text-gray-300 hover:text-white"
                >
                  <Filter className="h-4 w-4" />
                  {signalTypeFilter === "all"
                    ? "All Signals"
                    : signalTypeFilter === "buy"
                    ? "Buy Signals"
                    : "Sell Signals"}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white">
                <DropdownMenuItem
                  className={`flex items-center gap-2 ${
                    signalTypeFilter === "all" ? "text-primary" : ""
                  }`}
                  onClick={() => setSignalTypeFilter("all")}
                >
                  {signalTypeFilter === "all" && <Check className="h-4 w-4" />}
                  <span
                    className={signalTypeFilter === "all" ? "ml-0" : "ml-6"}
                  >
                    All Signals
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`flex items-center gap-2 ${
                    signalTypeFilter === "buy" ? "text-primary" : ""
                  }`}
                  onClick={() => setSignalTypeFilter("buy")}
                >
                  {signalTypeFilter === "buy" && <Check className="h-4 w-4" />}
                  <span
                    className={signalTypeFilter === "buy" ? "ml-0" : "ml-6"}
                  >
                    Buy Signals
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`flex items-center gap-2 ${
                    signalTypeFilter === "sell" ? "text-primary" : ""
                  }`}
                  onClick={() => setSignalTypeFilter("sell")}
                >
                  {signalTypeFilter === "sell" && <Check className="h-4 w-4" />}
                  <span
                    className={signalTypeFilter === "sell" ? "ml-0" : "ml-6"}
                  >
                    Sell Signals
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border-gray-800 text-gray-300 hover:text-white"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {sortOrder === "newest"
                    ? "Newest"
                    : sortOrder === "oldest"
                    ? "Oldest"
                    : "Symbol A-Z"}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 border-gray-800 text-white">
                <DropdownMenuItem
                  className={`flex items-center gap-2 ${
                    sortOrder === "newest" ? "text-primary" : ""
                  }`}
                  onClick={() => setSortOrder("newest")}
                >
                  {sortOrder === "newest" && <Check className="h-4 w-4" />}
                  <span className={sortOrder === "newest" ? "ml-0" : "ml-6"}>
                    Newest First
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`flex items-center gap-2 ${
                    sortOrder === "oldest" ? "text-primary" : ""
                  }`}
                  onClick={() => setSortOrder("oldest")}
                >
                  {sortOrder === "oldest" && <Check className="h-4 w-4" />}
                  <span className={sortOrder === "oldest" ? "ml-0" : "ml-6"}>
                    Oldest First
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`flex items-center gap-2 ${
                    sortOrder === "pair" ? "text-primary" : ""
                  }`}
                  onClick={() => setSortOrder("pair")}
                >
                  {sortOrder === "pair" && <Check className="h-4 w-4" />}
                  <span className={sortOrder === "pair" ? "ml-0" : "ml-6"}>
                    Symbol A-Z
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </MotionDiv>

        {/* Info Banner */}
        {/* <div className="bg-gray-900/50 rounded-lg p-4 mb-8 text-sm text-left border border-gray-800">
          For access to all premium signals and professional analysis,{" "}
          <a href="/premium" className="text-primary font-bold hover:underline">
            get Premium Membership
          </a>{" "}
          now.
        </div> */}

        {/* Signals Grid */}
        <MotionStaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {filteredSignals.length > 0 ? (
            filteredSignals.map((signal) => (
              <MotionStaggerItem key={signal.id}>
                <SignalCard {...signal} />
              </MotionStaggerItem>
            ))
          ) : (
            <MotionDiv className="col-span-full min-h-[300px] flex items-center justify-center text-center p-8 text-gray-400 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-800 w-full">
              <div>
                <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No signals found with this symbol</p>
                <p className="text-sm mt-2 text-gray-500">
                  Try searching for a different currency pair
                </p>
              </div>
            </MotionDiv>
          )}
        </MotionStaggerContainer>

        {/* Pagination */}
        {/* <div className="flex justify-center mt-12">
          <nav className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-800 text-gray-300 hover:text-white"
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-800 text-gray-300 hover:text-white"
            >
              8
            </Button>
            <span className="px-2 text-gray-400">...</span>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-800 text-gray-300 hover:text-white"
            >
              3
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-800 text-gray-300 hover:text-white"
            >
              2
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="text-gray-600 border-gray-800"
            >
              Previous
            </Button>
          </nav>
        </div> */}
      </div>
    </div>
  );
}
