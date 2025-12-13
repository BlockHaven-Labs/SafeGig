"use client"

import { useWallet } from "@/providers/WalletProvider"
import type React from "react"
import { createContext, useContext, useState } from "react"
import { ethers } from "ethers"
import DisputeResolverABI from "@/lib/abis/DisputeResolver.json"
import contractAddresses from "@/lib/abis/contract-addresses.json"

export enum DisputeStatus {
  Created = 0,
  InReview = 1,
  Resolved = 2,
  Appealed = 3,
  Closed = 4,
}

export enum Resolution {
  None = 0,
  FavorFreelancer = 1,
  FavorClient = 2,
  PartialRefund = 3,
  Mediation = 4,
}

export interface Dispute {
  id: number
  jobId: number
  escrowId: number
  client: string
  freelancer: string
  initiator: string
  reason: string
  evidenceURI: string
  status: DisputeStatus
  resolution: Resolution
  assignedArbitrator: string
  createdAt: number
  resolvedAt: number
  refundPercentage: number
  resolutionNote: string
}

export interface Evidence {
  disputeId: number
  submitter: string
  evidenceURI: string
  timestamp: number
  description: string
}

interface DisputeContextType {
  disputes: Dispute[]
  createDispute: (
    jobId: number,
    escrowId: number,
    reason: string,
    evidenceURI: string
  ) => Promise<void>
  submitEvidence: (
    disputeId: number,
    evidenceURI: string,
    description: string
  ) => Promise<void>
  resolveDispute: (
    disputeId: number,
    resolution: Resolution,
    refundPercentage: number,
    resolutionNote: string
  ) => Promise<void>
  appealDispute: (disputeId: number) => Promise<void>
  getDispute: (disputeId: number) => Promise<Dispute | null>
  getDisputeEvidence: (disputeId: number) => Promise<Evidence[]>
  getJobDispute: (jobId: number) => Promise<number>
  isLoading: boolean
}

const DisputeContext = createContext<DisputeContextType | undefined>(undefined)

export function DisputeProvider({ children }: { children: React.ReactNode }) {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { address, signer } = useWallet()

  const getDisputeContract = () => {
    if (!signer) throw new Error("Wallet not connected")
    return new ethers.Contract(
      contractAddresses.DisputeResolver,
      DisputeResolverABI.abi,
      signer
    )
  }

  const createDispute = async (
    jobId: number,
    escrowId: number,
    reason: string,
    evidenceURI: string
  ) => {
    if (!address) throw new Error("Wallet not connected")
    
    setIsLoading(true)
    try {
      const contract = getDisputeContract()
      const tx = await contract.createDispute(
        jobId,
        escrowId,
        reason,
        evidenceURI
      )
      
      await tx.wait()
    } finally {
      setIsLoading(false)
    }
  }

  const submitEvidence = async (
    disputeId: number,
    evidenceURI: string,
    description: string
  ) => {
    if (!address) throw new Error("Wallet not connected")
    
    setIsLoading(true)
    try {
      const contract = getDisputeContract()
      const tx = await contract.submitEvidence(
        disputeId,
        evidenceURI,
        description
      )
      
      await tx.wait()
    } finally {
      setIsLoading(false)
    }
  }

  const resolveDispute = async (
    disputeId: number,
    resolution: Resolution,
    refundPercentage: number,
    resolutionNote: string
  ) => {
    if (!address) throw new Error("Wallet not connected")
    
    setIsLoading(true)
    try {
      const contract = getDisputeContract()
      const tx = await contract.resolveDispute(
        disputeId,
        resolution,
        refundPercentage,
        resolutionNote
      )
      
      await tx.wait()
    } finally {
      setIsLoading(false)
    }
  }

  const appealDispute = async (disputeId: number) => {
    if (!address) throw new Error("Wallet not connected")
    
    setIsLoading(true)
    try {
      const contract = getDisputeContract()
      const tx = await contract.appealDispute(disputeId)
      await tx.wait()
    } finally {
      setIsLoading(false)
    }
  }

  const getDispute = async (disputeId: number): Promise<Dispute | null> => {
    try {
      const contract = getDisputeContract()
      const dispute = await contract.getDispute(disputeId)
      
      return {
        id: Number(dispute.id),
        jobId: Number(dispute.jobId),
        escrowId: Number(dispute.escrowId),
        client: dispute.client,
        freelancer: dispute.freelancer,
        initiator: dispute.initiator,
        reason: dispute.reason,
        evidenceURI: dispute.evidenceURI,
        status: dispute.status as DisputeStatus,
        resolution: dispute.resolution as Resolution,
        assignedArbitrator: dispute.assignedArbitrator,
        createdAt: Number(dispute.createdAt),
        resolvedAt: Number(dispute.resolvedAt),
        refundPercentage: Number(dispute.refundPercentage),
        resolutionNote: dispute.resolutionNote,
      }
    } catch (error) {
      console.error("Error fetching dispute:", error)
      return null
    }
  }

  const getDisputeEvidence = async (disputeId: number): Promise<Evidence[]> => {
    try {
      const contract = getDisputeContract()
      const evidences = await contract.getDisputeEvidence(disputeId)
      
      return evidences.map((e: any) => ({
        disputeId: Number(e.disputeId),
        submitter: e.submitter,
        evidenceURI: e.evidenceURI,
        timestamp: Number(e.timestamp),
        description: e.description,
      }))
    } catch (error) {
      console.error("Error fetching dispute evidence:", error)
      return []
    }
  }

  const getJobDispute = async (jobId: number): Promise<number> => {
    try {
      const contract = getDisputeContract()
      const disputeId = await contract.getJobDispute(jobId)
      return Number(disputeId)
    } catch (error) {
      console.error("Error fetching job dispute:", error)
      return 0
    }
  }

  const value = {
    disputes,
    createDispute,
    submitEvidence,
    resolveDispute,
    appealDispute,
    getDispute,
    getDisputeEvidence,
    getJobDispute,
    isLoading,
  }

  return <DisputeContext.Provider value={value}>{children}</DisputeContext.Provider>
}

export function useDispute() {
  const context = useContext(DisputeContext)
  if (context === undefined) {
    throw new Error("useDispute must be used within a DisputeProvider")
  }
  return context
}