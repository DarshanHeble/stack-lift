import React from 'react';
import { Button } from '@/components/ui';
import { AIProviderSettings } from './AIProviderSettings';
import { SandboxSecuritySettings } from './SandboxSecuritySettings';
import { ProjectScopeSettings } from './ProjectScopeSettings';
import type { Project } from '@/types/api';
import { ArrowLeft } from 'lucide-react';

interface SettingsViewProps {
  onBack: () => void;
  project?: Project | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack, project = null }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>
          Back
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Project & Platform Settings
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Configure {project ? `settings for ${project.name}, ` : ''}encrypted AI provider credentials, and sandbox quotas.
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-4xl">
        <ProjectScopeSettings project={project} />
        <AIProviderSettings />
        <SandboxSecuritySettings />
      </div>
    </div>
  );
};

