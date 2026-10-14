"""Tree-sitter Java AST Analyzer.

Analyzes Java source files to extract semantic metadata:
- Package declarations
- Class, Interface, Enum, Record, and Annotation definitions
- Implemented and extended types
- Annotations on classes and methods (e.g. @Deprecated, @RestController, @Entity)
- Deprecated API usage / calls
- Reflection usage (Class.forName, Method.invoke)
- javax.* vs jakarta.* package migration footprints
- Full AST Summary Index builder for AI Context Assembly Pipeline
"""

import os
from pathlib import Path
from typing import List, Dict, Optional, Set
import tree_sitter_java
from tree_sitter import Language, Parser, Node

from backend.engine.models import ASTFileInfo, ASTClassInfo, ASTMethodInfo


class JavaASTAnalyzer:
    """Extracts structural and semantic AST metadata from Java source files."""

    def __init__(self):
        self.language = Language(tree_sitter_java.language())
        self.parser = Parser(self.language)

    def parse_file(self, file_path: str, base_dir: Optional[str] = None) -> Optional[ASTFileInfo]:
        """Parses a single Java file into structured ASTFileInfo."""
        path = Path(file_path).resolve()
        if not path.is_file() or path.suffix != ".java":
            return None

        try:
            with open(path, "rb") as f:
                content = f.read()
        except Exception:
            return None

        tree = self.parser.parse(content)
        root = tree.root_node

        rel_path = str(path.relative_to(Path(base_dir).resolve())) if base_dir else path.name

        imports = self._extract_imports(root, content)
        classes = self._extract_classes(root, content)
        
        # Semantic smell flags
        has_javax = any(imp.startswith("javax.") for imp in imports)
        has_jakarta = any(imp.startswith("jakarta.") for imp in imports)
        
        # Check for reflection calls in file
        has_reflection = bool(b"Class.forName" in content or b"getMethod" in content or b"invoke(" in content)
        
        # Check for deprecated annotations or usages
        has_deprecated = any(cls.deprecated for cls in classes) or any(
            any("@Deprecated" in m.annotations for m in cls.methods) for cls in classes
        ) or (b"@Deprecated" in content)

        return ASTFileInfo(
            file_path=str(path),
            relative_path=rel_path,
            imports=imports,
            classes=classes,
            has_deprecated_usage=has_deprecated,
            has_reflection=has_reflection,
            has_javax_imports=has_javax,
            has_jakarta_imports=has_jakarta,
        )

    def analyze_repository(self, repo_dir: str, exclude_dirs: Optional[Set[str]] = None) -> List[ASTFileInfo]:
        """Analyzes all Java source files in a repository directory."""
        repo_path = Path(repo_dir).resolve()
        excludes = exclude_dirs or {"target", ".git", "build", ".gradle", ".idea", ".mvn", "bin"}
        results: List[ASTFileInfo] = []

        for current_root, dirs, files in os.walk(repo_path):
            # Prune excluded directories in-place
            dirs[:] = [d for d in dirs if d not in excludes]
            
            for file in files:
                if file.endswith(".java"):
                    full_path = Path(current_root) / file
                    info = self.parse_file(str(full_path), base_dir=str(repo_path))
                    if info:
                        results.append(info)

        return results

    def build_summary_index(self, ast_files: List[ASTFileInfo]) -> Dict[str, Dict]:
        """Builds a compact AST summary index (< 1MB) for the AI Context Assembly Pipeline."""
        index: Dict[str, Dict] = {}
        for f in ast_files:
            classes_summary = []
            for c in f.classes:
                methods_summary = [f"{m.return_type or 'void'} {m.name}()" for m in c.methods]
                classes_summary.append({
                    "name": c.name,
                    "type": c.class_type,
                    "annotations": c.annotations,
                    "extends": c.extends,
                    "implements": c.implements,
                    "methods": methods_summary[:15],  # Cap methods to keep payload compact
                })

            index[f.relative_path] = {
                "imports": f.imports,
                "classes": classes_summary,
                "has_javax": f.has_javax_imports,
                "has_jakarta": f.has_jakarta_imports,
                "has_reflection": f.has_reflection,
            }
        return index

    def _extract_imports(self, root: Node, content: bytes) -> List[str]:
        imports: List[str] = []
        for child in root.children:
            if child.type == "import_declaration":
                text = content[child.start_byte:child.end_byte].decode("utf-8", errors="ignore")
                # Clean: import static foo.bar; -> foo.bar
                cleaned = text.replace("import", "").replace("static", "").replace(";", "").strip()
                if cleaned:
                    imports.append(cleaned)
        return imports

    def _extract_classes(self, root: Node, content: bytes) -> List[ASTClassInfo]:
        classes: List[ASTClassInfo] = []
        package_name = self._extract_package(root, content)

        def walk(node: Node):
            if node.type in ("class_declaration", "interface_declaration", "enum_declaration", "record_declaration", "annotation_type_declaration"):
                cls_info = self._parse_class_node(node, content, package_name)
                if cls_info:
                    classes.append(cls_info)
            for ch in node.children:
                walk(ch)

        walk(root)
        return classes

    def _extract_package(self, root: Node, content: bytes) -> Optional[str]:
        for child in root.children:
            if child.type == "package_declaration":
                text = content[child.start_byte:child.end_byte].decode("utf-8", errors="ignore")
                return text.replace("package", "").replace(";", "").strip()
        return None

    def _parse_class_node(self, node: Node, content: bytes, package_name: Optional[str]) -> Optional[ASTClassInfo]:
        name = None
        extends = None
        implements: List[str] = []
        annotations: List[str] = []
        methods: List[ASTMethodInfo] = []
        class_type = node.type.replace("_declaration", "")

        for child in node.children:
            if child.type == "identifier":
                name = content[child.start_byte:child.end_byte].decode("utf-8", errors="ignore")
            elif child.type == "superclass":
                extends = content[child.start_byte:child.end_byte].decode("utf-8", errors="ignore").replace("extends", "").strip()
            elif child.type == "super_interfaces":
                raw = content[child.start_byte:child.end_byte].decode("utf-8", errors="ignore").replace("implements", "").strip()
                implements = [i.strip() for i in raw.split(",") if i.strip()]
            elif child.type == "modifiers":
                for mod_child in child.children:
                    if mod_child.type in ("marker_annotation", "annotation"):
                        ann_text = content[mod_child.start_byte:mod_child.end_byte].decode("utf-8", errors="ignore").strip()
                        annotations.append(ann_text)
            elif child.type == "class_body":
                for body_child in child.children:
                    if body_child.type == "method_declaration":
                        m_info = self._parse_method_node(body_child, content)
                        if m_info:
                            methods.append(m_info)

        if not name:
            return None

        is_deprecated = any("@Deprecated" in a for a in annotations)
        line_num = node.start_point[0] + 1

        return ASTClassInfo(
            name=name,
            class_type=class_type,
            package=package_name,
            annotations=annotations,
            implements=implements,
            extends=extends,
            methods=methods,
            deprecated=is_deprecated,
            line_number=line_num,
        )

    def _parse_method_node(self, node: Node, content: bytes) -> Optional[ASTMethodInfo]:
        name = None
        return_type = None
        annotations: List[str] = []
        params: List[str] = []

        for child in node.children:
            if child.type == "identifier":
                name = content[child.start_byte:child.end_byte].decode("utf-8", errors="ignore")
            elif child.type in ("type_identifier", "void_type", "generic_type", "integral_type", "boolean_type"):
                return_type = content[child.start_byte:child.end_byte].decode("utf-8", errors="ignore")
            elif child.type == "modifiers":
                for mod_child in child.children:
                    if mod_child.type in ("marker_annotation", "annotation"):
                        annotations.append(content[mod_child.start_byte:mod_child.end_byte].decode("utf-8", errors="ignore").strip())
            elif child.type == "formal_parameters":
                for param in child.children:
                    if param.type == "formal_parameter":
                        params.append(content[param.start_byte:param.end_byte].decode("utf-8", errors="ignore").strip())

        if not name:
            return None

        return ASTMethodInfo(
            name=name,
            return_type=return_type,
            parameters=params,
            annotations=annotations,
            line_number=node.start_point[0] + 1,
        )
