"use client";

import { memo, useState, useCallback, useMemo, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TokenInput from "@/components/swap/TokenInput";
import TokenSelector from "@/components/swap/TokenSelector";
import SlippageSettings from "@/components/swap/SlippageSettings";
import QuoteDisplay from "@/components/swap/QuoteDisplay";
import { useTokens } from "@/hooks/useTokens";
import { useBalances } from "@/hooks/useBalances";
import { useQuote } from "@/hooks/useQuote";
import { apiClient } from "@/lib/api";
import type { Token } from "@/types";
import { NATIVE_MON_ADDRESS } from "@/types";

const SwapPage = memo(function SwapPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [selectorOpen, setSelectorOpen] = useState<"in" | "out" | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [swapSuccess, setSwapSuccess] = useState<string | null>(null);

  const { data: tokensData } = useTokens();
  const { data: balancesData, refetch: refetchBalances } = useBalances();
  const {
    quote,
    isLoading: quoteLoading,
    error: quoteError,
  } = useQuote(tokenIn, tokenOut, amountIn, slippage, isConnected);

  const tokens = useMemo(() => tokensData?.tokens ?? [], [tokensData]);
  const balances = useMemo(() => balancesData?.balances ?? [], [balancesData]);

  useEffect(() => {
    if (tokens.length > 0 && !tokenIn) {
      const monToken = tokens.find((t) => t.symbol === "MON");
      if (monToken) setTokenIn(monToken);
    }
  }, [tokens, tokenIn]);

  useEffect(() => {
    if (tokens.length > 0 && !tokenOut && tokenIn?.symbol === "MON") {
      const otherToken = tokens.find((t) => t.symbol !== "MON");
      if (otherToken) setTokenOut(otherToken);
    }
  }, [tokens, tokenOut, tokenIn]);

  const balanceIn = useMemo(() => {
    if (!tokenIn || !balances.length) return undefined;
    const bal = balances.find(
      (b) => b.token.address.toLowerCase() === tokenIn.address.toLowerCase(),
    );
    return bal?.balanceFormatted;
  }, [tokenIn, balances]);

  const balanceOut = useMemo(() => {
    if (!tokenOut || !balances.length) return undefined;
    const bal = balances.find(
      (b) => b.token.address.toLowerCase() === tokenOut.address.toLowerCase(),
    );
    return bal?.balanceFormatted;
  }, [tokenOut, balances]);

  const handleAuthenticate = useCallback(async () => {
    if (!address || !isConnected) return;

    setIsAuthenticating(true);
    setSwapError(null);

    try {
      const { message } = await apiClient.getAuthMessage(address);
      const signature = await signMessageAsync({
        message: message as `0x${string}`,
      });
      await apiClient.connectWallet(address, message, signature);
      await refetchBalances();
    } catch (err: any) {
      setSwapError(err.message || "Authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, isConnected, signMessageAsync, refetchBalances]);

  const handleTokenSelect = useCallback(
    (token: Token) => {
      if (selectorOpen === "in") {
        if (tokenOut?.address.toLowerCase() === token.address.toLowerCase()) {
          setTokenOut(tokenIn);
        }
        setTokenIn(token);
      } else {
        if (tokenIn?.address.toLowerCase() === token.address.toLowerCase()) {
          setTokenIn(tokenOut);
        }
        setTokenOut(token);
      }
    },
    [selectorOpen, tokenIn, tokenOut],
  );

  const handleSwapTokens = useCallback(() => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    setAmountIn("");
  }, [tokenIn, tokenOut]);

  const handleSwap = useCallback(async () => {
    if (!quote || !isConnected) return;

    if (!apiClient.isAuthenticated()) {
      await handleAuthenticate();
      return;
    }

    setIsSwapping(true);
    setSwapError(null);
    setSwapSuccess(null);

    try {
      if (tokenIn && tokenIn.address !== NATIVE_MON_ADDRESS) {
        const { needsApproval } = await apiClient.checkAllowance(
          tokenIn.address,
          amountIn,
        );
        if (needsApproval) {
          setSwapError(
            "Token approval required. Please approve the token first.",
          );
          setIsSwapping(false);
          return;
        }
      }

      if (!quote.unsignedTx) {
        throw new Error("No transaction data available");
      }

      setSwapError(
        "Transaction signing not implemented in this demo. Use wagmi sendTransaction.",
      );
      setIsSwapping(false);
    } catch (err: any) {
      setSwapError(err.message || "Swap failed");
    } finally {
      setIsSwapping(false);
    }
  }, [quote, isConnected, tokenIn, amountIn, handleAuthenticate]);

  const buttonText = useMemo(() => {
    if (!isConnected) return "Connect Wallet";
    if (!apiClient.isAuthenticated()) return "Sign to Continue";
    if (!tokenIn || !tokenOut) return "Select Tokens";
    if (!amountIn || parseFloat(amountIn) <= 0) return "Enter Amount";
    if (quoteLoading) return "Getting Quote...";
    if (quoteError) return "Quote Error - Retry";
    if (!quote) return "Enter Amount";
    if (isSwapping) return "Swapping...";
    return "Swap";
  }, [
    isConnected,
    tokenIn,
    tokenOut,
    amountIn,
    quoteLoading,
    quoteError,
    quote,
    isSwapping,
  ]);

  const isButtonDisabled = useMemo(() => {
    return (
      isSwapping ||
      isAuthenticating ||
      !isConnected ||
      !tokenIn ||
      !tokenOut ||
      !amountIn ||
      parseFloat(amountIn) <= 0 ||
      quoteLoading ||
      !quote
    );
  }, [
    isSwapping,
    isAuthenticating,
    isConnected,
    tokenIn,
    tokenOut,
    amountIn,
    quoteLoading,
    quote,
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Swap on <span className="text-sakura-medium">Monad</span>
            </h1>
            <p className="text-text-secondary">
              Best prices via Kuru DEX • 0.5% platform fee
            </p>
          </div>

          <div className="card">
            <div className="flex justify-end mb-4">
              <SlippageSettings slippage={slippage} onChange={setSlippage} />
            </div>

            <div className="space-y-2">
              <TokenInput
                token={tokenIn}
                amount={amountIn}
                onAmountChange={setAmountIn}
                onTokenClick={() => setSelectorOpen("in")}
                label="You Pay"
                balance={balanceIn}
              />

              <div className="flex justify-center -my-2 relative z-10">
                <button
                  onClick={handleSwapTokens}
                  className="bg-bg-card hover:bg-bg-hover border border-sakura-dark/30 rounded-lg p-2 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-sakura-medium"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </button>
              </div>

              <TokenInput
                token={tokenOut}
                amount={quote?.outputAmountFormatted ?? ""}
                onAmountChange={() => {}}
                onTokenClick={() => setSelectorOpen("out")}
                label="You Receive"
                balance={balanceOut}
                readOnly
              />
            </div>

            {(quote || quoteLoading) && tokenIn && tokenOut && (
              <div className="mt-4">
                <QuoteDisplay
                  quote={quote}
                  isLoading={quoteLoading}
                  tokenInSymbol={tokenIn.symbol}
                  tokenOutSymbol={tokenOut.symbol}
                />
              </div>
            )}

            {quoteError && (
              <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                {quoteError}
              </div>
            )}

            {swapError && (
              <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                {swapError}
              </div>
            )}

            {swapSuccess && (
              <div className="mt-4 p-3 bg-success/10 border border-success/30 rounded-lg text-success text-sm">
                {swapSuccess}
              </div>
            )}

            <button
              onClick={handleSwap}
              disabled={isButtonDisabled}
              className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {buttonText}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="card p-4">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-sm text-text-muted">Fast Swaps</div>
            </div>
            <div className="card p-4">
              <div className="text-2xl mb-1">🔒</div>
              <div className="text-sm text-text-muted">Secure</div>
            </div>
            <div className="card p-4">
              <div className="text-2xl mb-1">🤖</div>
              <div className="text-sm text-text-muted">Bot API</div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {selectorOpen && (
        <TokenSelector
          tokens={tokens}
          selectedToken={selectorOpen === "in" ? tokenIn : tokenOut}
          onSelect={handleTokenSelect}
          onClose={() => setSelectorOpen(null)}
        />
      )}
    </div>
  );
});

export default SwapPage;
