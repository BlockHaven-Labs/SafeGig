'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Shield, Zap } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ConnectWalletPage() {
  const { isConnected, connectWallet, address } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push('/select-role');
    }
  }, [isConnected, router]);

  const handleConnect = async () => {
    await connectWallet();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/">
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">
              SafeGig
            </h1>
          </Link>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-muted-foreground">
            Connect your Web3 wallet to start using SafeGig's blockchain-powered
            escrow platform
          </p>
        </div>

        {/* Connect Card */}
        <Card className="border-border bg-card">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-blue-400" />
            </div>
            <CardTitle className="text-xl font-serif">
              MetaMask Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Secure blockchain transactions</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>Fast and reliable payments</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Wallet className="w-4 h-4 text-blue-400" />
                <span>Full control of your funds</span>
              </div>
            </div>

            <Button
              onClick={handleConnect}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              size="lg"
            >
              Connect MetaMask
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Don't have MetaMask?
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 ml-1"
              >
                Download here
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
