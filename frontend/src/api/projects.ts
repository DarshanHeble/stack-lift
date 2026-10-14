import { apiClient } from './client';
import type { Project, ProjectCreate } from '@/types/api';

/**
 * Projects API service.
 */
export const projectsApi = {
  async list(): Promise<Project[]> {
    const { data } = await apiClient.get<Project[]>('/projects');
    return data;
  },

  async getById(id: string): Promise<Project> {
    const { data } = await apiClient.get<Project>(`/projects/${id}`);
    return data;
  },

  async create(payload: ProjectCreate): Promise<Project> {
    const { data } = await apiClient.post<Project>('/projects', payload);
    return data;
  },

  async uploadZip(projectId: string, file: File): Promise<{ status: string; revision_id: string; commit_sha: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post(`/projects/${projectId}/upload-zip`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async getJobs(projectId: string): Promise<any[]> {
    const { data } = await apiClient.get<any[]>(`/projects/${projectId}/jobs`);
    return data;
  },
};
