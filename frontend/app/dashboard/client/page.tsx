"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { PostGigDialog } from "@/components/post-gig-dialog";
import { useToast } from "@/hooks/use-toast";
import { WalletButton } from "@/contexts/wallet-button";
import { useWallet } from "@/providers/WalletProvider";
import { useJobs, useEscrow, useDispute, JobStatus } from "@/contexts";
import type { Job } from "@/contexts";
import { RegistrationDialog } from "@/components/registration-dialog";
import Link from "next/link";

const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case JobStatus.Open:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case JobStatus.Assigned:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case JobStatus.InProgress:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case JobStatus.Submitted:
      return "bg-purple-100 text-purple-800 border-purple-200";
    case JobStatus.Completed:
      return "bg-green-100 text-green-800 border-green-200";
    case JobStatus.Disputed:
      return "bg-red-100 text-red-800 border-red-200";
    case JobStatus.Cancelled:
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: JobStatus) => {
  switch (status) {
    case JobStatus.Open:
      return <Clock className="w-4 h-4" />;
    case JobStatus.Assigned:
      return <DollarSign className="w-4 h-4" />;
    case JobStatus.InProgress:
      return <DollarSign className="w-4 h-4" />;
    case JobStatus.Submitted:
      return <AlertTriangle className="w-4 h-4" />;
    case JobStatus.Completed:
      return <CheckCircle className="w-4 h-4" />;
    case JobStatus.Disputed:
      return <AlertTriangle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getStatusLabel = (status: JobStatus) => {
  switch (status) {
    case JobStatus.Open:
      return "Open";
    case JobStatus.Assigned:
      return "Assigned";
    case JobStatus.InProgress:
      return "In Progress";
    case JobStatus.Submitted:
      return "Delivered";
    case JobStatus.Completed:
      return "Completed";
    case JobStatus.Disputed:
      return "Disputed";
    case JobStatus.Cancelled:
      return "Cancelled";
    default:
      return "Unknown";
  }
};

interface JobWithEscrow extends Job {
  escrowId?: number;
  escrowFunded?: boolean;
  escrowAmount?: string;
}

export default function ClientDashboard() {
  const { isConnected, address } = useWallet();
  const { getClientJobs, getJob, isLoading: jobLoading } = useJobs();
  const {
    getEscrowByJob,
    getEscrow,
    approveWork,
    isLoading: escrowLoading,
  } = useEscrow();
  const { createDispute, isLoading: disputeLoading } = useDispute();
  const { toast } = useToast();
  const [isPostGigOpen, setIsPostGigOpen] = useState(false);
  const [myJobs, setMyJobs] = useState<JobWithEscrow[]>([]);
  const [totalEscrowBalance, setTotalEscrowBalance] = useState(0);

  const isLoading = jobLoading || escrowLoading || disputeLoading;

  useEffect(() => {
    if (address) {
      loadClientJobs();
    }
  }, [address]);

  const loadClientJobs = async () => {
    if (!address) return;

    try {
      // Get all job IDs for this client
      const jobIds = await getClientJobs(address);

      // Load full job details
      const jobs = await Promise.all(
        jobIds.map(async (id) => {
          const job = await getJob(id);
          if (!job) return null;

          // Try to get escrow info for this job
          try {
            const escrowId = await getEscrowByJob(job.id);
            if (escrowId > 0) {
              const escrow = await getEscrow(escrowId);
              return {
                ...job,
                escrowId,
                escrowFunded: escrow ? escrow.status !== 0 : false, // Not Created status means funded
                escrowAmount: escrow?.amount || "0",
              } as JobWithEscrow;
            }
          } catch (error) {
            // No escrow for this job yet
            console.log("No escrow found for job:", job.id);
          }

          return job as JobWithEscrow;
        })
      );

      const validJobs = jobs.filter(
        (job): job is JobWithEscrow => job !== null
      );
      setMyJobs(validJobs);

      // Calculate total escrow balance
      const balance = validJobs
        .filter((job) => job.escrowFunded && job.escrowAmount)
        .reduce((sum, job) => sum + parseFloat(job.escrowAmount || "0"), 0);
      setTotalEscrowBalance(balance);
    } catch (error) {
      console.error("Error loading client jobs:", error);
      toast({
        title: "Error Loading Jobs",
        description: "Failed to load your jobs. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReleasePayment = async (job: JobWithEscrow) => {
    if (!job.escrowId) {
      toast({
        title: "No Escrow Found",
        description: "This job doesn't have an escrow.",
        variant: "destructive",
      });
      return;
    }

    try {
      await approveWork(job.escrowId);
      toast({
        title: "Payment Released",
        description: "The payment has been released to the freelancer.",
      });
      // Reload jobs
      await loadClientJobs();
    } catch (error) {
      console.error("Error releasing payment:", error);
      toast({
        title: "Error Releasing Payment",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpenDispute = async (job: JobWithEscrow) => {
    if (!job.escrowId) {
      toast({
        title: "No Escrow Found",
        description: "This job doesn't have an escrow.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createDispute(
        job.id,
        job.escrowId,
        "Work does not meet the agreed requirements",
        "" // You can add IPFS evidence URI here
      );
      toast({
        title: "Dispute Opened",
        description:
          "A dispute has been opened. An arbitrator will review the case.",
      });
      // Reload jobs
      await loadClientJobs();
    } catch (error) {
      console.error("Error opening dispute:", error);
      toast({
        title: "Error Opening Dispute",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDeadline = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  const formatAddress = (addr: string) => {
    if (!addr || addr === "0x0000...0000") return "Not assigned";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

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

  const completedJobs = myJobs.filter(
    (job) => job.status === JobStatus.Completed
  ).length;
  const recentJobs = myJobs.filter(
    (job) => job.createdAt > Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60
  ).length;

  const handleFundEscrow = async (gigId: number) => {
    try {
      await handleFundEscrow(gigId);
      toast({
        title: "Escrow Funded",
        description:
          "The escrow has been funded successfully. The freelancer can now start working.",
      });
    } catch (error) {
      toast({
        title: "Error Funding Escrow",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Registration Dialog - Shows if user is not registered */}
      <RegistrationDialog userType="client" />

      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0 cursor-pointer">
                <h1 className="text-2xl font-serif font-bold text-primary">
                  SafeGig
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <Button variant="ghost" className="text-foreground">
                  Dashboard
                </Button>
                <Link href={`client/${address}`}>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Profile
                  </Button>
                </Link>
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

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Client Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your gigs, track payments, and hire talented freelancers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Gigs Posted
              </CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myJobs.length}</div>
              <p className="text-xs text-muted-foreground">
                +{recentJobs} from last month
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
                {totalEscrowBalance.toFixed(3)} ETH
              </div>
              <p className="text-xs text-muted-foreground">
                Locked in active contracts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Jobs
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedJobs}</div>
              <p className="text-xs text-muted-foreground">
                {myJobs.length > 0
                  ? `${((completedJobs / myJobs.length) * 100).toFixed(
                      0
                    )}% completion rate`
                  : "No jobs yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Post New Gig */}
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

          {/* My Gigs */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Gigs</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && myJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Loading your jobs...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myJobs.map((gig) => (
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
                                {gig.budget} ETH
                              </span>
                              <span>Due: {formatDeadline(gig.deadline)}</span>
                              {gig.assignedFreelancer && (
                                <span>
                                  Freelancer:{" "}
                                  {formatAddress(gig.assignedFreelancer)}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(gig.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(gig.status)}
                              {getStatusLabel(gig.status)}
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
                            {gig.isUrgent && (
                              <Badge
                                variant="outline"
                                className="text-orange-600 border-orange-200"
                              >
                                Urgent
                              </Badge>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {gig.status === JobStatus.Submitted &&
                              !gig.escrowFunded && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleFundEscrow(gig.id)}
                                  disabled={isLoading}
                                >
                                  Fund Escrow
                                </Button>
                              )}
                            {gig.status === JobStatus.Submitted && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReleasePayment(gig)}
                                  disabled={isLoading}
                                >
                                  Release Payment
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                                  onClick={() => handleOpenDispute(gig)}
                                  disabled={isLoading}
                                >
                                  Open Dispute
                                </Button>
                              </>
                            )}
                            {gig.status === JobStatus.Completed && (
                              <Button size="sm" variant="outline" disabled>
                                Completed
                              </Button>
                            )}
                            {gig.status === JobStatus.Disputed && (
                              <Badge
                                variant="outline"
                                className="text-red-600 border-red-200"
                              >
                                Under Review
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {myJobs.length === 0 && !isLoading && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>
                          No gigs posted yet. Create your first gig to get
                          started!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <PostGigDialog
        open={isPostGigOpen}
        onOpenChange={setIsPostGigOpen}
        onSuccess={loadClientJobs}
      />
    </div>
  );
}
