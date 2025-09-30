'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletButton } from '@/components/wallet-button';
import { useWallet } from '@/lib/wallet-context';
import { useGigs } from '@/lib/gig-context';
import {
  Plus,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { PostGigDialog } from '@/components/post-gig-dialog';
import { useToast } from '@/hooks/use-toast';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'accepted':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'delivered':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'disputed':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4" />;
    case 'accepted':
      return <DollarSign className="w-4 h-4" />;
    case 'in-progress':
      return <DollarSign className="w-4 h-4" />;
    case 'delivered':
      return <AlertTriangle className="w-4 h-4" />;
    case 'completed':
      return <CheckCircle className="w-4 h-4" />;
    case 'disputed':
      return <AlertTriangle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

export default function ClientDashboard() {
  const { isConnected, address } = useWallet();
  const {
    getGigsByClient,
    fundEscrow,
    releasePayment,
    openDispute,
    isLoading,
  } = useGigs();
  const { toast } = useToast();
  const [isPostGigOpen, setIsPostGigOpen] = useState(false);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif">
              Connect Your Wallet
            </CardTitle>
            <p className="text-muted-foreground">
              Please connect your wallet to access the client dashboard
            </p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  const myGigs = getGigsByClient(address!);
  const totalEscrowBalance = myGigs
    .filter((gig) => gig.escrowFunded)
    .reduce((sum, gig) => sum + Number.parseFloat(gig.price), 0);

  const handleFundEscrow = async (gigId: number) => {
    try {
      await fundEscrow(gigId);
      toast({
        title: 'Escrow Funded',
        description:
          'The escrow has been funded successfully. The freelancer can now start working.',
      });
    } catch (error) {
      toast({
        title: 'Error Funding Escrow',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReleasePayment = async (gigId: number) => {
    try {
      await releasePayment(gigId);
      toast({
        title: 'Payment Released',
        description: 'The payment has been released to the freelancer.',
      });
    } catch (error) {
      toast({
        title: 'Error Releasing Payment',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenDispute = async (gigId: number) => {
    try {
      await openDispute(gigId);
      toast({
        title: 'Dispute Opened',
        description:
          'A dispute has been opened. An admin will review the case.',
      });
    } catch (error) {
      toast({
        title: 'Error Opening Dispute',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-serif font-bold text-primary">
                  SafeGig
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <Button variant="ghost" className="text-foreground">
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Active Contracts
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <WalletButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Client Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your gigs, track payments, and hire talented freelancers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Gigs Posted
              </CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myGigs.length}</div>
              <p className="text-xs text-muted-foreground">
                +
                {
                  myGigs.filter(
                    (g) =>
                      new Date(g.postedDate) >
                      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  ).length
                }{' '}
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Escrow Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalEscrowBalance.toFixed(1)} ETH
              </div>
              <p className="text-xs text-muted-foreground">
                Locked in active contracts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Gigs
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myGigs.filter((gig) => gig.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">100% success rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Post a New Gig
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create a new freelance job and find the perfect talent for
                  your project.
                </p>
                <Button
                  onClick={() => setIsPostGigOpen(true)}
                  className="w-full"
                  disabled={isLoading}
                >
                  Create New Gig
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Gigs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myGigs.map((gig) => (
                    <div
                      key={gig.id}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">
                            {gig.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {gig.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {gig.price} {gig.currency}
                            </span>
                            <span>Due: {gig.deadline}</span>
                            {gig.freelancer && (
                              <span>
                                Freelancer: {gig.freelancer.slice(0, 6)}...
                                {gig.freelancer.slice(-4)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge className={getStatusColor(gig.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(gig.status)}
                            {gig.status}
                          </div>
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {gig.escrowFunded && (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-200"
                            >
                              Escrow Funded
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {gig.status === 'accepted' && !gig.escrowFunded && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFundEscrow(gig.id)}
                              disabled={isLoading}
                            >
                              Fund Escrow
                            </Button>
                          )}
                          {gig.status === 'delivered' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReleasePayment(gig.id)}
                                disabled={isLoading}
                              >
                                Release Payment
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                                onClick={() => handleOpenDispute(gig.id)}
                                disabled={isLoading}
                              >
                                Open Dispute
                              </Button>
                            </>
                          )}
                          {gig.status === 'completed' && (
                            <Button size="sm" variant="outline" disabled>
                              Completed
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {myGigs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>
                        No gigs posted yet. Create your first gig to get
                        started!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PostGigDialog open={isPostGigOpen} onOpenChange={setIsPostGigOpen} />
    </div>
  );
}
