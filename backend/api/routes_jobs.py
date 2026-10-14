"""Modernization job orchestration REST API endpoints.

Handles:
- Enqueueing modernization jobs.
- Fetching job state (for SSE reconciliation).
- State transitions with Optimistic Concurrency Control (OCC).
"""

from typing import List
from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.session import get_db
from backend.db.models import RepositoryRevision, ModernizationJob, JobStatus, AuditEvent
from backend.schemas.api import JobCreate, JobResponse, JobStatusUpdate
from backend.core.events import broadcaster
from backend.core.exceptions import ResourceNotFoundException, ConflictException, ValidationException
from backend.worker.pipeline_executor import run_modernization_pipeline

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_job(
    payload: JobCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Enqueues a new modernization job for a repository revision."""
    rev_id = payload.repo_revision_id
    if not rev_id:
        # Auto-discover most recently ingested revision for project
        rev_res = await db.execute(
            select(RepositoryRevision)
            .where(RepositoryRevision.project_id == payload.project_id)
            .order_by(RepositoryRevision.ingested_at.desc())
        )
        rev = rev_res.scalars().first()
        if not rev:
            raise ValidationException("Project has no ingested repository revisions")
        rev_id = rev.id

    job = ModernizationJob(
        repo_revision_id=rev_id,
        requested_goal=payload.requested_goal,
        status=JobStatus.QUEUED,
        current_stage="Job Enqueued",
        version_id=1,  # Initial OCC version
    )
    db.add(job)
    await db.flush()
    await db.refresh(job)

    # Persist audit record
    audit = AuditEvent(
        action="JOB_QUEUED",
        associated_job_id=job.id,
        event_metadata={"goal": job.requested_goal},
    )
    db.add(audit)
    await db.commit()

    # Trigger async modernization pipeline execution
    background_tasks.add_task(run_modernization_pipeline, job.id)

    return job


@router.get("", response_model=List[JobResponse])
async def list_jobs(db: AsyncSession = Depends(get_db)):
    """Lists all modernization jobs across all projects."""
    result = await db.execute(select(ModernizationJob).order_by(ModernizationJob.started_at.desc()))
    return result.scalars().all()


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    """Fetches job by ID (used for frontend SSE reconnect state reconciliation)."""
    result = await db.execute(select(ModernizationJob).where(ModernizationJob.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise ResourceNotFoundException("Job not found")
    return job


@router.patch("/{job_id}/status", response_model=JobResponse)
async def update_job_status(job_id: str, payload: JobStatusUpdate, db: AsyncSession = Depends(get_db)):
    """Updates job state protected by Optimistic Concurrency Control (OCC)."""
    result = await db.execute(select(ModernizationJob).where(ModernizationJob.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise ResourceNotFoundException("Job not found")

    # Reject if version does not match (concurrent modification guard)
    if job.version_id != payload.version_id:
        raise ConflictException(
            f"Conflict: Job modified concurrently. Expected version {payload.version_id}, found {job.version_id}"
        )

    job.status = payload.status
    job.current_stage = payload.current_stage
    job.version_id += 1  # Increment version on mutation
    if payload.diagnostic_summary:
        job.diagnostic_summary = payload.diagnostic_summary

    await db.flush()
    await db.refresh(job)

    # Broadcast real-time stage change to connected SSE listeners
    await broadcaster.broadcast(
        job_id=job.id,
        event_type="stage_change",
        payload={"stage": job.current_stage, "status": job.status.value, "version_id": job.version_id},
    )
    return job
