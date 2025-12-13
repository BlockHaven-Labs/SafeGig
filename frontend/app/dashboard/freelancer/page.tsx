"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GigDetailsModal } from "@/components/gig-details-modal"
import { Search, Briefcase, DollarSign, Clock, CheckCircle, AlertTriangle, Eye, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useWallet } from "@/providers/WalletProvider"
import { WalletButton } from "@/contexts/wallet-button"
import Link from "next/link"

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "accepted":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "in-progress":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "delivered":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "completed":
      return "bg-green-100 text-green-800 border-green-200"
    case "paid":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="w-4 h-4" />
    case "accepted":
      return <DollarSign className="w-4 h-4" />
    case "in-progress":
      return <Clock className="w-4 h-4" />
    case "delivered":
      return <AlertTriangle className="w-4 h-4" />
    case "completed":
      return <CheckCircle className="w-4 h-4" />
    case "paid":
      return <DollarSign className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

export default function FreelancerDashboard() {
  const { isConnected, address } = useWallet()
  const router = useRouter()
  const {
    getAvailableGigs,
    getGigsByFreelancer,
    acceptGig,
    markAsDelivered,
    getPendingRequestsByFreelancer,
    isLoading,
  } = useGigs()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedGig, setSelectedGig] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showPendingRequests, setShowPendingRequests] = useState(false)
  const [selectedPendingGig, setSelectedPendingGig] = useState(null)
  const [isPendingStatusModalOpen, setIsPendingStatusModalOpen] = useState(false)

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif">Connect Your Wallet</CardTitle>
            <p className="text-muted-foreground">Please connect your wallet to access the freelancer dashboard</p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  const availableGigs = getAvailableGigs()
  const myJobs = getGigsByFreelancer(address!)
  const pendingRequests = getPendingRequestsByFreelancer(address!)

  const filteredGigs = availableGigs.filter((gig) => {
    const matchesSearch =
      gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gig.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || gig.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalEarnings = myJobs
    .filter((job) => job.status === "completed")
    .reduce((sum, job) => sum + Number.parseFloat(job.price), 0)
  const activeJobs = myJobs.filter((job) => ["accepted", "in-progress", "delivered"].includes(job.status)).length
  const completedJobs = myJobs.filter((job) => job.status === "completed").length
  const pendingRequestsCount = pendingRequests.filter((req) => req.status === "pending").length

  const handleAcceptGig = async (gigId: number) => {
    try {
      await acceptGig(gigId)
      toast({
        title: "Request Sent",
        description: "Your request has been sent to the client. You'll be notified when they respond.",
      })
      setIsModalOpen(false)
    } catch (error) {
      toast({
        title: "Error Sending Request",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMarkAsDelivered = async (gigId: number) => {
    try {
      await markAsDelivered(gigId)
      toast({
        title: "Work Delivered",
        description: "Your work has been marked as delivered. The client will review it.",
      })
    } catch (error) {
      toast({
        title: "Error Marking as Delivered",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewDetails = (gig: any) => {
    const gigWithClientInfo = {
      ...gig,
      requirements: [
        "Experience with React and Next.js",
        "Knowledge of blockchain integration",
        "Portfolio of previous work required",
        "Available for video calls during EST hours",
      ],
      skills: ["React", "Next.js", "TypeScript", "Web3", "Smart Contracts"],
      clientInfo: {
        name: "Sarah Johnson",
        avatar: "/professional-woman-avatar.png",
        rating: 4.9,
        totalJobs: 24,
        location: "San Francisco, CA",
        memberSince: "January 2023",
      },
    }
    setSelectedGig(gigWithClientInfo)
    setIsModalOpen(true)
  }

  const handleViewPendingStatus = (request: any) => {
    const availableGigs = getAvailableGigs()
    const originalGig = availableGigs.find((gig) => gig.id === request.originalGigId)

    const gigWithStatus = {
      ...request,
      gigStatus: originalGig ? "active" : "ended",
      statusMessage: originalGig
        ? "This gig is still available in the market"
        : "This gig has been assigned to another freelancer",
    }

    setSelectedPendingGig(gigWithStatus)
    setIsPendingStatusModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-serif font-bold text-primary">SafeGig</h1>
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
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
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
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Freelancer Dashboard</h1>
          <p className="text-muted-foreground">Find gigs, manage your work, and track your earnings</p>
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
              <p className="text-xs text-muted-foreground">Currently working on</p>
            </CardContent>
          </Card>

          {/* Pending Jobs */}
          <Card
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setShowPendingRequests(!showPendingRequests)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequestsCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting client response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEarnings.toFixed(1)} ETH</div>
              <p className="text-xs text-muted-foreground">From completed gigs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Gigs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedJobs}</div>
              <p className="text-xs text-muted-foreground">100% success rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests Section */}
        {showPendingRequests && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{request.gigTitle}</h3>
                        {/* <p className="text-sm text-muted-foreground mb-2">{request.}</p> */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {request.gigPrice} {request.gigCurrency}
                          </span>
                          {/* <span>Due: {request.}</span> */}
                          <span>Requested: {request.requestDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(request.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(request.status)}
                            {request.status}
                          </div>
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => handleViewPendingStatus(request)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingRequests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No pending requests.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Blockchain">Blockchain</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                      <SelectItem value="Writing">Writing</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredGigs.map((gig) => (
                    <div key={gig.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{gig.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{gig.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {gig.price} {gig.currency}
                            </span>
                            <span>Due: {gig.deadline}</span>
                            <span>
                              Client: {gig.client.slice(0, 6)}...{gig.client.slice(-4)}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-primary border-primary/20">
                          {gig.category}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">Posted: {gig.postedDate}</div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(gig)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm" onClick={() => handleAcceptGig(gig.id)}>
                            Send Request
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredGigs.length === 0 && (
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
                  {myJobs
                    .filter((job) => ["accepted", "in-progress", "delivered"].includes(job.status))
                    .map((job) => (
                      <div key={job.id} className="border border-border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground text-sm mb-1">{job.title}</h4>
                            <div className="text-xs text-muted-foreground">
                              <div>
                                {job.price} {job.currency}
                              </div>
                              <div>Due: {job.deadline}</div>
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
                          {job.status === "in-progress" && (
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => handleMarkAsDelivered(job.id)}
                              disabled={isLoading}
                            >
                              Mark as Delivered
                            </Button>
                          )}
                          {job.status === "delivered" && (
                            <Button size="sm" variant="outline" className="w-full bg-transparent" disabled>
                              Awaiting Review
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  {myJobs.filter((job) => ["accepted", "in-progress", "delivered"].includes(job.status)).length ===
                    0 && (
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
                    .filter((job) => job.status === "completed")
                    .map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground text-sm mb-1">{job.title}</h4>
                          <div className="text-xs text-muted-foreground">{job.completedDate}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-foreground">
                            {job.price} {job.currency}
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
                  {myJobs.filter((job) => job.status === "completed").length === 0 && (
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

      {/* Pending Gig Status Modal */}
      {selectedPendingGig && (
        <div className={`fixed inset-0 z-50 ${isPendingStatusModalOpen ? "block" : "hidden"}`}>
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsPendingStatusModalOpen(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Gig Status</span>
                  <Button variant="ghost" size="sm" onClick={() => setIsPendingStatusModalOpen(false)}>
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  {/* <h3 className="font-semibold text-foreground mb-2">{selectedPendingGig.title}</h3> */}
                  {/* <p className="text-sm text-muted-foreground mb-4">{selectedPendingGig.description}</p> */}

                  {/* <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Request Status:</span>
                      <Badge className={getStatusColor(selectedPendingGig.status)}>{selectedPendingGig.status}</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Gig Status:</span>
                      <Badge
                        className={
                          selectedPendingGig.gigStatus === "active"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        {selectedPendingGig.gigStatus}
                      </Badge>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{selectedPendingGig.statusMessage}</p>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>
                        Price: {selectedPendingGig.price} {selectedPendingGig.currency}
                      </div>
                      <div>Deadline: {selectedPendingGig.deadline}</div>
                      <div>Requested: {selectedPendingGig.requestedDate}</div>
                    </div>
                  </div> */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}