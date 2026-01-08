"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, MapPin, Wallet, ArrowLeft, Edit, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/providers/WalletProvider";
import { useRegistry } from "@/contexts";
import { toast } from "@/components/ui/use-toast";
import { Ballet } from "next/font/google";

export default function FreelancerProfile() {
  const router = useRouter();
  const { address, balance } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    title: "",
    bio: "",
    location: "",
    hourlyRate: "0 ETH/hour",
    skills: [] as string[],
    languages: ["English"],
    experience: "",
    availability: "Available",
  });
  const [freelancerStats, setFreelancerStats] = useState({
    rating: 0,
    totalJobs: 0,
    completedJobs: 0,
    totalEarned: "0 ETH",
    responseTime: "0 hours",
    successRate: "0%",
  });
  const {
    userProfile,
    loadUserProfile,
    updateProfile,
    getFreelancerStats,
    isLoading,
  } = useRegistry();

  const recentWork = [
    {
      id: 1,
      title: "DeFi Dashboard Development",
      client: "Sarah Johnson",
      rating: 5,
      earnings: "3.2 ETH",
      completedDate: "2 weeks ago",
    },
    {
      id: 2,
      title: "Smart Contract Audit",
      client: "Michael Brown",
      rating: 5,
      earnings: "2.8 ETH",
      completedDate: "1 month ago",
    },
    {
      id: 3,
      title: "E-commerce Platform",
      client: "Lisa Wang",
      rating: 4,
      earnings: "4.5 ETH",
      completedDate: "2 months ago",
    },
  ];

  useEffect(() => {
    if (address) {
      loadProfileData();
    }
  }, [address]);

  const loadProfileData = async () => {
    try {
      // Load user profile
      const profile = await loadUserProfile(address!);
      if (profile) {
        let metadata = {
          name: "Anonymous User",
          title: "Freelancer",
          bio: "",
          languages: ["English"],
          experience: "",
        };

        // Parse metadataURI if it exists and looks like JSON
        if (profile.metadataURI) {
          try {
            // Check if it starts with ipfs:// (from your backend)
            if (profile.metadataURI.startsWith("ipfs://")) {
              // Fetch from your backend
              const response = await fetch(
                `http://localhost:3000/users/ipfs/${profile.metadataURI.replace(
                  "ipfs://",
                  ""
                )}`
              );
              metadata = await response.json();
            } else if (profile.metadataURI.startsWith("{")) {
              // It's raw JSON (old data)
              metadata = JSON.parse(profile.metadataURI);
            }
          } catch (e) {
            console.error("Failed to parse metadata:", e);
          }
        }

        setProfileData({
          name: metadata.name || "Anonymous User",
          title: metadata.title || "Freelancer",
          bio: metadata.bio || "",
          location: profile.location || "",
          hourlyRate: "0 ETH/hour",
          skills: profile.skills || [],
          languages: metadata.languages || ["English"],
          experience: metadata.experience || "",
          availability: profile.isActive ? "Available" : "Unavailable",
        });
      }

      // Load freelancer stats
      const stats = await getFreelancerStats(address!);
      if (stats) {
        setFreelancerStats({
          rating: 4.5, // You'll need to implement rating system
          totalJobs: stats.jobsCompleted,
          completedJobs: stats.jobsCompleted,
          totalEarned: `${stats.totalEarned} ETH`,
          responseTime: `${Math.floor(stats.responseTime / 3600)} hours`,
          successRate: `${stats.successRate}%`,
        });

        // Update hourly rate in profile
        setProfileData((prev) => ({
          ...prev,
          hourlyRate: `${stats.hourlyRate} ETH/hour`,
        }));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleSave = async () => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to update profile",
        variant: "destructive",
      });
      return;
    }

    try {
      // You can store additional data as JSON in metadataURI
      // For now, we'll just update the basic fields
      const metadataURI = JSON.stringify({
        name: profileData.name,
        title: profileData.title,
        bio: profileData.bio,
        languages: profileData.languages,
        experience: profileData.experience,
      });

      await updateProfile(
        metadataURI,
        profileData.location,
        profileData.skills
      );

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });

      setIsEditing(false);
      await loadProfileData(); // Reload to confirm changes
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error Updating Profile",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    // Reset changes
    setIsEditing(false);
  };

  const addSkill = (skill: string) => {
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, skill],
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((s) => s !== skillToRemove),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-serif font-bold text-primary">
              SafeGig
            </h1>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
            >
              {isLoading ? (
                "Saving..."
              ) : isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
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
                    <AvatarImage src="/professional-developer-avatar.jpg" />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                      {profileData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  {isEditing ? (
                    <div className="space-y-2 mb-4">
                      <Input
                        placeholder="Input Name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        className="text-center"
                      />
                      <Input
                        value={profileData.title}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            title: e.target.value,
                          })
                        }
                        className="text-center text-sm"
                      />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
                        {profileData.name}
                      </h1>
                      <p className="text-muted-foreground mb-4">
                        {profileData.title}
                      </p>
                    </>
                  )}

                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {freelancerStats.rating}
                    </span>
                    <span className="text-muted-foreground">
                      ({freelancerStats.totalJobs} reviews)
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    {isEditing ? (
                      <Input
                        placeholder="location"
                        value={profileData.location}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            location: e.target.value,
                          })
                        }
                        className="text-center text-sm h-6"
                      />
                    ) : (
                      <span>{profileData.location}</span>
                    )}
                  </div>

                  {isEditing && (
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="w-full mb-2 bg-transparent"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Wallet Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Wallet Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-mono text-sm">
                    {address
                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                      : "Not connected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-semibold">{balance || "0"} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Earned</span>
                  <span className="font-semibold">
                    {freelancerStats.totalEarned}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Freelancer Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jobs Completed</span>
                  <span className="font-semibold">
                    {freelancerStats.completedJobs}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-semibold">
                    {freelancerStats.successRate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="font-semibold">
                    {freelancerStats.responseTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hourly Rate</span>
                  {isEditing ? (
                    <Input
                      value={profileData.hourlyRate}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          hourlyRate: e.target.value,
                        })
                      }
                      className="text-right h-6 w-24"
                    />
                  ) : (
                    <span className="font-semibold">
                      {profileData.hourlyRate}
                    </span>
                  )}
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
                {isEditing ? (
                  <Textarea
                    placeholder="Describe yourself"
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    rows={4}
                    className="mb-4"
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {profileData.bio}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isEditing ? (
                    <div>
                      <h4 className="font-semibold mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {profileData.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add skill (press Enter)"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSkill(e.currentTarget.value);
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-semibold mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {profileData.languages.map((language, index) => (
                        <Badge key={index} variant="outline">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Work */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Work</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentWork.map((work) => (
                    <div
                      key={work.id}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">
                            {work.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Client: {work.client}</span>
                            <span className="font-medium text-foreground">
                              {work.earnings}
                            </span>
                            <span>Completed {work.completedDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < work.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
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
