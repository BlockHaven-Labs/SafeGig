"use client"

import type React from "react"
import { JobProvider } from "./job-context"
import { EscrowProvider } from "./escrow-context"
import { ReputationProvider } from "./reputation-context"
import { RegistryProvider } from "./registry-context"
import { DisputeProvider } from "./dispute-context"

/**
 * SafeGigProvider wraps all the context providers in the correct order
 * Usage: Wrap your app with this provider to access all SafeGig contexts
 */
export function SafeGigProvider({ children }: { children: React.ReactNode }) {
  return (
    <RegistryProvider>
      <JobProvider>
        <EscrowProvider>
          <DisputeProvider>
            <ReputationProvider>
              {children}
            </ReputationProvider>
          </DisputeProvider>
        </EscrowProvider>
      </JobProvider>
    </RegistryProvider>
  )
}