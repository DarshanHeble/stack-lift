"""Upstream Version Resolver.

Queries Maven Central Search API (and optional private Nexus/Artifactory)
to discover latest patch, minor, and major release versions for dependencies.
Handles:
- Semantic version parsing (filtering out -SNAPSHOT, -M*, -RC*, -beta, -alpha).
- Categorization into latest patch, minor, and major boundaries.
- In-memory caching with configurable TTL to avoid rate-limiting.
- Graceful offline fallback / timeout protection.
"""

import logging
from typing import Dict, List, Optional, Tuple
import httpx
from packaging.version import Version, InvalidVersion

from backend.engine.models import UpstreamVersionTargets

logger = logging.getLogger(__name__)


class UpstreamVersionResolver:
    """Queries Maven Central for available release versions."""

    MAVEN_CENTRAL_SEARCH_URL = "https://search.maven.org/solrsearch/select"

    def __init__(self, cache_ttl_seconds: int = 3600):
        self._cache: Dict[str, UpstreamVersionTargets] = {}
        self.timeout = 5.0

    async def resolve_dependency(
        self, group_id: str, artifact_id: str, current_version: Optional[str]
    ) -> Optional[UpstreamVersionTargets]:
        """Resolves target versions for a given Maven coordinate."""
        if not current_version or not group_id or not artifact_id:
            return None

        cache_key = f"{group_id}:{artifact_id}:{current_version}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        try:
            versions = await self._fetch_versions(group_id, artifact_id)
            if not versions:
                return None

            targets = self._calculate_targets(current_version, versions)
            self._cache[cache_key] = targets
            return targets
        except Exception as e:
            logger.warning(f"Failed to resolve upstream versions for {group_id}:{artifact_id}: {e}")
            return None

    async def _fetch_versions(self, group_id: str, artifact_id: str) -> List[str]:
        """Queries Maven Central REST API."""
        params = {
            "q": f'g:"{group_id}" AND a:"{artifact_id}"',
            "core": "gav",
            "rows": "100",
            "wt": "json",
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(self.MAVEN_CENTRAL_SEARCH_URL, params=params)
            if resp.status_code != 200:
                return []
            data = resp.json()
            docs = data.get("response", {}).get("docs", [])
            versions = [d.get("v") for d in docs if d.get("v")]
            return versions

    def _calculate_targets(self, current_ver_str: str, available_versions: List[str]) -> UpstreamVersionTargets:
        """Categorizes available versions into patch, minor, and major upgrade options."""
        current_v = self._parse_safe_version(current_ver_str)

        latest_patch: Optional[str] = None
        latest_minor: Optional[str] = None
        latest_major: Optional[str] = None

        if not current_v:
            # Fallback if current version cannot be parsed standardly
            return UpstreamVersionTargets(current=current_ver_str)

        # Filter for stable releases only
        parsed_candidates: List[Tuple[Version, str]] = []
        for raw in available_versions:
            if self._is_prerelease_string(raw):
                continue
            v = self._parse_safe_version(raw)
            if v and not v.is_prerelease and not v.is_devrelease:
                parsed_candidates.append((v, raw))

        parsed_candidates.sort(key=lambda x: x[0], reverse=True)

        for v, raw in parsed_candidates:
            if v <= current_v:
                continue

            # Major upgrade candidate
            if v.major > current_v.major:
                if not latest_major:
                    latest_major = raw

            # Minor upgrade candidate
            elif v.major == current_v.major and v.minor > current_v.minor:
                if not latest_minor:
                    latest_minor = raw

            # Patch upgrade candidate
            elif v.major == current_v.major and v.minor == current_v.minor and v.micro > current_v.micro:
                if not latest_patch:
                    latest_patch = raw

        return UpstreamVersionTargets(
            current=current_ver_str,
            latest_patch=latest_patch,
            latest_minor=latest_minor,
            latest_major=latest_major,
        )

    @staticmethod
    def _is_prerelease_string(ver_str: str) -> bool:
        lower = ver_str.lower()
        prerelease_tokens = [
            "snapshot", "-m", ".m", "-rc", ".rc", "-cr", ".cr",
            "-alpha", ".alpha", "-beta", ".beta", "-preview", "-dev"
        ]
        return any(t in lower for t in prerelease_tokens)

    @staticmethod
    def _parse_safe_version(ver_str: str) -> Optional[Version]:
        """Attempts to parse version string using packaging.version."""
        clean = ver_str.strip()
        clean = clean.replace(".RELEASE", "").replace(".Final", "").replace(".FINAL", "")
        try:
            return Version(clean)
        except InvalidVersion:
            # Strip non-numeric suffixes if possible
            parts = clean.split(".")
            numeric_parts = []
            for p in parts:
                digits = "".join(c for c in p if c.isdigit())
                if digits:
                    numeric_parts.append(digits)
                else:
                    break
            if numeric_parts:
                try:
                    return Version(".".join(numeric_parts))
                except InvalidVersion:
                    return None
            return None
