import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardView } from '@/views/dashboard/DashboardView';
import { useProjectsQuery, useCreateProjectMutation } from '@/hooks/queries';
import { projectsApi } from '@/api/projects';
import { useUIStore } from '@/store';
import type { ProjectCreate } from '@/types/api';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedProjectId, setActiveJobId, setActiveStepId } = useUIStore();
  const { data: serverProjects } = useProjectsQuery();
  const createProjectMutation = useCreateProjectMutation();

  const projects = serverProjects || [];

  const handleSelectProject = async (projectId: string) => {
    setSelectedProjectId(projectId);
    try {
      const jobs = await projectsApi.getJobs(projectId);
      if (jobs && jobs.length > 0) {
        const latest = jobs[0];
        setActiveJobId(latest.id);
        setActiveStepId(`${latest.id}-step-1`);
      }
    } catch {
      // ignore
    }
    navigate(`/projects/${projectId}`);
  };

  const handleCreateProject = async (payload: ProjectCreate, file?: File) => {
    try {
      const created = await createProjectMutation.mutateAsync(payload);
      if (file) {
        await projectsApi.uploadZip(created.id, file);
      }
      setSelectedProjectId(created.id);
      navigate(`/projects/${created.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  return (
    <DashboardView
      projects={projects}
      onSelectProject={handleSelectProject}
      onCreateProject={handleCreateProject}
    />
  );
};
