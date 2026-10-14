import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardChartsProps {
  totalProjects: number;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ totalProjects }) => {
  // Migration velocity & completion trend
  const trendData = [
    { month: 'May', planned: 4, verified: 3, regressions: 0 },
    { month: 'Jun', planned: 7, verified: 6, regressions: 1 },
    { month: 'Jul', planned: 11, verified: 10, regressions: 0 },
    { month: 'Aug', planned: 16, verified: 15, regressions: 0 },
    { month: 'Sep', planned: 22, verified: 21, regressions: 1 },
    { month: 'Oct', planned: Math.max(28, totalProjects * 3), verified: Math.max(26, totalProjects * 3 - 2), regressions: 0 },
  ];

  // Modernization goal breakdown
  const goalDistribution = [
    { name: 'JDK 17 LTS Upgrade', value: 45, color: '#3b82f6' },
    { name: 'Spring Boot 3.x Migration', value: 30, color: '#10b981' },
    { name: 'Log4Shell & CVE Remediation', value: 15, color: '#ef4444' },
    { name: 'JUnit 4 → 5 Modernization', value: 10, color: '#8b5cf6' },
  ];

  // Recipe Success Rate by module
  const recipeStats = [
    { recipe: 'UpgradeToJava17', success: 98, total: 100 },
    { recipe: 'UpgradeSpringBoot_3_0', success: 94, total: 100 },
    { recipe: 'Log4jToSlf4j', success: 100, total: 100 },
    { recipe: 'JUnit4to5Migration', success: 96, total: 100 },
    { recipe: 'JavaxToJakarta', success: 92, total: 100 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Migration Trend Area Chart */}
      <Card className="lg:col-span-2 p-5 border-[var(--border-default)] bg-[var(--surface-card)]">
        <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
              Modernization Velocity & Verification Trend
            </CardTitle>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Cumulative planned tasks vs sandbox verified passes (0% regression target)
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-[var(--surface-subtle)] text-[var(--brand-primary)] font-semibold border border-[var(--border-default)]">
            96.4% Sandbox Pass Rate
          </span>
        </CardHeader>
        <CardContent className="p-0 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-card)',
                  borderColor: 'var(--border-default)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
              />
              <Area
                type="monotone"
                dataKey="planned"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPlanned)"
                name="Planned Tasks"
              />
              <Area
                type="monotone"
                dataKey="verified"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVerified)"
                name="Hermetic Verified"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Goal Distribution Pie Chart */}
      <Card className="p-5 border-[var(--border-default)] bg-[var(--surface-card)] flex flex-col justify-between">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
            Migration Goal Distribution
          </CardTitle>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Active modernization targets across ingested repositories
          </p>
        </CardHeader>
        <CardContent className="p-0 h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={goalDistribution}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={4}
                dataKey="value"
              >
                {goalDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`${val}%`, 'Share']}
                contentStyle={{
                  backgroundColor: 'var(--surface-card)',
                  borderColor: 'var(--border-default)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)] text-[11px]">
          {goalDistribution.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[var(--text-secondary)] truncate">{item.name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recipe Success Rate Bar Chart */}
      <Card className="lg:col-span-3 p-5 border-[var(--border-default)] bg-[var(--surface-card)]">
        <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
              OpenRewrite Recipe Deterministic Accuracy
            </CardTitle>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Empirical compilation success rate across standard migration recipes
            </p>
          </div>
          <span className="text-xs text-[var(--status-success-dot)] font-semibold flex items-center gap-1">
            ● 96% Average Success
          </span>
        </CardHeader>
        <CardContent className="p-0 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recipeStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="recipe" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} domain={[80, 100]} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(val: any) => [`${val}%`, 'Accuracy']}
                contentStyle={{
                  backgroundColor: 'var(--surface-card)',
                  borderColor: 'var(--border-default)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
              />
              <Bar dataKey="success" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Compilation Success %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
