"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { getAppKit } from "@/config/walletConfig";
import { Toaster } from "sonner";
import { BrowserProvider, JsonRpcSigner, ethers } from "ethers";
import type { Provider } from "@reown/appkit-adapter-ethers";

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  account: string | null;
  balance: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  provider: Provider | null;
  signer: JsonRpcSigner | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [appKit, setAppKit] = useState<ReturnType<typeof getAppKit> | null>(
    null
  );

  const fetchBalance = useCallback(async () => {
    if (!provider || !address) {
      setBalance(null);
      return;
    }

    try {
      const ethersProvider = new BrowserProvider(provider as any);
      const balanceWei = await ethersProvider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);
      // Format to 4 decimal places
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      setBalance("0");
    }
  }, [provider, address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    const createSigner = async () => {
      if (provider && address) {
        try {
          const ethersProvider = new BrowserProvider(provider as any);
          const ethersSigner = await ethersProvider.getSigner();
          setSigner(ethersSigner);
        } catch (error) {
          console.error("Failed to get signer:", error);
          setSigner(null);
        }
      } else {
        setSigner(null);
      }
    };

    createSigner();
  }, [provider, address]);

  // Initialize AppKit
  useEffect(() => {
    const modal = getAppKit();
    setAppKit(modal);

    // Subscribe to account changes
    const unsubscribeAccount = modal.subscribeAccount((account) => {
      if (account?.isConnected && account?.address) {
        setIsConnected(true);
        setAddress(account.address);
      } else {
        setIsConnected(false);
        setAddress(null);
        setBalance(null);
      }
    });

    // Subscribe to provider changes (note: it's subscribeProviders, not subscribeProvider)
    const unsubscribeProviders = modal.subscribeProviders((state) => {
      if (state?.["eip155"]) {
        setProvider(state["eip155"] as Provider);
      }
    });

    // Check initial state
    const account = modal.getAccount();
    if (account?.isConnected && account?.address) {
      setIsConnected(true);
      setAddress(account.address);
    }

    return () => {
      // These return void, so we don't need to call them with ()
      unsubscribeAccount;
      unsubscribeProviders;
    };
  }, []);

  const connectWallet = useCallback(async () => {
    if (!appKit) {
      throw new Error("AppKit not initialized");
    }

    setIsConnecting(true);
    try {
      await appKit.open();
      // The modal will handle the connection
      // State updates will happen through subscriptions
    } catch (error) {
      console.error("Failed to open wallet modal:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [appKit]);

  const disconnectWallet = useCallback(async () => {
    if (!appKit) {
      throw new Error("AppKit not initialized");
    }

    try {
      await appKit.disconnect();
      setIsConnected(false);
      setAddress(null);
      setProvider(null);
      setBalance(null);
    } catch (error) {
      console.error("Failed to disconnect:", error);
      throw error;
    }
  }, [appKit]);

  const value: WalletContextType = {
    isConnected,
    isConnecting,
    address,
    balance,
    connectWallet,
    disconnectWallet,
    provider,
    signer,
    account: address,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
      <Toaster richColors={true} />
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
