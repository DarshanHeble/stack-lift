"""Edge case and security tests for POM Parser and AST Analyzer."""

import pytest
from pathlib import Path
from backend.engine.pom_parser import PomParser
from backend.engine.ast_analyzer import JavaASTAnalyzer


def test_monorepo_root_pom_discovery_in_subdirectories(tmp_path):
    """Verifies that find_root_pom locates pom.xml even if repo is nested 2 levels deep."""
    nested_dir = tmp_path / "apps" / "backend-service"
    nested_dir.mkdir(parents=True)
    pom_file = nested_dir / "pom.xml"
    pom_file.write_text("""<project xmlns="http://maven.apache.org/POM/4.0.0">
        <modelVersion>4.0.0</modelVersion>
        <groupId>com.nested</groupId>
        <artifactId>nested-app</artifactId>
        <version>1.0.0</version>
    </project>""")

    discovered = PomParser.find_root_pom(str(tmp_path), max_depth=3)
    assert discovered is not None
    assert discovered.resolve() == pom_file.resolve()


def test_xxe_protection_billion_laughs(tmp_path):
    """Verifies defusedxml blocks entity expansion attacks safely without crashing or leaking."""
    xxe_pom = """<?xml version="1.0"?>
    <!DOCTYPE lolz [
      <!ENTITY lol "lol">
      <!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
      <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
    ]>
    <project>
      <modelVersion>4.0.0</modelVersion>
      <groupId>&lol3;</groupId>
      <artifactId>xxe-test</artifactId>
      <version>1.0.0</version>
    </project>"""
    bad_pom_file = tmp_path / "pom.xml"
    bad_pom_file.write_text(xxe_pom)

    parser = PomParser(str(tmp_path))
    # defusedxml will raise or refuse entity expansion, returning safe or empty model
    poms = parser.parse_repository()
    assert len(poms) == 0  # Safely rejected malicious XML entity


def test_recursive_property_interpolation_cycle_protection(tmp_path):
    """Verifies that circular property definitions (${a} -> ${b} -> ${a}) do not trigger infinite recursion."""
    cyclic_pom = """<project xmlns="http://maven.apache.org/POM/4.0.0">
        <modelVersion>4.0.0</modelVersion>
        <groupId>com.cyclic</groupId>
        <artifactId>cyclic-app</artifactId>
        <version>1.0.0</version>
        <properties>
            <propA>${propB}</propA>
            <propB>${propA}</propB>
        </properties>
        <dependencies>
            <dependency>
                <groupId>com.test</groupId>
                <artifactId>cyclic-dep</artifactId>
                <version>${propA}</version>
            </dependency>
        </dependencies>
    </project>"""
    (tmp_path / "pom.xml").write_text(cyclic_pom)

    parser = PomParser(str(tmp_path))
    poms = parser.parse_repository()
    assert len(poms) == 1
    dep = list(poms.values())[0].dependencies[0]
    # Should safely terminate with depth guard rather than RecursionError
    assert "${prop" in dep.version


def test_ast_analyzer_records_and_interfaces(tmp_path):
    """Verifies tree-sitter parses modern Java records, interfaces, and nested classes."""
    src = tmp_path / "ModernJava.java"
    src.write_text("""package com.modern;

public interface ServiceContract {
    void execute();
}

record UserRecord(String id, String name) {}
""")
    analyzer = JavaASTAnalyzer()
    info = analyzer.parse_file(str(src))
    assert info is not None
    class_names = [c.name for c in info.classes]
    assert "ServiceContract" in class_names
    assert "UserRecord" in class_names
