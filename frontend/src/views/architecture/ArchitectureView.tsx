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

      {/* Interactive Node Graph Canvas & Topology Map */}
      <div className="space-y-6">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-canvas)] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Microservice & Reactor Module Topology
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Active service nodes, inter-service gRPC/mTLS contracts, and isolated persistence boundaries.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Modernized (JDK 17)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> In Migration</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Database / Infrastructure</span>
            </div>
          </div>

          {/* Interactive Topology Visual Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            {/* API Gateway */}
            <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--brand-primary)]/40 bg-[var(--surface-card)] space-y-3 relative shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-[var(--brand-primary)]">EDGE GATEWAY</span>
                <Badge variant="success" withDot>Java 17 LTS</Badge>
              </div>
              <h4 className="font-semibold text-sm text-[var(--text-primary)]">spring-cloud-gateway</h4>
              <p className="text-xs text-[var(--text-muted)]">Routing, JWT auth enforcement, and rate limiting</p>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
                <span>Port: 8080</span>
                <span>Framework: Spring Boot 3.2</span>
              </div>
            </div>

            {/* Core Service */}
            <div className="p-4 rounded-[var(--radius-lg)] border border-amber-500/40 bg-[var(--surface-card)] space-y-3 relative shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-amber-500">CORE SERVICE</span>
                <Badge variant="warning" withDot>Migrating (Java 11 → 17)</Badge>
              </div>
              <h4 className="font-semibold text-sm text-[var(--text-primary)]">legacy-order-service</h4>
              <p className="text-xs text-[var(--text-muted)]">Order management domain, R2DBC reactive repository</p>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
                <span>Port: 8081</span>
                <span>Framework: Spring Boot 2.2.5</span>
              </div>
            </div>

            {/* Database Persistence */}
            <div className="p-4 rounded-[var(--radius-lg)] border border-blue-500/40 bg-[var(--surface-card)] space-y-3 relative shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-blue-400">PERSISTENCE</span>
                <Badge variant="purple" withDot>PostgreSQL 16</Badge>
              </div>
              <h4 className="font-semibold text-sm text-[var(--text-primary)]">postgres-r2dbc-cluster</h4>
              <p className="text-xs text-[var(--text-muted)]">Reactive non-blocking PostgreSQL connection pool</p>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
                <span>Port: 5432</span>
                <span>Driver: io.r2dbc:r2dbc-postgresql</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
