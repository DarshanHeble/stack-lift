# Product Definition, User Journey & UX Workflows

## 1. Product Definition

**StackLift** is a developer-facing modernization workspace providing:
- A centralized **Repository Dashboard** (with private repo credential management)
- Deep **Analysis Reports** (dependencies, AST debt, security CVEs, upstream version targets)
- An evidence-based **Migration Planner** (with multi-module attribution)
- Interactive **Patch Review** with side-by-side Monaco diff and iterative refinement chat
- An auditable **Validation History** with sandboxed build, test, and security verification

---

## 2. The 5-Step User Journey

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant UI as StackLift Dashboard
    participant API as Backend Service
    participant Eng as Analysis Engine
    participant Ver as Upstream Version Resolver
    participant LLM as AI Orchestrator
    participant Box as Hardened Sandbox

    Dev->>UI: 1. Create Project (ZIP / Git URL + Credentials + Goal)
    UI->>API: Ingest Repository & Record Revision
    API->>Eng: 2. Analyze (POM, Tree-sitter, Semgrep, OSV)
    API->>Ver: 2b. Resolve Upstream Versions (Maven Central / Nexus)
    Eng-->>API: Codebase Findings, AST Index & Dependencies
    Ver-->>API: Upgrade Target Matrix
    API->>LLM: 3. Generate Plan (AST Index + Findings + Versions)
    LLM-->>API: Prioritized Steps with Prerequisites & Risks
    API-->>UI: Display Analysis & Plan
    Dev->>UI: 4. Select Step & Request Patch
    API->>Eng: Run OpenRewrite or AI Patch (reads from Working Tree)
    Eng-->>UI: Display Diff in Monaco Viewer
    Dev->>UI: Approve / Request Revision
    UI->>API: Submit Approval (or revision feedback)
    API->>Box: 5. Stage 1: Pre-flight deps (network on)
    API->>Box: 5. Stage 2: Build & Test (network off)
    Box-->>API: Logs, Test Results, CVE Deltas
    API-->>UI: Stream Terminal & Generate Report
```

### Step 1 — Create a Project
Upload a ZIP or connect a Git repository (with PAT/SSH credentials for private repos), select branch/commit, and choose a modernization goal.

### Step 2 — Understand the Application
StackLift analyzes the repository: detects Java/Maven versions, maps direct and transitive dependencies, resolves **upstream version targets** from Maven Central/Nexus, identifies CVEs, extracts deprecated API usage, and notes analysis limitations.

### Step 3 — Review the Migration Plan
An ordered sequence of modernization steps with prerequisites, risk ratings, module attribution (for multi-module projects), estimated complexity, and verifiable evidence links.

### Step 4 — Review Proposed Changes
Inspect diffs in Monaco editor. **Approve**, **Reject**, or **Request Revision** with natural language feedback (e.g., *"Rename paymentSvc to paymentGateway"*) triggering a revised patch version without starting over. Supports file creation and deletion operations.

### Step 5 — Validate and Report
Two-stage sandbox execution: pre-flight dependency download (network on), then build/test with network disabled. Optional sidecar service containers for integration tests. Generates audit report distinguishing verified claims from unverified limitations.

---

## 3. The 5 Core Screens

### 1. Dashboard (`/projects`)
Projects, jobs, status badges, quick-filter for attention-needed items, upload with credential picker.

### 2. Codebase Analysis (`/projects/:id/analysis`)
Runtimes, frameworks, module dependency tree, dependency breakdown with upstream upgrade targets, CVEs, AST debt findings, analysis limitations.

### 3. Migration Planner (`/projects/:id/plan`)
Prioritized checklist, risk badges, module attribution, prerequisite indicators, evidence drawer.

### 4. Patch Review (`/projects/:id/steps/:stepId/review`)
Monaco side-by-side diff, new/deleted file badges, approve/reject/revision buttons, iterative refinement chat panel with patch version history.

### 5. Validation & Reports (`/projects/:id/jobs/:jobId/report`)
Live terminal stream, build/test results, integration test skip notices, CVE delta, patch history timeline, verified/unverified/residual risk cards.

---

## 4. Explicit MVP Scope

**Included:**
- Java + Maven applications (single-module AND multi-module Reactor).
- ZIP upload and Git clone with private repo credential support.
- Upstream version resolution from Maven Central (and optionally private registries).
- OpenRewrite deterministic recipes + AI-guided Search/Replace patches.
- File create/delete operations in patches.
- Two-stage sandboxed validation with optional sidecar services.
- Iterative patch refinement via natural language feedback.

**Deferred:**
- Gradle, Python, Node.js support.
- Automatic production deployment or CI/CD merging.
- Automated microservice decomposition.
- Universal refactoring for arbitrary languages.
