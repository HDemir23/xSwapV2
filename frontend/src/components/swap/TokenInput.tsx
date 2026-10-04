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

const PERCENTAGE_OPTIONS = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "MAX", value: 1 },
];

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

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      if (balance) {
        const balanceNum = parseFloat(balance);
        if (balanceNum > 0) {
          const calculatedAmount = balanceNum * percentage;
          // Format to avoid excessive decimal places
          const formatted = calculatedAmount.toFixed(6).replace(/\.?0+$/, "");
          onAmountChange(formatted);
        }
      }
    },
    [balance, onAmountChange],
  );

  const hasBalance = useMemo(() => {
    return balance && parseFloat(balance) > 0;
  }, [balance]);

  const formattedBalance = useMemo(() => {
    if (!balance) return null;
    const num = parseFloat(balance);
    if (num === 0) return "0";
    if (num < 0.0001) return "<0.0001";
    return num.toLocaleString("en-US", {
      maximumFractionDigits: 4,
      minimumFractionDigits: 0,
    });
  }, [balance]);

  return (
    <div className="bg-[#1B1A1A] rounded-2xl p-4">
      {/* Label row with inline balance and percentage buttons - Uniswap style */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-[#9B9B9B] text-sm">{label}</span>
        {balance && (
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-[#9B9B9B]">Balance: {formattedBalance}</span>
            {!readOnly && hasBalance && (
              <div className="flex gap-1 ml-1">
                {PERCENTAGE_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handlePercentageClick(option.value)}
                    className="text-[#FF007A] hover:text-[#FF007A]/80 font-medium transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Token selector and input row */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTokenClick}
          className="flex items-center gap-2 bg-[#2B2B2B] hover:bg-[#3B3B3B] px-3 py-2.5 rounded-2xl transition-colors"
        >
          {token ? (
            <>
              <span className="text-lg">
                {token.symbol === "MON" ? "🪙" : "💎"}
              </span>
              <span className="font-semibold text-white">{token.symbol}</span>
            </>
          ) : (
            <span className="text-[#FF007A]">Select token</span>
          )}
          <svg
            className="w-4 h-4 text-[#9B9B9B]"
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
          placeholder="0"
          readOnly={readOnly}
          className="flex-1 bg-transparent text-3xl font-semibold text-right outline-none placeholder:text-[#5E5E5E] text-white"
        />
      </div>

      {/* USD value at bottom */}
      {usdValue && (
        <div className="text-[#9B9B9B] text-sm mt-2 text-right">
          ≈ ${usdValue}
        </div>
      )}
    </div>
  );
});

export default TokenInput;
