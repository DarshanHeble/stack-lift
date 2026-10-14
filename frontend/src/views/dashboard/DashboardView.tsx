import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { MetricCard } from './MetricCard';
import { ProjectRow } from './ProjectRow';
import { CreateProjectDialog } from './CreateProjectDialog';
import { DashboardCharts } from './DashboardCharts';
import type { Project, ProjectCreate, Job } from '@/types/api';
import { Plus } from 'lucide-react';

interface DashboardViewProps {
  projects: Project[];
  jobs?: Job[];
  onSelectProject: (id: string) => void;
  onCreateProject: (payload: ProjectCreate, file?: File) => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  jobs = [],
  onSelectProject,
  onCreateProject,
}) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Compute live metrics from real database records
  const activeJobs = jobs.filter(
    (j) => j.status === 'QUEUED' || j.status === 'ANALYZING' || j.status === 'PLANNING' || j.status === 'MODERNIZING' || j.status === 'VALIDATING'
  );
  const awaitingReviewJobs = jobs.filter((j) => j.status === 'AWAITING_REVIEW' as any);
  const validatedJobs = jobs.filter((j) => j.status === 'SUCCEEDED');

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Modernization Dashboard
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1.5">
            Overview of legacy application migrations, automated recipes, and sandbox verifications.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Project
        </Button>
      </div>

      {/* Metrics Row (100% Real Live Database Data) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Projects"
          value={String(projects.length).padStart(2, '0')}
          subtext="Under active management"
          badgeText={projects.length > 0 ? "Active" : "None"}
          badgeVariant={projects.length > 0 ? "success" : "neutral"}
        />
        <MetricCard
          label="Active Jobs"
          value={String(activeJobs.length).padStart(2, '0')}
          subtext="In-flight analysis & runs"
          badgeText={activeJobs.length > 0 ? "Running" : "Idle"}
          badgeVariant={activeJobs.length > 0 ? "progress" : "neutral"}
        />
        <MetricCard
          label="Awaiting Review"
          value={String(awaitingReviewJobs.length).padStart(2, '0')}
          subtext="Human-in-the-loop gates"
          badgeText={awaitingReviewJobs.length > 0 ? "Pending" : "Clear"}
          badgeVariant={awaitingReviewJobs.length > 0 ? "warning" : "neutral"}
        />
        <MetricCard
          label="Validated Jobs"
          value={String(validatedJobs.length).padStart(2, '0')}
          subtext="Hermetic sandbox pass"
          badgeText={validatedJobs.length > 0 ? "Passed" : "None"}
          badgeVariant={validatedJobs.length > 0 ? "success" : "neutral"}
        />
      </div>

      {/* Interactive Analytics & Modernization Graphs */}
      <DashboardCharts totalProjects={projects.length} jobs={jobs} />

      {/* Needs Attention Panel (Actionable Triage) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Needs Your Attention
          </h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border-default)]">
            {awaitingReviewJobs.length} item{awaitingReviewJobs.length === 1 ? '' : 's'}
          </span>
        </div>
        {awaitingReviewJobs.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] p-6 text-center shadow-[var(--shadow-subtle)]">
            <p className="text-sm text-[var(--text-muted)]">All modernization tasks and reviews are clear. No pending items require your attention.</p>
          </div>
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
                Pending Code Review & Diff Approvals ({awaitingReviewJobs.length})
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {awaitingReviewJobs.length} job(s) generated modernization patches and are waiting for your human-in-the-loop inspection.
            </p>
          </div>
        )}
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Recent Projects
        </h2>
        {projects.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-card)] p-12 text-center space-y-3">
            <p className="text-base font-medium text-[var(--text-primary)]">No projects registered yet</p>
            <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
              Import a Java/Maven repository by clicking "New Project" to start automated AST analysis, dependency resolution, and sandboxed migration.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {projects.map((p) => (
              <ProjectRow key={p.id} project={p} onSelect={onSelectProject} />
            ))}
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={onCreateProject}
      />
    </div>
  );
};
