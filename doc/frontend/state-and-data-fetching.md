# Frontend State Management & Data Fetching

## 1. State Management Strategy

StackLift minimizes client-side global state by adopting **server-state caching via TanStack Query (React Query)** combined with local UI state.

---

## 2. Real-Time Log Streaming via Server-Sent Events

For sandboxed builds and long-running analysis, the client hooks into an SSE endpoint:

```typescript
// src/hooks/useJobStream.ts
export function useJobStream(jobId: string) {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('QUEUED');
  const [stage, setStage] = useState<string>('Initializing');

  useEffect(() => {
    if (!jobId) return;

    const eventSource = new EventSource(`/api/v1/jobs/${jobId}/stream`);

    eventSource.addEventListener('log', (event) => {
      const data = JSON.parse(event.data);
      setLogs((prev) => [...prev, data.message]);
    });

    eventSource.addEventListener('stage_change', (event) => {
      const data = JSON.parse(event.data);
      setStage(data.stage);
      setStatus(data.status);
    });

    eventSource.addEventListener('job_completed', () => {
      eventSource.close();
    });

    return () => { eventSource.close(); };
  }, [jobId]);

  return { logs, status, stage };
}
```

### 2.1. SSE Desync Reconciliation
Because SSE connections can drop due to network instability, the frontend must implement a reconciliation hook:
- **On Reconnect**: When the `EventSource` connection drops and automatically reconnects, the frontend must immediately fire a REST API `GET /api/v1/jobs/{jobId}` to fetch the current state.
- **Why**: This prevents a scenario where a state transition (e.g., `VALIDATING` -> `STEP_PASSED`) occurred on the backend while the SSE connection was dropped, leaving the frontend permanently stuck in `VALIDATING`.

---

## 3. Query Invalidation Rules

- On project upload → invalidate `['projects']`.
- On step patch approval → invalidate `['steps', jobId]` and trigger `['validation', patchId]`.
- On patch revision request → invalidate `['patches', stepId]` to reload the latest `patch_version`.
- On job completion → invalidate `['jobs', jobId]` and prefetch `['reports', jobId]`.
