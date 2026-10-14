import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsView } from '@/views/settings/SettingsView';
import { useProjectsQuery } from '@/hooks/queries';
import { useUIStore } from '@/store';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedProjectId } = useUIStore();
  const { data: serverProjects } = useProjectsQuery();
  const projects = serverProjects || [];
  const project = projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  return (
    <SettingsView
      project={project}
      onBack={() => navigate(-1)}
    />
  );
};
