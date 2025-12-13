"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/providers/WalletProvider";
import { useRegistry } from "@/contexts";
import { ethers } from "ethers";
import contractAddresses from "@/lib/abis/contract-addresses.json";
import JobManagerABI from "@/lib/abis/JobManager.json";
import SafeGigRegistryABI from "@/lib/abis/SafeGigRegistry.json";

export function DebugRegistrationChecker() {
  const { address, signer } = useWallet();
  const { isRegisteredUser, getUserType, userProfile } = useRegistry();
  const [debugOutput, setDebugOutput] = useState<string[]>([]);

  const log = (message: string) => {
    console.log(message);
    setDebugOutput((prev) => [...prev, message]);
  };

  const checkRegistration = async () => {
    setDebugOutput([]);

    if (!address || !signer) {
      log("❌ No wallet connected");
      return;
    }

    log("=== REGISTRATION DEBUG ===");
    log(`Connected address: ${address}`);
    log(`Registry contract: ${contractAddresses.SafeGigRegistry}`);
    log(`JobManager contract: ${contractAddresses.JobManager}`);
    log("");

    // Check via Registry context
    try {
      const isReg = await isRegisteredUser(address);
      const userType = await getUserType(address);
      log("📋 Registry Context says:");
      log(`  - Is Registered: ${isReg}`);
      log(
        `  - User Type: ${userType} (0=None, 1=Freelancer, 2=Client, 3=Both)`
      );
      // Now let's try to simulate the exact call that postJob makes
      log("");
      log("🔍 Simulating the actual postJob call:");
      try {
        // Create a contract instance to estimate gas
        const jobManager = new ethers.Contract(
          contractAddresses.JobManager,
          JobManagerABI.abi,
          signer
        );

        // Try to estimate gas for the postJob call
        const budgetInWei = ethers.parseEther("0.002");
        const deadlineTimestamp = Math.floor(Date.now() / 1000) + 86400; // 1 day from now

        const gasEstimate = await jobManager.postJob.estimateGas(
          "Test Job",
          "Test Description",
          "",
          budgetInWei,
          deadlineTimestamp,
          ["skill1"],
          ["Other"],
          false
        );

        log(`✅ Gas estimate succeeded: ${gasEstimate.toString()}`);
        log("   This means the transaction SHOULD work!");
      } catch (error: any) {
        log(`❌ Gas estimate FAILED: ${error.message}`);

        // Try to decode the revert reason
        if (error.data) {
          log(`   Revert data: ${error.data}`);
        }

        // Common reasons for failure
        if (error.message.includes("Only clients can perform this action")) {
          log("   Reason: onlyClient modifier is failing");
          log(
            "   Even though user type is 2, the modifier check is somehow failing"
          );
        } else if (error.message.includes("User not registered")) {
          log("   Reason: onlyRegisteredUser modifier is failing");
        } else if (error.message.includes("paused")) {
          log("   Reason: Contract is paused");
        } else {
          log(`   Raw error: ${JSON.stringify(error, null, 2)}`);
        }
      }
      log("");
    } catch (error: any) {
      log(`❌ Error checking Registry Context: ${error.message}`);
    }

    // Check what JobManager sees
    try {
      const jobManager = new ethers.Contract(
        contractAddresses.JobManager,
        JobManagerABI.abi,
        signer
      );

      // Get the registry address that JobManager is using
      const jobManagerRegistryAddr = await jobManager.registry();
      log(`🔍 JobManager's Registry address: ${jobManagerRegistryAddr}`);

      if (
        jobManagerRegistryAddr.toLowerCase() !==
        contractAddresses.SafeGigRegistry.toLowerCase()
      ) {
        log("❌❌❌ CRITICAL: REGISTRY MISMATCH! ❌❌❌");
        log(`   Your app is using: ${contractAddresses.SafeGigRegistry}`);
        log(`   JobManager is using: ${jobManagerRegistryAddr}`);
        log("   This is why your transaction is failing!");
        log("   You need to either:");
        log("   1. Update JobManager to use the correct Registry, OR");
        log(
          "   2. Register your user in the Registry that JobManager is using"
        );
        log("");
      } else {
        log("✅ Registry addresses match!");
        log("");
      }

      // Now check what that Registry says about the user
      const actualRegistry = new ethers.Contract(
        jobManagerRegistryAddr,
        SafeGigRegistryABI.abi,
        signer
      );

      const isRegInActual = await actualRegistry.isRegisteredUser(address);
      log(`🔍 What JobManager's Registry sees:`);
      log(`  - Is Registered: ${isRegInActual}`);

      if (isRegInActual) {
        const userTypeInActual = await actualRegistry.getUserType(address);
        const userTypeNum = Number(userTypeInActual);
        log(
          `  - User Type: ${userTypeNum} (0=None, 1=Freelancer, 2=Client, 3=Both)`
        );
        log(`  - Raw value: ${userTypeInActual.toString()}`);

        if (userTypeNum !== 2 && userTypeNum !== 3) {
          log(`❌ User type ${userTypeNum} is not Client (2) or Both (3)`);
          log("   This is why the onlyClient modifier is failing!");
        } else {
          log(`✅ User type ${userTypeNum} IS valid for posting jobs`);
          log("   The registration check should pass...");
        }
      } else {
        log("❌ User is NOT registered in JobManager's Registry!");
        log("   This is why the onlyRegisteredUser modifier is failing!");
      }
      log("");

      // Check if contract is paused
      const isPaused = await jobManager.paused();
      log(`🔍 Contract paused status: ${isPaused}`);
      if (isPaused) {
        log("❌ CONTRACT IS PAUSED! This will cause all transactions to fail.");
      } else {
        log("✅ Contract is not paused");
      }
      log("");

      // Check user's roles
      const DEFAULT_ADMIN_ROLE =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      const hasAdminRole = await jobManager.hasRole(
        DEFAULT_ADMIN_ROLE,
        address
      );
      log(`🔍 User has admin role: ${hasAdminRole}`);
      log("");

      // Check if JobManager has permission to update Registry
      log("🔍 Checking Registry permissions:");
      try {
        const JOB_MANAGER_ROLE = ethers.keccak256(
          ethers.toUtf8Bytes("JOB_MANAGER_ROLE")
        );
        const jobManagerHasRole = await actualRegistry.hasRole(
          JOB_MANAGER_ROLE,
          contractAddresses.JobManager
        );
        log(
          `  - JobManager has JOB_MANAGER_ROLE in Registry: ${jobManagerHasRole}`
        );

        if (!jobManagerHasRole) {
          log("❌❌❌ FOUND THE PROBLEM! ❌❌❌");
          log("   JobManager does NOT have JOB_MANAGER_ROLE in the Registry");
          log("   This means it cannot call updateClientStats()");
          log("   Solution: Grant JOB_MANAGER_ROLE to JobManager contract");
          log(
            `   Run this as admin: registry.grantRole(JOB_MANAGER_ROLE, "${contractAddresses.JobManager}")`
          );
        } else {
          log("✅ JobManager has proper permissions in Registry");
        }
      } catch (error: any) {
        log(`⚠️ Could not check JobManager role: ${error.message}`);
        log("   Your Registry might not have role-based access control");
      }
    } catch (error: any) {
      log(`❌ Error checking JobManager: ${error.message}`);
      console.error(error);
    }

    log("=== END DEBUG ===");
  };

  return (
    <div className="p-4 border rounded-lg bg-muted space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Debug Registration Status</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click to check your registration status and contract configuration
        </p>
        <Button onClick={checkRegistration} variant="outline">
          Check Registration
        </Button>
      </div>

      {debugOutput.length > 0 && (
        <div className="bg-black text-green-400 p-4 rounded font-mono text-xs overflow-auto max-h-96">
          {debugOutput.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}
