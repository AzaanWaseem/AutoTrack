import type { Job } from '../types';

export async function fetchJobs(): Promise<Job[]> {
  const response = await fetch("http://localhost:8000/jobs");
  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }
  return response.json();
}