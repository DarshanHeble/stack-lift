"""Project and Repository revision ORM models."""

import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.types import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db.session import Base
from backend.db.enums import RepoSource


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    repo_source: Mapped[RepoSource] = mapped_column(SQLEnum(RepoSource), default=RepoSource.ZIP_UPLOAD, nullable=False)
    repo_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    credential_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("integration_credentials.id", ondelete="SET NULL"), nullable=True)
    default_branch: Mapped[str] = mapped_column(String(100), default="main", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    revisions: Mapped[List["RepositoryRevision"]] = relationship("RepositoryRevision", back_populates="project", cascade="all, delete-orphan")


class RepositoryRevision(Base):
    __tablename__ = "repository_revisions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    commit_sha: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    detected_build_system: Mapped[str] = mapped_column(String(50), default="MAVEN_3", nullable=False)
    language_and_frameworks: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    module_structure: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    storage_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    project: Mapped["Project"] = relationship("Project", back_populates="revisions")
    jobs: Mapped[List["ModernizationJob"]] = relationship("ModernizationJob", back_populates="revision", cascade="all, delete-orphan")
    findings: Mapped[List["Finding"]] = relationship("Finding", back_populates="revision", cascade="all, delete-orphan")
