"use client";

import { memo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const ApiReferencePage = memo(function ApiReferencePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link
              href="/docs"
              className="text-sakura-medium hover:text-sakura-accent flex items-center gap-2 mb-4"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Docs
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              📚 API Reference
            </h1>
            <p className="text-text-secondary text-lg">
              Complete REST API documentation for xSwap
            </p>
          </div>

          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-2">Base URL</h2>
            <code className="bg-bg-secondary px-4 py-2 rounded block text-sm">
              {API_ENDPOINT}
            </code>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Authentication
              </h2>

              <div className="card mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">
                    POST
                  </span>
                  <code>/api/auth/message</code>
                </div>
                <p className="text-text-secondary text-sm mb-3">
                  Get a message to sign for authentication
                </p>
                <div className="bg-bg-secondary rounded-lg p-4 text-sm">
                  <p className="text-text-muted mb-2">Request Body:</p>
                  <pre className="overflow-x-auto">{`{
  "address": "0x..."
}`}</pre>
                </div>
              </div>

              <div className="card mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">
                    POST
                  </span>
                  <code>/api/auth/connect</code>
                </div>
                <p className="text-text-secondary text-sm mb-3">
                  Connect wallet with signed message
                </p>
                <div className="bg-bg-secondary rounded-lg p-4 text-sm">
                  <p className="text-text-muted mb-2">Request Body:</p>
                  <pre className="overflow-x-auto">{`{
  "address": "0x...",
  "message": "...",
  "signature": "0x..."
}`}</pre>
                  <p className="text-text-muted mt-3 mb-2">Response:</p>
                  <pre className="overflow-x-auto">{`{
  "sessionToken": "...",
  "expiresIn": 86400,
  "user": { "id": "...", "address": "0x..." }
}`}</pre>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">
                    POST
                  </span>
                  <code>/api/auth/disconnect</code>
                </div>
                <p className="text-text-secondary text-sm">
                  Disconnect and invalidate session (requires auth)
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Tokens
              </h2>

              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono">
                    GET
                  </span>
                  <code>/api/tokens</code>
                </div>
                <p className="text-text-secondary text-sm mb-3">
                  Get list of supported tokens
                </p>
                <div className="bg-bg-secondary rounded-lg p-4 text-sm">
                  <p className="text-text-muted mb-2">Response:</p>
                  <pre className="overflow-x-auto">{`{
  "tokens": [
    {
      "address": "0x...",
      "symbol": "MON",
      "name": "Monad",
      "decimals": 18,
      "logoUrl": "...",
      "priceUsd": 1.23
    }
  ]
}`}</pre>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Swap
              </h2>

              <div className="card mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">
                    POST
                  </span>
                  <code>/api/swap/quote</code>
                </div>
                <p className="text-text-secondary text-sm mb-3">
                  Get a quote for a swap (requires auth)
                </p>
                <div className="bg-bg-secondary rounded-lg p-4 text-sm">
                  <p className="text-text-muted mb-2">Request Body:</p>
                  <pre className="overflow-x-auto">{`{
  "tokenIn": "0x...",
  "tokenOut": "0x...",
  "amount": "1000000000000000000",
  "slippage": 0.5
}`}</pre>
                  <p className="text-text-muted mt-3 mb-2">Response:</p>
                  <pre className="overflow-x-auto">{`{
  "outputAmount": "...",
  "outputAmountFormatted": "1.5",
  "route": "Kuru DEX",
  "priceImpact": "0.01",
  "platformFee": "...",
  "userReceives": "...",
  "price": "1 MON = 1.5 USDC",
  "unsignedTx": { ... },
  "quoteId": "...",
  "expiresAt": 1700000000
}`}</pre>
                </div>
              </div>

              <div className="card mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">
                    POST
                  </span>
                  <code>/api/swap/execute</code>
                </div>
                <p className="text-text-secondary text-sm mb-3">
                  Execute a signed swap transaction (requires auth)
                </p>
                <div className="bg-bg-secondary rounded-lg p-4 text-sm">
                  <p className="text-text-muted mb-2">Request Body:</p>
                  <pre className="overflow-x-auto">{`{
  "signedTx": "0x...",
  "quoteId": "..."
}`}</pre>
                </div>
              </div>

              <div className="card mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono">
                    GET
                  </span>
                  <code>/api/swap/allowance/{"{token}"}</code>
                </div>
                <p className="text-text-secondary text-sm">
                  Check token allowance (requires auth)
                </p>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">
                    POST
                  </span>
                  <code>/api/approve/{"{token}"}</code>
                </div>
                <p className="text-text-secondary text-sm">
                  Get approval transaction data (requires auth)
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Portfolio
              </h2>

              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono">
                    GET
                  </span>
                  <code>/api/portfolio/balances</code>
                </div>
                <p className="text-text-secondary text-sm mb-3">
                  Get user token balances (requires auth)
                </p>
                <div className="bg-bg-secondary rounded-lg p-4 text-sm">
                  <p className="text-text-muted mb-2">Response:</p>
                  <pre className="overflow-x-auto">{`{
  "balances": [
    {
      "token": { "symbol": "MON", ... },
      "balance": "1000000000000000000",
      "balanceFormatted": "1.0",
      "valueUsd": 1.23
    }
  ],
  "totalValueUsd": 123.45
}`}</pre>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                History
              </h2>

              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono">
                    GET
                  </span>
                  <code>/api/history?limit=50&amp;offset=0</code>
                </div>
                <p className="text-text-secondary text-sm mb-3">
                  Get transaction history (requires auth)
                </p>
                <div className="bg-bg-secondary rounded-lg p-4 text-sm">
                  <p className="text-text-muted mb-2">Response:</p>
                  <pre className="overflow-x-auto">{`{
  "transactions": [
    {
      "id": "...",
      "txHash": "0x...",
      "type": "swap",
      "tokenIn": { "symbol": "MON", "amount": "1.0" },
      "tokenOut": { "symbol": "USDC", "amount": "1.5" },
      "fee": { "amount": "0.005", "token": "USDC" },
      "status": "completed",
      "createdAt": "2024-01-01T00:00:00Z",
      "explorerUrl": "https://monadvision.com/tx/..."
    }
  ],
  "total": 10
}`}</pre>
                </div>
              </div>
            </section>

            <div className="flex gap-4">
              <Link
                href="/docs/bot-integration"
                className="btn-secondary flex-1 text-center"
              >
                Bot Integration →
              </Link>
              <Link
                href="/docs/getting-started"
                className="btn-primary flex-1 text-center"
              >
                Getting Started
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default ApiReferencePage;
