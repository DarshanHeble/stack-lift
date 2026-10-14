# Server-Sent Events (SSE) Stream Protocol

## 1. Connection Endpoint

- **Route**: `GET /api/v1/jobs/{job_id}/stream`
- **Headers**:
  - `Accept: text/event-stream`
  - `Cache-Control: no-cache`
  - `Connection: keep-alive`

---

## 2. Event Types & Payloads

### 2.1. `log` Event
Emitted whenever a worker process, static scanner, or sandboxed build outputs a terminal line.
```
event: log
data: {"job_id": "8489c629-...", "timestamp": "2026-10-09T14:15:02Z", "stream": "stdout", "message": "[INFO] Scanning for projects..."}
```

### 2.2. `stage_change` Event
Emitted on transition between modernization stages.
```
event: stage_change
data: {"job_id": "8489c629-...", "status": "ANALYZING", "stage": "RUNNING_SECURITY_SCAN", "progress_pct": 45}
```

### 2.3. `step_status` Event
Emitted when a specific modernization step changes state.
```
event: step_status
data: {"step_id": "e2f15949-...", "status": "AWAITING_REVIEW", "title": "Upgrade Log4j to 2.20.0", "patch_version": 2}
```

### 2.4. `revision_ready` Event
Emitted when a revised patch version is generated after user feedback.
```
event: revision_ready
data: {"step_id": "e2f15949-...", "patch_version": 2, "feedback_applied": "Renamed paymentSvc to paymentGateway"}
```

### 2.5. `job_completed` Event
Emitted when the workflow reaches a terminal state.
```
event: job_completed
data: {"job_id": "8489c629-...", "status": "COMPLETED", "duration_seconds": 142.5, "integration_tests_skipped": true}
```
