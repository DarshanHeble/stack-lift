"""Tests for Security Scanner and OpenRewrite recipe generator."""

import pytest
from backend.engine.models import DependencyModel
from backend.engine.security_scanner import (
    SecurityScanner,
    VulnerabilityFinding,
    SecurityScanReport,
)
from backend.engine.openrewrite_runner import OpenRewriteCatalog


def test_openrewrite_catalog_recipes_and_command():
    recipe = OpenRewriteCatalog.get_recipe("UPGRADE_SPRING_BOOT_3")
    assert recipe is not None
    assert recipe.id == "org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0"

    # Test command generation with mvnw
    cmd = OpenRewriteCatalog.build_maven_command(recipe, mvn_bin="./mvnw")
    assert cmd[0] == "./mvnw"
    assert "org.openrewrite.maven:rewrite-maven-plugin:run" in cmd
    assert any("org.openrewrite.recipe:rewrite-spring:RELEASE" in arg for arg in cmd)


def test_vulnerability_delta_calculation_detects_regression():
    baseline = SecurityScanReport(
        findings=[
            VulnerabilityFinding(
                id="CVE-2021-44228",
                severity="CRITICAL",
                summary="Log4Shell",
                affected_package="org.apache.logging.log4j:log4j-core",
            )
        ]
    )

    # Post-patch resolved CVE-2021-44228 but introduced a new HIGH CVE
    post_patch = SecurityScanReport(
        findings=[
            VulnerabilityFinding(
                id="CVE-2023-12345",
                severity="HIGH",
                summary="Insecure dependency hallucinated",
                affected_package="com.example:bad-lib",
            )
        ]
    )

    delta = SecurityScanner.calculate_delta(baseline, post_patch)
    assert len(delta.resolved_findings) == 1
    assert delta.resolved_findings[0].id == "CVE-2021-44228"
    assert len(delta.new_findings) == 1
    assert delta.new_findings[0].id == "CVE-2023-12345"
    assert delta.has_regressions is True  # New HIGH severity is a regression!


def test_vulnerability_delta_calculation_clean_resolution():
    baseline = SecurityScanReport(
        findings=[
            VulnerabilityFinding(
                id="CVE-2021-44228",
                severity="CRITICAL",
                summary="Log4Shell",
                affected_package="org.apache.logging.log4j:log4j-core",
            )
        ]
    )
    post_patch = SecurityScanReport(findings=[])  # All resolved

    delta = SecurityScanner.calculate_delta(baseline, post_patch)
    assert len(delta.resolved_findings) == 1
    assert len(delta.new_findings) == 0
    assert delta.has_regressions is False


@pytest.mark.asyncio
async def test_security_scanner_empty_deps():
    scanner = SecurityScanner()
    report = await scanner.scan_dependencies([])
    assert report.total_findings == 0
