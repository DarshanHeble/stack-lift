"""Pydantic request and response schemas for REST API endpoints."""

from datetime import datetime
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from backend.db.models import (
    UserRole, CredentialType, RepoSource, JobStatus,
    PatchApprovalStatus, FindingCategory, FindingSeverity, BuildResult
)


# --- User Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.DEVELOPER
    auth_reference: Optional[str] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    role: UserRole
    created_at: datetime


# --- Credential Schemas ---
class CredentialCreate(BaseModel):
    label: str
    credential_type: CredentialType
    secret_value: str
    target_host: Optional[str] = None
    expires_at: Optional[datetime] = None


class CredentialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    owner_id: str
    label: str
    credential_type: CredentialType
    target_host: Optional[str]
    expires_at: Optional[datetime]
    created_at: datetime


# --- Project Schemas ---
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    repo_source: RepoSource = RepoSource.ZIP_UPLOAD
    repo_url: Optional[str] = None
    credential_id: Optional[str] = None
    default_branch: str = "main"


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: Optional[str]
    repo_source: RepoSource
    repo_url: Optional[str]
    default_branch: str
    created_at: datetime


# --- Job Schemas ---
class JobCreate(BaseModel):
    project_id: str
    repo_revision_id: Optional[str] = None
    requested_goal: str = Field(default="UPGRADE_JAVA_17", description="e.g. UPGRADE_JAVA_17 or SPRING_BOOT_3")


class JobStatusUpdate(BaseModel):
    status: JobStatus
    current_stage: str
    version_id: int = Field(description="Current version_id for Optimistic Concurrency Control")
    diagnostic_summary: Optional[Dict[str, Any]] = None


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    repo_revision_id: str
    requested_goal: str
    status: JobStatus
    version_id: int
    current_stage: str
    started_at: datetime
    completed_at: Optional[datetime]


# --- Plan & Findings Schemas ---
class FindingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    module_name: Optional[str]
    category: FindingCategory
    severity: FindingSeverity
    file_path: str
    evidence: Dict[str, Any]
    recommendation: str
    upstream_versions: Optional[Dict[str, Any]]


class MigrationPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    job_id: str
    ordered_steps: List[Dict[str, Any]]
    estimated_complexity: str
    approval_state: str
    created_at: datetime


# --- Patch & Review Schemas ---
class PatchReviewAction(BaseModel):
    action: str = Field(description="'APPROVE', 'REJECT', or 'REVISION_REQUESTED'")
    version_id: int = Field(description="Current patch version_id for OCC")
    feedback: Optional[str] = Field(default=None, description="Review feedback if requesting revision")


class PatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    step_id: str
    changed_files: List[str]
    diff_content: str
    patch_version: int
    version_id: int
    approval_status: PatchApprovalStatus
    revision_feedback: Optional[str]
