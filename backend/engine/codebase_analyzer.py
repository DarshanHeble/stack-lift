"""Unified Codebase Analyzer.

Combines POM parsing, AST structural analysis, and upstream version resolution
into a coherent CodebaseAnalysisResult.
"""

from pathlib import Path
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

from backend.engine.models import PomModel, ASTFileInfo, UpstreamVersionTargets
from backend.engine.pom_parser import PomParser
from backend.engine.ast_analyzer import JavaASTAnalyzer
from backend.engine.upstream_resolver import UpstreamVersionResolver


class AnalysisSummary(BaseModel):
    root_pom_path: Optional[str] = None
    java_version: Optional[str] = None
    build_system: str = "MAVEN"
    has_wrapper: bool = False
    detected_frameworks: Dict[str, str] = Field(default_factory=dict)
    total_modules: int = 0
    total_java_files: int = 0
    total_dependencies: int = 0
    outdated_dependencies: Dict[str, UpstreamVersionTargets] = Field(default_factory=dict)
    javax_migration_needed: bool = False
    reflection_detected: bool = False


class CodebaseAnalysisResult(BaseModel):
    summary: AnalysisSummary
    poms: Dict[str, PomModel] = Field(default_factory=dict)
    ast_summary_index: Dict[str, Dict] = Field(default_factory=dict)


class CodebaseAnalyzer:
    """Master orchestrator for Step 1 repository analysis."""

    def __init__(self, repo_dir: str):
        self.repo_dir = Path(repo_dir).resolve()
        self.pom_parser = PomParser(str(self.repo_dir))
        self.ast_analyzer = JavaASTAnalyzer()
        self.version_resolver = UpstreamVersionResolver()

    async def analyze(self, resolve_upstream: bool = False) -> CodebaseAnalysisResult:
        """Executes full multi-module POM parsing and AST extraction."""
        # 1. Parse POM reactor
        poms = self.pom_parser.parse_repository()
        
        # 2. Analyze Java source files
        ast_files = self.ast_analyzer.analyze_repository(str(self.repo_dir))
        ast_index = self.ast_analyzer.build_summary_index(ast_files)

        # 3. Aggregate findings
        root_pom: Optional[PomModel] = None
        for p in poms.values():
            if p.relative_path == "pom.xml" or not root_pom:
                root_pom = p

        java_ver = None
        frameworks: Dict[str, str] = {}
        has_wrapper = False
        all_deps = []

        if root_pom:
            java_ver = root_pom.source_version or root_pom.target_version or root_pom.release_version
            frameworks.update(root_pom.frameworks)
            has_wrapper = root_pom.has_wrapper

        for p in poms.values():
            all_deps.extend(p.dependencies)
            frameworks.update(p.frameworks)
            if p.has_wrapper:
                has_wrapper = True

        # Check javax / reflection flags
        javax_needed = any(f.has_javax_imports for f in ast_files)
        reflection_found = any(f.has_reflection for f in ast_files)

        # 4. Optional Upstream Version Resolution
        outdated: Dict[str, UpstreamVersionTargets] = {}
        if resolve_upstream:
            for dep in all_deps:
                if dep.version and not dep.version.startswith("$"):
                    key = f"{dep.group_id}:{dep.artifact_id}"
                    if key not in outdated:
                        targets = await self.version_resolver.resolve_dependency(
                            dep.group_id, dep.artifact_id, dep.version
                        )
                        if targets and (targets.latest_patch or targets.latest_minor or targets.latest_major):
                            outdated[key] = targets

        summary = AnalysisSummary(
            root_pom_path=root_pom.file_path if root_pom else None,
            java_version=java_ver,
            build_system="MAVEN",
            has_wrapper=has_wrapper,
            detected_frameworks=frameworks,
            total_modules=len(poms),
            total_java_files=len(ast_files),
            total_dependencies=len(all_deps),
            outdated_dependencies=outdated,
            javax_migration_needed=javax_needed,
            reflection_detected=reflection_found,
        )

        return CodebaseAnalysisResult(
            summary=summary,
            poms=poms,
            ast_summary_index=ast_index,
        )
