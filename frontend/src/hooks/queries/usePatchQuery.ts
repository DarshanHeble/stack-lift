import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patchesApi } from '@/api/patches';
import type { PatchReviewAction } from '@/types/api';

export const patchKeys = {
  byStep: (stepId: string) => ['patch', 'step', stepId] as const,
};

export function usePatchByStepQuery(stepId?: string | null) {
  return useQuery({
    queryKey: patchKeys.byStep(stepId || ''),
    queryFn: () => patchesApi.getByStepId(stepId!),
    enabled: Boolean(stepId),
    retry: (failureCount, error: any) => {
      // Do not retry 404s (e.g., when a pending step doesn't have an generated patch yet)
      if (error?.response?.status === 404 || error?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useReviewPatchMutation(stepId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patchId, action }: { patchId: string; action: PatchReviewAction }) =>
      patchesApi.review(patchId, action),
    onSuccess: () => {
      if (stepId) {
        queryClient.invalidateQueries({ queryKey: patchKeys.byStep(stepId) });
      }
    },
  });
}
