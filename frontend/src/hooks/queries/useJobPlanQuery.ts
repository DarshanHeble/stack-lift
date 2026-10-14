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
  });
}

export function useJobFindingsQuery(jobId?: string | null) {
  return useQuery({
    queryKey: planKeys.findings(jobId || ''),
    queryFn: () => plansApi.getFindingsByJobId(jobId!),
    enabled: Boolean(jobId),
  });
}
