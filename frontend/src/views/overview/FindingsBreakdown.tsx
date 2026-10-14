import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import type { Finding } from '@/types/api';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';

interface FindingsBreakdownProps {
  findings: Finding[];
}

export const FindingsBreakdown: React.FC<FindingsBreakdownProps> = ({ findings }) => {
  const cveCount = findings.filter((f) => f.category === 'CVE_VULNERABILITY').length;
  const breakingCount = findings.filter((f) => f.category === 'BREAKING_FRAMEWORK_CHANGE').length;
  const deprecatedCount = findings.filter((f) => f.category === 'DEPRECATED_API' || f.category === 'DEPRECATED_DEPENDENCY').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card hoverable className="border-l-4 border-l-[var(--status-danger-border)] p-5">
        <CardHeader className="flex flex-row items-center justify-between pb-2 p-0">
          <CardTitle className="text-sm font-semibold text-[var(--status-danger-text)]">CVE Vulnerabilities</CardTitle>
          <ShieldAlert className="h-5 w-5 text-[var(--status-danger-dot)]" />
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="text-3xl font-bold text-[var(--text-primary)]">{cveCount}</div>
          <p className="text-sm text-[var(--text-muted)] mt-1.5">Direct and transitive dependency CVEs</p>
        </CardContent>
      </Card>

      <Card hoverable className="border-l-4 border-l-[var(--status-warning-border)] p-5">
        <CardHeader className="flex flex-row items-center justify-between pb-2 p-0">
          <CardTitle className="text-sm font-semibold text-[var(--status-warning-text)]">Breaking API Changes</CardTitle>
          <AlertTriangle className="h-5 w-5 text-[var(--status-warning-accent)]" />
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="text-3xl font-bold text-[var(--text-primary)]">{breakingCount}</div>
          <p className="text-sm text-[var(--text-muted)] mt-1.5">Namespace migrations (javax → jakarta)</p>
        </CardContent>
      </Card>

      <Card hoverable className="border-l-4 border-l-[var(--status-progress-border)] p-5">
        <CardHeader className="flex flex-row items-center justify-between pb-2 p-0">
          <CardTitle className="text-sm font-semibold text-[var(--status-progress-text)]">Deprecated APIs</CardTitle>
          <Info className="h-5 w-5 text-[var(--status-progress-dot)]" />
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="text-3xl font-bold text-[var(--text-primary)]">{deprecatedCount}</div>
          <p className="text-sm text-[var(--text-muted)] mt-1.5">Methods flagged for removal in JDK 17+</p>
        </CardContent>
      </Card>
    </div>
  );
};
