"use client";

import { memo, useMemo } from "react";
import type { Quote } from "@/types";

interface QuoteDisplayProps {
  quote: Quote | null;
  isLoading: boolean;
  tokenInSymbol: string;
  tokenOutSymbol: string;
}

const QuoteDisplay = memo(function QuoteDisplay({
  quote,
  isLoading,
  tokenInSymbol,
  tokenOutSymbol,
}: QuoteDisplayProps) {
  const displayData = useMemo(() => {
    if (!quote) return null;
    return {
      price: quote.price,
      route: quote.route,
      priceImpact: `${parseFloat(quote.priceImpact).toFixed(2)}%`,
      platformFee: quote.platformFeeFormatted,
      userReceives: quote.userReceivesFormatted,
    };
  }, [quote]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-[#3B3B3B] rounded animate-pulse" />
          <div className="h-4 w-24 bg-[#3B3B3B] rounded animate-pulse" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-16 bg-[#3B3B3B] rounded animate-pulse" />
          <div className="h-4 w-20 bg-[#3B3B3B] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!displayData) return null;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-[#9B9B9B]">Price</span>
        <span className="text-white">{displayData.price}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-[#9B9B9B]">Route</span>
        <span className="text-[#FF007A]">{displayData.route || "Direct"}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-[#9B9B9B]">Price Impact</span>
        <span
          className={
            parseFloat(displayData.priceImpact) > 1
              ? "text-yellow-500"
              : "text-white"
          }
        >
          {displayData.priceImpact}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-[#9B9B9B]">Platform Fee (0.5%)</span>
        <span className="text-white">
          {displayData.platformFee} {tokenOutSymbol}
        </span>
      </div>

      <div className="border-t border-[#3B3B3B] pt-2 mt-2 flex justify-between font-semibold">
        <span className="text-white">You Receive</span>
        <span className="text-[#FF007A]">
          {displayData.userReceives} {tokenOutSymbol}
        </span>
      </div>
    </div>
  );
});

export default QuoteDisplay;
