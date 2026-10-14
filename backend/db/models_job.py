"""Modernization Job, Plan, and Findings database models."""

import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.types import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db.session import Base
from backend.db.enums import JobStatus, FindingCategory, FindingSeverity


class ModernizationJob(Base):
    __tablename__ = "modernization_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    repo_revision_id: Mapped[str] = mapped_column(String(36), ForeignKey("repository_revisions.id", ondelete="CASCADE"), nullable=False)
    requested_goal: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[JobStatus] = mapped_column(SQLEnum(JobStatus), default=JobStatus.QUEUED, index=True, nullable=False)
    version_id: Mapped[int] = mapped_column(Integer, default=1, nullable=False)  # OCC locking
    current_stage: Mapped[str] = mapped_column(String(100), default="Initialized", nullable=False)
    working_tree_path: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    diagnostic_summary: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    revision: Mapped["RepositoryRevision"] = relationship("RepositoryRevision", back_populates="jobs")
    plan: Mapped[Optional["MigrationPlan"]] = relationship("MigrationPlan", back_populates="job", uselist=False, cascade="all, delete-orphan")


class MigrationPlan(Base):
    __tablename__ = "migration_plans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id: Mapped[str] = mapped_column(String(36), ForeignKey("modernization_jobs.id", ondelete="CASCADE"), unique=True, nullable=False)
    ordered_steps: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    estimated_complexity: Mapped[str] = mapped_column(String(20), default="MEDIUM", nullable=False)
    approval_state: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    job: Mapped["ModernizationJob"] = relationship("ModernizationJob", back_populates="plan")


class Finding(Base):
    __tablename__ = "findings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    repo_revision_id: Mapped[str] = mapped_column(String(36), ForeignKey("repository_revisions.id", ondelete="CASCADE"), nullable=False)
    module_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    category: Mapped[FindingCategory] = mapped_column(SQLEnum(FindingCategory), nullable=False)
    severity: Mapped[FindingSeverity] = mapped_column(SQLEnum(FindingSeverity), default=FindingSeverity.INFO, nullable=False)
    file_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    evidence: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    upstream_versions: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    revision: Mapped["RepositoryRevision"] = relationship("RepositoryRevision", back_populates="findings")
