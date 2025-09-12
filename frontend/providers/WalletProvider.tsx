"use client";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

// Define Flare Testnet (Coston2) chain
const flareTestnet = {
  id: 114,
  name: 'Flare Testnet Coston2',
  network: 'flare-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Coston2 Flare',
    symbol: 'C2FLR',
  },
  rpcUrls: {
    default: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
    public: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: { 
      name: 'Flare Testnet Explorer', 
      url: 'https://coston2-explorer.flare.network' 
    },
  },
  testnet: true,
} as const;

const config = getDefaultConfig({
  appName: "meProject",
  projectId: "94160308b32ab0edf2db07fd3d2552c6", 
  chains: [flareTestnet], 
  ssr: true,
});

const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider 
          initialChain={flareTestnet} 
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
        <Toaster richColors={true}/>
      </WagmiProvider>
    </QueryClientProvider>
  );
}