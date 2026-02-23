"use client";

import { memo, useMemo, useCallback, useState, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useBalances } from "@/hooks/useBalances";
import { apiClient } from "@/lib/api";

const PortfolioPage = memo(function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: balancesData, isLoading, refetch } = useBalances();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const balances = useMemo(() => balancesData?.balances ?? [], [balancesData]);
  const totalValueUsd = useMemo(
    () => balancesData?.totalValueUsd ?? 0,
    [balancesData],
  );

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
                Please connect your wallet to view your portfolio
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
                Sign a message to verify your wallet and view your portfolio
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
          <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
          <p className="text-text-secondary mb-8">
            Your token balances on Monad
          </p>

          <div className="card mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-text-muted text-sm">Total Value</p>
                <p className="text-3xl font-bold text-sakura-medium">
                  ${totalValueUsd.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="btn-secondary text-sm"
              >
                Refresh Balances
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="card space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className="skeleton w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-3 w-16 rounded" />
                  </div>
                  <div className="text-right space-y-2">
                    <div className="skeleton h-4 w-20 rounded" />
                    <div className="skeleton h-3 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : balances.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold mb-2">No Tokens Found</h3>
              <p className="text-text-secondary">
                You don&apos;t have any tokens yet. Start swapping!
              </p>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-bg-hover">
                    <tr>
                      <th className="text-left p-4 text-text-muted text-sm font-medium">
                        Token
                      </th>
                      <th className="text-right p-4 text-text-muted text-sm font-medium">
                        Balance
                      </th>
                      <th className="text-right p-4 text-text-muted text-sm font-medium">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {balances.map((balance, index) => (
                      <tr
                        key={balance.token.address}
                        className={`border-t border-sakura-dark/10 ${
                          index === balances.length - 1 ? "" : "border-b"
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {balance.token.symbol === "MON" ? "🪙" : "💎"}
                            </span>
                            <div>
                              <div className="font-semibold">
                                {balance.token.symbol}
                              </div>
                              <div className="text-sm text-text-muted">
                                {balance.token.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="font-medium">
                            {parseFloat(balance.balanceFormatted).toFixed(4)}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="font-medium text-sakura-medium">
                            {balance.valueUsd
                              ? `$${balance.valueUsd.toFixed(2)}`
                              : "-"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default PortfolioPage;
