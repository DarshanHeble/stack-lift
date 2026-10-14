import { apiClient } from './client';
import type { Patch, PatchReviewAction } from '@/types/api';

/**
 * Patches and Human-in-the-Loop review API service with Optimistic Concurrency Control.
 */
export const patchesApi = {
  async getByStepId(stepId: string): Promise<Patch> {
    const { data } = await apiClient.get<Patch>(`/patches/step/${stepId}`);
    return data;
  },

  async review(patchId: string, action: PatchReviewAction): Promise<Patch> {
    const { data } = await apiClient.post<Patch>(`/patches/${patchId}/review`, action);
    return data;
  },
};
