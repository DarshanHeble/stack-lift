"""Global exception handlers for FastAPI application.

Eliminates repetitive try/except blocks across route handlers by catching
domain exceptions, Pydantic validation errors, SQLAlchemy database errors,
and unhandled system exceptions in a single centralized location.
"""

import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

from backend.core.exceptions import StackLiftException

logger = logging.getLogger(__name__)


def setup_global_exception_handlers(app: FastAPI) -> None:
    """Registers global exception handlers on the FastAPI app instance."""

    @app.exception_handler(StackLiftException)
    async def handle_stacklift_exception(_: Request, exc: StackLiftException):
        """Catches all domain exceptions across all modules."""
        logger.warning(f"Domain error [{exc.error_code}]: {exc.message} (details={exc.details})")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.error_code,
                    "message": exc.message,
                    "details": exc.details,
                },
                "detail": exc.message,  # Backwards-compatibility with FastAPI default
            },
        )

    @app.exception_handler(RequestValidationError)
    async def handle_request_validation_error(_: Request, exc: RequestValidationError):
        """Standardizes schema validation errors from FastAPI/Pydantic."""
        errors = exc.errors()
        logger.info(f"Request validation failure: {errors}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "code": "SCHEMA_VALIDATION_ERROR",
                    "message": "The request payload failed schema validation.",
                    "details": {"validation_errors": errors},
                },
                "detail": str(errors),
            },
        )

    @app.exception_handler(ValidationError)
    async def handle_pydantic_validation_error(_: Request, exc: ValidationError):
        """Standardizes direct Pydantic model validation errors."""
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "code": "DATA_VALIDATION_ERROR",
                    "message": "Data failed model validation.",
                    "details": {"errors": exc.errors()},
                },
                "detail": str(exc.errors()),
            },
        )

    @app.exception_handler(Exception)
    async def handle_unhandled_exception(_: Request, exc: Exception):
        """Last-resort fallback handler for unhandled server crashes."""
        logger.exception(f"Unhandled system error: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An internal server error occurred. Please contact system support.",
                    "details": {},
                },
                "detail": "Internal server error",
            },
        )
