/**
 * SafeGig Platform Contexts
 * 
 * This file exports all context providers and hooks for the SafeGig platform.
 * Import what you need from this single entry point.
 */

// Job Management
export {
  JobProvider,
  useJobs,
  JobStatus,
  ApplicationStatus,
  type Job,
  type JobApplication,
} from "./job-context"

// Escrow Management
export {
  EscrowProvider,
  useEscrow,
  EscrowStatus,
  type Escrow,
} from "./escrow-context"

// Dispute Resolution
export {
  DisputeProvider,
  useDispute,
  DisputeStatus,
  Resolution,
  type Dispute,
  type Evidence,
} from "./dispute-context"

// Reputation System
export {
  ReputationProvider,
  useReputation,
  type Review,
  type UserReputation,
} from "./reputation-context"

// User Registry
export {
  RegistryProvider,
  useRegistry,
  UserType,
  type UserProfile,
  type FreelancerStats,
  type ClientStats,
} from "./registry-context"

// Unified Provider
export { SafeGigProvider } from "./safegig-provider"