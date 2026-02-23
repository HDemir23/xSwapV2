import { memo } from "react";
import Link from "next/link";

const Footer = memo(function Footer() {
  return (
    <footer className="border-t border-sakura-dark/20 bg-bg-secondary py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌸</span>
              <span className="text-xl font-bold text-sakura-medium">
                xSwap
              </span>
            </div>
            <p className="text-text-muted text-sm">
              Swap tokens on Monad with the best prices.
            </p>
          </div>

          <div>
            <h4 className="text-text-primary font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-text-secondary hover:text-sakura-medium"
                >
                  Swap
                </Link>
              </li>
              <li>
                <Link
                  href="/portfolio"
                  className="text-text-secondary hover:text-sakura-medium"
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="text-text-secondary hover:text-sakura-medium"
                >
                  History
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-text-primary font-semibold mb-3">Developers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/docs"
                  className="text-text-secondary hover:text-sakura-medium"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/api-reference"
                  className="text-text-secondary hover:text-sakura-medium"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/bot-integration"
                  className="text-text-secondary hover:text-sakura-medium"
                >
                  Bot Integration
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-text-primary font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/docs/disclaimer"
                  className="text-text-secondary hover:text-sakura-medium"
                >
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sakura-dark/20 mt-8 pt-6 text-center text-text-muted text-sm">
          <p>© {new Date().getFullYear()} xSwap. Use at your own risk.</p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
