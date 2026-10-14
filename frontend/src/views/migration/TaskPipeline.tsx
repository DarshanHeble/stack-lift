import React from 'react';
import { Card, Badge, Button } from '@/components/ui';
import type { MigrationStep } from '@/types/api';
import { CheckCircle2, Clock, Play, Code, AlertCircle } from 'lucide-react';

interface TaskPipelineProps {
  steps: MigrationStep[];
  onExecuteStep?: (stepId: string) => void;
  onReviewDiff?: (stepId: string) => void;
}

export const TaskPipeline: React.FC<TaskPipelineProps> = ({
  steps,
  onExecuteStep,
  onReviewDiff,
}) => {
  const getStepIcon = (status: MigrationStep['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-[var(--status-success-dot)]" />;
      case 'IN_PROGRESS':
        return <Play className="h-4 w-4 text-[var(--brand-accent)] animate-pulse" />;
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-[var(--status-danger-dot)]" />;
      default:
        return <Clock className="h-4 w-4 text-[var(--text-muted)]" />;
    }
  };

  const getStepBadge = (status: MigrationStep['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success" withDot>Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="progress" withDot>Running</Badge>;
      case 'FAILED':
        return <Badge variant="danger" withDot>Failed</Badge>;
      default:
        return <Badge variant="neutral">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <Card key={step.id} hoverable className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-subtle)]">
              {getStepIcon(step.status)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  Step {step.order}: {step.title}
                </span>
                {getStepBadge(step.status)}
                <Badge variant="purple">{step.strategy}</Badge>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{step.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step.status === 'COMPLETED' && onReviewDiff && (
              <Button
                variant="outline"
                size="sm"
                icon={<Code className="h-3.5 w-3.5" />}
                onClick={() => onReviewDiff(step.id)}
              >
                Inspect Diff
              </Button>
            )}
            {step.status === 'PENDING' && onExecuteStep && (
              <Button
                variant="primary"
                size="sm"
                icon={<Play className="h-3.5 w-3.5" />}
                onClick={() => onExecuteStep(step.id)}
              >
                Run
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
