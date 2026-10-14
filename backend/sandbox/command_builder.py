"""Docker Sandbox configuration and command builder."""

from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel, Field


class SandboxConfig(BaseModel):
    """Resource constraints and security profiles for sandboxed execution."""
    cpu_quota: float = 2.0
    memory_limit: str = "4g"
    pids_limit: int = 100
    tmpfs_workspace_size: str = "2g"
    tmpfs_temp_size: str = "512m"
    user: str = "10001:10001"
    timeout_seconds: int = 300


class DockerCommandBuilder:
    """Builds hardened Docker CLI commands with dynamic JDK selection and mvnw support."""

    JDK_IMAGE_MAP = {
        "1.8": "stacklift/sandbox-java8:latest",
        "8": "stacklift/sandbox-java8:latest",
        "11": "stacklift/sandbox-java11:latest",
        "17": "stacklift/sandbox-java17:latest",
        "21": "stacklift/sandbox-java21:latest",
    }
    DEFAULT_IMAGE = "stacklift/sandbox-java17:latest"

    @classmethod
    def resolve_image(cls, java_version: Optional[str]) -> str:
        """Selects appropriate hardened Docker image based on detected Java runtime."""
        if not java_version:
            return cls.DEFAULT_IMAGE
        clean_v = java_version.strip()
        return cls.JDK_IMAGE_MAP.get(clean_v, cls.DEFAULT_IMAGE)

    @classmethod
    def resolve_mvn_bin(cls, workspace_root: Path) -> str:
        """Prefers ./mvnw if present and executable, else falls back to mvn."""
        if (workspace_root / "mvnw").is_file():
            return "./mvnw"
        return "mvn"

    @classmethod
    def build_stage1_command(cls, workspace_root: Path, m2_cache_dir: Path) -> List[str]:
        """Stage 1: Pre-flight dependency download with network ENABLED."""
        mvn_bin = cls.resolve_mvn_bin(workspace_root)
        return [
            mvn_bin,
            "dependency:go-offline",
            "dependency:resolve-plugins",
            "-B",
            "-fn",
            f"-Dmaven.repo.local={str(m2_cache_dir)}",
        ]

    @classmethod
    def build_stage2_docker_args(
        cls,
        run_id: str,
        workspace_root: Path,
        m2_cache_dir: Path,
        java_version: Optional[str] = None,
        config: Optional[SandboxConfig] = None,
    ) -> List[str]:
        """Stage 2: Offline sandboxed execution with --network none and read-only caches."""
        cfg = config or SandboxConfig()
        image = cls.resolve_image(java_version)
        mvn_bin = cls.resolve_mvn_bin(workspace_root)

        return [
            "docker", "run", "--rm",
            "--name", f"sandbox-val-{run_id}",
            "--network", "none",
            "--read-only",
            "--user", cfg.user,
            "--cap-drop", "ALL",
            "--security-opt", "no-new-privileges:true",
            "--memory", cfg.memory_limit,
            "--cpus", str(cfg.cpu_quota),
            "--pids-limit", str(cfg.pids_limit),
            "--tmpfs", f"/workspace:rw,noexec,nosuid,size={cfg.tmpfs_workspace_size}",
            "--tmpfs", f"/tmp:rw,noexec,nosuid,size={cfg.tmpfs_temp_size}",
            "-v", f"{str(m2_cache_dir)}:/home/builduser/.m2/repository:ro",
            "-v", f"{str(workspace_root)}:/workspace:rw",
            image,
            mvn_bin, "clean", "test", "--offline",
        ]
