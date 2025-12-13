"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/providers/WalletProvider"
import { ethers } from "ethers"
import contractAddresses from "@/lib/abis/contract-addresses.json"
import SafeGigRegistryABI from "@/lib/abis/SafeGigRegistry.json"
import { useToast } from "@/hooks/use-toast"

export function GrantRoleHelper() {
  const { signer, address } = useWallet()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const grantJobManagerRole = async () => {
    if (!signer || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const registry = new ethers.Contract(
        contractAddresses.SafeGigRegistry,
        SafeGigRegistryABI.abi,
        signer
      )

      // Check if user is admin
      const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000"
      const isAdmin = await registry.hasRole(DEFAULT_ADMIN_ROLE, address)
      
      if (!isAdmin) {
        toast({
          title: "Not Authorized",
          description: "You must be an admin to grant roles",
          variant: "destructive",
        })
        return
      }

      // Calculate the JOB_MANAGER_ROLE
      const JOB_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("JOB_MANAGER_ROLE"))
      
      console.log("Granting JOB_MANAGER_ROLE to JobManager...")
      console.log("Role hash:", JOB_MANAGER_ROLE)
      console.log("JobManager address:", contractAddresses.JobManager)

      // Grant the role
      const tx = await registry.grantRole(JOB_MANAGER_ROLE, contractAddresses.JobManager)
      
      toast({
        title: "Transaction Sent",
        description: "Waiting for confirmation...",
      })

      await tx.wait()

      toast({
        title: "Success!",
        description: "JobManager now has permission to update Registry",
      })

      console.log("✅ Role granted successfully!")
    } catch (error: any) {
      console.error("Error granting role:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to grant role",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const grantDisputeResolverRole = async () => {
    if (!signer || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const registry = new ethers.Contract(
        contractAddresses.SafeGigRegistry,
        SafeGigRegistryABI.abi,
        signer
      )

      const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000"
      const isAdmin = await registry.hasRole(DEFAULT_ADMIN_ROLE, address)
      
      if (!isAdmin) {
        toast({
          title: "Not Authorized",
          description: "You must be an admin to grant roles",
          variant: "destructive",
        })
        return
      }

      const DISPUTE_RESOLVER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DISPUTE_RESOLVER_ROLE"))
      
      console.log("Granting DISPUTE_RESOLVER_ROLE to DisputeResolver...")
      
      const tx = await registry.grantRole(DISPUTE_RESOLVER_ROLE, contractAddresses.DisputeResolver)
      
      toast({
        title: "Transaction Sent",
        description: "Waiting for confirmation...",
      })

      await tx.wait()

      toast({
        title: "Success!",
        description: "DisputeResolver now has permission to update Registry",
      })

      console.log("✅ Role granted successfully!")
    } catch (error: any) {
      console.error("Error granting role:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to grant role",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-muted space-y-4">
      <div>
        <h3 className="font-semibold mb-2">🔐 Grant Contract Permissions</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Grant necessary roles to your smart contracts. You must be an admin to use these functions.
        </p>
      </div>

      <div className="space-y-2">
        <Button 
          onClick={grantJobManagerRole} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Grant JOB_MANAGER_ROLE to JobManager"}
        </Button>
        
        <Button 
          onClick={grantDisputeResolverRole} 
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          {isLoading ? "Processing..." : "Grant DISPUTE_RESOLVER_ROLE to DisputeResolver"}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>📍 Registry: {contractAddresses.SafeGigRegistry}</p>
        <p>📍 JobManager: {contractAddresses.JobManager}</p>
        <p>📍 DisputeResolver: {contractAddresses.DisputeResolver}</p>
      </div>
    </div>
  )
}