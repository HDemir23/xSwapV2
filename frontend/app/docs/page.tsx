"use client";

import { memo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const DOC_SECTIONS = [
  {
    title: "Getting Started",
    description: "Learn how to use xSwap for token swaps",
    href: "/docs/getting-started",
    icon: "🚀",
  },
  {
    title: "API Reference",
    description: "Complete API documentation for developers",
    href: "/docs/api-reference",
    icon: "📚",
  },
  {
    title: "Bot Integration",
    description: "Integrate xSwap with AI bots like ClawBot",
    href: "/docs/bot-integration",
    icon: "🤖",
  },
  {
    title: "Disclaimer",
    description: "Important legal and risk information",
    href: "/docs/disclaimer",
    icon: "⚖️",
  },
] as const;

const DocsPage = memo(function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              📖 Documentation
            </h1>
            <p className="text-text-secondary text-lg">
              Everything you need to know about xSwap
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {DOC_SECTIONS.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="card hover:border-sakura-medium transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{section.icon}</span>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2 group-hover:text-sakura-medium transition-colors">
                      {section.title}
                    </h2>
                    <p className="text-text-secondary">{section.description}</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-text-muted group-hover:text-sakura-medium transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 card bg-sakura-medium/10 border-sakura-medium/30">
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h3 className="font-medium text-sakura-medium mb-2">Network</h3>
                <ul className="space-y-1 text-text-secondary">
                  <li>Chain ID: 143</li>
                  <li>RPC: https://rpc.monad.xyz</li>
                  <li>Explorer: monadvision.com</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-sakura-medium mb-2">DEX</h3>
                <ul className="space-y-1 text-text-secondary">
                  <li>Powered by Kuru DEX</li>
                  <li>API: ws.kuru.io</li>
                  <li>Native MON support</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-sakura-medium mb-2">Fees</h3>
                <ul className="space-y-1 text-text-secondary">
                  <li>Platform fee: 0.5%</li>
                  <li>Gas: Monad native</li>
                  <li>No hidden fees</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default DocsPage;
