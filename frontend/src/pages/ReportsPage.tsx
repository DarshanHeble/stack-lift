import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReportsView } from '@/views/reports/ReportsView';
import { useProjectsQuery, useJobFindingsQuery, useJobPlanQuery } from '@/hooks/queries';
import { useUIStore } from '@/store';

export const ReportsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { activeJobId, setSelectedProjectId } = useUIStore();

  const { data: serverProjects } = useProjectsQuery();
  const projects = serverProjects || [];
  const project = projects.find((p) => p.id === projectId) || null;

  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [projectId, setSelectedProjectId]);

  const { data: serverFindings } = useJobFindingsQuery(activeJobId);
  const { data: serverPlan } = useJobPlanQuery(activeJobId);

  return (
    <ReportsView
      project={project}
      projectName={project?.name}
      findings={serverFindings || []}
      plan={serverPlan || null}
      hasCompletedJob={Boolean(activeJobId)}
      onBack={() => navigate(`/projects/${projectId}`)}
    />
  );
};
