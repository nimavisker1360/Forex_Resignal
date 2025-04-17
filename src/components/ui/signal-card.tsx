"use client";

import {
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  BarChart3,
  Percent,
} from "lucide-react";
import { Button } from "./button";

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
}

export function SignalCard({
  id,
  pair,
  type,
  price,
  takeProfit,
  stopLoss,
  timestamp,
  success,
  isPremium = false,
}: SignalCardProps) {
  const isCompleted = success !== undefined;

  return (
    <div
      className={`bg-custom border rounded-lg overflow-hidden 
      ${
        isCompleted
          ? success
            ? "border-green-500/20 bg-green-500/5"
            : "border-red-500/20 bg-red-500/5"
          : ""
      }
      ${isPremium ? "border-amber-500/30" : ""}
    `}
    >
      {isPremium && (
        <div className="bg-amber-500 text-xs font-medium py-1 text-center text-black">
          Premium Signal
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{pair}</h3>
          <div
            className={`flex items-center gap-1 
            ${type === "buy" ? "text-green-500" : "text-red-500"}
          `}
          >
            {type === "buy" ? (
              <ArrowUpCircle className="h-5 w-5" />
            ) : (
              <ArrowDownCircle className="h-5 w-5" />
            )}
            <span className="font-semibold">
              {type === "buy" ? "Buy" : "Sell"}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted">Entry Price:</span>
          <span className="font-medium">{price}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted">Stop Loss:</span>
          <span className="font-medium text-red-400">{stopLoss}</span>
        </div>

        {takeProfit.map((tp, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-muted">Target {i + 1}:</span>
            <span className="font-medium text-green-400">{tp}</span>
          </div>
        ))}

        <div className="flex items-center gap-2 text-xs text-muted mt-4">
          <Clock className="h-3.5 w-3.5" />
          <span>{timestamp}</span>
        </div>

        {isCompleted && (
          <div
            className={`mt-3 text-sm flex items-center gap-1.5 
            ${success ? "text-green-500" : "text-red-500"}
          `}
          >
            {success ? (
              <>
                <span className="font-medium">Successful</span>
                <Percent className="h-4 w-4" />
              </>
            ) : (
              <>
                <span className="font-medium">Unsuccessful</span>
                <Percent className="h-4 w-4" />
              </>
            )}
          </div>
        )}

        {!isCompleted && (
          <div className="mt-3">
            <Button variant="outline" size="sm" className="w-full">
              <BarChart3 className="mr-2 h-4 w-4" />
              Show Analysis
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
