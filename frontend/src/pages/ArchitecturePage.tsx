import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArchitectureView } from '@/views/architecture/ArchitectureView';
import { useProjectsQuery } from '@/hooks/queries';
import { useUIStore } from '@/store';

export const ArchitecturePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { setSelectedProjectId } = useUIStore();

  const { data: serverProjects } = useProjectsQuery();
  const projects = serverProjects || [];
  const project = projects.find((p) => p.id === projectId) || null;

  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [projectId, setSelectedProjectId]);

  return (
    <ArchitectureView
      project={project}
      onBack={() => navigate(`/projects/${projectId}`)}
    />
  );
};
