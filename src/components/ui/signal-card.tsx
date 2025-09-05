"use client";

import { ArrowUpCircle, ArrowDownCircle, Clock, Percent } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

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
  const { t } = useLanguage();
  // If success === true, consider position closed regardless of passed prop
  const positionOpen = isOpen && success !== true;

  return (
    <div
      className={`${success === true ? "bg-red-900/60 border border-red-800" : "bg-gray-900/80"} backdrop-blur-sm rounded-lg overflow-hidden h-full flex flex-col text-right`}
    >
      <div className="border-b border-gray-800 py-3 px-4 flex flex-row-reverse justify-between items-center">
        <div className={`text-xl font-bold ${pairColor}`}>{pair}</div>
        <div className={`font-medium ${textColor} flex items-center gap-1`}>
          {type === "buy" ? (
            <>
              <ArrowUpCircle className="h-5 w-5" />
              <span>{t("buy")}</span>
            </>
          ) : (
            <>
              <ArrowDownCircle className="h-5 w-5" />
              <span>{t("sell")}</span>
            </>
          )}
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col items-end">
            <span className="text-gray-400 text-sm mb-2">
              {t("entryPrice")}
            </span>
            <span className="font-medium text-lg text-white">{price}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-gray-400 text-sm mb-2">{t("stopLoss")}</span>
            <span className="font-medium text-lg text-red-400">{stopLoss}</span>
          </div>
        </div>

        <div className="mb-6">
          {takeProfit.map((tp, i) => (
            <div
              key={i}
              className="flex flex-row-reverse justify-between items-center mb-3"
            >
              <span className="text-gray-400 text-sm">
                {t("target")} {i + 1}
              </span>
              <span className="font-medium text-green-400">{tp}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-row-reverse justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            <span>{timestamp}</span>
          </div>

          {isCompleted && (
            <div
              className={`text-sm flex items-center gap-1.5
                ${success ? "text-green-500" : "text-red-500"}
              `}
            >
              <span className="font-medium">
                {success ? t("successful") : t("unsuccessful")}
              </span>
              <Percent className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="mt-auto"></div>

        {/* Position Status Box - Positioned consistently across all cards */}
        <div
          className={`w-full py-2 text-center font-bold rounded-md ${
            positionOpen
              ? "bg-green-600/20 text-green-400"
              : "bg-red-600/20 text-red-400"
          } mt-6`}
        >
          {positionOpen ? t("open") : t("closed")}
        </div>
      </div>
    </div>
  );
}
