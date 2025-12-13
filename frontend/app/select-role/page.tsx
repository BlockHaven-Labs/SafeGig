'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/providers/WalletProvider';
import { Users, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SelectRolePage() {
  const { isConnected } = useWallet();
  const router = useRouter();
 
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
            Please connect your wallet first
          </h1>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <Link href="/" className="inline-block mb-8">
            <h1 className="text-3xl font-serif font-bold text-blue-400">
              SafeGig
            </h1>
          </Link>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            Choose Your Role
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select how you want to use SafeGig to get started with secure
            blockchain escrow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Client Card */}
          <Card className="border-border bg-card hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
            <Link href="../dashboard/client">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Briefcase className="w-8 h-8 text-blue-400" />
                </div>
                <CardTitle className="text-2xl font-serif text-foreground">
                  I'm a Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Post gigs, hire freelancers, and manage secure payments
                  through blockchain escrow.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Post unlimited gigs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Secure escrow payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Dispute resolution</span>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                  Continue as Client
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Freelancer Card */}
          <Card className="border-border bg-card hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
            <Link href="../dashboard/freelancer">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600/20 transition-colors">
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <CardTitle className="text-2xl font-serif text-foreground">
                  I'm a Freelancer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Browse available gigs, showcase your skills, and get paid
                  securely through smart contracts.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Browse quality gigs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Guaranteed payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Build your reputation</span>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                  Continue as Freelancer
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        <div className="mt-12">
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
