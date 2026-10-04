import { memo } from "react";
import Link from "next/link";

const Footer = memo(function Footer() {
  return (
    <footer className="border-t border-[#2B2B2B] bg-[#0D0D0D] py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌸</span>
              <span className="text-xl font-bold text-[#FF007A]">
                xSwap
              </span>
            </div>
            <p className="text-[#9B9B9B] text-sm">
              Swap tokens on Monad with the best prices.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-[#9B9B9B] hover:text-white"
                >
                  Swap
                </Link>
              </li>
              <li>
                <Link
                  href="/portfolio"
                  className="text-[#9B9B9B] hover:text-white"
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="text-[#9B9B9B] hover:text-white"
                >
                  History
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Developers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/docs"
                  className="text-[#9B9B9B] hover:text-white"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/api-reference"
                  className="text-[#9B9B9B] hover:text-white"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/bot-integration"
                  className="text-[#9B9B9B] hover:text-white"
                >
                  Bot Integration
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/docs/disclaimer"
                  className="text-[#9B9B9B] hover:text-white"
                >
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2B2B2B] mt-8 pt-6 text-center text-[#9B9B9B] text-sm">
          <p>© {new Date().getFullYear()} xSwap. Use at your own risk.</p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
