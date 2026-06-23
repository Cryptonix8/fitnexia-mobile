import type { GymTierConfig, JobApplication, JobPosting } from '@/types/api';

import { apiRequest } from './client';

export async function fetchGymTierCatalog() {
  const result = await apiRequest<{ data: GymTierConfig[] }>('/config/gym-tiers');
  return result.data;
}

export async function fetchOpenJobs(q?: string) {
  const query = q ? `?q=${encodeURIComponent(q)}` : '';
  const result = await apiRequest<{ data: JobPosting[] }>(`/jobs${query}`);
  return result.data;
}

export async function fetchOpenJob(jobId: string) {
  return apiRequest<JobPosting>(`/jobs/${jobId}`);
}

export async function applyToJobApi(jobId: string, message?: string) {
  return apiRequest<JobApplication>(`/jobs/${jobId}/apply`, {
    method: 'POST',
    body: { message: message ?? '' },
  });
}

export async function fetchMyJobApplications() {
  const result = await apiRequest<{ data: JobApplication[] }>('/instructors/me/job-applications');
  return result.data;
}
