# Backend Architecture & Service Design

## 1. Overview & Directory Structure

The StackLift backend is built with **Python 3.11+** and **FastAPI**, using asynchronous endpoints, Pydantic v2 schemas, and SQLAlchemy 2.0.

### Proposed Code Directory Layout:
```
backend/
├── app/
│   ├── main.py                     # FastAPI application factory & lifespan
│   ├── core/
│   │   ├── config.py               # Pydantic Settings & environment variables
│   │   ├── security.py             # Auth verification & API key helpers
│   │   ├── credentials.py          # Integration Credentials Manager (encrypted vault)
│   │   └── logging.py              # Structured logging configuration
│   ├── api/
│   │   ├── v1/
│   │   │   ├── router.py           # API v1 central router
│   │   │   ├── endpoints/
│   │   │   │   ├── projects.py     # Project & ingestion endpoints
│   │   │   │   ├── jobs.py         # Job creation & SSE streams
│   │   │   │   ├── steps.py        # Modernization steps
│   │   │   │   ├── patches.py      # Patch diffs, approvals & revision requests
│   │   │   │   ├── reports.py      # Audit reports
│   │   │   │   └── credentials.py  # Integration credential CRUD (Admin only)
│   ├── models/                     # SQLAlchemy ORM models
│   │   ├── project.py
│   │   ├── repository.py
│   │   ├── job.py
│   │   ├── step.py
│   │   ├── patch.py
│   │   ├── validation.py
│   │   ├── credential.py           # Encrypted integration credentials
│   │   └── audit.py                # Immutable audit event log
│   ├── schemas/                    # Pydantic request/response schemas
│   ├── services/                   # Business logic layer
│   │   ├── repo_service.py         # Ingestion, unzipping, git checkout (with auth)
│   │   ├── analysis_service.py     # Orchestrates AST, security, & version resolution
│   │   ├── version_resolver.py     # Upstream version oracle (Maven Central / Nexus)
│   │   ├── planning_service.py     # AI plan generation (with Context Assembly)
│   │   ├── patch_service.py        # Patch creation, S/R block parsing, OpenRewrite
│   │   ├── validation_service.py   # Two-stage sandbox build orchestration
│   │   └── credential_service.py   # Encrypt/decrypt/rotate integration tokens
│   ├── workers/                    # Background task definitions (ARQ / Celery)
│   │   └── tasks.py
│   └── db/
│       ├── session.py              # Async engine & sessionmaker
│       └── base.py                 # Declarative base
├── tests/                          # Pytest test suite
│   ├── conftest.py
│   ├── test_projects.py
│   ├── test_analysis.py
│   ├── test_patch_parser.py        # Search/Replace block parser tests
│   └── test_sandbox.py
├── alembic/                        # Database migration scripts
├── Dockerfile                      # Backend container definition
└── pyproject.toml                  # Dependencies & tooling configuration
```

---

## 2. Key Architectural Patterns

### 2.1. Separation of Concerns
- **Routers**: Only handle HTTP request validation, parameter unpacking, and serialization. No database business logic inside route handlers.
- **Service Layer**: Pure business logic (e.g. `AnalysisService`, `PatchService`), fully unit-testable independently of HTTP.
- **Data Layer**: Clean SQLAlchemy declarative models with typed relationships.

### 2.2. Asynchronous API with Sync Sandbox/Worker Isolation
- Fast HTTP response times: Long jobs return a `202 Accepted` with a Job UUID and an SSE event stream URL.
- Background tasks run in dedicated worker processes to prevent blocking the async event loop.

### 2.3. Integration Credentials Manager
- Stores Git Personal Access Tokens, SSH key references, and LLM API keys in the `integration_credentials` table.
- Values are encrypted at rest using Fernet symmetric encryption (or KMS-backed encryption for production).
- Credentials are decrypted in-memory only at the moment of use (e.g., `git clone`) and **never** passed into sandbox containers.
- Admin-only CRUD endpoints for credential lifecycle management.

### 2.4. Search-and-Replace Block Parser
A dedicated backend parser converts AI-generated `SEARCH/REPLACE` blocks into applied file modifications:
1. Parse the `<<<< SEARCH ... ==== ... >>>> REPLACE` block.
2. For each block, locate the exact `SEARCH` text in the target file via substring matching.
3. If the `SEARCH` text is not found (LLM hallucinated content), raise a `PatchApplicationError` with diagnostic context.
4. If found, replace with the `REPLACE` content.
5. Also support `<<<< CREATE_FILE path/to/file` and `<<<< DELETE_FILE path/to/file` directives for file lifecycle operations.
6. After all blocks are applied, generate a standard unified diff for the Monaco viewer.
