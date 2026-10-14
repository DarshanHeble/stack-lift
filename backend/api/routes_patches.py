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
    """Fetches the active patch associated with a migration plan step."""
    result = await db.execute(
        select(Patch)
        .where(Patch.step_id == step_id)
        .order_by(Patch.patch_version.desc())
    )
    patch = result.scalars().first()
    if not patch:
        raise ResourceNotFoundException("Patch not found for step")
    return patch
