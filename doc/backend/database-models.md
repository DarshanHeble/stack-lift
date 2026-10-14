# Database Schema, Entities & Storage Strategy

## 1. Storage Strategy: Database vs. Object Storage

> [!IMPORTANT]
> **Data Tier Separation**:
> - **PostgreSQL**: Stores relational metadata, structured findings, plan steps, status flags, user references, credentials (encrypted), and audit events.
> - **Artifact Storage (Local Disk / S3 Object Store)**: Stores large binary archives (uploaded ZIPs), raw uncompressed source trees, Working Tree snapshots, full verbose container STDOUT/STDERR logs, and generated `.patch` files.

---

## 2. Core Entities & Column Mappings

### 2.1. `users`
Tracks system operators, developers, and reviewers.
- `id`: UUID (PK)
- `email`: VARCHAR(255) (Unique, Indexed)
- `role`: Enum (`PROJECT_OWNER`, `DEVELOPER`, `REVIEWER`, `ADMINISTRATOR`)
- `auth_reference`: VARCHAR(255) (OAuth / Auth0 / JWT sub)
- `created_at`, `updated_at`: Timestamps

### 2.2. `integration_credentials`
Securely stores encrypted tokens for Git remotes, LLM APIs, and private Maven registries.
- `id`: UUID (PK)
- `owner_id`: UUID (FK -> `users.id`) — the administrator who created this credential
- `label`: VARCHAR(255) (Human-readable name, e.g., "GitHub Enterprise PAT")
- `credential_type`: Enum (`GIT_PAT`, `GIT_SSH_KEY`, `LLM_API_KEY`, `MAVEN_REGISTRY_TOKEN`)
- `encrypted_value`: BYTEA (Fernet-encrypted token / key material)
- `target_host`: VARCHAR(1024) (e.g., `github.com`, `nexus.internal.corp`)
- `expires_at`: TIMESTAMPTZ (Nullable — for token rotation tracking)
- `created_at`, `updated_at`: Timestamps

> [!CAUTION]
> **Security Invariants**:
> - `encrypted_value` is NEVER returned by any API endpoint, even to administrators.
> - Decryption occurs only in-memory inside the backend worker process at the moment of `git clone` or Maven registry authentication.
> - Credentials are NEVER passed into sandbox containers as environment variables or mounted files.

### 2.3. `projects`
Tracks modernized engineering codebases.
- `id`: UUID (PK)
- `name`: VARCHAR(255)
- `description`: TEXT
- `repo_source`: VARCHAR(20) (`ZIP_UPLOAD`, `GITHUB_CLONE`, `GITLAB_CLONE`)
- `repo_url`: VARCHAR(1024) (Nullable)
- `credential_id`: UUID (Nullable, FK -> `integration_credentials.id`) — used for private repo clones
- `default_branch`: VARCHAR(100) (Default 'main')
- `created_at`, `updated_at`: Timestamps

### 2.4. `repository_revisions`
Immutable snapshot of a codebase at a specific point in time.
- `id`: UUID (PK)
- `project_id`: UUID (FK -> `projects.id`)
- `commit_sha`: VARCHAR(64) (Exact Git commit SHA or ZIP SHA-256)
- `detected_build_system`: VARCHAR(50) (`MAVEN_3`, `GRADLE`)
- `language_and_frameworks`: JSONB (`{"java": "1.8", "spring_boot": "2.7.5"}`)
- `module_structure`: JSONB (For multi-module: `{"root": ".", "modules": ["core", "web", "api"]}`)
- `storage_path`: VARCHAR(1024) (Path to raw files in artifact store)
- `ingested_at`: Timestamp

### 2.5. `modernization_jobs`
Orchestrates an end-to-end upgrade cycle.
- `id`: UUID (PK)
- `repo_revision_id`: UUID (FK -> `repository_revisions.id`)
- `requested_goal`: VARCHAR(100) (e.g. `UPGRADE_JAVA_17`, `SPRING_BOOT_3`)
- `status`: Enum (`QUEUED`, `ANALYZING`, `PLANNING`, `AWAITING_REVIEW`, `VALIDATING`, `COMPLETED`, `FAILED`, `CANCELLED`)
- `version_id`: INT (Default 1; incremented on every state transition for Optimistic Concurrency Control / OCC)
- `current_stage`: VARCHAR(100)
- `working_tree_path`: VARCHAR(1024) — path to the mutable Working Tree for this job's patch stack
- `diagnostic_summary`: JSONB (Failure reasons, retry counts)
- `started_at`, `completed_at`: Timestamps

### 2.6. `findings`
Discrete code and security observations identified during analysis.
- `id`: UUID (PK)
- `repo_revision_id`: UUID (FK -> `repository_revisions.id`)
- `module_name`: VARCHAR(255) (Nullable — for multi-module attribution, e.g. `"core"`, `"web"`)
- `category`: VARCHAR(50) (`DEPENDENCY_OUTDATED`, `CVE_VULNERABILITY`, `DEPRECATED_API`, `CONFIGURATION_ISSUE`)
- `severity`: Enum (`INFO`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `file_path`: VARCHAR(1024)
- `evidence`: JSONB (Line numbers, code snippet, matched rule)
- `recommendation`: TEXT
- `upstream_versions`: JSONB (Nullable — `{"current": "2.14.1", "latest_patch": "2.14.3", "latest_minor": "2.23.1", "latest_major": "3.0.0"}`)
- `created_at`: Timestamp

### 2.7. `migration_plans`
The structured roadmap generated for a modernization job.
- `id`: UUID (PK)
- `job_id`: UUID (FK -> `modernization_jobs.id`)
- `ordered_steps`: JSONB (Array of step objects with order, title, prerequisites, risk)
- `estimated_complexity`: VARCHAR(20) (`LOW`, `MEDIUM`, `HIGH`)
- `approval_state`: Enum (`PENDING`, `APPROVED`, `REJECTED`)
- `created_at`: Timestamp

### 2.8. `patches`
Generated code changes for modernization steps.
- `id`: UUID (PK)
- `step_id`: UUID (FK)
- `changed_files`: JSONB (List of file paths modified, created, or deleted)
- `diff_content`: TEXT (Git unified diff — generated from applied Search/Replace blocks)
- `raw_ai_blocks`: TEXT (Nullable — original Search/Replace / CREATE_FILE / DELETE_FILE blocks from LLM)
- `patch_version`: INT (Default 1; incremented on iterative refinement revisions)
- `version_id`: INT (Default 1; incremented for OCC race condition prevention during review actions)
- `revision_feedback`: TEXT (Nullable — user's textual feedback that triggered this revision)
- `source_revision_sha`: VARCHAR(64)
- `approval_status`: Enum (`PENDING`, `APPROVED`, `REJECTED`, `REVISION_REQUESTED`)
- `created_at`: Timestamp

### 2.9. `validation_runs`
Results of containerized build and test execution.
- `id`: UUID (PK)
- `patch_id`: UUID (FK -> `patches.id`)
- `build_result`: Enum (`PASSED`, `FAILED`, `TIMED_OUT`)
- `test_result`: JSONB (`{"total": 42, "passed": 42, "failed": 0, "skipped": 0}`)
- `integration_tests_skipped`: BOOLEAN (Default false — true when `-DskipITs` was applied)
- `integration_test_reason`: TEXT (Nullable — e.g., "No sidecar DB configured")
- `scanner_results`: JSONB (CVE and Semgrep delta)
- `log_storage_uri`: VARCHAR(1024) (Object store URI for full build log)
- `completed_at`: Timestamp

### 2.10. `audit_events`
Immutable record of all consequential actions for enterprise compliance.
- `id`: UUID (PK)
- `actor_id`: UUID (FK -> `users.id`)
- `action`: VARCHAR(100) (e.g. `PROJECT_CREATED`, `PATCH_APPROVED`, `PATCH_REVISION_REQUESTED`, `VALIDATION_TRIGGERED`, `CREDENTIAL_ROTATED`)
- `associated_job_id`: UUID (Nullable, FK -> `modernization_jobs.id`)
- `metadata`: JSONB (IP address, user-agent, prior state vs new state)
- `timestamp`: TIMESTAMPTZ (Default `now()`)

---

## 3. Data Sanitization & Retention Rules

- **Zero Secret Ingestion**: AI prompts and server logs are scrubbed for API keys, passwords, and `.env` credentials before dispatch.
- **Repository Retention**: Uploaded source archives and unpacked build trees are automatically purged after 30 days unless marked pinned by an Administrator.
- **Credential Rotation**: The system tracks `expires_at` on all integration credentials and surfaces warnings 14 days before expiry.
