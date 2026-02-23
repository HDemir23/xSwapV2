"use client";

import { memo, useMemo, useState, useCallback } from "react";
import type { Token } from "@/types";

interface TokenSelectorProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  onClose: () => void;
}

const TokenSelector = memo(function TokenSelector({
  tokens,
  selectedToken,
  onSelect,
  onClose,
}: TokenSelectorProps) {
  const [search, setSearch] = useState("");

  const filteredTokens = useMemo(() => {
    if (!search) return tokens;
    const searchLower = search.toLowerCase();
    return tokens.filter(
      (t) =>
        t.symbol.toLowerCase().includes(searchLower) ||
        t.name.toLowerCase().includes(searchLower),
    );
  }, [tokens, search]);

  const handleSelect = useCallback(
    (token: Token) => {
      onSelect(token);
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-card rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden border border-sakura-dark/30">
        <div className="p-4 border-b border-sakura-dark/20 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Select Token</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or address"
            className="w-full bg-bg-secondary border border-sakura-dark/20 rounded-lg px-4 py-3 outline-none focus:border-sakura-medium transition-colors"
          />
        </div>

        <div className="overflow-y-auto max-h-96">
          {filteredTokens.map((token) => (
            <button
              key={token.address}
              onClick={() => handleSelect(token)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-bg-hover transition-colors ${
                selectedToken?.address === token.address ? "bg-bg-hover" : ""
              }`}
            >
              <span className="text-2xl">
                {token.symbol === "MON" ? "🪙" : "💎"}
              </span>
              <div className="flex-1 text-left">
                <div className="font-semibold">{token.symbol}</div>
                <div className="text-sm text-text-muted">{token.name}</div>
              </div>
              {token.priceUsd && (
                <div className="text-sm text-text-muted">
                  ${token.priceUsd.toFixed(4)}
                </div>
              )}
            </button>
          ))}

          {filteredTokens.length === 0 && (
            <div className="p-8 text-center text-text-muted">
              No tokens found
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default TokenSelector;
