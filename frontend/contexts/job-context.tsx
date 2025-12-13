"use client";

import { useWallet } from "@/providers/WalletProvider";
import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import JobManagerABI from "@/lib/abis/JobManager.json";
import contractAddresses from "@/lib/abis/contract-addresses.json";

export enum JobStatus {
  Open = 0,
  Assigned = 1,
  InProgress = 2,
  Submitted = 3,
  Completed = 4,
  Cancelled = 5,
  Disputed = 6,
}

export enum ApplicationStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
}

export interface Job {
  id: number;
  client: string;
  assignedFreelancer: string;
  title: string;
  description: string;
  metadataURI: string;
  budget: string;
  deadline: number;
  createdAt: number;
  status: JobStatus;
  requiredSkills: string[];
  tags: string[];
  isUrgent: boolean;
}

export interface JobApplication {
  jobId: number;
  freelancer: string;
  proposalURI: string;
  proposedBudget: string;
  proposedDeadline: number;
  appliedAt: number;
  status: ApplicationStatus;
}

interface JobContextType {
  jobs: Job[];
  postJob: (jobData: {
    title: string;
    description: string;
    metadataURI: string;
    budget: string;
    deadline: number;
    requiredSkills: string[];
    tags: string[];
    isUrgent: boolean;
  }) => Promise<void>;
  applyForJob: (
    jobId: number,
    proposalURI: string,
    proposedBudget: string,
    proposedDeadline: number
  ) => Promise<void>;
  acceptApplication: (applicationId: number) => Promise<void>;
  startWork: (jobId: number) => Promise<void>;
  submitWork: (jobId: number) => Promise<void>;
  getJob: (jobId: number) => Promise<Job | null>;
  getJobApplications: (jobId: number) => Promise<number[]>;
  getClientJobs: (clientAddress: string) => Promise<number[]>;
  getFreelancerJobs: (freelancerAddress: string) => Promise<number[]>;
  getTotalJobs: () => Promise<number>;
  isLoading: boolean;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { address, signer } = useWallet();

  const getJobManagerContract = () => {
    if (!signer) throw new Error("check wallet connection");
    return new ethers.Contract(
      contractAddresses.JobManager,
      JobManagerABI.abi,
      signer
    );
  };

  const postJob = async (jobData: {
    title: string;
    description: string;
    metadataURI: string;
    budget: string;
    deadline: number;
    requiredSkills: string[];
    tags: string[];
    isUrgent: boolean;
  }) => {
    if (!address) throw new Error("Wallet not connected");

    setIsLoading(true);
    try {
      const contract = getJobManagerContract();
      const budgetInWei = ethers.parseEther(jobData.budget);

      const tx = await contract.postJob(
        jobData.title,
        jobData.description,
        jobData.metadataURI,
        budgetInWei,
        jobData.deadline,
        jobData.requiredSkills,
        jobData.tags,
        jobData.isUrgent
      );

      await tx.wait();

      // Refresh jobs list
      await loadJobs();
    } finally {
      setIsLoading(false);
    }
  };

  const applyForJob = async (
    jobId: number,
    proposalURI: string,
    proposedBudget: string,
    proposedDeadline: number
  ) => {
    if (!address) throw new Error("Wallet not connected");

    setIsLoading(true);
    try {
      const contract = getJobManagerContract();
      const budgetInWei = ethers.parseEther(proposedBudget);

      const tx = await contract.applyForJob(
        jobId,
        proposalURI,
        budgetInWei,
        proposedDeadline
      );

      await tx.wait();
    } finally {
      setIsLoading(false);
    }
  };

  const acceptApplication = async (applicationId: number) => {
    if (!address) throw new Error("Wallet not connected");

    setIsLoading(true);
    try {
      const contract = getJobManagerContract();
      const tx = await contract.acceptApplication(applicationId);
      await tx.wait();

      // Refresh jobs list
      await loadJobs();
    } finally {
      setIsLoading(false);
    }
  };

  const startWork = async (jobId: number) => {
    if (!address) throw new Error("Wallet not connected");

    setIsLoading(true);
    try {
      const contract = getJobManagerContract();
      const tx = await contract.startWork(jobId);
      await tx.wait();

      // Refresh jobs list
      await loadJobs();
    } finally {
      setIsLoading(false);
    }
  };

  const submitWork = async (jobId: number) => {
    if (!address) throw new Error("Wallet not connected");

    setIsLoading(true);
    try {
      const contract = getJobManagerContract();
      const tx = await contract.submitWork(jobId);
      await tx.wait();

      // Refresh jobs list
      await loadJobs();
    } finally {
      setIsLoading(false);
    }
  };

  const getJob = async (jobId: number): Promise<Job | null> => {
    try {
      const contract = getJobManagerContract();
      const job = await contract.getJob(jobId);

      return {
        id: Number(job.id),
        client: job.client,
        assignedFreelancer: job.assignedFreelancer,
        title: job.title,
        description: job.description,
        metadataURI: job.metadataURI,
        budget: ethers.formatEther(job.budget),
        deadline: Number(job.deadline),
        createdAt: Number(job.createdAt),
        status: job.status as JobStatus,
        requiredSkills: job.requiredSkills,
        tags: job.tags,
        isUrgent: job.isUrgent,
      };
    } catch (error) {
      console.error("Error fetching job:", error);
      return null;
    }
  };

  const getJobApplications = async (jobId: number): Promise<number[]> => {
    try {
      const contract = getJobManagerContract();
      const applications = await contract.getJobApplications(jobId);
      return applications.map((id: bigint) => Number(id));
    } catch (error) {
      console.error("Error fetching job applications:", error);
      return [];
    }
  };

  const getClientJobs = async (clientAddress: string): Promise<number[]> => {
    try {
      const contract = getJobManagerContract();
      const jobIds = await contract.getClientJobs(clientAddress);
      return jobIds.map((id: bigint) => Number(id));
    } catch (error) {
      console.error("Error fetching client jobs:", error);
      return [];
    }
  };

  const getFreelancerJobs = async (
    freelancerAddress: string
  ): Promise<number[]> => {
    try {
      const contract = getJobManagerContract();
      const jobIds = await contract.getFreelancerJobs(freelancerAddress);
      return jobIds.map((id: bigint) => Number(id));
    } catch (error) {
      console.error("Error fetching freelancer jobs:", error);
      return [];
    }
  };

  const getTotalJobs = async (): Promise<number> => {
    const contract = getJobManagerContract();
    if (!contract) return 0;

    try {
      const total = await contract.getTotalJobs();
      return Number(total);
    } catch (error) {
      console.error("Error fetching total jobs:", error);
      return 0;
    }
  };

  const loadJobs = async () => {
    if (!address) return;

    try {
      const total = await getTotalJobs();
      const loadedJobs: Job[] = [];

      for (let i = 0; i < total; i++) {
        const job = await getJob(i);
        if (job) loadedJobs.push(job);
      }

      setJobs(loadedJobs);
    } catch (error) {
      console.error("Error loading jobs:", error);
    }
  };

  useEffect(() => {
    if (!signer || !address) return;
    loadJobs();
  }, [signer, address]);

  const value = {
    jobs,
    postJob,
    applyForJob,
    acceptApplication,
    startWork,
    submitWork,
    getJob,
    getJobApplications,
    getClientJobs,
    getFreelancerJobs,
    getTotalJobs,
    isLoading,
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
}

export function useJobs() {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error("useJobs must be used within a JobProvider");
  }
  return context;
}
