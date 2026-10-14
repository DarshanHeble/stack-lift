# REST API Endpoints Specification

## 1. API Conventions

- **Base Path**: `/api/v1`
- **Formats**: All requests and responses use JSON (except multipart uploads).
- **Authentication**: Bearer API tokens in `Authorization` header.

---

## 2. Resource Endpoints

### 2.1. Projects
- `POST /api/v1/projects`: Register a new project (with optional `credential_id` for private repos).
- `GET /api/v1/projects`: List tracked projects with snapshot summaries.
- `GET /api/v1/projects/{project_id}`: Retrieve project details.
- `POST /api/v1/projects/{project_id}/upload`: Upload legacy `.zip` repository.

### 2.2. Credentials (Admin Only)
- `POST /api/v1/credentials`: Store a new encrypted integration credential (Git PAT, SSH key, Maven token).
- `GET /api/v1/credentials`: List credentials (metadata only — `encrypted_value` is NEVER returned).
- `DELETE /api/v1/credentials/{credential_id}`: Revoke and delete a credential.

### 2.3. Modernization Jobs
- `POST /api/v1/projects/{project_id}/jobs`: Trigger an analysis and modernization job.
- `GET /api/v1/jobs/{job_id}`: Get job progress, status, and summary metrics.
- `POST /api/v1/jobs/{job_id}/cancel`: Cancel a running job.

### 2.4. Plan & Steps
- `GET /api/v1/jobs/{job_id}/plan`: Get ordered modernization steps with evidence links and module attribution.
- `GET /api/v1/steps/{step_id}`: Retrieve specific step metadata.
- `POST /api/v1/steps/{step_id}/generate-patch`: Propose patch for step.

### 2.5. Patches, Approvals & Revisions
- `GET /api/v1/steps/{step_id}/patch`: Get generated diff (latest `patch_version`).
- `GET /api/v1/steps/{step_id}/patch/history`: Get all patch versions for this step.
- `POST /api/v1/patches/{patch_id}/approve`: Approve patch and trigger sandboxed build.
- `POST /api/v1/patches/{patch_id}/reject`: Reject patch with developer feedback notes.
- `POST /api/v1/patches/{patch_id}/request-revision`: Submit revision feedback; triggers AI to generate a new `patch_version`.
  - **Request Body**:
    ```json
    {
      "feedback": "Rename paymentSvc to paymentGateway throughout the file."
    }
    ```
  - **Response**: `202 Accepted` returning the new `Patch` with incremented `patch_version`.

### 2.6. Reports
- `GET /api/v1/jobs/{job_id}/report`: Get full modernization audit report.
- `GET /api/v1/jobs/{job_id}/report/export`: Download report as Markdown or PDF.

---

## 3. SSE Event Stream

- `GET /api/v1/jobs/{job_id}/stream`: Server-Sent Events endpoint.
  - Events: `log`, `stage_change`, `step_status`, `job_completed`.
  - See [`api/sse-event-stream.md`](file:///home/darshan/Projects/stack-lift/doc/api/sse-event-stream.md) for full payload contracts.
