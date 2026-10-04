"use client";

import { memo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const BotIntegrationPage = memo(function BotIntegrationPage() {
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
              🤖 Bot Integration
            </h1>
            <p className="text-text-secondary text-lg">
              Integrate xSwap with AI bots for automated trading
            </p>
          </div>

          <div className="space-y-8">
            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Overview
              </h2>
              <p className="text-text-secondary mb-4">
                xSwap provides a secure API for AI bots to execute swaps without
                exposing private keys to the server. Bots sign transactions
                locally and only send signed transactions to the API.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-bg-secondary rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🔑</div>
                  <div className="text-sm text-text-muted">
                    API Key + Secret
                  </div>
                </div>
                <div className="bg-bg-secondary rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">✍️</div>
                  <div className="text-sm text-text-muted">Local Signing</div>
                </div>
                <div className="bg-bg-secondary rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🔒</div>
                  <div className="text-sm text-text-muted">No Key Exposure</div>
                </div>
              </div>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Authentication
              </h2>
              <p className="text-text-secondary mb-4">
                Bot API uses API Key and Secret authentication. Include these
                headers in all requests:
              </p>
              <div className="bg-bg-secondary rounded-lg p-4 text-sm">
                <pre className="overflow-x-auto">{`Headers:
  X-API-Key: your-api-key
  X-API-Secret: your-api-secret
  X-Timestamp: 1700000000
  X-Signature: hmac-sha256(secret, timestamp + method + path + body)`}</pre>
              </div>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Bot API Endpoints
              </h2>

              <div className="space-y-4">
                <div className="bg-bg-secondary rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono">
                      GET
                    </span>
                    <code>/api/bot/tokens</code>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Get supported tokens
                  </p>
                </div>

                <div className="bg-bg-secondary rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">
                      POST
                    </span>
                    <code>/api/bot/quote</code>
                  </div>
                  <p className="text-text-secondary text-sm">Get swap quote</p>
                  <pre className="mt-2 text-xs overflow-x-auto">{`{
  "tokenIn": "0x...",
  "tokenOut": "0x...",
  "amount": "1000000000000000000",
  "slippage": 0.5
}`}</pre>
                </div>

                <div className="bg-bg-secondary rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">
                      POST
                    </span>
                    <code>/api/bot/swap</code>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Execute signed swap
                  </p>
                  <pre className="mt-2 text-xs overflow-x-auto">{`{
  "signedTx": "0x...",
  "quoteId": "..."
}`}</pre>
                </div>

                <div className="bg-bg-secondary rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono">
                      GET
                    </span>
                    <code>/api/bot/balances</code>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Get bot wallet balances
                  </p>
                </div>

                <div className="bg-bg-secondary rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono">
                      GET
                    </span>
                    <code>/api/bot/history</code>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Get bot transaction history
                  </p>
                </div>
              </div>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                ClawBot Skill Integration
              </h2>
              <p className="text-text-secondary mb-4">
                xSwap includes a pre-built ClawBot skill for easy AI bot
                integration. The skill is located in the{" "}
                <code>bot-skills/xswap</code> directory.
              </p>
              <div className="bg-bg-secondary rounded-lg p-4 text-sm">
                <p className="text-text-muted mb-2">skill.json manifest:</p>
                <pre className="overflow-x-auto">{`{
  "name": "xswap",
  "version": "1.0.0",
  "description": "Swap tokens on Monad via xSwap",
  "triggers": ["swap", "trade", "exchange"],
  "actions": [
    {
      "name": "get_quote",
      "description": "Get a swap quote"
    },
    {
      "name": "execute_swap",
      "description": "Execute a swap"
    },
    {
      "name": "get_balances",
      "description": "Check wallet balances"
    }
  ]
}`}</pre>
              </div>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Example: Get Quote & Swap
              </h2>
              <div className="bg-bg-secondary rounded-lg p-4 text-sm">
                <pre className="overflow-x-auto">{`// 1. Get quote
const quoteResponse = await fetch('/api/bot/quote', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
    'X-API-Secret': API_SECRET,
    'X-Timestamp': Date.now().toString(),
    'X-Signature': generateSignature(...)
  },
  body: JSON.stringify({
    tokenIn: '0x0000...0000', // MON
    tokenOut: '0x...',        // USDC
    amount: '1000000000000000000', // 1 MON
    slippage: 0.5
  })
});

const { quoteId, unsignedTx } = await quoteResponse.json();

// 2. Sign transaction locally (never send private key!)
const signedTx = await wallet.signTransaction(unsignedTx);

// 3. Execute swap
const swapResponse = await fetch('/api/bot/swap', {
  method: 'POST',
  headers: { /* ... */ },
  body: JSON.stringify({
    signedTx,
    quoteId
  })
});

const { txHash, explorerUrl } = await swapResponse.json();`}</pre>
              </div>
            </section>

            <section className="card bg-warning/10 border-warning/30">
              <h2 className="text-xl font-semibold mb-4 text-warning">
                ⚠️ Security Best Practices
              </h2>
              <ul className="space-y-2 text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  <span>Never send private keys to the API</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  <span>Always sign transactions locally</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  <span>
                    Store API secrets securely (env vars, secret managers)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  <span>Rotate API keys periodically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  <span>Use rate limiting to prevent abuse</span>
                </li>
              </ul>
            </section>

            <div className="flex gap-4">
              <Link
                href="/docs/api-reference"
                className="btn-secondary flex-1 text-center"
              >
                API Reference
              </Link>
              <Link
                href="/docs/disclaimer"
                className="btn-primary flex-1 text-center"
              >
                Disclaimer →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default BotIntegrationPage;
