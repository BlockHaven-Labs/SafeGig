"use client"

import { useWallet } from "@/providers/WalletProvider"
import type React from "react"
import { createContext, useContext, useState } from "react"
import { ethers } from "ethers"
import ReputationSystemABI from "@/lib/abis/ReputationSystem.json"
import contractAddresses from "@/lib/abis/contract-addresses.json"

export interface Review {
  id: number
  jobId: number
  reviewer: string
  reviewee: string
  rating: number // 100-500 (1.0-5.0 stars)
  reviewURI: string
  timestamp: number
  isFreelancerReview: boolean
}

export interface UserReputation {
  totalRating: number
  reviewCount: number
  averageRating: number
  lastUpdated: number
}

interface ReputationContextType {
  reviews: Review[]
  submitReview: (
    jobId: number,
    reviewee: string,
    rating: number,
    reviewURI: string
  ) => Promise<void>
  getUserRating: (userAddress: string) => Promise<number>
  getUserReputation: (userAddress: string) => Promise<UserReputation | null>
  getReview: (reviewId: number) => Promise<Review | null>
  getUserReviews: (userAddress: string) => Promise<number[]>
  getJobReviews: (jobId: number) => Promise<Review[]>
  isLoading: boolean
}

const ReputationContext = createContext<ReputationContextType | undefined>(undefined)

export function ReputationProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { address, signer } = useWallet()

  const getReputationContract = () => {
    if (!signer) throw new Error("Wallet not connected")
    return new ethers.Contract(
      contractAddresses.ReputationSystem,
      ReputationSystemABI.abi,
      signer
    )
  }

  const submitReview = async (
    jobId: number,
    reviewee: string,
    rating: number,
    reviewURI: string
  ) => {
    if (!address) throw new Error("Wallet not connected")
    
    // Validate rating (100-500 for 1.0-5.0 stars)
    if (rating < 100 || rating > 500) {
      throw new Error("Rating must be between 1.0 and 5.0")
    }
    
    setIsLoading(true)
    try {
      const contract = getReputationContract()
      const tx = await contract.submitReview(
        jobId,
        reviewee,
        rating,
        reviewURI
      )
      
      await tx.wait()
    } finally {
      setIsLoading(false)
    }
  }

  const getUserRating = async (userAddress: string): Promise<number> => {
    try {
      const contract = getReputationContract()
      const rating = await contract.getUserRating(userAddress)
      return Number(rating)
    } catch (error) {
      console.error("Error fetching user rating:", error)
      return 0
    }
  }

  const getUserReputation = async (userAddress: string): Promise<UserReputation | null> => {
    try {
      const contract = getReputationContract()
      const reputation = await contract.getUserReputation(userAddress)
      
      return {
        totalRating: Number(reputation.totalRating),
        reviewCount: Number(reputation.reviewCount),
        averageRating: Number(reputation.averageRating),
        lastUpdated: Number(reputation.lastUpdated),
      }
    } catch (error) {
      console.error("Error fetching user reputation:", error)
      return null
    }
  }

  const getReview = async (reviewId: number): Promise<Review | null> => {
    try {
      const contract = getReputationContract()
      const review = await contract.getReview(reviewId)
      
      return {
        id: Number(review.id),
        jobId: Number(review.jobId),
        reviewer: review.reviewer,
        reviewee: review.reviewee,
        rating: Number(review.rating),
        reviewURI: review.reviewURI,
        timestamp: Number(review.timestamp),
        isFreelancerReview: review.isFreelancerReview,
      }
    } catch (error) {
      console.error("Error fetching review:", error)
      return null
    }
  }

  const getUserReviews = async (userAddress: string): Promise<number[]> => {
    try {
      const contract = getReputationContract()
      const reviewIds = await contract.getUserReviews(userAddress)
      return reviewIds.map((id: bigint) => Number(id))
    } catch (error) {
      console.error("Error fetching user reviews:", error)
      return []
    }
  }

  const getJobReviews = async (jobId: number): Promise<Review[]> => {
    try {
      const contract = getReputationContract()
      const reviews = await contract.getJobReviews(jobId)
      
      return reviews.map((r: any) => ({
        id: Number(r.id),
        jobId: Number(r.jobId),
        reviewer: r.reviewer,
        reviewee: r.reviewee,
        rating: Number(r.rating),
        reviewURI: r.reviewURI,
        timestamp: Number(r.timestamp),
        isFreelancerReview: r.isFreelancerReview,
      }))
    } catch (error) {
      console.error("Error fetching job reviews:", error)
      return []
    }
  }

  const value = {
    reviews,
    submitReview,
    getUserRating,
    getUserReputation,
    getReview,
    getUserReviews,
    getJobReviews,
    isLoading,
  }

  return <ReputationContext.Provider value={value}>{children}</ReputationContext.Provider>
}

export function useReputation() {
  const context = useContext(ReputationContext)
  if (context === undefined) {
    throw new Error("useReputation must be used within a ReputationProvider")
  }
  return context
}