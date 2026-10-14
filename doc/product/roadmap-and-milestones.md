# Roadmap, Milestones & Deliverables

## 1. Project Phasing

### Phase 1: MVP Core
- Documentation & Context Architecture
- Backend Skeleton & DB Setup
- AST & Maven Analysis Engine + Upstream Version Resolver
- AI Planning & LLM Adapter (with Context Assembly Pipeline)
- Docker Sandbox Validation (Two-Stage Execution)
- Frontend SPA & Monaco Diff Review (with Iterative Refinement Chat)
- End-to-End Testing & Verification

### Phase 2: Post-MVP
- GitHub PR Automation
- Gradle & Multi-Module Support enhancements
- Visual Dependency & Graph UI
- Team workspaces, RBAC enforcement, SSO integration

---

## 2. Deliverable Checklists

### Milestone 1: Ingestion & Static Analysis
- [ ] ZIP upload and Git repository clone endpoint (with PAT / SSH key credential support).
- [ ] SHA-256 / Git commit hash pinning.
- [ ] Maven POM parser (dependencies, versions, plugins, multi-module reactor support).
- [ ] Upstream Version Resolver querying Maven Central / Nexus APIs.
- [ ] OSV-Scanner and Semgrep integration for vulnerability scanning.

### Milestone 2: Modernization Engine & AI Planner
- [ ] Provider-agnostic LLM client (Claude, OpenAI, Gemini, Mock).
- [ ] AST indexing and Context Assembly Pipeline for selective file retrieval.
- [ ] Structured JSON plan generation with sequence ordering and evidence links.
- [ ] OpenRewrite recipe execution runner.
- [ ] Search-and-Replace block parser (with CREATE_FILE / DELETE_FILE support).

### Milestone 3: Hardened Sandbox Runner
- [ ] Two-stage Docker runner: Pre-flight dependency download (network on), then validation (network off).
- [ ] Resource caps (CPU, memory, PID limits).
- [ ] Live STDOUT/STDERR log capture.
- [ ] Surefire XML report parser for test counts.
- [ ] Integration test support via optional sidecar service containers.
- [ ] Maven profile auto-detection (`-DskipITs`) for projects mixing unit and integration tests.

### Milestone 4: Frontend UI & Code Review
- [ ] Dashboard view of projects and modernization jobs.
- [ ] Analysis summary view (outdated dependencies, CVEs, upstream version targets).
- [ ] Interactive plan step tracker.
- [ ] Monaco Editor side-by-side diff viewer.
- [ ] Iterative refinement chat panel for patch revision feedback.
- [ ] Final Modernization Audit Report view with PDF/Markdown export.

### Milestone 5: Verification & End-to-End Demo
- [ ] Pytest suite covering backend routes, mock AI failures, and sandbox isolation.
- [ ] Representative test repository (legacy Spring Boot 2.x application).
- [ ] Live demo recording and presentation slide deck.
