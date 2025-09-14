"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";
import { useWallet } from "./wallet-context";

export interface Gig {
  id: number;
  title: string;
  description: string;
  price: string;
  currency: string;
  deadline: string;
  category: string;
  client: string;
  freelancer: string | null;
  status:
    | "pending"
    | "accepted"
    | "in-progress"
    | "delivered"
    | "completed"
    | "disputed";
  escrowFunded: boolean;
  postedDate: string;
  acceptedDate?: string;
  deliveredDate?: string;
  completedDate?: string;
  disputeReason?: string;
  disputeDate?: string;
}

export interface PendingRequest {
  id: number;
  gigId: number;
  freelancerAddress: string;
  clientAddress: string;
  gigTitle: string;
  gigPrice: string;
  gigCurrency: string;
  requestDate: string;
  status: "pending" | "accepted" | "rejected";
}

interface GigContextType {
  gigs: Gig[];
  pendingRequests: PendingRequest[];
  createGig: (
    gigData: Omit<
      Gig,
      "id" | "client" | "freelancer" | "status" | "escrowFunded" | "postedDate"
    >
  ) => Promise<void>;
  acceptGig: (gigId: number) => Promise<void>;
  fundEscrow: (gigId: number) => Promise<void>;
  markAsDelivered: (gigId: number) => Promise<void>;
  releasePayment: (gigId: number) => Promise<void>;
  openDispute: (gigId: number, reason?: string) => Promise<void>;
  resolveDispute: (
    gigId: number,
    winner: "client" | "freelancer"
  ) => Promise<void>;
  getGigsByClient: (clientAddress: string) => Gig[];
  getGigsByFreelancer: (freelancerAddress: string) => Gig[];
  getAvailableGigs: () => Gig[];
  getDisputedGigs: () => Gig[];
  getPendingRequestsByFreelancer: (
    freelancerAddress: string
  ) => PendingRequest[];
  acceptFreelancerRequest: (requestId: number) => Promise<void>;
  rejectFreelancerRequest: (requestId: number) => Promise<void>;
  getPlatformStats: () => {
    totalGigs: number;
    totalVolume: number;
    totalFees: number;
    activeDisputes: number;
  };
  isLoading: boolean;
}

const GigContext = createContext<GigContextType | undefined>(undefined);

// Mock initial data
const initialGigs: Gig[] = [
  {
    id: 1,
    title: "Build a React Landing Page",
    description:
      "Need a modern landing page for my startup with responsive design and smooth animations",
    price: "0.5",
    currency: "ETH",
    deadline: "2024-02-15",
    category: "Web Development",
    client: "0x742d35Cc6634C0532925a3b8D404d3aABb8c4532",
    freelancer: null,
    status: "pending",
    escrowFunded: false,
    postedDate: "2024-01-20",
  },
  {
    id: 2,
    title: "Logo Design for Tech Company",
    description: "Create a professional logo for our tech startup",
    price: "0.2",
    currency: "ETH",
    deadline: "2024-02-10",
    category: "Design",
    client: "0x742d35Cc6634C0532925a3b8D404d3aABb8c4532",
    freelancer: "0x8ba1f109551bD432803012645Hac136c22C501e",
    status: "accepted",
    escrowFunded: true,
    postedDate: "2024-01-18",
    acceptedDate: "2024-01-19",
  },
  {
    id: 3,
    title: "Smart Contract Audit",
    description: "Security audit for DeFi protocol smart contracts",
    price: "2.0",
    currency: "ETH",
    deadline: "2024-02-20",
    category: "Blockchain",
    client: "0x742d35Cc6634C0532925a3b8D404d3aABb8c4532",
    freelancer: "0x123d35Cc6634C0532925a3b8D404d3aABb8c4567",
    status: "completed",
    escrowFunded: true,
    postedDate: "2024-01-15",
    acceptedDate: "2024-01-16",
    deliveredDate: "2024-01-25",
    completedDate: "2024-01-26",
  },
  {
    id: 4,
    title: "Smart Contract Development",
    description:
      "Develop and deploy an ERC-20 token with custom tokenomics and security features",
    price: "1.2",
    currency: "ETH",
    deadline: "2024-02-25",
    category: "Blockchain",
    client: "0x456d35Cc6634C0532925a3b8D404d3aABb8c4789",
    freelancer: null,
    status: "pending",
    escrowFunded: false,
    postedDate: "2024-01-22",
  },
  {
    id: 5,
    title: "Mobile App UI/UX Design",
    description:
      "Design a complete mobile app interface for a fitness tracking application",
    price: "0.8",
    currency: "ETH",
    deadline: "2024-02-18",
    category: "Design",
    client: "0x789d35Cc6634C0532925a3b8D404d3aABb8c4012",
    freelancer: null,
    status: "pending",
    escrowFunded: false,
    postedDate: "2024-01-21",
  },
  {
    id: 6,
    title: "WordPress Website Development",
    description:
      "Build a custom WordPress site for a local business with e-commerce functionality",
    price: "1.5",
    currency: "ETH",
    deadline: "2024-02-08",
    category: "Web Development",
    client: "0x111d35Cc6634C0532925a3b8D404d3aABb8c4111",
    freelancer: "0x222d35Cc6634C0532925a3b8D404d3aABb8c4222",
    status: "disputed",
    escrowFunded: true,
    postedDate: "2024-01-10",
    acceptedDate: "2024-01-11",
    deliveredDate: "2024-01-20",
    disputeDate: "2024-01-22",
    disputeReason:
      "Client claims the delivered work doesn't match requirements. Freelancer claims all requirements were met according to the original specification.",
  },
];

export function GigProvider({ children }: { children: React.ReactNode }) {
  const [gigs, setGigs] = useState<Gig[]>(initialGigs);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useWallet();

  const createGig = async (
    gigData: Omit<
      Gig,
      "id" | "client" | "freelancer" | "status" | "escrowFunded" | "postedDate"
    >
  ) => {
    if (!address) throw new Error("Wallet not connected");

    setIsLoading(true);
    try {
      // Simulate smart contract interaction
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newGig: Gig = {
        ...gigData,
        id: Math.max(...gigs.map((g) => g.id)) + 1,
        client: address,
        freelancer: null,
        status: "pending",
        escrowFunded: false,
        postedDate: new Date().toISOString().split("T")[0],
      };

      setGigs((prev) => [...prev, newGig]);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptGig = async (gigId: number) => {
    if (!address) throw new Error("Wallet not connected");

    setIsLoading(true);
    try {
      // Simulate smart contract interaction
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const gig = gigs.find((g) => g.id === gigId);
      if (!gig) throw new Error("Gig not found");

      const newRequest: PendingRequest = {
        id: Math.max(...pendingRequests.map((r) => r.id), 0) + 1,
        gigId: gigId,
        freelancerAddress: address,
        clientAddress: gig.client,
        gigTitle: gig.title,
        gigPrice: gig.price,
        gigCurrency: gig.currency,
        requestDate: new Date().toISOString().split("T")[0],
        status: "pending",
      };

      setPendingRequests((prev) => [...prev, newRequest]);
    } finally {
      setIsLoading(false);
    }
  };

  const fundEscrow = async (gigId: number) => {
    setIsLoading(true);
    try {
      // Simulate smart contract interaction
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setGigs((prev) =>
        prev.map((gig) =>
          gig.id === gigId
            ? { ...gig, escrowFunded: true, status: "in-progress" as const }
            : gig
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const markAsDelivered = async (gigId: number) => {
    setIsLoading(true);
    try {
      // Simulate smart contract interaction
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setGigs((prev) =>
        prev.map((gig) =>
          gig.id === gigId
            ? {
                ...gig,
                status: "delivered" as const,
                deliveredDate: new Date().toISOString().split("T")[0],
              }
            : gig
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const releasePayment = async (gigId: number) => {
    setIsLoading(true);
    try {
      // Simulate smart contract interaction
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setGigs((prev) =>
        prev.map((gig) =>
          gig.id === gigId
            ? {
                ...gig,
                status: "completed" as const,
                completedDate: new Date().toISOString().split("T")[0],
              }
            : gig
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openDispute = async (gigId: number, reason?: string) => {
    setIsLoading(true);
    try {
      // Simulate smart contract interaction
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setGigs((prev) =>
        prev.map((gig) =>
          gig.id === gigId
            ? {
                ...gig,
                status: "disputed" as const,
                disputeDate: new Date().toISOString().split("T")[0],
                disputeReason: reason || "Dispute opened by client",
              }
            : gig
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resolveDispute = async (
    gigId: number,
    winner: "client" | "freelancer"
  ) => {
    setIsLoading(true);
    try {
      // Simulate smart contract interaction
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setGigs((prev) =>
        prev.map((gig) =>
          gig.id === gigId
            ? {
                ...gig,
                status: "completed" as const,
                completedDate: new Date().toISOString().split("T")[0],
              }
            : gig
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getGigsByClient = (clientAddress: string) => {
    return gigs.filter(
      (gig) => gig.client.toLowerCase() === clientAddress.toLowerCase()
    );
  };

  const getGigsByFreelancer = (freelancerAddress: string) => {
    return gigs.filter(
      (gig) => gig.freelancer?.toLowerCase() === freelancerAddress.toLowerCase()
    );
  };

  const getAvailableGigs = () => {
    return gigs.filter((gig) => gig.status === "pending");
  };

  const getDisputedGigs = () => {
    return gigs.filter((gig) => gig.status === "disputed");
  };

  const getPendingRequestsByFreelancer = (freelancerAddress: string) => {
    return pendingRequests.filter(
      (request) =>
        request.freelancerAddress.toLowerCase() ===
        freelancerAddress.toLowerCase()
    );
  };

  const acceptFreelancerRequest = async (requestId: number) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const request = pendingRequests.find((r) => r.id === requestId);
      if (!request) throw new Error("Request not found");

      // Update the gig with the freelancer
      setGigs((prev) =>
        prev.map((gig) =>
          gig.id === request.gigId
            ? {
                ...gig,
                freelancer: request.freelancerAddress,
                status: "accepted" as const,
                acceptedDate: new Date().toISOString().split("T")[0],
              }
            : gig
        )
      );

      // Update the request status
      setPendingRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "accepted" as const } : req
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const rejectFreelancerRequest = async (requestId: number) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPendingRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "rejected" as const } : req
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformStats = () => {
    const totalGigs = gigs.length;
    const totalVolume = gigs
      .filter((gig) => gig.status === "completed")
      .reduce((sum, gig) => sum + Number.parseFloat(gig.price), 0);
    const totalFees = totalVolume * 0.025; // 2.5% platform fee
    const activeDisputes = gigs.filter(
      (gig) => gig.status === "disputed"
    ).length;

    return { totalGigs, totalVolume, totalFees, activeDisputes };
  };

  const value = {
    gigs,
    pendingRequests,
    createGig,
    acceptGig,
    fundEscrow,
    markAsDelivered,
    releasePayment,
    openDispute,
    resolveDispute,
    getGigsByClient,
    getGigsByFreelancer,
    getAvailableGigs,
    getDisputedGigs,
    getPendingRequestsByFreelancer,
    acceptFreelancerRequest,
    rejectFreelancerRequest,
    getPlatformStats,
    isLoading,
  };

  return <GigContext.Provider value={value}>{children}</GigContext.Provider>;
}

export function useGigs() {
  const context = useContext(GigContext);
  if (context === undefined) {
    throw new Error("useGigs must be used within a GigProvider");
  }
  return context;
}
