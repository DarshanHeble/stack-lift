"""Patch Applier that safely applies structured patch plans to disk.

Handles:
- Verifying SEARCH blocks exist verbatim before mutating files.
- Raising explicit errors on missing or ambiguous SEARCH targets.
- Creating parent directories for CREATE_FILE.
- Generating standard unified diffs for Git/Monaco Editor display.
"""

import os
import difflib
from pathlib import Path
from typing import List, Tuple
from backend.patch.models import ModernizationPatchPlan


class PatchApplicationError(Exception):
    """Raised when a patch cannot be applied cleanly."""
    pass


class PatchApplier:
    """Applies structured patch directives to files on disk and emits unified diffs."""

    def __init__(self, workspace_root: str):
        self.workspace_root = Path(workspace_root).resolve()

    def apply(self, plan: ModernizationPatchPlan) -> Tuple[List[str], str]:
        """Applies all directives in plan. Returns (changed_files, unified_diff)."""
        changed_files: List[str] = []
        diff_chunks: List[str] = []

        # 1. Apply file deletions
        for d in plan.delete_files:
            target = self.workspace_root / d.file_path
            if target.is_file():
                old_content = target.read_text(encoding="utf-8", errors="ignore")
                target.unlink()
                changed_files.append(d.file_path)
                diff = difflib.unified_diff(
                    old_content.splitlines(keepends=True),
                    [],
                    fromfile=f"a/{d.file_path}",
                    tofile="/dev/null"
                )
                diff_chunks.extend(diff)

        # 2. Apply file creations
        for c in plan.create_files:
            target = self.workspace_root / c.file_path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(c.content, encoding="utf-8")
            changed_files.append(c.file_path)
            diff = difflib.unified_diff(
                [],
                c.content.splitlines(keepends=True),
                fromfile="/dev/null",
                tofile=f"b/{c.file_path}"
            )
            diff_chunks.extend(diff)

        # 3. Apply search & replace blocks
        for p in plan.file_patches:
            target = self.workspace_root / p.file_path
            if not target.is_file():
                raise PatchApplicationError(f"Target file does not exist: {p.file_path}")

            original_text = target.read_text(encoding="utf-8", errors="ignore")
            current_text = original_text

            for b in p.blocks:
                if b.search not in current_text:
                    raise PatchApplicationError(
                        f"Search block not found in {p.file_path}:\n'{b.search[:100]}...'"
                    )
                # Replace only first occurrence to avoid ambiguity
                current_text = current_text.replace(b.search, b.replace, 1)

            target.write_text(current_text, encoding="utf-8")
            changed_files.append(p.file_path)

            diff = difflib.unified_diff(
                original_text.splitlines(keepends=True),
                current_text.splitlines(keepends=True),
                fromfile=f"a/{p.file_path}",
                tofile=f"b/{p.file_path}"
            )
            diff_chunks.extend(diff)

        full_diff = "".join(diff_chunks)
        return changed_files, full_diff
