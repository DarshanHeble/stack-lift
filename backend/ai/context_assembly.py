"""Prompt builder and Context Assembly Pipeline for selective file retrieval."""

from typing import Dict, List, Any
from pathlib import Path


class ContextAssemblyPipeline:
    """Assembles prompt payloads without exceeding LLM context windows."""

    @staticmethod
    def build_plan_prompt(findings_summary: Dict[str, Any], ast_summary_index: Dict[str, Any]) -> str:
        """Constructs the structured plan generation prompt."""
        return f"""You are the StackLift Modernization Architect.
Analyze the following legacy repository findings:

- Detected Java Version: {findings_summary.get('java_version', 'Unknown')}
- Build Tool: {findings_summary.get('build_system', 'MAVEN')}
- Detected Frameworks: {findings_summary.get('detected_frameworks', {})}
- Outdated Dependencies: {findings_summary.get('outdated_dependencies', {})}
- AST Summary Index:
{ast_summary_index}

INSTRUCTIONS:
1. Generate an ordered sequence of modernization steps.
2. Every step must have a unique sequence_order starting from 1.
3. Reference actual files and dependencies identified in the findings.
4. Categorize risk as LOW, MEDIUM, or HIGH.
5. Provide clear verification criteria for each step.
6. Propose deterministic OpenRewrite recipes when applicable.
"""

    @staticmethod
    def assemble_step_context(workspace_root: str, step_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Performs Just-In-Time retrieval of only the affected files from the Working Tree."""
        root = Path(workspace_root).resolve()
        affected_files = step_metadata.get("affected_files", ["pom.xml"])
        file_contents: Dict[str, str] = {}

        for rel_path in affected_files:
            file_path = root / rel_path
            if file_path.is_file():
                file_contents[rel_path] = file_path.read_text(encoding="utf-8", errors="ignore")

        return {
            "step_title": step_metadata.get("title", ""),
            "rationale": step_metadata.get("rationale", ""),
            "files": file_contents,
        }
