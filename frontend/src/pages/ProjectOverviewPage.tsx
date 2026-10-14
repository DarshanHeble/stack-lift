import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectOverviewView } from '@/views/overview/ProjectOverviewView';
import { useProjectsQuery, useJobFindingsQuery, useCreateJobMutation } from '@/hooks/queries';
import { projectsApi } from '@/api/projects';
import { useUIStore } from '@/store';

export const ProjectOverviewPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const {
    activeJobId,
    setSelectedProjectId,
    setActiveJobId,
    setActiveStepId,
  } = useUIStore();

  const { data: serverProjects } = useProjectsQuery();
  const createJobMutation = useCreateJobMutation();

  const projects = serverProjects || [];
  const project = projects.find((p) => p.id === projectId) || null;

  // Sync selectedProjectId when entering by URL
  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
      projectsApi.getJobs(projectId).then((jobs) => {
        if (jobs && jobs.length > 0) {
          const latest = jobs[0];
          setActiveJobId(latest.id);
          setActiveStepId(`${latest.id}-step-1`);
        }
      }).catch(() => {});
    }
  }, [projectId, setSelectedProjectId, setActiveJobId, setActiveStepId]);

  const { data: serverFindings } = useJobFindingsQuery(activeJobId);
  const findings = serverFindings || [];

  const handleStartMigration = async (goal: string) => {
    if (!project) return;
    try {
      const createdJob = await createJobMutation.mutateAsync({
        project_id: project.id,
        requested_goal: goal,
      });
      setActiveJobId(createdJob.id);
      setActiveStepId(`${createdJob.id}-step-1`);
    } catch {
      setActiveJobId(`job-${Date.now()}`);
    }
    navigate(`/projects/${project.id}/plan`);
  };

  return (
    <ProjectOverviewView
      project={project}
      findings={findings}
      onBack={() => navigate('/')}
      onStartMigration={handleStartMigration}
    />
  );
};
