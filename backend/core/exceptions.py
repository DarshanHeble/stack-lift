"""Standard domain exception hierarchy for StackLift."""

from typing import Optional, Dict, Any


class StackLiftException(Exception):
    """Base class for all business/domain exceptions in StackLift."""

    status_code: int = 500
    error_code: str = "INTERNAL_SERVER_ERROR"

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class ResourceNotFoundException(StackLiftException):
    """Raised when a requested resource (Project, Job, Patch, Plan) does not exist."""

    status_code: int = 404
    error_code: str = "RESOURCE_NOT_FOUND"


class ConflictException(StackLiftException):
    """Raised on concurrency conflicts (OCC version mismatch, duplicate keys)."""

    status_code: int = 409
    error_code: str = "RESOURCE_CONFLICT"


class ValidationException(StackLiftException):
    """Raised when client inputs or uploaded archives fail business validation."""

    status_code: int = 400
    error_code: str = "VALIDATION_ERROR"



class SandboxExecutionException(StackLiftException):
    """Raised when an isolated sandbox runner execution errors out."""

    status_code: int = 502
    error_code: str = "SANDBOX_EXECUTION_FAILURE"
