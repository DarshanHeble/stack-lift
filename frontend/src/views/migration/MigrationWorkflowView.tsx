import React from 'react';
import { Button } from '@/components/ui';
import { TaskPipeline } from './TaskPipeline';
import { LiveTerminal } from './LiveTerminal';
import type { MigrationPlan, SSELogEvent, Project } from '@/types/api';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface MigrationWorkflowViewProps {
  plan: MigrationPlan | null;
  logs: SSELogEvent[];
  isStreamConnected: boolean;
  onBack: () => void;
  onExecuteStep?: (stepId: string) => void;
  onReviewDiff?: (stepId: string) => void;
  project?: Project | null;
}

export const MigrationWorkflowView: React.FC<MigrationWorkflowViewProps> = ({
  plan,
  logs,
  isStreamConnected,
  onBack,
  onExecuteStep,
  onReviewDiff,
  project = null,
}) => {
  if (!plan) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="md" icon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>
          Back
        </Button>
        <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-default)] p-12 text-center space-y-3 bg-[var(--surface-card)]">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            {project ? `No Active Migration Plan for ${project.name}` : 'No Active Migration Plan'}
          </h3>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
            {project
              ? `Go to Overview and launch an upgrade goal for ${project.name} to generate a structured modernization plan.`
              : 'Select a project and launch a modernization upgrade to generate a structured, dependency-ordered migration plan.'}
          </p>
        </div>
        <LiveTerminal logs={logs} isConnected={isStreamConnected} />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              {project ? `${project.name} — Migration Workflow` : 'Migration Workflow (Linear Execution)'}
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Complexity: {plan.estimated_complexity} • Approval State: {plan.approval_state}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />}>
            Rerun All
          </Button>
        </div>
      </div>

      {/* Task steps */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Ordered Migration Tasks
        </h2>
        <TaskPipeline
          steps={plan.ordered_steps}
          onExecuteStep={onExecuteStep}
          onReviewDiff={onReviewDiff}
        />
      </div>

      {/* Live execution logs */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Execution Environment Console
        </h2>
        <LiveTerminal logs={logs} isConnected={isStreamConnected} />
      </div>
    </div>
  );
};
