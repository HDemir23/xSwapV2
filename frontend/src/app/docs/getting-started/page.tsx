"use client";

import { memo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const GettingStartedPage = memo(function GettingStartedPage() {
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
              🚀 Getting Started
            </h1>
            <p className="text-text-secondary text-lg">
              Learn how to swap tokens on xSwap
            </p>
          </div>

          <div className="space-y-8">
            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Prerequisites
              </h2>
              <ul className="space-y-3 text-text-secondary">
                <li className="flex items-start gap-3">
                  <span className="text-sakura-medium">✓</span>
                  <span>A Web3 wallet (MetaMask, Rainbow, etc.)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sakura-medium">✓</span>
                  <span>MON tokens on Monad network</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sakura-medium">✓</span>
                  <span>Monad network configured in your wallet</span>
                </li>
              </ul>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Step 1: Connect Your Wallet
              </h2>
              <p className="text-text-secondary mb-4">
                Click the &quot;Connect&quot; button in the top right corner and
                select your wallet. xSwap uses RainbowKit for secure wallet
                connections.
              </p>
              <div className="bg-bg-secondary rounded-lg p-4 text-sm">
                <code>
                  Supported wallets: MetaMask, Rainbow, Coinbase, and more
                </code>
              </div>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Step 2: Sign Authentication Message
              </h2>
              <p className="text-text-secondary mb-4">
                After connecting, you&apos;ll be asked to sign a message. This
                verifies your wallet ownership without sharing your private
                keys.
              </p>
              <div className="bg-bg-secondary rounded-lg p-4 text-sm border-l-4 border-sakura-medium">
                <strong>Security Note:</strong> Signing a message is safe and
                does not give anyone access to your funds or allow transactions.
              </div>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Step 3: Select Tokens
              </h2>
              <p className="text-text-secondary mb-4">
                Choose the token you want to swap from and the token you want to
                receive. Click on the token buttons to open the token selector.
              </p>
              <ul className="space-y-2 text-text-secondary">
                <li>
                  • Click &quot;Select token&quot; to choose from available
                  tokens
                </li>
                <li>• Use the search bar to find specific tokens</li>
                <li>• Click the swap button (⇅) to reverse token selection</li>
              </ul>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Step 4: Enter Amount
              </h2>
              <p className="text-text-secondary mb-4">
                Enter the amount you want to swap. You can also click
                &quot;MAX&quot; to use your entire balance.
              </p>
              <div className="bg-bg-secondary rounded-lg p-4 text-sm">
                <p className="text-text-muted mb-2">
                  Quote auto-refreshes every 10 seconds
                </p>
                <code>Minimum swap amount may apply</code>
              </div>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Step 5: Review Quote
              </h2>
              <p className="text-text-secondary mb-4">
                Before swapping, review the quote details:
              </p>
              <ul className="space-y-2 text-text-secondary">
                <li>
                  • <strong>Price:</strong> Exchange rate for your swap
                </li>
                <li>
                  • <strong>Route:</strong> Path through Kuru DEX
                </li>
                <li>
                  • <strong>Price Impact:</strong> Effect on market price
                </li>
                <li>
                  • <strong>Platform Fee:</strong> 0.5% fee (included)
                </li>
                <li>
                  • <strong>You Receive:</strong> Final amount after fees
                </li>
              </ul>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Step 6: Adjust Slippage (Optional)
              </h2>
              <p className="text-text-secondary mb-4">
                Slippage tolerance determines the maximum price difference
                you&apos;re willing to accept. Default is 0.5%.
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-bg-secondary rounded text-sm">
                  0.1%
                </span>
                <span className="px-3 py-1 bg-sakura-medium text-bg-primary rounded text-sm">
                  0.5%
                </span>
                <span className="px-3 py-1 bg-bg-secondary rounded text-sm">
                  1.0%
                </span>
                <span className="px-3 py-1 bg-bg-secondary rounded text-sm">
                  Custom
                </span>
              </div>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Step 7: Confirm Swap
              </h2>
              <p className="text-text-secondary mb-4">
                Click &quot;Swap&quot; and confirm the transaction in your
                wallet. The swap will be executed on Kuru DEX.
              </p>
              <div className="bg-bg-secondary rounded-lg p-4 text-sm border-l-4 border-success">
                <strong>Success!</strong> After confirmation, you can view your
                transaction in the History page or MonadVision explorer.
              </div>
            </section>

            <div className="flex gap-4">
              <Link
                href="/docs/api-reference"
                className="btn-secondary flex-1 text-center"
              >
                API Reference →
              </Link>
              <Link href="/" className="btn-primary flex-1 text-center">
                Start Swapping
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default GettingStartedPage;
