"use client";

import { memo, useMemo } from "react";
import { useAccount } from "wagmi";
import { useWalletBalances } from "@/hooks/useBalances";
import type { Token } from "@/types";

interface WalletBalancesProps {
  tokens: Token[];
  onSelectToken?: (token: Token, direction: "in" | "out") => void;
}

const WalletBalances = memo(function WalletBalances({
  tokens,
  onSelectToken,
}: WalletBalancesProps) {
  const { isConnected } = useAccount();
  const { balances, isLoading } = useWalletBalances(tokens);

  // Filter to show only tokens with balance > 0
  const tokensWithBalance = useMemo(() => {
    return balances.filter((b) => parseFloat(b.balanceFormatted) > 0);
  }, [balances]);

  if (!isConnected) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-bg-secondary rounded-xl p-4 border border-sakura-dark/20 mb-6">
        <h3 className="text-sm font-medium text-text-muted mb-3">
          Your Wallet
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 bg-bg-hover rounded-lg p-3 animate-pulse"
            >
              <div className="h-4 w-12 bg-bg-card rounded mb-2" />
              <div className="h-6 w-20 bg-bg-card rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tokensWithBalance.length === 0) {
    return (
      <div className="bg-bg-secondary rounded-xl p-4 border border-sakura-dark/20 mb-6">
        <h3 className="text-sm font-medium text-text-muted mb-3">
          Your Wallet
        </h3>
        <p className="text-text-muted text-sm">No token balances found</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary rounded-xl p-4 border border-sakura-dark/20 mb-6">
      <h3 className="text-sm font-medium text-text-muted mb-3">Your Wallet</h3>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tokensWithBalance.map((balance) => (
          <button
            key={balance.token.address}
            onClick={() =>
              onSelectToken?.(
                balance.token,
                balance.token.symbol === "MON" ? "in" : "out",
              )
            }
            className="flex-shrink-0 bg-bg-hover hover:bg-bg-card rounded-lg p-3 transition-colors cursor-pointer border border-transparent hover:border-sakura-dark/30"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">
                {balance.token.symbol === "MON" ? "🪙" : "💎"}
              </span>
              <span className="text-xs text-text-muted font-medium">
                {balance.token.symbol}
              </span>
            </div>
            <div className="text-sm font-semibold text-text-primary">
              {formatBalance(balance.balanceFormatted)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

// Helper to format balance nicely
function formatBalance(balance: string): string {
  const num = parseFloat(balance);
  if (num === 0) return "0";
  if (num < 0.0001) return "<0.0001";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + "K";
  }
  // Format with commas and up to 4 decimal places
  return num.toLocaleString("en-US", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  });
}

export default WalletBalances;
