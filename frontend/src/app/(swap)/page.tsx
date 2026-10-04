"use client";

import { memo, useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  useAccount,
  useSignMessage,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TokenInput from "@/components/swap/TokenInput";
import TokenSelector from "@/components/swap/TokenSelector";
import SlippageSettings from "@/components/swap/SlippageSettings";
import QuoteDisplay from "@/components/swap/QuoteDisplay";
import ApprovalFlow from "@/components/swap/ApprovalFlow";
import { useTokens } from "@/hooks/useTokens";
import { useWalletBalances } from "@/hooks/useBalances";
import { useQuote } from "@/hooks/useQuote";
import { apiClient } from "@/lib/api";
import type { Token } from "@/types";
import { NATIVE_MON_ADDRESS } from "@/types";

// Kuru spender address for token approvals
const KURU_SPENDER_ADDRESS = "0xb3e6778480b2E488385E8205eA05E20060B813cb";

const SwapPage = memo(function SwapPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const {
    sendTransactionAsync,
    data: txHash,
    isPending: isSending,
  } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [selectorOpen, setSelectorOpen] = useState<"in" | "out" | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [swapSuccess, setSwapSuccess] = useState<string | null>(null);
  const [needsApproval, setNeedsApproval] = useState<{
    token: Token;
    amount: string;
  } | null>(null);

  // Use ref to track if we're in approval flow to re-attempt swap after approval
  const isApprovalFlowActive = useRef(false);

  const { data: tokensData } = useTokens();
  const tokens = useMemo(() => tokensData?.tokens ?? [], [tokensData]);

  // Use wallet balances directly (no authentication required)
  const {
    balances,
    isLoading: balancesLoading,
    refetch: refetchBalances,
  } = useWalletBalances(tokens);

  const {
    quote,
    isLoading: quoteLoading,
    error: quoteError,
  } = useQuote(tokenIn, tokenOut, amountIn, slippage, isConnected);

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
      // Check allowance for ERC20 tokens
      if (tokenIn && tokenIn.address !== NATIVE_MON_ADDRESS) {
        const { needsApproval: approvalNeeded } =
          await apiClient.checkAllowance(tokenIn.address, amountIn);
        if (approvalNeeded) {
          // Show approval flow instead of error
          setNeedsApproval({ token: tokenIn, amount: amountIn });
          isApprovalFlowActive.current = true;
          setIsSwapping(false);
          return;
        }
      }

      if (!quote.unsignedTx) {
        throw new Error("No transaction data available");
      }

      // Send transaction via wagmi
      const hash = await sendTransactionAsync({
        to: quote.unsignedTx.to as `0x${string}`,
        data: quote.unsignedTx.data as `0x${string}`,
        value: BigInt(quote.unsignedTx.value || "0"),
      });

      // Track in backend
      const result = await apiClient.executeSwap(hash, quote.quoteId);

      setSwapSuccess(`Swap submitted! TX: ${hash.slice(0, 10)}...`);
      setAmountIn("");
      refetchBalances();
    } catch (err: any) {
      console.error("Swap error:", err);
      if (err.message?.includes("User rejected")) {
        setSwapError("Transaction cancelled by user");
      } else {
        setSwapError(err.message || "Swap failed");
      }
    } finally {
      setIsSwapping(false);
    }
  }, [
    quote,
    isConnected,
    tokenIn,
    amountIn,
    handleAuthenticate,
    sendTransactionAsync,
    refetchBalances,
  ]);

  const handleApprovalComplete = useCallback(() => {
    setNeedsApproval(null);
    // Re-attempt swap after approval
    setTimeout(() => {
      handleSwap();
    }, 100);
  }, [handleSwap]);

  const handleApprovalCancel = useCallback(() => {
    setNeedsApproval(null);
    isApprovalFlowActive.current = false;
    setSwapError("Approval cancelled");
  }, []);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      setSwapSuccess(`Swap confirmed! TX: ${txHash.slice(0, 10)}...`);
      refetchBalances();
    }
  }, [isConfirmed, txHash, refetchBalances]);

  const buttonText = useMemo(() => {
    if (!isConnected) return "Connect Wallet";
    if (!apiClient.isAuthenticated()) return "Sign to Continue";
    if (!tokenIn || !tokenOut) return "Select Tokens";
    if (!amountIn || parseFloat(amountIn) <= 0) return "Enter Amount";
    if (quoteLoading) return "Getting Quote...";
    if (quoteError) return "Quote Error - Retry";
    if (!quote) return "Enter Amount";
    if (isSending) return "Signing...";
    if (isConfirming) return "Confirming...";
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
    isSending,
    isConfirming,
    isSwapping,
  ]);

  const isButtonDisabled = useMemo(() => {
    return (
      isSwapping ||
      isSending ||
      isConfirming ||
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
    isSending,
    isConfirming,
    isAuthenticating,
    isConnected,
    tokenIn,
    tokenOut,
    amountIn,
    quoteLoading,
    quote,
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D0D]">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
              Swap on <span className="text-[#FF007A]">Monad</span>
            </h1>
            <p className="text-[#9B9B9B]">
              Best prices via Kuru DEX • 0.5% platform fee
            </p>
          </div>

          {/* Main Swap Card - Uniswap style */}
          <div className="bg-[#1B1A1A] rounded-3xl p-4">
            {/* Header with slippage settings */}
            <div className="flex justify-end mb-2">
              <SlippageSettings slippage={slippage} onChange={setSlippage} />
            </div>

            {/* Token Inputs */}
            <div className="space-y-0">
              <TokenInput
                token={tokenIn}
                amount={amountIn}
                onAmountChange={setAmountIn}
                onTokenClick={() => setSelectorOpen("in")}
                label="You Pay"
                balance={balanceIn}
              />

              {/* Swap direction button - Uniswap style overlapping */}
              <div className="flex justify-center relative z-10 -my-2">
                <button
                  onClick={handleSwapTokens}
                  className="bg-[#2B2B2B] hover:bg-[#3B3B3B] border-4 border-[#1B1A1A] rounded-xl p-2 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-[#9B9B9B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
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

            {/* Quote Display */}
            {(quote || quoteLoading) && tokenIn && tokenOut && (
              <div className="mt-4 bg-[#2B2B2B] rounded-2xl p-3">
                <QuoteDisplay
                  quote={quote}
                  isLoading={quoteLoading}
                  tokenInSymbol={tokenIn.symbol}
                  tokenOutSymbol={tokenOut.symbol}
                />
              </div>
            )}

            {/* Errors */}
            {quoteError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {quoteError}
              </div>
            )}

            {swapError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {swapError}
              </div>
            )}

            {/* Success */}
            {swapSuccess && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
                {swapSuccess}
              </div>
            )}

            {/* Approval Flow */}
            {needsApproval && (
              <ApprovalFlow
                tokenAddress={needsApproval.token.address}
                tokenSymbol={needsApproval.token.symbol}
                spenderAddress={KURU_SPENDER_ADDRESS}
                onApproved={handleApprovalComplete}
                onCancel={handleApprovalCancel}
              />
            )}

            {/* Main Swap Button - Uniswap style */}
            <button
              onClick={handleSwap}
              disabled={isButtonDisabled}
              className="w-full mt-4 bg-[#FF007A] hover:bg-[#FF007A]/90 disabled:bg-[#2B2B2B] disabled:text-[#5E5E5E] text-white font-semibold text-lg py-4 rounded-2xl transition-colors"
            >
              {buttonText}
            </button>
          </div>

          {/* Feature badges */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="bg-[#1B1A1A] rounded-2xl p-4">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-sm text-[#9B9B9B]">Fast Swaps</div>
            </div>
            <div className="bg-[#1B1A1A] rounded-2xl p-4">
              <div className="text-2xl mb-1">🔒</div>
              <div className="text-sm text-[#9B9B9B]">Secure</div>
            </div>
            <div className="bg-[#1B1A1A] rounded-2xl p-4">
              <div className="text-2xl mb-1">🤖</div>
              <div className="text-sm text-[#9B9B9B]">Bot API</div>
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
