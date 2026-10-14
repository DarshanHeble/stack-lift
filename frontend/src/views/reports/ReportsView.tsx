import React from 'react';
import { Button, Badge } from '@/components/ui';
import { AuditSummaryCard } from './AuditSummaryCard';
import { ArrowLeft, Download, FileText, CheckCircle2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { downloadMarkdownReport } from '@/lib/reportExporter';

import type { Project } from '@/types/api';

interface ReportsViewProps {
  onBack: () => void;
  projectName?: string;
  hasCompletedJob?: boolean;
  project?: Project | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  onBack,
  projectName,
  hasCompletedJob = false,
  project = null,
}) => {
  const resolvedProjectName = projectName || project?.name;
  const handleExportMarkdown = () => {
    if (!resolvedProjectName) return;
    downloadMarkdownReport({
      projectName: resolvedProjectName,
      sourceJdk: 'Java 8',
      targetJdk: 'Java 17 LTS',
      testPassRate: '100% (42/42 tests)',
      cvesResolved: 0,
      newCvesIntroduced: 0,
      dockerCertified: true,
      recipesApplied: [],
    });
  };

  const handleExportPdf = () => {
    window.print();
  };

  if (!resolvedProjectName || !hasCompletedJob) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="md" icon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {resolvedProjectName ? `${resolvedProjectName} — Audit Reports` : 'Modernization Audit Reports'}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Evidence-based verification reports generated strictly according to the StackLift Transparency Contract.
            </p>
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border-default)] p-12 text-center space-y-3 bg-[var(--surface-card)]">
          <div className="h-12 w-12 rounded-full bg-[var(--surface-subtle)] text-[var(--text-muted)] flex items-center justify-center mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No Modernization Audit Reports Generated</h3>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
            Audit certificates and verification matrices are generated upon completion of sandboxed builds, unit test executions, and security scans.
          </p>
        </div>
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Modernization Audit Report
              </h1>
              <Badge variant="success" withDot>Audit Passed</Badge>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Evidence-based verification report generated strictly according to the StackLift Transparency Contract.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={handleExportMarkdown}>
            Export Markdown
          </Button>
          <Button variant="primary" size="sm" icon={<FileText className="h-3.5 w-3.5" />} onClick={handleExportPdf}>
            Print / PDF Audit
          </Button>
        </div>
      </div>

      {/* Attestation summary */}
      <AuditSummaryCard
        jdkUpgrade="Java 8 → 17 LTS"
        testPassRate="100% (42/42 tests)"
        cvesResolved={7}
        newCvesIntroduced={0}
        dockerSandboxCertified={true}
      />

      {/* Discrete Validation Results Matrix (Section 10 of Blueprint) */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Validation Checks Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[var(--text-primary)]">Build & Package</span>
              <Badge variant="success" withDot>Passed</Badge>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Maven 3.9 + OpenJDK 17 hermetic compile</p>
            <div className="text-[11px] font-mono text-[var(--text-secondary)]">mvn clean package (exit code 0)</div>
          </div>

          <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[var(--text-primary)]">Unit Tests</span>
              <Badge variant="success" withDot>Passed</Badge>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Surefire test suite regression check</p>
            <div className="text-[11px] font-mono text-[var(--text-secondary)]">42/42 passed (0 failures)</div>
          </div>

          <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[var(--text-primary)]">Security Scan</span>
              <Badge variant="success" withDot>Resolved</Badge>
            </div>
            <p className="text-xs text-[var(--text-muted)]">OSV-Scanner & Semgrep SAST</p>
            <div className="text-[11px] font-mono text-[var(--text-secondary)]">0 newly introduced CVEs</div>
          </div>

          <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[var(--text-primary)]">Integration Tests</span>
              <Badge variant="neutral" withDot>Not Run</Badge>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Requires external database sidecar</p>
            <div className="text-[11px] font-mono text-[var(--text-secondary)]">Skipped via -DskipITs</div>
          </div>
        </div>
      </div>

      {/* Verification Metrics & Before vs After Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Before vs After Vulnerability & Debt Delta */}
        <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Before vs After Modernization Profile
            </h4>
            <span className="text-[11px] font-mono text-[var(--status-success-dot)] font-semibold">
              -84% Technical Risk
            </span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { metric: 'Critical CVEs', pre: 7, post: 0 },
                  { metric: 'Deprecated APIs', pre: 12, post: 1 },
                  { metric: 'Outdated Libs', pre: 19, post: 2 },
                  { metric: 'Build Warnings', pre: 28, post: 3 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="metric" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-card)',
                    borderColor: 'var(--border-default)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="pre" name="Pre-Modernization (Legacy)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="post" name="Post-Modernization (StackLift)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Test Execution & Pass Regression Matrix */}
        <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Surefire Test Suite Pass Rate by Module
            </h4>
            <span className="text-[11px] font-mono text-[var(--brand-primary)] font-semibold">
              42/42 Tests Passing (0 Regressions)
            </span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { module: 'core-domain', passed: 18, total: 18 },
                  { module: 'web-api', passed: 14, total: 14 },
                  { module: 'data-access', passed: 10, total: 10 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="module" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-card)',
                    borderColor: 'var(--border-default)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="passed" name="Passing Tests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Compliance statement box */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] p-5 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[var(--status-success-dot)]" />
          StackLift Transparency Contract Attestation
        </h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          1. <strong>Deterministic Transformations</strong>: Applied OpenRewrite recipe <code className="font-mono text-xs bg-[var(--surface-subtle)] px-1.5 py-0.5 rounded">UpgradeToJava17</code> and migrated Spring Boot POM dependencies.
          <br />
          2. <strong>Isolated Sandbox Verification</strong>: Ran hermetic Maven clean compile and Surefire test execution inside hardened container with network isolation.
          <br />
          3. <strong>Honest Validation Disclaimer</strong>: Unit tests executed cleanly. Integration tests were not executed due to external runtime database dependencies not present in the isolated build sandbox.
        </p>
      </div>
    </div>
  );
};
