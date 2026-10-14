import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CodeReviewView } from '@/views/review/CodeReviewView';
import {
  useProjectsQuery,
  usePatchByStepQuery,
  useReviewPatchMutation,
} from '@/hooks/queries';
import { projectsApi } from '@/api/projects';
import { useUIStore } from '@/store';
import type { Patch } from '@/types/api';

export const PatchReviewPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const {
    activeJobId,
    activeStepId,
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

  const { data: serverPatch } = usePatchByStepQuery(activeStepId);
  const reviewPatchMutation = useReviewPatchMutation(activeStepId);
  const [localPatch, setLocalPatch] = useState<Patch | null>(null);

  const patch = serverPatch || localPatch;

  const handleApprove = async (patchId: string, versionId: number) => {
    try {
      await reviewPatchMutation.mutateAsync({
        patchId,
        action: { action: 'APPROVE', version_id: versionId },
      });
    } catch {
      setLocalPatch((prev) => (prev ? {
        ...prev,
        approval_status: 'APPROVED',
        version_id: versionId + 1,
      } : null));
    }
    navigate(`/projects/${projectId}/plan`);
  };

  const handleReject = async (patchId: string, versionId: number) => {
    try {
      await reviewPatchMutation.mutateAsync({
        patchId,
        action: { action: 'REJECT', version_id: versionId },
      });
    } catch {
      setLocalPatch((prev) => (prev ? {
        ...prev,
        approval_status: 'REJECTED',
        version_id: versionId + 1,
      } : null));
    }
    navigate(`/projects/${projectId}/plan`);
  };

  const handleRequestRevision = async (feedback: string) => {
    if (!patch) return;
    try {
      await reviewPatchMutation.mutateAsync({
        patchId: patch.id,
        action: { action: 'REVISION_REQUESTED', version_id: patch.version_id, feedback },
      });
    } catch {
      setLocalPatch((prev) => (prev ? {
        ...prev,
        approval_status: 'REVISION_REQUESTED',
        revision_feedback: feedback,
        version_id: prev.version_id + 1,
      } : null));
    }
  };

  return (
    <CodeReviewView
      patch={patch}
      project={project}
      onBack={() => navigate(`/projects/${projectId}/plan`)}
      onApprove={handleApprove}
      onReject={handleReject}
      onRequestRevision={handleRequestRevision}
    />
  );
};
