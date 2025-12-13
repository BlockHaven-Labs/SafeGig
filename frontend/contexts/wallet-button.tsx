"use client";

import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useWallet } from "@/providers/WalletProvider";
import { formatAddress } from "@/lib/utils";

interface WalletButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function WalletButton({
  variant = "default",
  size = "default",
  className,
}: WalletButtonProps) {
  const {
    isConnected,
    address,
    connectWallet,
    disconnectWallet,
    isConnecting,
  } = useWallet();
  const router = useRouter();

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      router.push("/select-role");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnectWallet}
        disabled={isConnecting}
        variant={variant}
        size={size}
        className={className}
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Wallet className="w-4 h-4 mr-2" />
          {formatAddress(address!)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={disconnectWallet}>
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
