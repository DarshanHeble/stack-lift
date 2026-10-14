import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import type { Finding } from '@/types/api';
import { FileCode, ArrowRight } from 'lucide-react';

interface FindingsListProps {
  findings: Finding[];
  onInspectFinding?: (finding: Finding) => void;
}

export const FindingsList: React.FC<FindingsListProps> = ({ findings, onInspectFinding }) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <Badge variant="danger" withDot>{severity}</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning" withDot>{severity}</Badge>;
      default:
        return <Badge variant="progress">{severity}</Badge>;
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader className="p-5 border-b border-[var(--border-default)]">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Codebase Diagnostics & Evidence
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-[var(--border-subtle)]">
        {findings.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">
            No diagnostic issues found in this repository.
          </div>
        ) : (
          findings.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between p-5 hover:bg-[var(--surface-hover)] transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <FileCode className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="font-mono text-sm font-semibold text-[var(--text-primary)]">
                    {f.file_path}
                  </span>
                  {getSeverityBadge(f.severity)}
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{f.recommendation}</p>
              </div>

              {onInspectFinding && (
                <Button
                  variant="ghost"
                  size="md"
                  icon={<ArrowRight className="h-4 w-4" />}
                  onClick={() => onInspectFinding(f)}
                >
                  Review
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
