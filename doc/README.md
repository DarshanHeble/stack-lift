# StackLift Documentation Hub & Context Index

Welcome to the **StackLift** primary documentation directory.
This repository of context files is modularized into distinct architectural layers and domains, allowing humans and AI coding agents to navigate, maintain, and implement each component independently.

---

## 🗺️ Architectural Context Map

```
doc/
├── README.md                               # Root context map & reading navigation
│
├── overview/                               # Vision, Mission, & High-Level Architecture
│   ├── vision-and-mission.md               # Core tagline, 6 pillars, target personas
│   └── system-architecture.md              # Multi-tier topology, Credentials Manager, Version Resolver
│
├── product/                                # Product Requirements & Scope
│   ├── product-requirements.md             # 5-step user journey, 5 screens, MVP scope
│   ├── roles-and-permissions.md            # RBAC matrix: Owner, Dev, Reviewer, Admin
│   └── roadmap-and-milestones.md           # Delivery milestones & deliverable checklists
│
├── backend/                                # Backend Core Services & Data Layer
│   ├── architecture-and-design.md          # FastAPI layout, Credentials Manager, S/R Block Parser
│   ├── database-models.md                  # PostgreSQL schema: users, credentials, findings, patches, audit
│   └── job-orchestration.md                # State machine, Working Tree, iterative refinement, error handling
│
├── frontend/                               # Web UI & User Experience
│   ├── architecture-and-stack.md           # React, TypeScript, Vite, Tailwind CSS, Monaco, Revision Chat
│   ├── views-and-components.md             # Dashboard, Analysis, Planner, Diff+Chat Review, Reports
│   └── state-and-data-fetching.md          # TanStack Query, SSE stream hook, cache invalidation
│
├── engine/                                 # Java Modernization & Analysis Tools
│   ├── java-and-maven-parser.md            # AST Tree-sitter, POM parser, multi-module, Upstream Version Resolver
│   ├── openrewrite-integration.md          # OpenRewrite recipes, conservative transformation philosophy
│   └── security-scanners.md               # OSV-Scanner (CVEs) & Semgrep SAST rules
│
├── ai/                                     # LLM Prompts & Orchestration
│   ├── adapter-architecture.md             # Context Assembly Pipeline, JIT file retrieval, determinism-first
│   ├── prompt-templates.md                 # SEARCH/REPLACE + CREATE/DELETE file format, revision & diagnostic prompts
│   └── failure-diagnostics.md              # Compiler error filtering, self-healing retry loop, guardrails
│
├── sandbox/                                # Execution Security & Container Isolation
│   ├── threat-model.md                     # Full security checklist, credential lifecycle, prompt injection defense
│   └── container-isolation.md              # 3-stage execution: pre-flight, validation, optional sidecar services
│
├── api/                                    # REST Endpoints & Streaming Contracts
│   ├── rest-endpoints.md                   # REST routes with credentials, revisions, patch history
│   └── sse-event-stream.md                 # SSE events: log, stage_change, revision_ready, job_completed
│
├── operations/                             # Metrics, Testing, & Roadmap
│   ├── success-metrics-and-kpis.md         # KPIs, Truth in Modernization rule (with IT skip disclosure)
│   ├── risk-and-mitigation.md              # 12-risk matrix with all edge case mitigations
│   └── integrations-roadmap.md             # MVP & Post-MVP integrations with interface contracts
│
└── branding/                               # Brand, Namespace & Trademark Notes
    └── brand-and-naming.md                 # Trademark review & positioning consistency
```

---

## 📚 Quick Navigation by Domain

| Domain | Files | What's Covered |
| :--- | :--- | :--- |
| **Overview** | [`overview/vision-and-mission.md`](file:///home/darshan/Projects/stack-lift/doc/overview/vision-and-mission.md) · [`overview/system-architecture.md`](file:///home/darshan/Projects/stack-lift/doc/overview/system-architecture.md) | Vision, 6 pillars, personas, full topology with Credentials Manager & Version Resolver |
| **Product** | [`product/product-requirements.md`](file:///home/darshan/Projects/stack-lift/doc/product/product-requirements.md) · [`product/roles-and-permissions.md`](file:///home/darshan/Projects/stack-lift/doc/product/roles-and-permissions.md) · [`product/roadmap-and-milestones.md`](file:///home/darshan/Projects/stack-lift/doc/product/roadmap-and-milestones.md) | 5-step journey, 5 screens, RBAC, MVP scope, milestones |
| **Backend** | [`backend/architecture-and-design.md`](file:///home/darshan/Projects/stack-lift/doc/backend/architecture-and-design.md) · [`backend/database-models.md`](file:///home/darshan/Projects/stack-lift/doc/backend/database-models.md) · [`backend/job-orchestration.md`](file:///home/darshan/Projects/stack-lift/doc/backend/job-orchestration.md) | FastAPI, 10 DB entities, Working Tree, patch refinement loop, error handling |
| **Frontend** | [`frontend/architecture-and-stack.md`](file:///home/darshan/Projects/stack-lift/doc/frontend/architecture-and-stack.md) · [`frontend/views-and-components.md`](file:///home/darshan/Projects/stack-lift/doc/frontend/views-and-components.md) · [`frontend/state-and-data-fetching.md`](file:///home/darshan/Projects/stack-lift/doc/frontend/state-and-data-fetching.md) | React SPA, Monaco diff, revision chat panel, SSE terminal, patch history |
| **Engine** | [`engine/java-and-maven-parser.md`](file:///home/darshan/Projects/stack-lift/doc/engine/java-and-maven-parser.md) · [`engine/openrewrite-integration.md`](file:///home/darshan/Projects/stack-lift/doc/engine/openrewrite-integration.md) · [`engine/security-scanners.md`](file:///home/darshan/Projects/stack-lift/doc/engine/security-scanners.md) | AST index, POM parser, multi-module, Upstream Version Resolver, OpenRewrite, Semgrep/OSV |
| **AI** | [`ai/adapter-architecture.md`](file:///home/darshan/Projects/stack-lift/doc/ai/adapter-architecture.md) · [`ai/prompt-templates.md`](file:///home/darshan/Projects/stack-lift/doc/ai/prompt-templates.md) · [`ai/failure-diagnostics.md`](file:///home/darshan/Projects/stack-lift/doc/ai/failure-diagnostics.md) | Context Assembly, SEARCH/REPLACE + CREATE/DELETE format, revision & diagnostic prompts |
| **Sandbox** | [`sandbox/threat-model.md`](file:///home/darshan/Projects/stack-lift/doc/sandbox/threat-model.md) · [`sandbox/container-isolation.md`](file:///home/darshan/Projects/stack-lift/doc/sandbox/container-isolation.md) | 3-stage execution, sidecar services, credential lifecycle, prompt injection defense |
| **API** | [`api/rest-endpoints.md`](file:///home/darshan/Projects/stack-lift/doc/api/rest-endpoints.md) · [`api/sse-event-stream.md`](file:///home/darshan/Projects/stack-lift/doc/api/sse-event-stream.md) | REST routes with credentials/revisions, SSE events |
| **Operations** | [`operations/success-metrics-and-kpis.md`](file:///home/darshan/Projects/stack-lift/doc/operations/success-metrics-and-kpis.md) · [`operations/risk-and-mitigation.md`](file:///home/darshan/Projects/stack-lift/doc/operations/risk-and-mitigation.md) · [`operations/integrations-roadmap.md`](file:///home/darshan/Projects/stack-lift/doc/operations/integrations-roadmap.md) | 7 KPIs, 12-risk matrix, MVP/Post-MVP integrations |
| **Branding** | [`branding/brand-and-naming.md`](file:///home/darshan/Projects/stack-lift/doc/branding/brand-and-naming.md) | Trademark analysis, positioning |

---

> [!NOTE]
> AI agents and engineers working on any layer of this application must read the corresponding folder documentation before editing code or adding dependencies.
