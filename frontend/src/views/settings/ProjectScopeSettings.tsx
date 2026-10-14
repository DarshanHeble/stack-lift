import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Input, Badge, Button } from '@/components/ui';
import type { Project } from '@/types/api';
import { FolderGit2, GitBranch, Shield, Save } from 'lucide-react';

interface ProjectScopeSettingsProps {
  project: Project | null;
}

export const ProjectScopeSettings: React.FC<ProjectScopeSettingsProps> = ({ project }) => {
  const [targetJava, setTargetJava] = React.useState('17');
  const [targetFramework, setTargetFramework] = React.useState('SPRING_BOOT_3');
  const [saved, setSaved] = React.useState(false);

  if (!project) {
    return (
      <Card className="border-[var(--border-default)]">
        <CardContent className="p-6 text-center text-xs text-[var(--text-muted)]">
          No project selected. Select a project from the header to configure project-specific modernization goals.
        </CardContent>
      </Card>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="border-[var(--border-default)]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-4 w-4 text-[var(--brand-primary)]" />
          <CardTitle className="text-sm font-semibold">Active Project Configuration</CardTitle>
        </div>
        <Badge variant="progress" withDot>{project.name}</Badge>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-primary)]">Project Repository</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--surface-subtle)] border border-[var(--border-default)] text-xs font-mono text-[var(--text-secondary)]">
                <GitBranch className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                <span className="truncate">{project.repo_url || project.name}</span>
                <span className="ml-auto text-[10px] text-[var(--text-muted)]">{project.default_branch}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-primary)]">Target Language & Runtime</label>
              <div className="flex items-center gap-2">
                <Input
                  value={targetJava}
                  onChange={(e) => setTargetJava(e.target.value)}
                  placeholder="e.g. 17 or 21"
                />
                <span className="text-xs text-[var(--text-muted)] shrink-0">LTS (Temurin/OpenJDK)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-primary)]">Target Modernization Framework</label>
              <Input
                value={targetFramework}
                onChange={(e) => setTargetFramework(e.target.value)}
                placeholder="e.g. SPRING_BOOT_3"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-primary)]">Recipe Catalog</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--surface-subtle)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)]">
                <Shield className="h-3.5 w-3.5 text-[var(--status-success-dot)] shrink-0" />
                <span>OpenRewrite Spring Boot 3.0 + JUnit 5 Migration</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm" icon={<Save className="h-3.5 w-3.5" />}>
              {saved ? 'Saved!' : 'Save Project Settings'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
