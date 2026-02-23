"use client";

import { memo, useMemo, useCallback, useState, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useHistory } from "@/hooks/useHistory";
import { apiClient } from "@/lib/api";

const HistoryPage = memo(function HistoryPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: historyData, isLoading, refetch } = useHistory(50, 0);

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const transactions = useMemo(
    () => historyData?.transactions ?? [],
    [historyData],
  );
  const total = useMemo(() => historyData?.total ?? 0, [historyData]);

  useEffect(() => {
    if (isConnected && !apiClient.isAuthenticated()) {
      setAuthError(null);
    }
  }, [isConnected]);

  const handleAuthenticate = useCallback(async () => {
    if (!address || !isConnected) return;

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const { message } = await apiClient.getAuthMessage(address);
      const signature = await signMessageAsync({
        message: message as `0x${string}`,
      });
      await apiClient.connectWallet(address, message, signature);
      await refetch();
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, isConnected, signMessageAsync, refetch]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return "text-success";
      case "pending":
        return "text-warning";
      case "failed":
        return "text-error";
      default:
        return "text-text-muted";
    }
  }, []);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card">
              <div className="text-6xl mb-4">🔐</div>
              <h1 className="text-2xl font-bold mb-2">Connect Your Wallet</h1>
              <p className="text-text-secondary">
                Please connect your wallet to view your transaction history
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!apiClient.isAuthenticated()) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card">
              <div className="text-6xl mb-4">✍️</div>
              <h1 className="text-2xl font-bold mb-2">Sign to Continue</h1>
              <p className="text-text-secondary mb-4">
                Sign a message to verify your wallet and view your history
              </p>
              {authError && <p className="text-error mb-4">{authError}</p>}
              <button
                onClick={handleAuthenticate}
                disabled={isAuthenticating}
                className="btn-primary"
              >
                {isAuthenticating ? "Signing..." : "Sign Message"}
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
              <p className="text-text-secondary">
                {total} transaction{total !== 1 ? "s" : ""} found
              </p>
            </div>
            <button onClick={() => refetch()} className="btn-secondary text-sm">
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="card">
                  <div className="flex items-center gap-4">
                    <div className="skeleton w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-32 rounded" />
                      <div className="skeleton h-3 w-48 rounded" />
                    </div>
                    <div className="text-right space-y-2">
                      <div className="skeleton h-4 w-20 rounded" />
                      <div className="skeleton h-3 w-24 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">
                No Transactions Yet
              </h3>
              <p className="text-text-secondary">
                Your swap transactions will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <a
                  key={tx.id}
                  href={tx.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card block hover:border-sakura-medium transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-sakura-medium/20 flex items-center justify-center">
                        <span className="text-lg">🔄</span>
                      </div>
                      <div>
                        <div className="font-semibold">
                          {tx.tokenIn.amount} {tx.tokenIn.symbol} →{" "}
                          {tx.tokenOut.amount} {tx.tokenOut.symbol}
                        </div>
                        <div className="text-sm text-text-muted">
                          {formatDate(tx.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="text-sm">
                        <span className="text-text-muted">Fee: </span>
                        <span>
                          {tx.fee.amount} {tx.fee.token}
                        </span>
                      </div>
                      <div
                        className={`text-sm font-medium ${getStatusColor(tx.status)}`}
                      >
                        {tx.status}
                      </div>
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-sakura-dark/10">
                    <code className="text-xs text-text-muted break-all">
                      {tx.txHash}
                    </code>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default HistoryPage;
