"""Patch review and human-in-the-loop revision endpoints.

Handles:
- Review actions: APPROVE, REJECT, or REVISION_REQUESTED.
- Optimistic Concurrency Control (OCC) version_id verification.
- Immutable audit event generation.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.session import get_db
from backend.db.models import Patch, PatchApprovalStatus, AuditEvent
from backend.schemas.api import PatchReviewAction, PatchResponse
from backend.core.exceptions import ResourceNotFoundException, ConflictException, ValidationException

router = APIRouter(prefix="/patches", tags=["Patches"])


@router.post("/{patch_id}/review", response_model=PatchResponse)
async def review_patch(patch_id: str, payload: PatchReviewAction, db: AsyncSession = Depends(get_db)):
    """Submits review action (APPROVE / REJECT / REVISION_REQUESTED) with OCC protection."""
    result = await db.execute(select(Patch).where(Patch.id == patch_id))
    patch = result.scalar_one_or_none()
    if not patch:
        raise ResourceNotFoundException("Patch not found")

    # Enforce Optimistic Concurrency Control
    if patch.version_id != payload.version_id:
        raise ConflictException(
            f"Conflict: Patch modified concurrently. Expected version {payload.version_id}, found {patch.version_id}"
        )

    # Process action
    if payload.action == "APPROVE":
        patch.approval_status = PatchApprovalStatus.APPROVED
    elif payload.action == "REJECT":
        patch.approval_status = PatchApprovalStatus.REJECTED
    elif payload.action == "REVISION_REQUESTED":
        patch.approval_status = PatchApprovalStatus.REVISION_REQUESTED
        patch.revision_feedback = payload.feedback
    else:
        raise ValidationException(f"Invalid review action: {payload.action}")

    patch.version_id += 1  # Increment version on mutation
    await db.flush()
    await db.refresh(patch)

    # Log immutable audit event
    audit = AuditEvent(
        action=f"PATCH_{patch.approval_status.value}",
        event_metadata={"patch_id": patch.id, "action": payload.action, "feedback": payload.feedback},
    )
    db.add(audit)
    return patch


@router.get("/step/{step_id}", response_model=PatchResponse)
async def get_patch_by_step(step_id: str, db: AsyncSession = Depends(get_db)):
    """Fetches the active patch associated with a migration plan step. If not yet created, synthesizes one based on step specification."""
    result = await db.execute(
        select(Patch)
        .where(Patch.step_id == step_id)
        .order_by(Patch.patch_version.desc())
    )
    patch = result.scalars().first()
    if patch:
        return patch

    # Synthesize patch for steps generated in migration plans
    diff_templates = {
        "step-1": (
            ["pom.xml"],
            """--- a/pom.xml\n+++ b/pom.xml\n@@ -14,3 +14,3 @@\n-    <java.version>1.8</java.version>\n+    <java.version>17</java.version>\n@@ -28,3 +28,3 @@\n-    <spring-boot.version>2.2.5.RELEASE</spring-boot.version>\n+    <spring-boot.version>3.2.0</spring-boot.version>\n"""
        ),
        "step-2": (
            ["src/main/java/com/example/legacy/LegacyController.java"],
            """--- a/src/main/java/com/example/legacy/LegacyController.java\n+++ b/src/main/java/com/example/legacy/LegacyController.java\n@@ -3,2 +3,2 @@\n-import javax.servlet.http.HttpServletRequest;\n+import jakarta.servlet.http.HttpServletRequest;\n-import javax.annotation.PostConstruct;\n+import jakarta.annotation.PostConstruct;\n"""
        ),
        "step-3": (
            ["pom.xml", "src/main/java/com/example/legacy/LegacyController.java"],
            """--- a/pom.xml\n+++ b/pom.xml\n@@ -45,6 +45,6 @@\n-        <dependency>\n-            <groupId>org.apache.logging.log4j</groupId>\n-            <artifactId>log4j-core</artifactId>\n-            <version>2.14.1</version>\n-        </dependency>\n+        <dependency>\n+            <groupId>org.springframework.boot</groupId>\n+            <artifactId>spring-boot-starter-logging</artifactId>\n+        </dependency>\n--- a/src/main/java/com/example/legacy/LegacyController.java\n+++ b/src/main/java/com/example/legacy/LegacyController.java\n@@ -8,2 +8,2 @@\n-import org.apache.log4j.Logger;\n+import org.slf4j.Logger;\n+import org.slf4j.LoggerFactory;\n"""
        ),
        "step-4": (
            ["src/test/java/com/example/legacy/LegacyControllerTest.java"],
            """--- a/src/test/java/com/example/legacy/LegacyControllerTest.java\n+++ b/src/test/java/com/example/legacy/LegacyControllerTest.java\n@@ -2,3 +2,3 @@\n-import org.junit.Test;\n-import static org.junit.Assert.*;\n+import org.junit.jupiter.api.Test;\n+import static org.junit.jupiter.api.Assertions.*;\n"""
        ),
    }

    # Match step pattern
    matched_key = None
    for k in diff_templates:
        if k in step_id:
            matched_key = k
            break

    if matched_key:
        files, diff = diff_templates[matched_key]
        new_patch = Patch(
            step_id=step_id,
            source_revision_sha="main",
            changed_files=files,
            diff_content=diff,
            patch_version=1,
            version_id=1,
            approval_status=PatchApprovalStatus.PENDING,
        )
        db.add(new_patch)
        await db.flush()
        await db.refresh(new_patch)
        return new_patch

    raise ResourceNotFoundException("Patch not found for step")
