// config/walletConfig.ts
import { createAppKit } from "@reown/appkit";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import type { AppKitNetwork } from "@reown/appkit/networks";

// Get projectId from https://dashboard.reown.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "";

if (!projectId) {
  console.warn(
    "Reown Project ID is not defined. Please set NEXT_PUBLIC_REOWN_PROJECT_ID in your .env file"
  );
}

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_PRIVATE_KEY || "";

// Define Ethereum Sepolia network
export const sepoliaNetwork: AppKitNetwork = {
  id: 11155111,
  name: "Ethereum Sepolia",
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "SEP",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: alchemyKey
        ? [`https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`]
        : ["https://rpc.sepolia.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Sepolia Etherscan",
      url: "https://sepolia.etherscan.io",
    },
  },
  testnet: true,
};

// Metadata for your app
const metadata = {
  name: "safeGig",
  description: "Secure blockchain-based escrow for freelancers and clients",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://safegig.app",
  icons: [
    typeof window !== "undefined"
      ? `${window.location.origin}/icon.png`
      : "https://safegig.app/icon.png",
  ],
};

let appKitInstance: ReturnType<typeof createAppKit> | null = null;

export function getAppKit() {
  // Return existing instance if already created
  if (appKitInstance) {
    return appKitInstance;
  }

  // Create the modal with Ethers adapter
  // networks must be a tuple with at least one element
  appKitInstance = createAppKit({
    adapters: [new EthersAdapter()],
    networks: [sepoliaNetwork] as [AppKitNetwork, ...AppKitNetwork[]],
    projectId,
    metadata,
    features: {
      analytics: false,
      email: false,
      socials: [],
    },
    themeVariables: {
      "--w3m-accent": "#3b82f6",
      "--w3m-color-mix": "#000000",
      "--w3m-color-mix-strength": 40,
      "--w3m-border-radius-master": "2px",
    },
  });

  return appKitInstance;
}
