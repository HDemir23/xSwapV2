"use client";

import { memo, useCallback, useMemo } from "react";
import type { Token } from "@/types";

interface TokenInputProps {
  token: Token | null;
  amount: string;
  onAmountChange: (amount: string) => void;
  onTokenClick?: () => void;
  label: string;
  balance?: string;
  usdValue?: string;
  readOnly?: boolean;
}

const TokenInput = memo(function TokenInput({
  token,
  amount,
  onAmountChange,
  onTokenClick,
  label,
  balance,
  usdValue,
  readOnly = false,
}: TokenInputProps) {
  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        onAmountChange(value);
      }
    },
    [onAmountChange],
  );

  const handleMaxClick = useCallback(() => {
    if (balance) {
      onAmountChange(balance);
    }
  }, [balance, onAmountChange]);

  return (
    <div className="bg-bg-secondary rounded-xl p-4 border border-sakura-dark/20">
      <div className="flex justify-between items-center mb-2">
        <span className="text-text-muted text-sm">{label}</span>
        {balance && (
          <span className="text-text-muted text-sm">
            Balance: {parseFloat(balance).toFixed(4)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onTokenClick}
          className="flex items-center gap-2 bg-bg-hover hover:bg-bg-card px-3 py-2 rounded-lg transition-colors"
        >
          {token ? (
            <>
              <span className="text-lg">
                {token.symbol === "MON" ? "🪙" : "💎"}
              </span>
              <span className="font-semibold">{token.symbol}</span>
            </>
          ) : (
            <span className="text-sakura-medium">Select token</span>
          )}
          <svg
            className="w-4 h-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <input
          type="text"
          value={amount}
          onChange={handleAmountChange}
          placeholder="0.0"
          readOnly={readOnly}
          className="flex-1 bg-transparent text-2xl font-semibold text-right outline-none placeholder:text-text-muted"
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        {balance && !readOnly && (
          <button
            onClick={handleMaxClick}
            className="text-xs text-sakura-medium hover:text-sakura-accent transition-colors"
          >
            MAX
          </button>
        )}
        <span className="text-text-muted text-sm ml-auto">
          {usdValue && `$${usdValue}`}
        </span>
      </div>
    </div>
  );
});

export default TokenInput;
