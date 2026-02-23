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
      <div className="bg-bg-secondary rounded-xl p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
      </div>
    );
  }

  if (!displayData) return null;

  return (
    <div className="bg-bg-secondary rounded-xl p-4 space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-text-muted">Price</span>
        <span>{displayData.price}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-text-muted">Route</span>
        <span className="text-sakura-medium">{displayData.route}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-text-muted">Price Impact</span>
        <span
          className={
            parseFloat(displayData.priceImpact) > 1 ? "text-warning" : ""
          }
        >
          {displayData.priceImpact}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-text-muted">Platform Fee (0.5%)</span>
        <span>
          {displayData.platformFee} {tokenOutSymbol}
        </span>
      </div>

      <div className="border-t border-sakura-dark/20 pt-3 flex justify-between font-semibold">
        <span>You Receive</span>
        <span className="text-sakura-medium">
          {displayData.userReceives} {tokenOutSymbol}
        </span>
      </div>
    </div>
  );
});

export default QuoteDisplay;
