"""Tests for asynchronous modernization pipeline execution."""

import pytest
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

from backend.db.session import Base
from backend.db.models import (
    Project,
    RepositoryRevision,
    ModernizationJob,
    JobStatus,
    MigrationPlan,
    Finding,
    Patch,
    RepoSource,
)
from backend.worker.pipeline_executor import run_modernization_pipeline


@pytest.fixture
async def in_memory_db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    Session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as session:
        yield session
    await engine.dispose()


@pytest.mark.asyncio
async def test_pipeline_executor_end_to_end(in_memory_db: AsyncSession):
    # Setup project and revision pointing to sample legacy spring app
    project = Project(
        name="Legacy App Test",
        repo_source=RepoSource.ZIP_UPLOAD,
        repo_url="examples/legacy-spring-app",
    )
    in_memory_db.add(project)
    await in_memory_db.flush()

    revision = RepositoryRevision(
        project_id=project.id,
        commit_sha="a1b2c3d4e5",
        storage_path="examples/legacy-spring-app",
    )
    in_memory_db.add(revision)
    await in_memory_db.flush()

    job = ModernizationJob(
        repo_revision_id=revision.id,
        requested_goal="Upgrade to Spring Boot 3 & Java 17",
        status=JobStatus.QUEUED,
        current_stage="Job Enqueued",
        version_id=1,
    )
    in_memory_db.add(job)
    await in_memory_db.commit()

    # Execute pipeline
    await run_modernization_pipeline(job.id, in_memory_db)

    # Refresh job state
    res = await in_memory_db.execute(select(ModernizationJob).where(ModernizationJob.id == job.id))
    updated_job = res.scalar_one()

    # Verify status progressed to AWAITING_REVIEW
    assert updated_job.status == JobStatus.AWAITING_REVIEW
    assert "Awaiting Code Review" in updated_job.current_stage

    # Verify MigrationPlan was created
    plan_res = await in_memory_db.execute(select(MigrationPlan).where(MigrationPlan.job_id == job.id))
    plan = plan_res.scalar_one_or_none()
    assert plan is not None
    assert len(plan.ordered_steps) >= 2
    assert plan.ordered_steps[0]["target_files"] == ["pom.xml"]

    # Verify Findings were created
    find_res = await in_memory_db.execute(select(Finding).where(Finding.repo_revision_id == revision.id))
    findings = find_res.scalars().all()
    assert len(findings) > 0
    assert any("jakarta" in f.recommendation for f in findings)

    # Verify Patch was generated
    patch_res = await in_memory_db.execute(select(Patch).where(Patch.step_id == f"{job.id}-step-1"))
    patch = patch_res.scalar_one_or_none()
    assert patch is not None
    assert "pom.xml" in patch.changed_files
    assert "+    <java.version>17</java.version>" in patch.diff_content
