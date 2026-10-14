import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MigrationWorkflowView } from '@/views/migration/MigrationWorkflowView';
import { useProjectsQuery, useJobPlanQuery } from '@/hooks/queries';
import { useSSELogs } from '@/hooks/useSSELogs';
import { projectsApi } from '@/api/projects';
import { useUIStore } from '@/store';

export const MigrationPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const {
    activeJobId,
    setSelectedProjectId,
    setActiveJobId,
    setActiveStepId,
  } = useUIStore();

  const { data: serverProjects } = useProjectsQuery();
  const projects = serverProjects || [];
  const project = projects.find((p) => p.id === projectId) || null;

  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
      if (!activeJobId) {
        projectsApi.getJobs(projectId).then((jobs) => {
          if (jobs && jobs.length > 0) {
            const latest = jobs[0];
            setActiveJobId(latest.id);
            setActiveStepId(`${latest.id}-step-1`);
          }
        }).catch(() => {});
      }
    }
  }, [projectId, activeJobId, setSelectedProjectId, setActiveJobId, setActiveStepId]);

  const { data: serverPlan } = useJobPlanQuery(activeJobId);
  const { logs, isConnected: isStreamConnected } = useSSELogs(activeJobId);

  return (
    <MigrationWorkflowView
      plan={serverPlan || null}
      logs={logs}
      isStreamConnected={isStreamConnected}
      project={project}
      onBack={() => navigate(`/projects/${projectId}`)}
      onExecuteStep={(stepId) => {
        setActiveStepId(stepId);
        navigate(`/projects/${projectId}/patches`);
      }}
      onReviewDiff={(stepId) => {
        setActiveStepId(stepId);
        navigate(`/projects/${projectId}/patches`);
      }}
    />
  );
};
