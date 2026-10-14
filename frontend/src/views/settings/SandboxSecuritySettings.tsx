import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Switch, Input, Button } from '@/components/ui';
import { ShieldCheck, Save } from 'lucide-react';

export const SandboxSecuritySettings: React.FC = () => {
  const [networkIsolation, setNetworkIsolation] = useState(true);
  const [cpuLimit, setCpuLimit] = useState('2.0');
  const [memoryLimit, setMemoryLimit] = useState('4096MB');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="border-[var(--border-default)]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[var(--status-success-dot)]" />
          <CardTitle className="text-sm font-semibold">Hardened Docker Sandbox Policies</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--surface-subtle)]">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[var(--text-primary)]">Strict Network Isolation</span>
              <p className="text-[11px] text-[var(--text-muted)]">Disable network access during build and test phases (--network none)</p>
            </div>
            <Switch checked={networkIsolation} onCheckedChange={setNetworkIsolation} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-primary)]">CPU Quota (Cores)</label>
              <Input
                value={cpuLimit}
                onChange={(e) => setCpuLimit(e.target.value)}
                placeholder="2.0"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-primary)]">Max Memory Allocation</label>
              <Input
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(e.target.value)}
                placeholder="4096MB"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm" icon={<Save className="h-3.5 w-3.5" />}>
              {saved ? 'Saved!' : 'Save Sandbox Quotas'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
