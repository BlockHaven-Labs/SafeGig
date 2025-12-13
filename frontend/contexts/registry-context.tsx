"use client"

import { useWallet } from "@/providers/WalletProvider"
import type React from "react"
import { createContext, useContext, useState } from "react"
import { ethers } from "ethers"
import SafeGigRegistryABI from "@/lib/abis/SafeGigRegistry.json"
import contractAddresses from "@/lib/abis/contract-addresses.json"

export enum UserType {
  None = 0,
  Freelancer = 1,
  Client = 2,
  Both = 3,
}

export interface UserProfile {
  metadataURI: string
  userType: UserType
  registrationTime: number
  isActive: boolean
  isVerified: boolean
  location: string
  skills: string[]
}

export interface FreelancerStats {
  jobsCompleted: number
  totalEarned: string
  successRate: number
  responseTime: number
  hourlyRate: string
}

export interface ClientStats {
  totalSpent: string
  jobsPosted: number
  jobsCompleted: number
  responseTime: number
}

interface RegistryContextType {
  userProfile: UserProfile | null
  registerUser: (
    userType: UserType,
    metadataURI: string,
    location: string,
    skills: string[]
  ) => Promise<void>
  updateProfile: (
    metadataURI: string,
    location: string,
    skills: string[]
  ) => Promise<void>
  isRegisteredUser: (userAddress: string) => Promise<boolean>
  getUserType: (userAddress: string) => Promise<UserType>
  getUserProfile: (userAddress: string) => Promise<string>
  getFreelancerStats: (freelancerAddress: string) => Promise<FreelancerStats | null>
  getClientStats: (clientAddress: string) => Promise<ClientStats | null>
  getUserSkills: (userAddress: string) => Promise<string[]>
  getTotalUsers: () => Promise<number>
  loadUserProfile: (userAddress?: string) => Promise<UserProfile | null>,
  isLoading: boolean
}

const RegistryContext = createContext<RegistryContextType | undefined>(undefined)

export function RegistryProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { address, signer } = useWallet()

  const getRegistryContract = () => {
    if (!signer) throw new Error("Wallet not connected")
    return new ethers.Contract(
      contractAddresses.SafeGigRegistry,
      SafeGigRegistryABI.abi,
      signer
    )
  }

  const registerUser = async (
    userType: UserType,
    metadataURI: string,
    location: string,
    skills: string[]
  ) => {
    if (!address) throw new Error("Wallet not connected")
    
    setIsLoading(true)
    try {
      const contract = getRegistryContract()
      const tx = await contract.registerUser(
        userType,
        metadataURI,
        location,
        skills
      )
      
      await tx.wait()
      
      // Reload user profile
      await loadUserProfile()
    } finally {
      setIsLoading(false)
    }
  }

  const getUserSkills = async (userAddress: string): Promise<string[]> => {
  try {
    const contract = getRegistryContract()
    const profile = await contract.userProfiles(userAddress)
    return profile.skills || []
  } catch (error) {
    console.error("Error fetching user skills:", error)
    return []
  }
}


  const updateProfile = async (
    metadataURI: string,
    location: string,
    skills: string[]
  ) => {
    if (!address) throw new Error("Wallet not connected")
    
    setIsLoading(true)
    try {
      const contract = getRegistryContract()
      const tx = await contract.updateProfile(
        metadataURI,
        location,
        skills
      )
      
      await tx.wait()
      
      // Reload user profile
      await loadUserProfile()
    } finally {
      setIsLoading(false)
    }
  }

  const isRegisteredUser = async (userAddress: string): Promise<boolean> => {
    try {
      const contract = getRegistryContract()
      return await contract.isRegisteredUser(userAddress)
    } catch (error) {
      console.error("Error checking user registration:", error)
      return false
    }
  }

  const getUserType = async (userAddress: string): Promise<UserType> => {
    try {
      const contract = getRegistryContract()
      const userType = await contract.getUserType(userAddress)
      return Number(userType) as UserType
    } catch (error) {
      console.error("Error fetching user type:", error)
      return UserType.None
    }
  }

  const getUserProfile = async (userAddress: string): Promise<string> => {
    try {
      const contract = getRegistryContract()
      return await contract.getUserProfile(userAddress)
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return ""
    }
  }

  const getFreelancerStats = async (freelancerAddress: string): Promise<FreelancerStats | null> => {
    try {
      const contract = getRegistryContract()
      const stats = await contract.freelancerStats(freelancerAddress)
      
      return {
        jobsCompleted: Number(stats.jobsCompleted),
        totalEarned: ethers.formatEther(stats.totalEarned),
        successRate: Number(stats.successRate),
        responseTime: Number(stats.responseTime),
        hourlyRate: ethers.formatEther(stats.hourlyRate),
      }
    } catch (error) {
      console.error("Error fetching freelancer stats:", error)
      return null
    }
  }

  const getClientStats = async (clientAddress: string): Promise<ClientStats | null> => {
    try {
      const contract = getRegistryContract()
      const stats = await contract.clientStats(clientAddress)
      
      return {
        totalSpent: ethers.formatEther(stats.totalSpent),
        jobsPosted: Number(stats.jobsPosted),
        jobsCompleted: Number(stats.jobsCompleted),
        responseTime: Number(stats.responseTime),
      }
    } catch (error) {
      console.error("Error fetching client stats:", error)
      return null
    }
  }

  const getTotalUsers = async (): Promise<number> => {
    try {
      const contract = getRegistryContract()
      const total = await contract.getTotalUsers()
      return Number(total)
    } catch (error) {
      console.error("Error fetching total users:", error)
      return 0
    }
  }

  const loadUserProfile = async (
  userAddress?: string
): Promise<UserProfile | null> => {
  const target = userAddress || address
  if (!target) return null

  setIsLoading(true)

  try {
    const contract = getRegistryContract()
    const profile = await contract.userProfiles(target)

    const formatted: UserProfile = {
      metadataURI: profile.metadataURI,
      userType: Number(profile.userType) as UserType,
      registrationTime: Number(profile.registrationTime),
      isActive: profile.isActive,
      isVerified: profile.isVerified,
      location: profile.location,
      skills: profile.skills,
    }

    setUserProfile(formatted)
    return formatted
  } catch (error) {
    console.error("Error loading user profile:", error)
    setUserProfile(null)
    return null
  } finally {
    setIsLoading(false)
  }
}

  const value = {
    userProfile,
    registerUser,
    updateProfile,
    isRegisteredUser,
    getUserType,
    getUserProfile,
    getFreelancerStats,
    getClientStats,
    getUserSkills,
    getTotalUsers,
    loadUserProfile,
    isLoading,
  }

  return <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>
}

export function useRegistry() {
  const context = useContext(RegistryContext)
  if (context === undefined) {
    throw new Error("useRegistry must be used within a RegistryProvider")
  }
  return context
}