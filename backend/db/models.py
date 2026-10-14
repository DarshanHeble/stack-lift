"""Central index re-exporting all database models and enums."""

from backend.db.enums import (
    UserRole, CredentialType, RepoSource, JobStatus,
    PatchApprovalStatus, FindingCategory, FindingSeverity, BuildResult
)
from backend.db.models_auth import User, IntegrationCredential
from backend.db.models_project import Project, RepositoryRevision
from backend.db.models_job import ModernizationJob, MigrationPlan, Finding
from backend.db.models_validation import Patch, ValidationRun, AuditEvent

__all__ = [
    "UserRole", "CredentialType", "RepoSource", "JobStatus",
    "PatchApprovalStatus", "FindingCategory", "FindingSeverity", "BuildResult",
    "User", "IntegrationCredential",
    "Project", "RepositoryRevision",
    "ModernizationJob", "MigrationPlan", "Finding",
    "Patch", "ValidationRun", "AuditEvent",
]
