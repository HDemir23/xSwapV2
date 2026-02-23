import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import dynamic from "next/dynamic";

const Providers = dynamic(
  () => import("./providers").then((mod) => mod.Providers),
  { ssr: false },
);

export const metadata: Metadata = {
  title: "xSwap - Swap Tokens on Monad",
  description:
    "Swap tokens on Monad blockchain with AI-powered best prices via Kuru DEX",
  keywords: ["Monad", "DEX", "Swap", "DeFi", "Kuru", "Blockchain"],
  authors: [{ name: "xSwap Team" }],
  openGraph: {
    title: "xSwap - Swap Tokens on Monad",
    description: "Swap tokens on Monad with AI-powered best prices",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1A1415",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen bg-bg-primary">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
