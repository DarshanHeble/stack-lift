import { useEffect, useState, useCallback, useRef } from 'react';
import type { SSELogEvent } from '@/types/api';

interface UseSSELogsOptions {
  autoConnect?: boolean;
  maxLogs?: number;
}

/**
 * Enterprise React hook for real-time Server-Sent Events (SSE) log streaming.
 */
export function useSSELogs(jobId?: string | null, options: UseSSELogsOptions = {}) {
  const { autoConnect = true, maxLogs = 500 } = options;
  const [logs, setLogs] = useState<SSELogEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const connect = useCallback(() => {
    if (!jobId) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `/api/v1/jobs/${jobId}/stream`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as SSELogEvent;
        setLogs((prev) => {
          const next = [...prev, parsed];
          return next.length > maxLogs ? next.slice(next.length - maxLogs) : next;
        });
      } catch {
        // Raw text line fallback
        const fallbackEvent: SSELogEvent = {
          job_id: jobId,
          timestamp: new Date().toISOString(),
          level: 'INFO',
          stage: 'RUNNER',
          message: event.data,
        };
        setLogs((prev) => [...prev, fallbackEvent]);
      }
    };

    es.onerror = () => {
      setIsConnected(false);
      setError('Log stream disconnected');
      es.close();
    };
  }, [jobId, maxLogs]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (autoConnect && jobId) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, jobId, connect, disconnect]);

  return {
    logs,
    isConnected,
    error,
    clearLogs,
    connect,
    disconnect,
  };
}
