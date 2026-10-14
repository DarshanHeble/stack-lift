import { apiClient } from './client';
import type { Job, JobCreate } from '@/types/api';

/**
 * Modernization Jobs API service.
 */
export const jobsApi = {
  async getById(id: string): Promise<Job> {
    const { data } = await apiClient.get<Job>(`/jobs/${id}`);
    return data;
  },

  async list(): Promise<Job[]> {
    const { data } = await apiClient.get<Job[]>('/jobs');
    return data;
  },

  async create(payload: JobCreate): Promise<Job> {
    const { data } = await apiClient.post<Job>('/jobs', payload);
    return data;
  },
};
