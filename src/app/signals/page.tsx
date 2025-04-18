import { Button } from "@/components/ui/button";
import { SignalCard } from "@/components/ui/signal-card";
import { SearchIcon, Filter, ArrowUpDown } from "lucide-react";

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
  return (
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex justify-center items-center mb-4">
          <h1 className="text-2xl font-bold">Forex Signals</h1>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search signals..."
              className="w-full h-9 pr-3 pl-10 rounded-md border border-gray-800 bg-gray-900 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex gap-2 justify-start">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 border-gray-800 text-gray-300 hover:text-white"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 border-gray-800 text-gray-300 hover:text-white"
            >
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        {/* <div className="bg-gray-900/50 rounded-lg p-4 mb-8 text-sm text-left border border-gray-800">
          For access to all premium signals and professional analysis,{" "}
          <a href="/premium" className="text-primary font-bold hover:underline">
            get Premium Membership
          </a>{" "}
          now.
        </div> */}

        {/* Signals Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {signals.map((signal) => (
            <SignalCard key={signal.id} {...signal} />
          ))}
        </div>

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
