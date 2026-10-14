import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, ScrollArea, Badge } from '@/components/ui';
import type { SSELogEvent } from '@/types/api';
import { Terminal, Activity } from 'lucide-react';

interface LiveTerminalProps {
  logs: SSELogEvent[];
  isConnected: boolean;
}

export const LiveTerminal: React.FC<LiveTerminalProps> = ({ logs, isConnected }) => {
  return (
    <Card className="p-0 overflow-hidden bg-[#0A0E17] border-[var(--border-strong)] text-slate-200">
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-slate-800 bg-[#0F1420]">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[var(--brand-accent)]" />
          <CardTitle className="text-xs font-mono text-slate-200">Sandbox Build Logs (SSE)</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? 'success' : 'neutral'} withDot>
            {isConnected ? 'LIVE STREAM' : 'DISCONNECTED'}
          </Badge>
          <Activity className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64 font-mono text-xs p-3">
          {logs.length === 0 ? (
            <p className="text-slate-500 italic">Waiting for container build execution to begin...</p>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex gap-2 py-0.5 leading-relaxed">
                <span className="text-slate-600 select-none">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-[var(--brand-accent)] font-semibold select-none">
                  [{log.stage}]
                </span>
                <span className={log.level === 'ERROR' ? 'text-rose-400' : 'text-slate-300'}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
