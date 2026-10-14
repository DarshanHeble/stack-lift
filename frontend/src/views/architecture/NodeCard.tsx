import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { Database, Server, Cpu, Globe } from 'lucide-react';

interface NodeCardProps {
  title: string;
  type: 'GATEWAY' | 'SERVICE' | 'DATABASE' | 'BROKER';
  framework: string;
  cves: number;
  status: 'OUTDATED' | 'MIGRATING' | 'MODERN';
  latency?: string;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  title,
  type,
  framework,
  cves,
  status,
  latency,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'DATABASE':
        return <Database className="h-4 w-4 text-[var(--brand-accent)]" />;
      case 'GATEWAY':
        return <Globe className="h-4 w-4 text-[var(--status-progress-dot)]" />;
      case 'BROKER':
        return <Cpu className="h-4 w-4 text-[var(--status-purple-dot)]" />;
      default:
        return <Server className="h-4 w-4 text-[var(--text-primary)]" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'MODERN':
        return <Badge variant="success" withDot>JDK 17</Badge>;
      case 'MIGRATING':
        return <Badge variant="progress" withDot>Upgrading</Badge>;
      default:
        return <Badge variant="danger" withDot>JDK 8 (EOL)</Badge>;
    }
  };

  return (
    <Card hoverable className="w-64 border-[var(--border-strong)] shadow-[var(--shadow-dropdown)] space-y-3">
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          {getIcon()}
          <CardTitle className="text-xs font-mono">{title}</CardTitle>
        </div>
        {getStatusBadge()}
      </CardHeader>
      <CardContent className="space-y-1.5 text-xs text-[var(--text-secondary)]">
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)]">Framework:</span>
          <span className="font-semibold text-[var(--text-primary)]">{framework}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)]">Active CVEs:</span>
          <span className={cves > 0 ? 'text-[var(--status-danger-text)] font-bold' : 'text-[var(--status-success-text)]'}>
            {cves}
          </span>
        </div>
        {latency && (
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Avg Latency:</span>
            <span className="font-mono text-[11px]">{latency}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
