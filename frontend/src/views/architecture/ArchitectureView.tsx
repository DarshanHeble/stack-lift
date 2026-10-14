import React from 'react';
import { Button, Badge } from '@/components/ui';
import { ArrowLeft, GitMerge } from 'lucide-react';

import type { Project } from '@/types/api';

interface ArchitectureViewProps {
  onBack: () => void;
  project?: Project | null;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ onBack, project = null }) => {
  const handleExportTopology = () => {
    const topologyData = {
      timestamp: new Date().toISOString(),
      nodes: [
        { id: 'api-gateway', type: 'GATEWAY', framework: 'Spring Cloud Gateway', status: 'MODERN' },
        { id: 'order-service', type: 'SERVICE', framework: 'Spring Boot 2.1.8', status: 'MIGRATING', cves: 5 },
        { id: 'postgres-primary', type: 'DATABASE', framework: 'PostgreSQL 16', status: 'MODERN' },
      ],
      edges: [
        { from: 'api-gateway', to: 'order-service', protocol: 'mTLS / gRPC' },
        { from: 'order-service', to: 'postgres-primary', protocol: 'JDBC' },
      ],
    };
    const blob = new Blob([JSON.stringify(topologyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'architecture-topology.json';
    link.click();
    URL.revokeObjectURL(url);
  };

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
                {project ? `${project.name} — Architecture Graph` : 'Architecture & Module Graph'}
              </h1>
              <Badge variant="purple" withDot>{project ? project.default_branch : 'Topology View'}</Badge>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Service relationships, database boundaries, and framework versions across {project ? project.name : 'reactor modules'}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<GitMerge className="h-3.5 w-3.5" />} onClick={handleExportTopology}>
            Export Topology
          </Button>
        </div>
      </div>

      {/* Interactive Node Graph Canvas */}
      <div className="relative min-h-[460px] rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-canvas)] p-8 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="max-w-md space-y-3">
          <div className="h-12 w-12 rounded-full bg-[var(--surface-subtle)] text-[var(--text-muted)] flex items-center justify-center mx-auto">
            <GitMerge className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No Architecture Topology Available</h3>
          <p className="text-sm text-[var(--text-muted)]">
            Run a modernization job on a registered Java project to parse modules, dependency graphs, and service boundary relationships.
          </p>
        </div>
      </div>
    </div>
  );
};
