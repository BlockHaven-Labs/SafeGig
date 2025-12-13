"use client"

import { useWallet } from "@/providers/WalletProvider"
import type React from "react"
import { createContext, useContext, useState } from "react"
import { ethers } from "ethers"
import EscrowManagerABI from "@/lib/abis/EscrowManager.json"
import contractAddresses from "@/lib/abis/contract-addresses.json"

export enum EscrowStatus {
  Created = 0,
  WorkStarted = 1,
  WorkSubmitted = 2,
  Approved = 3,
  Released = 4,
  Refunded = 5,
  Disputed = 6,
}

export interface Escrow {
  id: number
  jobId: number
  client: string
  freelancer: string
  amount: string
  platformFee: string
  createdAt: number
  releaseTime: number
  status: EscrowStatus
  clientApproved: boolean
  freelancerConfirmed: boolean
}

interface EscrowContextType {
  escrows: Escrow[]
  createEscrow: (jobId: number, amount: string) => Promise<void>
  startWork: (escrowId: number) => Promise<void>
  submitWork: (escrowId: number) => Promise<void>
  approveWork: (escrowId: number) => Promise<void>
  releasePayment: (escrowId: number) => Promise<void>
  requestRefund: (escrowId: number) => Promise<void>
  getEscrow: (escrowId: number) => Promise<Escrow | null>
  getEscrowByJob: (jobId: number) => Promise<number>
  getUserEscrows: (userAddress: string) => Promise<number[]>
  getEscrowUSDValue: (escrowId: number) => Promise<string>
  getLatestPrice: () => Promise<string>
  meetsMinimumUSD: (ethAmount: string) => Promise<boolean>
  isLoading: boolean
}

const EscrowContext = createContext<EscrowContextType | undefined>(undefined)

export function EscrowProvider({ children }: { children: React.ReactNode }) {
  const [escrows, setEscrows] = useState<Escrow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { address, signer } = useWallet()

  const getEscrowContract = () => {
    if (!signer) throw new Error("Wallet not connected")
    return new ethers.Contract(
      contractAddresses.EscrowManager,
      EscrowManagerABI.abi,
      signer
    )
  }

  const createEscrow = async (jobId: number, amount: string) => {
    if (!address) throw new Error("Wallet not connected")
    
    setIsLoading(true)
    try {
      const contract = getEscrowContract()
      const amountInWei = ethers.parseEther(amount)
      
      const tx = await contract.createEscrow(jobId, {
        value: amountInWei,
      })
      
      await tx.wait()
    } finally {
      setIsLoading(false)
    }
  }

  const startWork = async (escrowId: number) => {
    if (!address) throw new Error("Wallet not connected")
    
    setIsLoading(true)
    try {
      const contract = getEscrowContract()
      const tx = await contract.startWork(escrowId)
      await tx.wait()
    } finally {
      setIsLoading(false)
    }
  }

  const submitWork = async (escrowId: number) => {
    if (!address) throw new Error("Wallet not connected")
    
    setIsLoading(true)
    try {
      const contract = getEscrowContract()
      const tx = await contract.submitWork(escrowId)
      await tx.wait()
    } finally {
      setIsLoading(false)
    }
  }

  const approveWork = async (escrowId: number) => {
    if (!address) throw new Error("Wallet not connected")
    
    setIsLoading(true)
    try {
      const contract = getEscrowContract()
      const tx = await contract.approveWork(escrowId)
      await tx.wait()
    } finally {
      setIsLoading(false)
    }
  }

  const releasePayment = async (escrowId: number) => {
    if (!address) throw new Error("Wallet not connected")
    
    setIsLoading(true)
    try {
      const contract = getEscrowContract()
      const tx = await contract.releasePayment(escrowId)
      await tx.wait()
    } finally {
      setIsLoading(false)
    }
  }

  const requestRefund = async (escrowId: number) => {
    if (!address) throw new Error("Wallet not connected")
    
    setIsLoading(true)
    try {
      const contract = getEscrowContract()
      const tx = await contract.requestRefund(escrowId)
      await tx.wait()
    } finally {
      setIsLoading(false)
    }
  }

  const getEscrow = async (escrowId: number): Promise<Escrow | null> => {
    try {
      const contract = getEscrowContract()
      const escrow = await contract.getEscrow(escrowId)
      
      return {
        id: Number(escrow.id),
        jobId: Number(escrow.jobId),
        client: escrow.client,
        freelancer: escrow.freelancer,
        amount: ethers.formatEther(escrow.amount),
        platformFee: ethers.formatEther(escrow.platformFee),
        createdAt: Number(escrow.createdAt),
        releaseTime: Number(escrow.releaseTime),
        status: escrow.status as EscrowStatus,
        clientApproved: escrow.clientApproved,
        freelancerConfirmed: escrow.freelancerConfirmed,
      }
    } catch (error) {
      console.error("Error fetching escrow:", error)
      return null
    }
  }

  const getEscrowByJob = async (jobId: number): Promise<number> => {
    try {
      const contract = getEscrowContract()
      const escrowId = await contract.getEscrowByJob(jobId)
      return Number(escrowId)
    } catch (error) {
      console.error("Error fetching escrow by job:", error)
      return 0
    }
  }

  const getUserEscrows = async (userAddress: string): Promise<number[]> => {
    try {
      const contract = getEscrowContract()
      const escrowIds = await contract.getUserEscrows(userAddress)
      return escrowIds.map((id: bigint) => Number(id))
    } catch (error) {
      console.error("Error fetching user escrows:", error)
      return []
    }
  }

  const getEscrowUSDValue = async (escrowId: number): Promise<string> => {
    try {
      const contract = getEscrowContract()
      const usdValue = await contract.getEscrowUSDValue(escrowId)
      // USD value has 8 decimals, convert to readable format
      return (Number(usdValue) / 1e8).toFixed(2)
    } catch (error) {
      console.error("Error fetching escrow USD value:", error)
      return "0"
    }
  }

  const getLatestPrice = async (): Promise<string> => {
    try {
      const contract = getEscrowContract()
      const price = await contract.getLatestPrice()
      // Price has 8 decimals
      return (Number(price) / 1e8).toFixed(2)
    } catch (error) {
      console.error("Error fetching latest price:", error)
      return "0"
    }
  }

  const meetsMinimumUSD = async (ethAmount: string): Promise<boolean> => {
    try {
      const contract = getEscrowContract()
      const amountInWei = ethers.parseEther(ethAmount)
      return await contract.meetsMinimumUSD(amountInWei)
    } catch (error) {
      console.error("Error checking minimum USD:", error)
      return false
    }
  }

  const value = {
    escrows,
    createEscrow,
    startWork,
    submitWork,
    approveWork,
    releasePayment,
    requestRefund,
    getEscrow,
    getEscrowByJob,
    getUserEscrows,
    getEscrowUSDValue,
    getLatestPrice,
    meetsMinimumUSD,
    isLoading,
  }

  return <EscrowContext.Provider value={value}>{children}</EscrowContext.Provider>
}

export function useEscrow() {
  const context = useContext(EscrowContext)
  if (context === undefined) {
    throw new Error("useEscrow must be used within an EscrowProvider")
  }
  return context
}