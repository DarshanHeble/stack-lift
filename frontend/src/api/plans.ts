import { apiClient } from './client';
import type { MigrationPlan, Finding } from '@/types/api';

/**
 * Migration Plans & Static Analysis Findings API service.
 */
export const plansApi = {
  async getByJobId(jobId: string): Promise<MigrationPlan> {
    const { data } = await apiClient.get<MigrationPlan>(`/jobs/${jobId}/plan`);
    return data;
  },

  async getFindingsByJobId(jobId: string): Promise<Finding[]> {
    const { data } = await apiClient.get<Finding[]>(`/jobs/${jobId}/findings`);
    return data;
  },
};
