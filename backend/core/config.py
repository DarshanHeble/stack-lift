"""Application configuration settings using pydantic-settings."""

from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "StackLift API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/stacklift",
        description="Async SQLAlchemy database connection string"
    )
    DB_ECHO: bool = False
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    # Redis & Job Queues
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security & Encryption (Fernet key for integration credentials)
    # Generate in production via: cryptography.fernet.Fernet.generate_key().decode()
    SECRET_KEY: str = "stacklift-dev-secret-key-32chars-min!!"
    FERNET_KEY: str = "7j0v6Vf1K-tS6k4Y_fG4hN6X5Q1u9Z4t8R2b6m8p0wA="

    # Storage Paths
    ARTIFACT_STORAGE_PATH: str = "/tmp/stacklift/artifacts"
    WORKSPACE_STORAGE_PATH: str = "/tmp/stacklift/workspaces"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]


settings = Settings()
