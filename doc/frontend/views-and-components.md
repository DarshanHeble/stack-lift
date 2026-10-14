# Frontend Views & Core Components

## 1. Primary Application Views

### 1.1. Dashboard (`/projects`)
- Project cards displaying: repository name, source commit hash, detected Java version, last modernized timestamp.
- Clear status badges for each job (`QUEUED`, `ANALYZING`, `PLANNING`, `AWAITING_REVIEW`, `VALIDATING`, `COMPLETED`, `FAILED`, `CANCELLED`).
- Quick-filter for jobs needing developer attention (e.g., `AWAITING_REVIEW`).
- **Upload Modal**: Drag-and-drop `.zip` file uploader with upload progress bar, Git clone URL input, branch selector, and credential picker for private repos.

### 1.2. Analysis & Dependency Inspector (`/projects/:id/analysis`)
- **Key Metrics Bar**: Java version (e.g., `Java 8`), build tool (`Maven 3.8`), total dependencies, detected CVE count.
- **Module Map**: For multi-module projects, display the module dependency tree and per-module findings attribution.
- **Vulnerability Table**: Affected libraries, CVSS severity, current version, and **recommended upgrade targets** (latest patch, minor, and major versions from the Upstream Version Resolver).
- **AST Debt Findings**: Highlighting deprecated framework methods, XML configurations, and reflection calls.

### 1.3. Modernization Plan & Stepper (`/projects/:id/plan`)
- Interactive step-by-step checklist of modernization actions.
- Each step displays: sequence number, title, risk badge (`LOW` green, `MEDIUM` yellow, `HIGH` red), module attribution, rationale accordion, and an "Inspect & Generate Patch" CTA button.
- Prerequisite dependency indicators showing which steps must complete before others.

### 1.4. Patch Review Interface (`/projects/:id/steps/:stepId/review`)
- Integrated Monaco Editor side-by-side diff view.
- Left pane: Original file content from the current Working Tree.
- Right pane: Proposed modernization patch (diff highlighting).
- **New/Deleted File Indicators**: Special badges for `CREATE_FILE` and `DELETE_FILE` operations.
- **Action Buttons**:
  - ✅ "Approve & Run Sandbox Validation"
  - ❌ "Reject"
  - 🔄 "Request Revision" (opens the refinement chat panel)
  - 📥 "Download .patch File"
- **Iterative Refinement Chat Panel**: Collapsible side panel where the user can type natural language feedback (e.g., *"Rename `paymentSvc` to `paymentGateway`"*). On submit, the system generates a revised `patch_version` without requiring the user to start over. Displays patch version history.

### 1.5. Live Sandbox Validation Terminal (`/projects/:id/jobs/:jobId/terminal`)
- Monospace terminal window streaming live STDOUT/STDERR logs from the Docker container via SSE.
- Stage indicators: `Resolving Dependencies` → `Compiling Sources` → `Running Unit Tests` → `Scanning Security Rules`.
- Integration test status: If skipped, display a yellow banner: *"Integration tests skipped. Reason: No sidecar DB configured."*
- Status banner indicating build outcome with exit codes.

### 1.6. Modernization Audit Report (`/projects/:id/reports/:reportId`)
- Executive summary with downloadable PDF/Markdown report.
- **Verified Checks** card (passed tests, successful JDK compile, CVEs resolved).
- **Partially Verified** card (integration tests skipped with explicit reason).
- **Residual Limitations** card (untested modules, manual runtime verification recommendations, reflection-based calls detected).
- **Patch History Timeline**: All patch versions, revision feedback, and self-healing attempts for each step.
