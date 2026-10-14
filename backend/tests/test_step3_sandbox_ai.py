"""Tests for Step 3: Search/Replace Patch Applier, AI Context Assembly, and Sandbox Runner."""

import pytest
from pathlib import Path
from backend.patch.models import SearchReplaceBlock, FilePatch, ModernizationPatchPlan, FileCreateBlock
from backend.patch.block_parser import PatchBlockParser
from backend.patch.applier import PatchApplier, PatchApplicationError
from backend.ai.mock_provider import MockLLMProvider
from backend.ai.context_assembly import ContextAssemblyPipeline
from backend.sandbox.command_builder import DockerCommandBuilder
from backend.sandbox.runner import SandboxRunner
from backend.sandbox.log_parser import LogDiagnosticParser


def test_patch_block_parser_search_replace_and_create():
    raw_llm_output = """
Some explanatory text before blocks...

FILE: src/main/java/com/example/Legacy.java
<<<< SEARCH
import javax.servlet.http.HttpServletRequest;
====
import jakarta.servlet.http.HttpServletRequest;
>>>> REPLACE

<<<< CREATE_FILE src/main/java/com/example/NewConfig.java
package com.example;
public class NewConfig {}
>>>> END_CREATE

<<<< DELETE_FILE src/main/webapp/web.xml >>>> END_DELETE
"""
    plan = PatchBlockParser.parse(raw_llm_output)

    assert len(plan.file_patches) == 1
    assert plan.file_patches[0].file_path == "src/main/java/com/example/Legacy.java"
    assert len(plan.file_patches[0].blocks) == 1
    assert "javax.servlet" in plan.file_patches[0].blocks[0].search
    assert "jakarta.servlet" in plan.file_patches[0].blocks[0].replace

    assert len(plan.create_files) == 1
    assert plan.create_files[0].file_path == "src/main/java/com/example/NewConfig.java"

    assert len(plan.delete_files) == 1
    assert plan.delete_files[0].file_path == "src/main/webapp/web.xml"


def test_patch_applier_mutates_file_and_generates_diff(tmp_path):
    target_file = tmp_path / "pom.xml"
    target_file.write_text("<version>2.14.1</version>\n<scope>compile</scope>\n")

    plan = ModernizationPatchPlan(
        file_patches=[
            FilePatch(
                file_path="pom.xml",
                blocks=[SearchReplaceBlock(search="<version>2.14.1</version>", replace="<version>2.20.0</version>")]
            )
        ]
    )

    applier = PatchApplier(str(tmp_path))
    changed_files, unified_diff = applier.apply(plan)

    assert changed_files == ["pom.xml"]
    assert "<version>2.20.0</version>" in target_file.read_text()
    assert "-<version>2.14.1</version>" in unified_diff
    assert "+<version>2.20.0</version>" in unified_diff


def test_patch_applier_missing_search_block_raises_error(tmp_path):
    target_file = tmp_path / "pom.xml"
    target_file.write_text("<version>1.0.0</version>\n")

    plan = ModernizationPatchPlan(
        file_patches=[
            FilePatch(
                file_path="pom.xml",
                blocks=[SearchReplaceBlock(search="<version>non_existent</version>", replace="<version>2.0.0</version>")]
            )
        ]
    )
    applier = PatchApplier(str(tmp_path))
    with pytest.raises(PatchApplicationError):
        applier.apply(plan)


@pytest.mark.asyncio
async def test_mock_llm_provider_plan_and_patch():
    provider = MockLLMProvider()
    plan = await provider.generate_plan({})
    assert len(plan["steps"]) == 2
    assert plan["steps"][0]["title"] == "Upgrade Log4j to 2.20.0"

    patch_text = await provider.generate_patch({"files": {"pom.xml": "<version>2.14.1</version>"}})
    assert "<<<< SEARCH" in patch_text
    assert "<version>2.20.0</version>" in patch_text


def test_docker_command_builder_dynamic_jdk_and_mvnw(tmp_path):
    # Case 1: java 1.8 with mvnw
    (tmp_path / "mvnw").write_text("#!/bin/sh")
    args = DockerCommandBuilder.build_stage2_docker_args(
        run_id="run_123",
        workspace_root=tmp_path,
        m2_cache_dir=tmp_path / "m2",
        java_version="1.8",
    )
    assert "stacklift/sandbox-java8:latest" in args
    assert "./mvnw" in args
    assert "--network" in args and "none" in args

    # Case 2: java 17 without mvnw
    tmp2 = tmp_path / "no_mvnw"
    tmp2.mkdir()
    args2 = DockerCommandBuilder.build_stage2_docker_args(
        run_id="run_456",
        workspace_root=tmp2,
        m2_cache_dir=tmp_path / "m2",
        java_version="17",
    )
    assert "stacklift/sandbox-java17:latest" in args2
    assert "mvn" in args2


@pytest.mark.asyncio
async def test_sandbox_runner_hermetic_execution(tmp_path):
    runner = SandboxRunner(run_id="test_run", workspace_root=str(tmp_path))
    res = await runner.execute_validation(mock_mode=True)
    assert res.passed is True
    assert res.exit_code == 0
    assert res.tests.total > 0
