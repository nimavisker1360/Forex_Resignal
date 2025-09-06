import { NextResponse } from "next/server";

export interface MonthlySignal {
  id: string;
  pair: string;
  type: "buy" | "sell";
  entryPrice: number;
  stopLoss: number;
  target: number;
  time: string;
  status: "Successful" | "Unsuccessful";
  volume: number;
  profit: number;
  premium: "free" | "premium";
}

interface MonthlySignalsResponse {
  signals: MonthlySignal[];
  totalProfit: number;
  total: number;
}

export async function GET(request: Request) {
  try {
    // Get URL parameters for filtering
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const search = searchParams.get("search") || "";
    const mockSignals: MonthlySignal[] = [
      {
        id: "1",
        pair: "EUR/USD",
        type: "sell",
        entryPrice: 1.1694,
        stopLoss: 1.1718,
        target: 1.1687,
        time: "08/29/2025, 11:47 PM",
        status: "Successful",
        volume: 0.1,
        profit: 7.5,
        premium: "free",
      },
      {
        id: "2",
        pair: "USD/CAD",
        type: "buy",
        entryPrice: 1.3735,
        stopLoss: 1.3708,
        target: 1.3734,
        time: "08/29/2025, 07:49 PM",
        status: "Unsuccessful",
        volume: 0.01,
        profit: -0.07,
        premium: "free",
      },
      {
        id: "3",
        pair: "USD/CAD",
        type: "sell",
        entryPrice: 1.3733,
        stopLoss: 1.3761,
        target: 1.3735,
        time: "08/29/2025, 07:42 PM",
        status: "Unsuccessful",
        volume: 0.02,
        profit: -0.2,
        premium: "free",
      },
      {
        id: "4",
        pair: "GBP/USD",
        type: "buy",
        entryPrice: 1.3514,
        stopLoss: 1.3487,
        target: 1.3503,
        time: "08/29/2025, 07:36 PM",
        status: "Unsuccessful",
        volume: 0.05,
        profit: -5.1,
        premium: "free",
      },
      {
        id: "5",
        pair: "EUR/USD",
        type: "sell",
        entryPrice: 1.1633,
        stopLoss: 1.1656,
        target: 1.1651,
        time: "08/29/2025, 03:32 PM",
        status: "Unsuccessful",
        volume: 0.1,
        profit: -18.7,
        premium: "free",
      },
      {
        id: "6",
        pair: "EUR/USD",
        type: "sell",
        entryPrice: 1.1683,
        stopLoss: 1.1706,
        target: 1.1651,
        time: "08/29/2025, 03:32 PM",
        status: "Successful",
        volume: 0.11,
        profit: 34.65,
        premium: "free",
      },
      {
        id: "7",
        pair: "GBP/USD",
        type: "sell",
        entryPrice: 1.3522,
        stopLoss: 1.3549,
        target: 1.3488,
        time: "08/29/2025, 10:20 AM",
        status: "Successful",
        volume: 0.11,
        profit: 37.73,
        premium: "free",
      },
      {
        id: "8",
        pair: "NZD/CHF",
        type: "sell",
        entryPrice: 0.4819,
        stopLoss: 0.4828,
        target: 1.3488,
        time: "08/29/2025, 10:20 AM",
        status: "Unsuccessful",
        volume: 0.1,
        profit: -21.9,
        premium: "free",
      },
      {
        id: "9",
        pair: "AUD/USD",
        type: "buy",
        entryPrice: 0.6625,
        stopLoss: 0.6605,
        target: 0.6645,
        time: "08/28/2025, 02:15 PM",
        status: "Successful",
        volume: 0.08,
        profit: 15.2,
        premium: "free",
      },
      {
        id: "10",
        pair: "USD/JPY",
        type: "sell",
        entryPrice: 154.5,
        stopLoss: 154.8,
        target: 154.2,
        time: "08/28/2025, 09:30 AM",
        status: "Successful",
        volume: 0.05,
        profit: 12.8,
        premium: "premium",
      },
    ];

    // Apply search filter
    let filteredSignals = mockSignals;
    if (search) {
      filteredSignals = mockSignals.filter((signal) =>
        signal.pair.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Calculate total profit from filtered signals
    const totalProfit = filteredSignals.reduce(
      (sum, signal) => sum + signal.profit,
      0
    );

    const response: MonthlySignalsResponse = {
      signals: filteredSignals,
      totalProfit: totalProfit,
      total: filteredSignals.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in monthly signals API:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly signals" },
      { status: 500 }
    );
  }
}
