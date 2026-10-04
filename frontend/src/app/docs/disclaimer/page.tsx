"use client";

import { memo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const DisclaimerPage = memo(function DisclaimerPage() {
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
              ⚖️ Disclaimer
            </h1>
            <p className="text-text-secondary text-lg">
              Important legal and risk information
            </p>
          </div>

          <div className="space-y-8">
            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                General Risk Warning
              </h2>
              <p className="text-text-secondary mb-4">
                Trading cryptocurrencies involves substantial risk of loss and
                is not suitable for every investor. The valuation of
                cryptocurrencies and tokens can fluctuate widely, and you may
                lose more than your original investment.
              </p>
              <div className="bg-error/10 border border-error/30 rounded-lg p-4">
                <p className="text-error font-medium">
                  Past performance is not indicative of future results. Only
                  trade with funds you can afford to lose.
                </p>
              </div>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                No Financial Advice
              </h2>
              <p className="text-text-secondary">
                xSwap is a decentralized exchange gateway that facilitates token
                swaps. Nothing on this platform constitutes financial,
                investment, legal, or tax advice. You should consult with your
                own advisers before making any investment decisions. The xSwap
                team does not recommend any specific tokens or trading
                strategies.
              </p>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Smart Contract Risks
              </h2>
              <p className="text-text-secondary mb-4">
                xSwap integrates with Kuru DEX and other smart contracts on the
                Monad blockchain. Smart contracts may contain bugs or
                vulnerabilities that could result in partial or complete loss of
                funds.
              </p>
              <ul className="space-y-2 text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-sakura-medium">•</span>
                  <span>
                    Smart contracts are provided &quot;as is&quot; without
                    warranties
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sakura-medium">•</span>
                  <span>
                    The team is not responsible for smart contract failures
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sakura-medium">•</span>
                  <span>Always verify transaction details before signing</span>
                </li>
              </ul>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Platform Fees
              </h2>
              <p className="text-text-secondary">
                xSwap charges a 0.5% platform fee on all swaps. This fee is
                collected by the xSwap platform and is separate from any network
                fees (gas) or fees charged by Kuru DEX. All fees are clearly
                displayed before you confirm any transaction.
              </p>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Regulatory Compliance
              </h2>
              <p className="text-text-secondary mb-4">
                Cryptocurrency regulations vary by jurisdiction. It is your
                responsibility to understand and comply with all applicable laws
                and regulations in your jurisdiction regarding:
              </p>
              <ul className="space-y-2 text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-sakura-medium">•</span>
                  <span>Cryptocurrency trading and ownership</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sakura-medium">•</span>
                  <span>Tax reporting and payment obligations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sakura-medium">•</span>
                  <span>Anti-money laundering (AML) requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sakura-medium">•</span>
                  <span>Know Your Customer (KYC) requirements</span>
                </li>
              </ul>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                No Guarantees
              </h2>
              <p className="text-text-secondary">
                xSwap provides no guarantees regarding:
              </p>
              <ul className="space-y-2 text-text-secondary mt-2">
                <li className="flex items-start gap-2">
                  <span className="text-sakura-medium">•</span>
                  <span>Availability or uptime of the platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sakura-medium">•</span>
                  <span>Accuracy of price quotes or exchange rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sakura-medium">•</span>
                  <span>Successful execution of transactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sakura-medium">•</span>
                  <span>Recovery of lost or stuck transactions</span>
                </li>
              </ul>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Limitation of Liability
              </h2>
              <p className="text-text-secondary">
                To the fullest extent permitted by law, the xSwap team shall not
                be liable for any indirect, incidental, special, consequential,
                or punitive damages, including but not limited to loss of
                profits, tokens, or data, whether in contract, tort, or
                otherwise arising from your use of the platform.
              </p>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Indemnification
              </h2>
              <p className="text-text-secondary">
                You agree to indemnify and hold harmless the xSwap team from any
                claims, damages, losses, or expenses arising from your use of
                the platform or violation of these terms.
              </p>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Changes to Disclaimer
              </h2>
              <p className="text-text-secondary">
                We reserve the right to modify this disclaimer at any time.
                Changes will be effective immediately upon posting. Continued
                use of the platform constitutes acceptance of the modified
                disclaimer.
              </p>
            </section>

            <section className="card">
              <h2 className="text-xl font-semibold mb-4 text-sakura-medium">
                Contact
              </h2>
              <p className="text-text-secondary">
                For questions about this disclaimer, please contact the xSwap
                team through official channels.
              </p>
            </section>

            <div className="text-center text-text-muted text-sm">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>

            <div className="flex gap-4">
              <Link href="/docs" className="btn-secondary flex-1 text-center">
                Back to Docs
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

export default DisclaimerPage;
