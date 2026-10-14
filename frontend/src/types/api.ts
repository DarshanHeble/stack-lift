/**
 * TypeScript domain types mirroring backend Pydantic models.
 */

export type UserRole = 'ADMIN' | 'DEVELOPER' | 'REVIEWER' | 'PROJECT_OWNER';

export type RepoSource = 'ZIP_UPLOAD' | 'GIT_HTTPS' | 'GIT_SSH';

export type JobStatus =
  | 'QUEUED'
  | 'ANALYZING'
  | 'PLANNING'
  | 'MODERNIZING'
  | 'VALIDATING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED';

export type PatchApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVISION_REQUESTED';

export type FindingSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FindingCategory =
  | 'OUTDATED_JAVA_RUNTIME'
  | 'DEPRECATED_DEPENDENCY'
  | 'CVE_VULNERABILITY'
  | 'DEPRECATED_API'
  | 'BREAKING_FRAMEWORK_CHANGE'
  | 'BUILD_CONFIGURATION_ISSUE';

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  repo_source: RepoSource;
  repo_url?: string | null;
  default_branch: string;
  created_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  repo_source?: RepoSource;
  repo_url?: string;
  credential_id?: string;
  default_branch?: string;
}

export interface Job {
  id: string;
  repo_revision_id: string;
  requested_goal: string;
  status: JobStatus;
  version_id: number;
  current_stage: string;
  started_at: string;
  completed_at?: string | null;
}

export interface JobCreate {
  project_id: string;
  repo_revision_id?: string;
  requested_goal?: string;
}

export interface Finding {
  id: string;
  module_name?: string | null;
  category: FindingCategory;
  severity: FindingSeverity;
  file_path: string;
  evidence: Record<string, unknown>;
  recommendation: string;
  upstream_versions?: Record<string, unknown> | null;
}

export interface MigrationStep {
  id: string;
  order: number;
  title: string;
  description: string;
  strategy: 'OPENREWRITE' | 'AI_PATCH' | 'MANUAL';
  target_files: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

export interface MigrationPlan {
  id: string;
  job_id: string;
  ordered_steps: MigrationStep[];
  estimated_complexity: string;
  approval_state: string;
  created_at: string;
}

export interface Patch {
  id: string;
  step_id: string;
  changed_files: string[];
  diff_content: string;
  patch_version: number;
  version_id: number;
  approval_status: PatchApprovalStatus;
  revision_feedback?: string | null;
}

export interface PatchReviewAction {
  action: 'APPROVE' | 'REJECT' | 'REVISION_REQUESTED';
  version_id: number;
  feedback?: string;
}

export interface SSELogEvent {
  job_id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  stage: string;
  message: string;
}
