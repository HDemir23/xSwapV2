import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api";
import type { Token, Quote } from "@/types";
import { QUOTE_REFRESH_INTERVAL_MS } from "@shared/constants";

export function useQuote(
  tokenIn: Token | null,
  tokenOut: Token | null,
  amountIn: string,
  slippage: number,
  enabled = true,
) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchQuote = useCallback(async () => {
    if (
      !tokenIn ||
      !tokenOut ||
      !amountIn ||
      parseFloat(amountIn) <= 0 ||
      !enabled
    ) {
      setQuote(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const amountWei = BigInt(
        Math.floor(parseFloat(amountIn) * 10 ** tokenIn.decimals),
      ).toString();
      const result = await apiClient.getQuote(
        tokenIn.address,
        tokenOut.address,
        amountWei,
        slippage,
      );
      setQuote(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to get quote";
      setError(message);
      setQuote(null);
    } finally {
      setIsLoading(false);
    }
  }, [tokenIn, tokenOut, amountIn, slippage, enabled]);

  useEffect(() => {
    fetchQuote();

    if (
      enabled &&
      tokenIn &&
      tokenOut &&
      amountIn &&
      parseFloat(amountIn) > 0
    ) {
      intervalRef.current = setInterval(fetchQuote, QUOTE_REFRESH_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchQuote, enabled, tokenIn, tokenOut, amountIn]);

  return { quote, isLoading, error, refetch: fetchQuote };
}
