import React from 'react';
import { Button, Badge } from '@/components/ui';
import { DiffViewer } from './DiffViewer';
import { RevisionFeedbackPanel } from './RevisionFeedbackPanel';
import type { Patch, Project } from '@/types/api';
import { Check, X, ArrowLeft } from 'lucide-react';

interface CodeReviewViewProps {
  patch: Patch | null;
  onBack: () => void;
  onApprove: (patchId: string, versionId: number) => Promise<void>;
  onReject: (patchId: string, versionId: number) => Promise<void>;
  onRequestRevision: (feedback: string) => Promise<void>;
  project?: Project | null;
}

export const CodeReviewView: React.FC<CodeReviewViewProps> = ({
  patch,
  onBack,
  onApprove,
  onReject,
  onRequestRevision,
  project = null,
}) => {
  if (!patch) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="md" icon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>
          Back to Workflow
        </Button>
        <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-default)] p-12 text-center space-y-3 bg-[var(--surface-card)]">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            {project ? `No Proposed Patch for ${project.name}` : 'No Proposed Patch Available'}
          </h3>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
            Execute a migration task step to generate an OpenRewrite recipe transformation or AI code patch for inspection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with OCC version display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                {project ? `${project.name} — Patch Review` : 'Code Review & Human-in-the-Loop Gate'}
              </h1>
              <Badge variant="warning" withDot>OCC v{patch.version_id}</Badge>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Patch Version {patch.patch_version} • Status: {patch.approval_status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            icon={<X className="h-4 w-4" />}
            onClick={() => onReject(patch.id, patch.version_id)}
          >
            Reject Patch
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Check className="h-4 w-4" />}
            onClick={() => onApprove(patch.id, patch.version_id)}
          >
            Approve & Merge
          </Button>
        </div>
      </div>

      {/* Grid: Diff on Left, Chat on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DiffViewer
            diffContent={patch.diff_content}
            changedFiles={patch.changed_files}
          />
        </div>
        <div>
          <RevisionFeedbackPanel onSubmitFeedback={onRequestRevision} />
        </div>
      </div>
    </div>
  );
};
