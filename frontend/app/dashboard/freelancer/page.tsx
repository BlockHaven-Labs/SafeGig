"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GigDetailsModal } from "@/components/gig-details-modal";
import {
  Search,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useWallet } from "@/providers/WalletProvider";
import { WalletButton } from "@/contexts/wallet-button";
import { useEffect } from "react";
import {
  useJobs,
  useEscrow,
  JobStatus,
  useRegistry,
  UserType,
} from "@/contexts";
import type { Job } from "@/contexts";
import Link from "next/link";
import { RegistrationDialog } from "@/components/registration-dialog";

const getStatusColor = (status: JobStatus | string) => {
  // Normalize enum or string to a slug like "in-progress" or "completed"
  let raw: any = status;
  if (typeof raw === "number" && typeof JobStatus !== "undefined") {
    raw = JobStatus[raw];
  }
  const slug = String(raw || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/\s+/g, "-");

  switch (slug) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "accepted":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "in-progress":
    case "inprogress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "delivered":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: JobStatus | string) => {
  let raw: any = status;
  if (typeof raw === "number" && typeof JobStatus !== "undefined") {
    raw = JobStatus[raw];
  }
  const slug = String(raw || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/\s+/g, "-");

  switch (slug) {
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "accepted":
      return <DollarSign className="w-4 h-4" />;
    case "in-progress":
    case "inprogress":
      return <Clock className="w-4 h-4" />;
    case "delivered":
      return <AlertTriangle className="w-4 h-4" />;
    case "completed":
      return <CheckCircle className="w-4 h-4" />;
    case "paid":
      return <DollarSign className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

export default function FreelancerDashboard() {
  const { isConnected, address } = useWallet();
  const router = useRouter();
  const {
    jobs,
    getFreelancerJobs,
    getJob,
    getTotalJobs,
    applyForJob,
    startWork,
    submitWork,
    isLoading: jobLoading,
  } = useJobs();
  const { getEscrowByJob, getEscrow, isLoading: escrowLoading } = useEscrow();
  const isLoading = jobLoading || escrowLoading;
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedGig, setSelectedGig] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const { loadUserProfile, getClientStats } = useRegistry();
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    if (address) {
      loadFreelancerData();
    }
  }, [address]);

  const loadFreelancerData = async () => {
    try {
      // Load my assigned jobs
      const jobIds = await getFreelancerJobs(address!);
      const jobs = await Promise.all(
        jobIds.map(async (id) => {
          const job = await getJob(id);
          if (!job) return null;

          try {
            const escrowId = await getEscrowByJob(job.id);
            if (escrowId > 0) {
              const escrow = await getEscrow(escrowId);
              return {
                ...job,
                escrowId,
                escrowFunded: escrow ? escrow.status !== 0 : false,
              };
            }
          } catch (error) {
            console.log("No escrow for job:", job.id);
          }
          return job;
        })
      );
      const validJobs = jobs.filter(Boolean);
      setMyJobs(validJobs);

      // Calculate earnings
      const earnings = validJobs
        .filter((job: any) => job.status === JobStatus.Completed)
        .reduce((sum, job: any) => sum + parseFloat(job.budget), 0);
      setTotalEarnings(earnings);

      // Load available jobs
      const total = await getTotalJobs();
      const allJobs: Job[] = [];
      for (let i = 0; i < total; i++) {
        const job = await getJob(i);
        if (job && job.status === JobStatus.Open) {
          allJobs.push(job);
        }
      }
      setAvailableJobs(allJobs);
    } catch (error) {
      console.error("Error loading freelancer data:", error);
    }
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
              Please connect your wallet to access the freelancer dashboard
            </p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredGigs = availableJobs.filter((gig) => {
    const matchesSearch =
      gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gig.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || gig.tags?.[0] === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeJobs = myJobs.filter((job: any) =>
    [JobStatus.Assigned, JobStatus.InProgress, JobStatus.Submitted].includes(
      job.status
    )
  ).length;
  const completedJobs = myJobs.filter(
    (job: any) => job.status === JobStatus.Completed
  ).length;

  const handleAcceptGig = async (gigId: number) => {
    try {
      const job = await getJob(gigId);
      if (!job) return;

      await applyForJob(
        gigId,
        "", // replace with actual proposal URI: ipfs://proposal-metadata
        job.budget,
        job.deadline
      );
      toast({
        title: "Application Sent",
        description: "Your application has been sent to the client.",
      });
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "Error Sending Application",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleMarkAsDelivered = async (gigId: number) => {
    try {
      await submitWork(gigId);
      toast({
        title: "Work Submitted",
        description: "Your work has been submitted for client review.",
      });
      await loadFreelancerData();
    } catch (error) {
      toast({
        title: "Error Submitting Work",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = async (gig: any) => {
    try {
      setIsModalOpen(true); // Open modal immediately with loading state

      // Fetch client profile from registry
      const clientProfile = await loadUserProfile(gig.client);
      const clientStats = await getClientStats(gig.client);

      // Parse metadata if it exists
      let clientMetadata = null;
      if (clientProfile?.metadataURI) {
        try {
          // Handle data URI format
          if (clientProfile.metadataURI.startsWith("data:application/json,")) {
            const jsonString = decodeURIComponent(
              clientProfile.metadataURI.replace("data:application/json,", "")
            );
            clientMetadata = JSON.parse(jsonString);
          } else {
            // Handle IPFS or other URIs - you'd need to fetch from IPFS
            // For now, just log it
            console.log("Non-data URI:", clientProfile.metadataURI);
          }
        } catch (error) {
          console.error("Error parsing client metadata:", error);
        }
      }

      // Calculate member since date
      const memberSince = clientProfile?.registrationTime
        ? new Date(clientProfile.registrationTime * 1000).toLocaleDateString(
            "en-US",
            {
              month: "long",
              year: "numeric",
            }
          )
        : "Unknown";

      const gigWithClientInfo = {
        ...gig,
        price: gig.budget,
        currency: "ETH",
        deadline: new Date(gig.deadline * 1000).toLocaleDateString(),
        category: gig.tags?.[0] || "General",
        postedDate: new Date(gig.createdAt * 1000).toLocaleDateString(),
        requirements: gig.requiredSkills || [],
        skills: gig.tags || [],
        clientInfo: {
          name:
            clientMetadata?.name ||
            `Client ${gig.client.slice(0, 6)}...${gig.client.slice(-4)}`,
          avatar: clientMetadata?.portfolioUrl || "/placeholder.svg",
          rating: 4.8, // You could calculate this from reviews if you have them
          totalJobs: clientStats?.jobsPosted || 0,
          location: clientProfile?.location || "Unknown",
          memberSince: memberSince,
        },
      };

      setSelectedGig(gigWithClientInfo);
    } catch (error) {
      console.error("Error fetching client details:", error);

      // Fallback to basic info if fetch fails
      const gigWithBasicInfo = {
        ...gig,
        price: gig.budget,
        currency: "ETH",
        deadline: new Date(gig.deadline * 1000).toLocaleDateString(),
        category: gig.tags?.[0] || "General",
        postedDate: new Date(gig.createdAt * 1000).toLocaleDateString(),
        requirements: gig.requiredSkills || [],
        skills: gig.tags || [],
        clientInfo: {
          name: `${gig.client.slice(0, 6)}...${gig.client.slice(-4)}`,
          avatar: "/placeholder.svg",
          rating: 0,
          totalJobs: 0,
          location: "Unknown",
          memberSince: "Unknown",
        },
      };

      setSelectedGig(gigWithBasicInfo);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <RegistrationDialog userType="freelancer" />
      {/* Navigation */}
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
                <Link href="freelancer/profile">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => router.push("/freelancer/profile")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Offers
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
            Freelancer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Find gigs, manage your work, and track your earnings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeJobs}</div>
              <p className="text-xs text-muted-foreground">
                Currently working on
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalEarnings.toFixed(1)} ETH
              </div>
              <p className="text-xs text-muted-foreground">
                From completed gigs
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
              <div className="text-2xl font-bold">{completedJobs}</div>
              <p className="text-xs text-muted-foreground">100% success rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Gigs */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Available Gigs
                </CardTitle>
                <div className="flex gap-4 mt-4">
                  <Input
                    placeholder="Search gigs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Web Development">
                        Web Development
                      </SelectItem>
                      <SelectItem value="Blockchain">Blockchain</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Mobile Development">
                        Mobile Development
                      </SelectItem>
                      <SelectItem value="Writing">Writing</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobs.map((gig: any) => (
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
                            <span>
                              Due:{" "}
                              {new Date(
                                gig.deadline * 1000
                              ).toLocaleDateString()}
                            </span>
                            <span>
                              Client: {gig.client.slice(0, 6)}...
                              {gig.client.slice(-4)}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-primary border-primary/20"
                        >
                          {gig.tags?.[0] || "General"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Posted:{" "}
                          {new Date(gig.createdAt * 1000).toLocaleDateString()}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(gig)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptGig(gig.id)}
                            className="cursor-pointer"
                          >
                            {isLoading ? "Sending Request" : "Send Request"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {jobs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No gigs match your search criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  My Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredGigs
                    .filter((job: any) =>
                      [
                        JobStatus.Assigned,
                        JobStatus.InProgress,
                        JobStatus.Submitted,
                      ].includes(job.status)
                    )
                    .map((job) => (
                      <div
                        key={job.id}
                        className="border border-border rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground text-sm mb-1">
                              {job.title}
                            </h4>
                            <div className="text-xs text-muted-foreground">
                              <div>{job.budget} ETH</div>
                              <div>
                                Due:{" "}
                                {new Date(
                                  job.deadline * 1000
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(job.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(job.status)}
                              {job.status}
                            </div>
                          </Badge>
                        </div>

                        <div className="flex gap-2 mt-3">
                          {job.status === JobStatus.InProgress && (
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => handleMarkAsDelivered(job.id)}
                              disabled={isLoading}
                            >
                              Mark as Delivered
                            </Button>
                          )}
                          {job.status === JobStatus.Submitted && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full bg-transparent"
                              disabled
                            >
                              Awaiting Review
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  {myJobs.filter((job: any) =>
                    [
                      JobStatus.Assigned,
                      JobStatus.InProgress,
                      JobStatus.Submitted,
                    ].includes(job.status)
                  ).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      <p>No active jobs</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Payouts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Recent Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myJobs
                    .filter((job) => job.status === JobStatus.Completed)
                    .map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground text-sm mb-1">
                            {job.title}
                          </h4>
                          <div className="text-xs text-muted-foreground">
                            {job.completedDate}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-foreground">
                            {job.budget} ETH
                          </div>
                          <Badge className={getStatusColor("completed")}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon("completed")}
                              paid
                            </div>
                          </Badge>
                        </div>
                      </div>
                    ))}
                  {myJobs.filter(
                    (job: any) => job.status === JobStatus.Completed
                  ).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      <p>No completed gigs yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Gig Details Modal */}
      <GigDetailsModal
        gig={selectedGig}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAcceptGig={handleAcceptGig}
        isLoading={isLoading}
      />
    </div>
  );
}
