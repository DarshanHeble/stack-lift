import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '@/api/jobs';
import type { JobCreate } from '@/types/api';

export const jobKeys = {
  detail: (jobId: string) => ['job', jobId] as const,
};

export function useJobQuery(jobId?: string | null) {
  return useQuery({
    queryKey: jobKeys.detail(jobId || ''),
    queryFn: () => jobsApi.getById(jobId!),
    enabled: Boolean(jobId),
  });
}

export function useCreateJobMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JobCreate) => jobsApi.create(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(jobKeys.detail(data.id), data);
    },
  });
}
