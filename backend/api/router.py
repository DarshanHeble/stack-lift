"""Aggregated API router mounting all modular resource sub-routers."""

from fastapi import APIRouter

from backend.api.routes_projects import router as projects_router
from backend.api.routes_jobs import router as jobs_router
from backend.api.routes_plans import router as plans_router
from backend.api.routes_patches import router as patches_router
from backend.api.routes_stream import router as stream_router

# Central API v1 router
api_router = APIRouter()

# Register modular sub-routers
api_router.include_router(projects_router)
api_router.include_router(jobs_router)
api_router.include_router(plans_router)
api_router.include_router(patches_router)
api_router.include_router(stream_router)
