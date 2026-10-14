# User Roles, Permissions & Access Control

## 1. Access Control Philosophy

While the initial MVP supports a single-user / developer workflow, the permission model is architected from day one with **Role-Based Access Control (RBAC)** to ensure clean enterprise team scaling and prevent privilege escalation.

> [!IMPORTANT]
> **Separation of Review & Execution Privileges**:
> A user with permission to review a plan or inspect a diff must **NOT** automatically gain permission to execute arbitrary code, modify sandbox constraints, or change third-party integration credentials.

---

## 2. Role & Permission Matrix

| Permission Action | Project Owner | Developer | Reviewer | Administrator |
| :--- | :---: | :---: | :---: | :---: |
| **Create Project & Ingest Repo** | ✅ | ✅ | ❌ | ✅ |
| **Configure Modernization Goals** | ✅ | ✅ | ❌ | ✅ |
| **View Codebase Analysis & Findings** | ✅ | ✅ | ✅ | ✅ |
| **Inspect Plans & Patch Diffs** | ✅ | ✅ | ✅ | ✅ |
| **Approve / Reject Proposed Patches** | ✅ | ❌ | ✅ | ✅ |
| **Request Patch Revision with Feedback** | ✅ | ✅ | ✅ | ✅ |
| **Trigger Sandboxed Build Validations** | ✅ | ✅ | ❌ | ✅ |
| **Download .patch Files & Reports** | ✅ | ✅ | ✅ | ✅ |
| **Manage Users & Role Assignments** | ❌ | ❌ | ❌ | ✅ |
| **Manage Integration Credentials (GitHub/LLM)** | ❌ | ❌ | ❌ | ✅ |
| **Configure Sandbox Security & Quotas** | ❌ | ❌ | ❌ | ✅ |
