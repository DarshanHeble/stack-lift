import React from 'react';
import { Card, CardHeader, CardContent, Badge, Progress } from '@/components/ui';

interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
  badgeText: string;
  badgeVariant?: 'success' | 'progress' | 'purple' | 'warning' | 'danger' | 'neutral';
  progressValue?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  badgeText,
  badgeVariant = 'success',
  progressValue,
}) => (
  <Card hoverable className="flex flex-col justify-between p-5">
    <CardHeader className="flex flex-row items-center justify-between pb-3 p-0">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </span>
      <Badge variant={badgeVariant} withDot>
        {badgeText}
      </Badge>
    </CardHeader>
    <CardContent className="space-y-2 p-0 pt-2">
      <div className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
        {value}
      </div>
      <p className="text-sm text-[var(--text-muted)]">{subtext}</p>
      {progressValue !== undefined && (
        <Progress value={progressValue} className="h-2 mt-3" />
      )}
    </CardContent>
  </Card>
);
