"""Database enumerated types."""

import enum


class UserRole(str, enum.Enum):
    PROJECT_OWNER = "PROJECT_OWNER"
    DEVELOPER = "DEVELOPER"
    REVIEWER = "REVIEWER"
    ADMINISTRATOR = "ADMINISTRATOR"


class CredentialType(str, enum.Enum):
    GIT_PAT = "GIT_PAT"
    GIT_SSH_KEY = "GIT_SSH_KEY"
    LLM_API_KEY = "LLM_API_KEY"
    MAVEN_REGISTRY_TOKEN = "MAVEN_REGISTRY_TOKEN"


class RepoSource(str, enum.Enum):
    ZIP_UPLOAD = "ZIP_UPLOAD"
    GITHUB_CLONE = "GITHUB_CLONE"
    GITLAB_CLONE = "GITLAB_CLONE"
    GIT_HTTPS = "GIT_HTTPS"
    GIT_SSH = "GIT_SSH"


class JobStatus(str, enum.Enum):
    QUEUED = "QUEUED"
    ANALYZING = "ANALYZING"
    PLANNING = "PLANNING"
    AWAITING_REVIEW = "AWAITING_REVIEW"
    VALIDATING = "VALIDATING"
    STEP_PASSED = "STEP_PASSED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    BLOCKED = "BLOCKED"
    CANCELLED = "CANCELLED"


class PatchApprovalStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    REVISION_REQUESTED = "REVISION_REQUESTED"


class FindingCategory(str, enum.Enum):
    DEPENDENCY_OUTDATED = "DEPENDENCY_OUTDATED"
    CVE_VULNERABILITY = "CVE_VULNERABILITY"
    DEPRECATED_API = "DEPRECATED_API"
    CONFIGURATION_ISSUE = "CONFIGURATION_ISSUE"


class FindingSeverity(str, enum.Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class BuildResult(str, enum.Enum):
    PASSED = "PASSED"
    FAILED = "FAILED"
    TIMED_OUT = "TIMED_OUT"
