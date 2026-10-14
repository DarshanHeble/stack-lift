import React from 'react';
import { Button, Badge } from '@/components/ui';
import { FindingsBreakdown } from './FindingsBreakdown';
import { FindingsList } from './FindingsList';
import type { Project, Finding } from '@/types/api';
import { Play, ArrowLeft } from 'lucide-react';

interface ProjectOverviewViewProps {
  project: Project | null;
  findings: Finding[];
  onBack: () => void;
  onStartMigration: (goal: string) => void;
}

export const ProjectOverviewView: React.FC<ProjectOverviewViewProps> = ({
  project,
  findings,
  onBack,
  onStartMigration,
}) => {
  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="md" icon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>
          Back to Overview
        </Button>
        <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-default)] p-12 text-center space-y-3 bg-[var(--surface-card)]">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No Project Selected</h3>
          <p className="text-sm text-[var(--text-muted)]">Select or register a project from the dashboard to inspect its diagnostics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="md" icon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                {project.name}
              </h1>
              <Badge variant="progress" withDot>Ready for Upgrade</Badge>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Default branch: <span className="font-mono">{project.default_branch}</span> • Source: {project.repo_source}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            icon={<Play className="h-4 w-4" />}
            onClick={() => onStartMigration('UPGRADE_JAVA_17')}
          >
            Launch Upgrade to JDK 17
          </Button>
        </div>
      </div>

      {/* Diagnostics summary cards */}
      <FindingsBreakdown findings={findings} />

      {/* Findings list */}
      <FindingsList findings={findings} />
    </div>
  );
};
