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
