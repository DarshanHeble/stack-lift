"""Integration and unit tests for Step 2 Backend Architecture."""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from backend.main import create_app
from backend.db.session import Base, get_db
from backend.core.security import crypto
from backend.db.models import Project, ModernizationJob, JobStatus, Patch, PatchApprovalStatus


# In-memory SQLite async test database
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture
async def test_session():
    test_engine = create_async_engine(TEST_DB_URL, echo=False)
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    TestSession = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)
    async with TestSession() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


@pytest_asyncio.fixture
async def client(test_session: AsyncSession):
    app = create_app()

    async def override_get_db():
        yield test_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


def test_fernet_credential_encryption():
    secret = "ghp_PersonalAccessTokenSecret12345"
    encrypted = crypto.encrypt(secret)
    assert encrypted != secret.encode()
    decrypted = crypto.decrypt(encrypted)
    assert decrypted == secret


@pytest.mark.asyncio
async def test_health_check_endpoint(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"

    resp_v1 = await client.get("/api/v1/health")
    assert resp_v1.status_code == 200
    assert resp_v1.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_project_creation_and_listing(client: AsyncClient):
    payload = {
        "name": "Legacy Enterprise App",
        "description": "Monolithic legacy Spring Boot 2 app",
        "repo_source": "ZIP_UPLOAD",
        "default_branch": "main",
    }
    resp = await client.post("/api/v1/projects", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == payload["name"]
    project_id = data["id"]

    # List projects
    list_resp = await client.get("/api/v1/projects")
    assert list_resp.status_code == 200
    projects = list_resp.json()
    assert len(projects) == 1
    assert projects[0]["id"] == project_id


@pytest.mark.asyncio
async def test_optimistic_concurrency_control_on_patch_review(client: AsyncClient, test_session: AsyncSession):
    # Setup sample patch
    patch = Patch(
        step_id="step_1",
        changed_files=["pom.xml"],
        diff_content="--- a/pom.xml\n+++ b/pom.xml",
        patch_version=1,
        version_id=1,
        source_revision_sha="a1b2c3d4",
        approval_status=PatchApprovalStatus.PENDING,
    )
    test_session.add(patch)
    await test_session.commit()
    await test_session.refresh(patch)

    # 1. First review succeeds with version_id=1
    review_payload = {
        "action": "APPROVE",
        "version_id": 1,
    }
    resp = await client.post(f"/api/v1/patches/{patch.id}/review", json=review_payload)
    assert resp.status_code == 200
    updated_patch = resp.json()
    assert updated_patch["approval_status"] == "APPROVED"
    assert updated_patch["version_id"] == 2

    # 2. Second concurrent review with stale version_id=1 MUST be rejected with HTTP 409 Conflict
    stale_review_payload = {
        "action": "REJECT",
        "version_id": 1,  # Stale version!
    }
    conflict_resp = await client.post(f"/api/v1/patches/{patch.id}/review", json=stale_review_payload)
    assert conflict_resp.status_code == 409
    assert "Conflict" in conflict_resp.json()["detail"]


@pytest.mark.asyncio
async def test_optimistic_concurrency_control_on_job_status(client: AsyncClient, test_session: AsyncSession):
    # Setup sample project and revision
    project = Project(name="Test Proj", repo_source="ZIP_UPLOAD")
    test_session.add(project)
    await test_session.flush()

    from backend.db.models import RepositoryRevision
    rev = RepositoryRevision(
        project_id=project.id,
        commit_sha="sha123",
        detected_build_system="MAVEN_3",
        storage_path="/tmp/test",
    )
    test_session.add(rev)
    await test_session.flush()

    job = ModernizationJob(
        repo_revision_id=rev.id,
        requested_goal="UPGRADE_JAVA_17",
        status=JobStatus.QUEUED,
        version_id=1,
    )
    test_session.add(job)
    await test_session.commit()
    await test_session.refresh(job)

    # Valid status transition (1 -> 2)
    update_payload = {
        "status": "ANALYZING",
        "current_stage": "Analyzing POM",
        "version_id": 1,
    }
    resp = await client.patch(f"/api/v1/jobs/{job.id}/status", json=update_payload)
    assert resp.status_code == 200
    assert resp.json()["status"] == "ANALYZING"
    assert resp.json()["version_id"] == 2

    # Stale status update (sending 1 instead of 2) -> 409 Conflict
    stale_payload = {
        "status": "PLANNING",
        "current_stage": "Generating Plan",
        "version_id": 1,
    }
    conflict_resp = await client.patch(f"/api/v1/jobs/{job.id}/status", json=stale_payload)
    assert conflict_resp.status_code == 409


@pytest.mark.asyncio
async def test_get_job_plan_and_findings(client: AsyncClient, test_session: AsyncSession):
    from backend.db.models import RepositoryRevision, MigrationPlan, Finding, FindingCategory, FindingSeverity

    project = Project(name="Plan Test Proj", repo_source="ZIP_UPLOAD")
    test_session.add(project)
    await test_session.flush()

    rev = RepositoryRevision(
        project_id=project.id,
        commit_sha="plan_sha",
        storage_path="/tmp/plan",
    )
    test_session.add(rev)
    await test_session.flush()

    job = ModernizationJob(
        repo_revision_id=rev.id,
        requested_goal="SPRING_BOOT_3",
        status=JobStatus.AWAITING_REVIEW,
        version_id=1,
    )
    test_session.add(job)
    await test_session.flush()

    plan = MigrationPlan(
        job_id=job.id,
        ordered_steps=[{"step": 1, "title": "Migrate to Spring Boot 3"}],
        estimated_complexity="HIGH",
        approval_state="PENDING",
    )
    test_session.add(plan)

    finding = Finding(
        repo_revision_id=rev.id,
        category=FindingCategory.DEPENDENCY_OUTDATED,
        severity=FindingSeverity.HIGH,
        file_path="pom.xml",
        recommendation="Upgrade Spring Boot",
    )
    test_session.add(finding)
    await test_session.commit()

    # Test Plan retrieval
    plan_resp = await client.get(f"/api/v1/jobs/{job.id}/plan")
    assert plan_resp.status_code == 200
    assert plan_resp.json()["estimated_complexity"] == "HIGH"
    assert len(plan_resp.json()["ordered_steps"]) == 1

    # Test Findings retrieval
    findings_resp = await client.get(f"/api/v1/jobs/{job.id}/findings")
    assert findings_resp.status_code == 200
    assert len(findings_resp.json()) == 1
    assert findings_resp.json()[0]["file_path"] == "pom.xml"


@pytest.mark.asyncio
async def test_get_patch_by_step_id(client: AsyncClient, test_session: AsyncSession):
    patch = Patch(
        step_id="step-unique-xyz",
        source_revision_sha="abc1234",
        changed_files=["pom.xml"],
        diff_content="--- pom.xml\n+++ pom.xml",
        patch_version=1,
        version_id=1,
        approval_status=PatchApprovalStatus.PENDING,
    )
    test_session.add(patch)
    await test_session.commit()

    resp = await client.get("/api/v1/patches/step/step-unique-xyz")
    assert resp.status_code == 200
    assert resp.json()["step_id"] == "step-unique-xyz"
    assert resp.json()["diff_content"] == "--- pom.xml\n+++ pom.xml"

    # Non-existent step returns 404
    missing_resp = await client.get("/api/v1/patches/step/step-nonexistent")
    assert missing_resp.status_code == 404


@pytest.mark.asyncio
async def test_upload_project_zip_success(client: AsyncClient, test_session: AsyncSession):
    import io
    import zipfile

    # 1. Create project
    proj = Project(name="Upload Test", repo_source="ZIP_UPLOAD")
    test_session.add(proj)
    await test_session.commit()

    # 2. Build in-memory safe zip
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("pom.xml", "<project><modelVersion>4.0.0</modelVersion></project>")
        zf.writestr("src/Main.java", "public class Main {}")
    zip_buffer.seek(0)

    # 3. Post to upload endpoint
    files = {"file": ("repo.zip", zip_buffer, "application/zip")}
    resp = await client.post(f"/api/v1/projects/{proj.id}/upload-zip", files=files)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "INGESTED"
    assert data["project_id"] == proj.id
    assert "revision_id" in data
    assert len(data["commit_sha"]) == 16


@pytest.mark.asyncio
async def test_upload_project_zip_slip_rejected(client: AsyncClient, test_session: AsyncSession):
    import io
    import zipfile

    proj = Project(name="ZipSlip Test", repo_source="ZIP_UPLOAD")
    test_session.add(proj)
    await test_session.commit()

    # Build malicious zip containing parent path traversal (../../evil.sh)
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("../../evil.sh", "echo pwned")
    zip_buffer.seek(0)

    files = {"file": ("malicious.zip", zip_buffer, "application/zip")}
    resp = await client.post(f"/api/v1/projects/{proj.id}/upload-zip", files=files)
    assert resp.status_code == 400
    assert "Zip Slip" in resp.json()["detail"]
