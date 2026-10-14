"""Project management REST API endpoints.

Handles:
- Registering modernization projects.
- Listing active projects.
- Fetching project details by ID.
"""

from typing import List
from fastapi import APIRouter, Depends, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.session import get_db
from backend.db.models import Project, AuditEvent
from backend.schemas.api import ProjectCreate, ProjectResponse
from backend.core.exceptions import ResourceNotFoundException, ValidationException

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(payload: ProjectCreate, db: AsyncSession = Depends(get_db)):
    """Registers a new modernization project and creates audit log."""
    project = Project(
        name=payload.name,
        description=payload.description,
        repo_source=payload.repo_source,
        repo_url=payload.repo_url,
        credential_id=payload.credential_id,
        default_branch=payload.default_branch,
    )
    db.add(project)
    await db.flush()
    await db.refresh(project)

    # Record audit event
    audit = AuditEvent(
        action="PROJECT_CREATED",
        event_metadata={"project_id": project.id, "name": project.name}
    )
    db.add(audit)
    await db.commit()
    return project


@router.get("", response_model=List[ProjectResponse])
async def list_projects(db: AsyncSession = Depends(get_db)):
    """Lists all registered modernization projects."""
    result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    return result.scalars().all()


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    """Fetches a specific project by unique ID."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise ResourceNotFoundException("Project not found")
    return project


@router.get("/{project_id}/jobs")
async def get_project_jobs(project_id: str, db: AsyncSession = Depends(get_db)):
    """Fetches all modernization jobs for a project."""
    from backend.db.models import ModernizationJob, RepositoryRevision
    result = await db.execute(
        select(ModernizationJob)
        .join(RepositoryRevision, ModernizationJob.repo_revision_id == RepositoryRevision.id)
        .where(RepositoryRevision.project_id == project_id)
        .order_by(ModernizationJob.started_at.desc())
    )
    jobs = result.scalars().all()
    return jobs


@router.post("/{project_id}/upload-zip")
async def upload_project_zip(
    project_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Ingests a repository ZIP archive safely with Zip Slip path-traversal protection."""
    import os
    import zipfile
    import hashlib
    from pathlib import Path
    from backend.db.models import RepositoryRevision
    from backend.core.config import settings

    # 1. Verify project exists
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise ResourceNotFoundException("Project not found")

    # 2. Prepare workspace target directory
    extract_dir = Path(settings.WORKSPACE_STORAGE_PATH) / project_id
    extract_dir.mkdir(parents=True, exist_ok=True)

    # 3. Read content & compute SHA-256
    content = await file.read()
    if not content:
        raise ValidationException("Uploaded file is empty")

    sha256_hash = hashlib.sha256(content).hexdigest()

    # 4. Safe ZIP extraction guarding against Zip Slip path traversal
    zip_path = extract_dir / "uploaded_source.zip"
    with open(zip_path, "wb") as f:
        f.write(content)

    resolved_extract = extract_dir.resolve()
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        for member in zip_ref.namelist():
            target_path = (extract_dir / member).resolve()
            if not str(target_path).startswith(str(resolved_extract)):
                raise ValidationException("Illegal Zip Slip archive entry detected")
        zip_ref.extractall(extract_dir)

    # 5. Persist RepositoryRevision
    revision = RepositoryRevision(
        project_id=project.id,
        commit_sha=sha256_hash[:16],
        storage_path=str(extract_dir),
    )
    db.add(revision)
    await db.flush()
    await db.refresh(revision)

    # 6. Audit event
    audit = AuditEvent(
        action="REPOSITORY_INGESTED",
        event_metadata={"project_id": project.id, "revision_id": revision.id, "sha256": sha256_hash},
    )
    db.add(audit)
    await db.commit()

    return {
        "status": "INGESTED",
        "project_id": project.id,
        "revision_id": revision.id,
        "commit_sha": revision.commit_sha,
        "storage_path": revision.storage_path,
    }
