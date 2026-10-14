"""Migration plan and codebase findings REST API endpoints.

Handles:
- Fetching generated migration plan steps with prerequisites.
- Fetching static analysis and vulnerability findings.
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.session import get_db
from backend.db.models import ModernizationJob, MigrationPlan, Finding
from backend.schemas.api import MigrationPlanResponse, FindingResponse
from backend.core.exceptions import ResourceNotFoundException

router = APIRouter(prefix="/jobs/{job_id}", tags=["Plan & Findings"])


@router.get("/plan", response_model=MigrationPlanResponse)
async def get_job_plan(job_id: str, db: AsyncSession = Depends(get_db)):
    """Fetches the generated migration plan for a modernization job."""
    result = await db.execute(select(MigrationPlan).where(MigrationPlan.job_id == job_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise ResourceNotFoundException("Migration plan not found for this job")
    return plan


@router.get("/findings", response_model=List[FindingResponse])
async def get_job_findings(job_id: str, db: AsyncSession = Depends(get_db)):
    """Fetches all static code and CVE vulnerability findings for a job's revision."""
    job_res = await db.execute(select(ModernizationJob).where(ModernizationJob.id == job_id))
    job = job_res.scalar_one_or_none()
    if not job:
        raise ResourceNotFoundException("Job not found")

    findings_res = await db.execute(
        select(Finding).where(Finding.repo_revision_id == job.repo_revision_id)
    )
    return findings_res.scalars().all()
