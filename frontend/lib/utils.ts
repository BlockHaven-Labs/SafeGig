import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export enum JobStatus {
  Open = 0,
  Assigned = 1,
  InProgress = 2,
  Submitted = 3,
  Completed = 4,
  Cancelled = 5,
  Disputed = 6,
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  [JobStatus.Open]: "Open",
  [JobStatus.Assigned]: "Assigned",
  [JobStatus.InProgress]: "In Progress",
  [JobStatus.Submitted]: "Delivered",
  [JobStatus.Completed]: "Completed",
  [JobStatus.Cancelled]: "Cancelled",
  [JobStatus.Disputed]: "Disputed",
};

export const getStatusLabel = (status: JobStatus): string => {
  return JOB_STATUS_LABELS[status] || "Unknown";
};

export const getStatusColor = (status: JobStatus): string => {
  switch (status) {
    case JobStatus.Open:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case JobStatus.Assigned:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case JobStatus.InProgress:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case JobStatus.Submitted:
      return "bg-purple-100 text-purple-800 border-purple-200";
    case JobStatus.Completed:
      return "bg-green-100 text-green-800 border-green-200";
    case JobStatus.Disputed:
      return "bg-red-100 text-red-800 border-red-200";
    case JobStatus.Cancelled:
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const formatDeadline = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
};

export const formatAddress = (addr: string) => {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};
