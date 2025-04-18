"use client";

import { ArrowUpCircle, ArrowDownCircle, Clock, Percent } from "lucide-react";

export interface SignalCardProps {
  id: string;
  pair: string;
  type: "buy" | "sell";
  price: number;
  takeProfit: number[];
  stopLoss: number;
  timestamp: string;
  success?: boolean;
  isPremium?: boolean;
  pairColor?: string;
  isOpen?: boolean;
}

export function SignalCard({
  pair,
  type,
  price,
  takeProfit,
  stopLoss,
  timestamp,
  success,
  pairColor = "text-white",
  isOpen = true,
}: SignalCardProps) {
  const isCompleted = success !== undefined;
  const textColor = type === "buy" ? "text-green-500" : "text-red-500";

  return (
    <div
      className={`bg-gray-900 rounded-lg overflow-hidden h-full flex flex-col`}
    >
      <div className="border-b border-gray-800 py-3 px-4 flex flex-row-reverse justify-between items-center">
        <div className={`text-xl font-bold ${pairColor}`}>{pair}</div>
        <div className={`font-medium ${textColor} flex items-center gap-1`}>
          {type === "buy" ? (
            <>
              <ArrowUpCircle className="h-5 w-5" />
              <span>Buy</span>
            </>
          ) : (
            <>
              <ArrowDownCircle className="h-5 w-5" />
              <span>Sell</span>
            </>
          )}
        </div>
      </div>

      <div className="p-5 text-right flex-grow flex flex-col">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm mb-2">Stop Loss</span>
            <span className="font-medium text-lg text-red-400">{stopLoss}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm mb-2">Entry Price</span>
            <span className="font-medium text-lg text-white">{price}</span>
          </div>
        </div>

        <div className="mb-6">
          {takeProfit.map((tp, i) => (
            <div
              key={i}
              className="flex flex-row-reverse justify-between items-center mb-3"
            >
              <span className="text-gray-400 text-sm">Target {i + 1}</span>
              <span className="font-medium text-green-400">{tp}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-row-reverse justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{timestamp}</span>
            <Clock className="h-3.5 w-3.5" />
          </div>

          {isCompleted && (
            <div
              className={`text-sm flex flex-row-reverse items-center gap-1.5
                ${success ? "text-green-500" : "text-red-500"}
              `}
            >
              <span className="font-medium">
                {success ? "Successful" : "Unsuccessful"}
              </span>
              <Percent className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="mt-auto"></div>

        {/* Position Status Box - Positioned consistently across all cards */}
        <div
          className={`w-full py-2 text-center font-bold rounded-md ${
            isOpen
              ? "bg-green-600/20 text-green-400"
              : "bg-red-600/20 text-red-400"
          } mt-6`}
        >
          {isOpen ? "OPEN" : "CLOSED"}
        </div>
      </div>
    </div>
  );
}
