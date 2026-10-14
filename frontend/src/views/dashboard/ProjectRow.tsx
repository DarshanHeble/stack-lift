import React from 'react';
import { Card, Badge, Button } from '@/components/ui';
import type { Project } from '@/types/api';
import { Layers, ArrowRight, GitBranch } from 'lucide-react';

interface ProjectRowProps {
  project: Project;
  onSelect: (projectId: string) => void;
}

export const ProjectRow: React.FC<ProjectRowProps> = ({ project, onSelect }) => (
  <Card hoverable className="flex items-center justify-between p-5" onClick={() => onSelect(project.id)}>
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-subtle)] text-[var(--text-primary)] shrink-0">
        <Layers className="h-5 w-5" />
      </div>
      <div>
        <div className="flex items-center gap-2.5">
          <span className="text-base font-semibold text-[var(--text-primary)]">{project.name}</span>
          <Badge variant="neutral">{project.repo_source}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          <span className="flex items-center gap-1.5">
            <GitBranch className="h-3.5 w-3.5" />
            {project.default_branch}
          </span>
          <span>•</span>
          <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <Button variant="ghost" size="md" icon={<ArrowRight className="h-4 w-4" />}>
        Open
      </Button>
    </div>
  </Card>
);
