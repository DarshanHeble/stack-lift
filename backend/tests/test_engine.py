"""Comprehensive unit tests for Step 1 Engine components."""

import pytest
import tempfile
import os
from pathlib import Path

from backend.engine.pom_parser import PomParser
from backend.engine.ast_analyzer import JavaASTAnalyzer
from backend.engine.upstream_resolver import UpstreamVersionResolver
from backend.engine.codebase_analyzer import CodebaseAnalyzer


@pytest.fixture
def sample_maven_project(tmp_path):
    """Creates a temporary multi-module Spring Boot repository structure."""
    root_pom = """<project xmlns="http://maven.apache.org/POM/4.0.0">
        <modelVersion>4.0.0</modelVersion>
        <groupId>com.example</groupId>
        <artifactId>parent-project</artifactId>
        <version>1.0.0</version>
        <packaging>pom</packaging>
        
        <properties>
            <maven.compiler.source>1.8</maven.compiler.source>
            <maven.compiler.target>1.8</maven.compiler.target>
            <spring.boot.version>2.7.5</spring.boot.version>
            <log4j.version>2.14.1</log4j.version>
        </properties>

        <modules>
            <module>core-service</module>
        </modules>

        <dependencyManagement>
            <dependencies>
                <dependency>
                    <groupId>org.apache.logging.log4j</groupId>
                    <artifactId>log4j-core</artifactId>
                    <version>${log4j.version}</version>
                </dependency>
            </dependencies>
        </dependencyManagement>
    </project>"""
    (tmp_path / "pom.xml").write_text(root_pom)
    (tmp_path / "mvnw").write_text("#!/bin/sh\n")

    # Submodule
    core_dir = tmp_path / "core-service"
    core_dir.mkdir()
    sub_pom = """<project xmlns="http://maven.apache.org/POM/4.0.0">
        <modelVersion>4.0.0</modelVersion>
        <parent>
            <groupId>com.example</groupId>
            <artifactId>parent-project</artifactId>
            <version>1.0.0</version>
        </parent>
        <artifactId>core-service</artifactId>

        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-web</artifactId>
                <version>${spring.boot.version}</version>
            </dependency>
            <dependency>
                <groupId>org.apache.logging.log4j</groupId>
                <artifactId>log4j-core</artifactId>
            </dependency>
        </dependencies>
    </project>"""
    (core_dir / "pom.xml").write_text(sub_pom)

    # Java Source file
    src_dir = core_dir / "src" / "main" / "java" / "com" / "example"
    src_dir.mkdir(parents=True)
    java_file = """package com.example;

import javax.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@Deprecated
public class LegacyController {

    @GetMapping("/hello")
    public String hello(HttpServletRequest request) {
        return "Hello World";
    }

    public void dynamicCall() throws Exception {
        Class<?> clazz = Class.forName("com.example.Hidden");
    }
}
"""
    (src_dir / "LegacyController.java").write_text(java_file)
    return tmp_path


def test_pom_parser_multi_module_and_properties(sample_maven_project):
    parser = PomParser(str(sample_maven_project))
    poms = parser.parse_repository()

    assert len(poms) == 2
    root_pom = [p for p in poms.values() if p.relative_path == "pom.xml"][0]
    sub_pom = [p for p in poms.values() if p.artifact_id == "core-service"][0]

    # Verify root properties & wrapper
    assert root_pom.source_version == "1.8"
    assert root_pom.has_wrapper is True
    assert "core-service" in root_pom.modules

    # Verify submodule inheritance & property interpolation
    assert sub_pom.group_id == "com.example"
    assert sub_pom.source_version == "1.8"
    web_dep = [d for d in sub_pom.dependencies if d.artifact_id == "spring-boot-starter-web"][0]
    assert web_dep.version == "2.7.5"
    assert "spring_boot" in sub_pom.frameworks


def test_ast_analyzer_features(sample_maven_project):
    analyzer = JavaASTAnalyzer()
    java_files = analyzer.analyze_repository(str(sample_maven_project))

    assert len(java_files) == 1
    info = java_files[0]

    # Imports check
    assert "javax.servlet.http.HttpServletRequest" in info.imports
    assert info.has_javax_imports is True
    assert info.has_jakarta_imports is False

    # Reflection check
    assert info.has_reflection is True

    # Class metadata check
    assert len(info.classes) == 1
    cls = info.classes[0]
    assert cls.name == "LegacyController"
    assert cls.class_type == "class"
    assert cls.deprecated is True
    assert any("@RestController" in a for a in cls.annotations)

    # Methods
    method_names = [m.name for m in cls.methods]
    assert "hello" in method_names
    assert "dynamicCall" in method_names


def test_upstream_version_target_calculation():
    resolver = UpstreamVersionResolver()
    available = [
        "2.14.0",
        "2.14.1",
        "2.14.2",
        "2.15.0",
        "2.20.0",
        "3.0.0-M1",
        "3.0.0",
        "3.1.0-SNAPSHOT",
    ]
    targets = resolver._calculate_targets("2.14.1", available)

    assert targets.latest_patch == "2.14.2"
    assert targets.latest_minor == "2.20.0"
    assert targets.latest_major == "3.0.0"


@pytest.mark.asyncio
async def test_codebase_analyzer_integration(sample_maven_project):
    analyzer = CodebaseAnalyzer(str(sample_maven_project))
    result = await analyzer.analyze(resolve_upstream=False)

    assert result.summary.java_version == "1.8"
    assert result.summary.total_modules == 2
    assert result.summary.total_java_files == 1
    assert result.summary.has_wrapper is True
    assert result.summary.javax_migration_needed is True
    assert result.summary.reflection_detected is True
    assert "LegacyController.java" in list(result.ast_summary_index.keys())[0]
