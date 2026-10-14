# Security, Trust Architecture & Compliance

## 1. Security as a Core Product Requirement

Because StackLift executes untrusted code from legacy repositories, security is a **core product requirement**, not an afterthought.

> [!CAUTION]
> **Container Boundary Reality**:
> A container alone is not a complete security boundary. Sandbox configuration, host isolation, network policy, secret handling, credential lifecycle, and resource quotas all matter.

---

## 2. Comprehensive Security & Trust Checklist

### 2.1. Sandboxed & Disposable Execution
- [x] Run all compilation and test tasks in disposable, single-use container environments.
- [x] Restrict network egress during builds (`--network none`) to prevent code exfiltration and reverse shells.
- [x] Enforce read-only root filesystems with ephemeral `tmpfs` mounts for `/workspace`.
- [x] Run containers under an unprivileged user (`UID 10001:GID 10001`), never as `root`.
- [x] Drop all Linux capabilities (`--cap-drop ALL`) and disable setuid elevation (`--security-opt no-new-privileges:true`).
- [x] Never mount the Docker socket inside any sandbox container.

### 2.2. Two-Stage Network Isolation
- [x] Stage 1 (Pre-flight): Network enabled ONLY for declarative dependency resolution (`mvn dependency:go-offline`). No code execution.
- [x] Stage 2 (Validation): Network completely disabled. Cached dependencies mounted read-only.
- [x] Stage 3 (Optional Sidecars): If integration tests require databases, use an isolated Docker network with NO public internet route.

### 2.3. Credential & Secret Isolation
- [x] Store Git PATs, SSH keys, Maven registry tokens, and LLM API keys in encrypted DB columns (Fernet / KMS).
- [x] **NEVER** return `encrypted_value` via any API endpoint, even to administrators.
- [x] Decrypt credentials only in-memory inside the backend worker process at the moment of use (e.g., `git clone`).
- [x] **NEVER** pass host application credentials, cloud tokens, or AI API keys into sandbox containers as env vars or mounted files.
- [x] Use a temporary `settings.xml` for private Maven registries during Stage 1 only; destroy before Stage 2.
- [x] Track `expires_at` on all credentials and surface rotation warnings 14 days before expiry.

### 2.4. Untrusted Input Handling & Prompt Injection Defense
- [x] Treat source code, repository READMEs, commit messages, and build scripts as **untrusted user data**.
- [x] Isolate untrusted source content within fenced delimiters in LLM prompts.
- [x] Instruct models to ignore instructions embedded inside source code comments or READMEs attempting to alter modernization plans.
- [x] Validate all AI responses against strict Pydantic schemas; reject and drop malformed patches.
- [x] Verify every SEARCH block exists verbatim in the target file before applying; reject hallucinated blocks.

### 2.5. Authorization, Quotas & Auditability
- [x] Require explicit user authorization before reading repositories or approving code patches.
- [x] Set hard quotas:
  - Upload size: Max 200MB uncompressed.
  - Execution time: 300-second (5-minute) hard timeout per container run.
  - Memory & CPU: `--memory 4g --cpus 2.0 --pids-limit 100`.
  - AI retries: Max 3 automated self-healing attempts per step.
  - User revisions: Max 5 revision requests per step.
- [x] Record immutable `audit_events` for every consequential action (project creation, patch approval, credential rotation, sandbox execution).
- [x] **No Auto-Deploy**: Never automatically deploy generated code to production environments in the MVP.
