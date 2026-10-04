"use client";

import { useMemo } from "react";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";

const monadChain = {
  id: 143,
  name: "Monad",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.monad.xyz"] } },
  blockExplorers: {
    default: { name: "MonadVision", url: "https://monadvision.com" },
  },
} as const;

// Create config outside of component to prevent re-initialization
const config = getDefaultConfig({
  appName: "xSwap",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  chains: [monadChain],
  ssr: false,
});

// Create QueryClient outside of component to prevent re-creation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  // Memoize to prevent unnecessary re-renders
  const memoizedConfig = useMemo(() => config, []);

  return (
    <WagmiProvider config={memoizedConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
