"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, MessageCircle, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useRegistry, useReputation, useJobs } from "@/contexts";
import { useRouter } from "next/navigation";
import { formatAddress } from "@/lib/utils";

export default function ClientProfile() {
  const params = useParams();
  const router = useRouter();
  const clientAddress = params.address as string;

  const { getUserProfile, getClientStats, isRegisteredUser, getUserSkills, loadUserProfile } =
    useRegistry();
  const { getUserReputation, getUserReviews, getReview } = useReputation();
  const { getClientJobs, getJob } = useJobs();
  const [isLoading, setIsLoading] = useState(true);
  const [clientData, setClientData] = useState<{
    name: string;
    bio: string;
    address: string;
    skills: string[];
    rating: number;
    totalJobs: number;
    completedJobs: number;
    totalSpent: string;
    responseTime: string;
    memberSince: string;
    recentJobs: any[];
    reviews: any[];
  } | null>(null);

  useEffect(() => {
    loadClientData();
  }, [clientAddress]);

  const loadClientData = async () => {
    try {
      setIsLoading(true);

      // Check if registered
      const isRegistered = await isRegisteredUser(clientAddress);
      if (!isRegistered) {
        setClientData(null);
        return;
      }

      const [metadataURI, stats, reputation, reviewIds, jobIds, userProfile] = await Promise.all([
      getUserProfile(clientAddress),
      getClientStats(clientAddress),
      getUserReputation(clientAddress),
      getUserReviews(clientAddress),
      getClientJobs(clientAddress),
      loadUserProfile(clientAddress)
    ])

      // Load profile metadata
    let metadata = { name: "Unknown Client", bio: "", location: "Unknown" }
    if (metadataURI && metadataURI.startsWith("data:application/json,")) {
      try {
        const decoded = decodeURIComponent(metadataURI.replace("data:application/json,", ""))
        metadata = { ...metadata, ...JSON.parse(decoded) }
      } catch (e) {
        console.error("Error parsing metadata:", e)
      }
    }

    const recentJobsData = await Promise.all(
      jobIds.slice(0, 3).map(async (id) => {
        const job = await getJob(id)
        return job
      })
    )

    // Load reviews (top 5)
    const reviewsData = await Promise.all(
      reviewIds.slice(0, 5).map(async (id) => {
        const review = await getReview(id)
        return review
      })
    )

      function isNotNull<T>(value: T | null): value is T {
        return value !== null;
      }

      // Load on-chain skills
      const skills = await getUserSkills(clientAddress);

      setClientData({
        name: metadata.name || "Unknown Client",
        bio: metadata.bio || "",
        address: clientAddress,
        skills: skills || [],
        rating: reputation ? reputation.averageRating / 100 : 0,
        totalJobs: stats?.jobsPosted || 0,
        completedJobs: stats?.jobsCompleted || 0,
        totalSpent: stats?.totalSpent || "0",
        responseTime: stats?.responseTime ? `${stats.responseTime}h` : "N/A",
        memberSince: userProfile?.registrationTime ? new Date(Number(userProfile.registrationTime *1000)).toLocaleDateString() : "N/A",
        recentJobs: recentJobsData.filter(isNotNull).map((job) => ({
          id: job.id,
          title: job.title,
          category: job.tags?.[0] || "General",
          budget: `${job.budget} ETH`,
          status: [
            "Open",
            "Assigned",
            "In Progress",
            "Submitted",
            "Completed",
            "Cancelled",
            "Disputed",
          ][job.status],
          postedDate: new Date(job.createdAt * 1000).toLocaleDateString(),
        })),
        reviews: reviewsData.filter(isNotNull).map((review) => ({
          id: review.id,
          freelancer: `${review.reviewer.slice(0, 6)}...${review.reviewer.slice(
            -4
          )}`,
          rating: review.rating / 100,
          comment: "Review on blockchain",
          project: `Job #${review.jobId}`,
          date: new Date(review.timestamp * 1000).toLocaleDateString(),
        })),
      });
    } catch (error) {
      console.error("Error loading client data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Client not found or not registered
            </p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-serif font-bold text-primary">
              SafeGig
            </h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage
                      src={"/placeholder.svg"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                      {clientData.name
                        .split(" ")
                        .map((name: any) => name[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
                    {clientData.name}
                  </h1>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {clientData.rating.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">
                      ({clientData.totalJobs} reviews)
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{formatAddress(clientData.address)}</span>
                  </div>
                  <Button className="w-full mb-2">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Client
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    Member since {clientData.memberSince}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Spent</span>
                  <span className="font-semibold">{clientData.totalSpent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jobs Posted</span>
                  <span className="font-semibold">{clientData.totalJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-semibold">
                    {clientData.completedJobs}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="font-semibold">
                    {clientData.responseTime}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {clientData.bio}
                </p>
                <div>
                  <h4 className="font-semibold mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {clientData.skills.map((skill: any, index: any) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientData.recentJobs.map((job: any) => (
                    <div
                      key={job.id}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {job.budget}
                            </span>
                            <span>Posted {job.postedDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-primary border-primary/20"
                          >
                            {job.category}
                          </Badge>
                          <Badge
                            className={
                              job.status === "Completed"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : job.status === "In Progress"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            }
                          >
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews from Freelancers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientData.reviews.map((review: any) => (
                    <div
                      key={review.id}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">
                              {review.freelancer}
                            </span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm mb-1">
                            {review.comment}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {review.project} • {review.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
