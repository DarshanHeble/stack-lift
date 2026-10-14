import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

interface AuditSummaryCardProps {
  jdkUpgrade: string;
  testPassRate: string;
  cvesResolved: number;
  newCvesIntroduced: number;
  dockerSandboxCertified: boolean;
}

export const AuditSummaryCard: React.FC<AuditSummaryCardProps> = ({
  jdkUpgrade,
  testPassRate,
  cvesResolved,
  newCvesIntroduced,
  dockerSandboxCertified,
}) => {
  return (
    <Card className="border-[var(--border-default)] p-5 space-y-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[var(--status-success-dot)]" />
          <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
            Modernization Attestation Certificate
          </CardTitle>
        </div>
        <Badge variant={dockerSandboxCertified ? 'success' : 'warning'} withDot>
          {dockerSandboxCertified ? 'Sandbox Certified' : 'Unverified'}
        </Badge>
      </CardHeader>

      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <div className="space-y-1">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">Runtime Upgrade</span>
          <div className="text-sm font-mono font-bold text-[var(--text-primary)]">{jdkUpgrade}</div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">Test Pass Rate</span>
          <div className="text-sm font-bold text-[var(--status-success-text)] flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {testPassRate}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">CVE Delta</span>
          <div className="text-sm font-bold text-[var(--text-primary)]">
            <span className="text-[var(--status-success-text)]">-{cvesResolved}</span> /{' '}
            <span className={newCvesIntroduced === 0 ? 'text-[var(--status-success-text)]' : 'text-[var(--status-danger-text)]'}>
              +{newCvesIntroduced}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">Hermetic Sandbox</span>
          <div className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-1">
            <Cpu className="h-3.5 w-3.5" />
            JDK 17 + Maven
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
