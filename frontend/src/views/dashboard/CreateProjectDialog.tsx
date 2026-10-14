import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
} from '@/components/ui';
import type { ProjectCreate } from '@/types/api';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ProjectCreate, file?: File) => Promise<void>;
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [modernizationGoal, setModernizationGoal] = useState('UPGRADE_JAVA_17');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setStep(1);
    setName('');
    setDescription('');
    setRepoUrl('');
    setBranch('main');
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        repo_url: repoUrl.trim() || undefined,
        repo_source: selectedFile ? 'ZIP_UPLOAD' : repoUrl.trim() ? 'GIT_HTTPS' : 'ZIP_UPLOAD',
        default_branch: branch,
      }, selectedFile || undefined);
      handleReset();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) handleReset(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between pb-1">
            <DialogTitle>New Modernization Project</DialogTitle>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[var(--surface-subtle)] text-[var(--text-muted)]">
              Step {step} of 3
            </span>
          </div>
          <DialogDescription>
            {step === 1 && 'Import repository source code via ZIP archive upload or remote Git repository.'}
            {step === 2 && 'Configure target branch, detected build system, and modernization goals.'}
            {step === 3 && 'Review project scope, hermetic sandbox isolation notice, and launch analysis.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator breadcrumbs */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 pt-1">
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 1 ? 'bg-[var(--brand-primary)] text-[var(--text-inverse)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'}`}>
              1
            </span>
            <span className="text-xs font-medium text-[var(--text-primary)]">Source</span>
          </div>
          <div className="h-0.5 w-12 bg-[var(--border-subtle)]" />
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 2 ? 'bg-[var(--brand-primary)] text-[var(--text-inverse)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'}`}>
              2
            </span>
            <span className="text-xs font-medium text-[var(--text-primary)]">Configure</span>
          </div>
          <div className="h-0.5 w-12 bg-[var(--border-subtle)]" />
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 3 ? 'bg-[var(--brand-primary)] text-[var(--text-inverse)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'}`}>
              3
            </span>
            <span className="text-xs font-medium text-[var(--text-primary)]">Review</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* STEP 1: IMPORT SOURCE */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Project Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. order-service-legacy"
                  required
                />
              </div>

              {/* ZIP Archive Drag & Drop Zone */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Upload Project ZIP (Recommended for Local Repos)</label>
                <div
                  className={`border-2 border-dashed rounded-[var(--radius-md)] p-5 text-center cursor-pointer transition-colors ${
                    selectedFile ? 'border-[var(--brand-accent)] bg-[var(--surface-subtle)]' : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
                  }`}
                  onClick={() => document.getElementById('zip-file-input')?.click()}
                >
                  <input
                    id="zip-file-input"
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                        if (!name) setName(e.target.files[0].name.replace('.zip', ''));
                      }
                    }}
                  />
                  <span className="text-sm text-[var(--text-secondary)]">
                    {selectedFile ? (
                      <strong className="text-[var(--brand-accent)]">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</strong>
                    ) : (
                      'Click to select or drag & drop a .zip archive'
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Or Remote Git Repository URL</label>
                <Input
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/enterprise-org/repo.git"
                  disabled={Boolean(selectedFile)}
                />
              </div>
            </div>
          )}

          {/* STEP 2: CONFIGURE ANALYSIS */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Target Branch</label>
                  <Input
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Detected Toolchain</label>
                  <div className="h-10 px-3 flex items-center rounded-[var(--radius-md)] bg-[var(--surface-subtle)] border border-[var(--border-default)] text-xs font-mono text-[var(--text-secondary)]">
                    Java · Apache Maven (Auto)
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Primary Modernization Goal</label>
                <select
                  value={modernizationGoal}
                  onChange={(e) => setModernizationGoal(e.target.value)}
                  className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--surface-card)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
                >
                  <option value="UPGRADE_JAVA_17">Upgrade Java 8/11 to Java 17 LTS</option>
                  <option value="SPRING_BOOT_3">Migrate Spring Boot 2.x to 3.x (Jakarta EE)</option>
                  <option value="REMEDIATE_CVES">Remediate High & Critical Dependency CVEs</option>
                  <option value="FULL_MODERNIZATION">Full Modernization: Java 17 + Spring 3 + OpenRewrite</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Description / Architecture Notes</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Core monolithic API with legacy servlet dependencies"
                />
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW AND START */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Repository:</span>
                  <span className="font-semibold text-[var(--text-primary)]">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Source:</span>
                  <span className="font-mono text-[var(--text-primary)]">{selectedFile ? `ZIP (${selectedFile.name})` : repoUrl || 'Local Workspace'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Target Goal:</span>
                  <span className="font-medium text-[var(--brand-accent)]">{modernizationGoal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Branch:</span>
                  <span className="font-mono text-[var(--text-primary)]">{branch}</span>
                </div>
              </div>

              <div className="p-3 rounded-[var(--radius-md)] bg-[rgba(129,140,248,0.1)] border border-[var(--brand-accent)] text-xs text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)]">Hermetic Execution Guarantee:</strong> Analysis and builds run in isolated Docker sandboxes with CPU/memory caps and strictly restricted network access.
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between pt-2">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep((s) => (s - 1) as 1 | 2)}>
                Back
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            )}

            {step < 3 ? (
              <Button
                type="button"
                variant="primary"
                disabled={!name.trim()}
                onClick={() => setStep((s) => (s + 1) as 2 | 3)}
              >
                Next Step
              </Button>
            ) : (
              <Button type="submit" variant="primary" disabled={loading || !name.trim()}>
                {loading ? 'Launching...' : 'Confirm & Launch Analysis'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
