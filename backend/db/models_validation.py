"""Patch review, container validation run, and audit event models."""

import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy import String, Text, Boolean, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.types import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db.session import Base
from backend.db.enums import PatchApprovalStatus, BuildResult


class Patch(Base):
    __tablename__ = "patches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    step_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    changed_files: Mapped[List[str]] = mapped_column(JSON, default=list)
    diff_content: Mapped[str] = mapped_column(Text, nullable=False)
    raw_ai_blocks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    patch_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    version_id: Mapped[int] = mapped_column(Integer, default=1, nullable=False)  # OCC locking
    revision_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_revision_sha: Mapped[str] = mapped_column(String(64), nullable=False)
    approval_status: Mapped[PatchApprovalStatus] = mapped_column(SQLEnum(PatchApprovalStatus), default=PatchApprovalStatus.PENDING, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    validations: Mapped[List["ValidationRun"]] = relationship("ValidationRun", back_populates="patch", cascade="all, delete-orphan")


class ValidationRun(Base):
    __tablename__ = "validation_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patch_id: Mapped[str] = mapped_column(String(36), ForeignKey("patches.id", ondelete="CASCADE"), nullable=False)
    build_result: Mapped[BuildResult] = mapped_column(SQLEnum(BuildResult), nullable=False)
    test_result: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    integration_tests_skipped: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    integration_test_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    scanner_results: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    log_storage_uri: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    patch: Mapped["Patch"] = relationship("Patch", back_populates="validations")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    associated_job_id: Mapped[Optional[str]] = mapped_column(String(36), index=True, nullable=True)
    event_metadata: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
