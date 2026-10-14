import { useQuery } from '@tanstack/react-query';
import { plansApi } from '@/api/plans';

export const planKeys = {
  plan: (jobId: string) => ['plan', jobId] as const,
  findings: (jobId: string) => ['findings', jobId] as const,
};

export function useJobPlanQuery(jobId?: string | null) {
  return useQuery({
    queryKey: planKeys.plan(jobId || ''),
    queryFn: () => plansApi.getByJobId(jobId!),
    enabled: Boolean(jobId),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404 || error?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useJobFindingsQuery(jobId?: string | null) {
  return useQuery({
    queryKey: planKeys.findings(jobId || ''),
    queryFn: () => plansApi.getFindingsByJobId(jobId!),
    enabled: Boolean(jobId),
  });
}
