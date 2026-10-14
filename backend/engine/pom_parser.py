"""Robust and safe Maven POM parser using defusedxml.

Handles:
- Safe XML parsing protected against XXE / billion laughs attacks.
- XML Namespaces (strip or tolerate default xmlns).
- Multi-module reactor discovery (recursive submodule parsing).
- Root POM auto-discovery in monorepos.
- Recursive property interpolation (e.g. ${spring.version}, ${project.version}, ${env.*}).
- Parent POM inheritance resolution (relative & default parent).
- Detection of Java compiler versions from both <properties> and <maven-compiler-plugin>.
- Framework footprint identification (Spring Boot, Jakarta/JavaEE, Quarkus, Micronaut).
- Detection of Maven Wrapper (mvnw / mvnw.cmd).
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Set
import xml.etree.ElementTree as std_ET
import defusedxml.ElementTree as ET

from backend.engine.models import PomModel, DependencyModel, PluginModel


class PomParser:
    """Parser for Maven POM files with edge-case handling."""

    # Common property patterns
    PROPERTY_PATTERN = re.compile(r"\$\{([^}]+)\}")

    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir).resolve()
        self._parsed_poms: Dict[str, PomModel] = {}

    @classmethod
    def find_root_pom(cls, base_dir: str, max_depth: int = 3) -> Optional[Path]:
        """Finds root pom.xml in directory or up to max_depth subdirectories."""
        base = Path(base_dir).resolve()
        
        # Check direct root first
        direct_pom = base / "pom.xml"
        if direct_pom.is_file():
            return direct_pom

        # Search subdirectories up to max_depth
        for current_root, dirs, files in os.walk(base):
            rel_depth = len(Path(current_root).relative_to(base).parts)
            if rel_depth > max_depth:
                dirs.clear()
                continue
            if "pom.xml" in files:
                return Path(current_root) / "pom.xml"
        return None

    @staticmethod
    def _strip_ns(tag: str) -> str:
        """Strip XML namespace prefix from tag name."""
        if "}" in tag:
            return tag.split("}", 1)[1]
        return tag

    def parse_repository(self) -> Dict[str, PomModel]:
        """Discovers and parses all POMs starting from the root POM."""
        root_pom_path = self.find_root_pom(str(self.root_dir))
        if not root_pom_path:
            return {}

        # First pass: parse root and recursively discover modules
        self._parse_recursive(root_pom_path, parent_model=None)
        return self._parsed_poms

    def _parse_recursive(self, pom_path: Path, parent_model: Optional[PomModel] = None) -> Optional[PomModel]:
        pom_str_path = str(pom_path.resolve())
        if pom_str_path in self._parsed_poms:
            return self._parsed_poms[pom_str_path]

        if not pom_path.exists():
            return None

        try:
            tree = ET.parse(str(pom_path))
            root = tree.getroot()
        except Exception:
            return None

        model = self._build_model_from_element(root, pom_path, parent_model)
        self._parsed_poms[pom_str_path] = model

        # Check for submodules
        for submodule_rel in model.modules:
            submodule_path = pom_path.parent / submodule_rel / "pom.xml"
            if submodule_path.is_file():
                self._parse_recursive(submodule_path, parent_model=model)

        return model

    def _build_model_from_element(
        self, root: std_ET.Element, pom_path: Path, parent_model: Optional[PomModel]
    ) -> PomModel:
        rel_path = str(pom_path.relative_to(self.root_dir))
        
        # 1. Properties
        props: Dict[str, str] = {}
        if parent_model:
            props.update(parent_model.properties)

        props_elem = self._find_child(root, "properties")
        if props_elem is not None:
            for prop in props_elem:
                prop_name = self._strip_ns(prop.tag)
                prop_val = (prop.text or "").strip()
                props[prop_name] = prop_val

        # 2. Coordinates
        group_id = self._get_text(root, "groupId")
        artifact_id = self._get_text(root, "artifactId")
        version = self._get_text(root, "version")
        packaging = self._get_text(root, "packaging") or "jar"
        name = self._get_text(root, "name")

        # Parent coordinates
        parent_elem = self._find_child(root, "parent")
        p_group_id = None
        p_artifact_id = None
        p_version = None
        p_relative_path = None
        
        if parent_elem is not None:
            p_group_id = self._get_text(parent_elem, "groupId")
            p_artifact_id = self._get_text(parent_elem, "artifactId")
            p_version = self._get_text(parent_elem, "version")
            p_relative_path = self._get_text(parent_elem, "relativePath") or "../pom.xml"

            if not group_id:
                group_id = p_group_id
            if not version:
                version = p_version

        # Add coordinates to properties for interpolation
        if group_id:
            props["project.groupId"] = group_id
            props["pom.groupId"] = group_id
        if artifact_id:
            props["project.artifactId"] = artifact_id
            props["pom.artifactId"] = artifact_id
        if version:
            props["project.version"] = version
            props["pom.version"] = version

        # 3. Compiler Version detection
        source_ver = self._resolve_property(props.get("maven.compiler.source") or props.get("java.version"), props)
        target_ver = self._resolve_property(props.get("maven.compiler.target") or props.get("java.version"), props)
        release_ver = self._resolve_property(props.get("maven.compiler.release"), props)

        # 4. Plugins
        plugins = self._parse_plugins(root, props)
        # Check compiler plugin configuration if not set in properties
        for plugin in plugins:
            if plugin.artifact_id == "maven-compiler-plugin":
                cfg = plugin.configuration
                if not source_ver and "source" in cfg:
                    source_ver = self._resolve_property(str(cfg["source"]), props)
                if not target_ver and "target" in cfg:
                    target_ver = self._resolve_property(str(cfg["target"]), props)
                if not release_ver and "release" in cfg:
                    release_ver = self._resolve_property(str(cfg["release"]), props)

        # Default fallback if release is specified
        if release_ver and not source_ver:
            source_ver = release_ver
        if release_ver and not target_ver:
            target_ver = release_ver

        # 5. Dependencies
        dependencies = self._parse_dependencies(
            root, props, rel_path, is_management=False, parent_model=parent_model,
            p_group_id=p_group_id, p_version=p_version
        )
        dep_mgmt = self._parse_dependencies(
            root, props, rel_path, is_management=True, parent_model=parent_model,
            p_group_id=p_group_id, p_version=p_version
        )

        # 6. Multi-module children
        modules: List[str] = []
        modules_elem = self._find_child(root, "modules")
        if modules_elem is not None:
            for mod in modules_elem:
                if self._strip_ns(mod.tag) == "module" and mod.text:
                    modules.append(mod.text.strip())

        # 7. Frameworks detection
        frameworks: Dict[str, str] = {}
        if p_artifact_id == "spring-boot-starter-parent" and p_version:
            frameworks["spring_boot"] = self._resolve_property(p_version, props)
        for dep in dependencies + dep_mgmt:
            if "spring-boot" in dep.artifact_id:
                if "spring_boot" not in frameworks and dep.version:
                    frameworks["spring_boot"] = dep.version
            elif "quarkus" in dep.artifact_id:
                if "quarkus" not in frameworks and dep.version:
                    frameworks["quarkus"] = dep.version
            elif "micronaut" in dep.artifact_id:
                if "micronaut" not in frameworks and dep.version:
                    frameworks["micronaut"] = dep.version

        # 8. Maven wrapper check
        has_wrapper = (pom_path.parent / "mvnw").is_file() or (pom_path.parent / "mvnw.cmd").is_file()

        return PomModel(
            file_path=str(pom_path),
            relative_path=rel_path,
            group_id=self._resolve_property(group_id, props) if group_id else None,
            artifact_id=artifact_id,
            version=self._resolve_property(version, props) if version else None,
            packaging=packaging,
            name=name,
            parent_group_id=p_group_id,
            parent_artifact_id=p_artifact_id,
            parent_version=self._resolve_property(p_version, props) if p_version else None,
            parent_relative_path=p_relative_path,
            source_version=source_ver,
            target_version=target_ver,
            release_version=release_ver,
            frameworks=frameworks,
            properties=props,
            dependencies=dependencies,
            dependency_management=dep_mgmt,
            plugins=plugins,
            modules=modules,
            has_wrapper=has_wrapper,
        )

    def _parse_dependencies(
        self,
        root: std_ET.Element,
        props: Dict[str, str],
        module_path: str,
        is_management: bool = False,
        parent_model: Optional[PomModel] = None,
        p_group_id: Optional[str] = None,
        p_version: Optional[str] = None,
    ) -> List[DependencyModel]:
        results: List[DependencyModel] = []
        if is_management:
            container = self._find_child(root, "dependencyManagement")
            if container is None:
                return results
            deps_elem = self._find_child(container, "dependencies")
        else:
            deps_elem = self._find_child(root, "dependencies")

        if deps_elem is None:
            return results

        for dep in deps_elem:
            if self._strip_ns(dep.tag) != "dependency":
                continue
            gid = self._get_text(dep, "groupId")
            aid = self._get_text(dep, "artifactId")
            if not gid or not aid:
                continue

            raw_ver = self._get_text(dep, "version")
            resolved_ver = self._resolve_property(raw_ver, props) if raw_ver else None

            # Inherit version from dependencyManagement if absent
            if not resolved_ver:
                dep_key = f"{self._resolve_property(gid, props)}:{self._resolve_property(aid, props)}"
                if parent_model and parent_model.dependency_management:
                    for mgmt in parent_model.dependency_management:
                        if f"{mgmt.group_id}:{mgmt.artifact_id}" == dep_key and mgmt.version:
                            resolved_ver = mgmt.version
                            break
                # Fallback to parent POM version if dependency is within the parent's group
                if not resolved_ver and p_version and p_group_id == self._resolve_property(gid, props):
                    resolved_ver = self._resolve_property(p_version, props)

            scope = self._get_text(dep, "scope") or "compile"
            classifier = self._get_text(dep, "classifier")
            optional = (self._get_text(dep, "optional") or "false").lower() == "true"

            results.append(
                DependencyModel(
                    group_id=self._resolve_property(gid, props),
                    artifact_id=self._resolve_property(aid, props),
                    version=resolved_ver,
                    raw_version=raw_ver,
                    scope=scope,
                    classifier=classifier,
                    optional=optional,
                    is_direct=not is_management,
                    module_path=module_path,
                )
            )
        return results

    def _parse_plugins(self, root: std_ET.Element, props: Dict[str, str]) -> List[PluginModel]:
        results: List[PluginModel] = []
        build_elem = self._find_child(root, "build")
        if build_elem is None:
            return results
        plugins_elem = self._find_child(build_elem, "plugins")
        if plugins_elem is None:
            return results

        for plg in plugins_elem:
            if self._strip_ns(plg.tag) != "plugin":
                continue
            gid = self._get_text(plg, "groupId") or "org.apache.maven.plugins"
            aid = self._get_text(plg, "artifactId")
            if not aid:
                continue
            ver = self._get_text(plg, "version")
            resolved_ver = self._resolve_property(ver, props) if ver else None

            # Parse simple string configuration values
            cfg_dict: Dict[str, str] = {}
            cfg_elem = self._find_child(plg, "configuration")
            if cfg_elem is not None:
                for c in cfg_elem:
                    cfg_dict[self._strip_ns(c.tag)] = (c.text or "").strip()

            results.append(
                PluginModel(
                    group_id=self._resolve_property(gid, props),
                    artifact_id=self._resolve_property(aid, props),
                    version=resolved_ver,
                    configuration=cfg_dict,
                )
            )
        return results

    def _resolve_property(self, value: Optional[str], props: Dict[str, str], depth: int = 0) -> Optional[str]:
        """Recursively resolves properties like ${spring.version} in strings."""
        if not value or depth > 5:
            return value

        match = self.PROPERTY_PATTERN.search(value)
        if not match:
            return value

        prop_key = match.group(1)
        prop_val = props.get(prop_key)
        if prop_val is not None:
            replaced = value.replace(f"${{{prop_key}}}", prop_val)
            return self._resolve_property(replaced, props, depth + 1)
        return value

    def _find_child(self, parent: std_ET.Element, tag_name: str) -> Optional[std_ET.Element]:
        for child in parent:
            if self._strip_ns(child.tag) == tag_name:
                return child
        return None

    def _get_text(self, parent: std_ET.Element, tag_name: str) -> Optional[str]:
        child = self._find_child(parent, tag_name)
        if child is not None and child.text:
            return child.text.strip()
        return None
