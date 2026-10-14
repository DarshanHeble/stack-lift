"""Parser for LLM-generated Search/Replace, CREATE_FILE, and DELETE_FILE blocks.

Format:
FILE: path/to/File.java
<<<< SEARCH
old content
====
new content
>>>> REPLACE

<<<< CREATE_FILE path/to/New.java
new file content
>>>> END_CREATE

<<<< DELETE_FILE path/to/Old.java >>>> END_DELETE
"""

import re
from typing import List, Optional
from backend.patch.models import (
    SearchReplaceBlock, FileCreateBlock, FileDeleteBlock, FilePatch, ModernizationPatchPlan
)


class PatchBlockParser:
    """Robust parser that transforms raw LLM text output into structured Patch directives."""

    RE_FILE_HEADER = re.compile(r"FILE:\s*([^\r\n]+)", re.MULTILINE)
    RE_SEARCH_REPLACE = re.compile(r"<<<< SEARCH\r?\n(.*?)\r?\n====\r?\n(.*?)\r?\n>>>> REPLACE", re.DOTALL)
    RE_CREATE_FILE = re.compile(r"<<<< CREATE_FILE\s+([^\r\n]+)\r?\n(.*?)\r?\n>>>> END_CREATE", re.DOTALL)
    RE_DELETE_FILE = re.compile(r"<<<< DELETE_FILE\s+([^\r\n>]+)\s*>>>> END_DELETE", re.MULTILINE)

    @classmethod
    def parse(cls, raw_text: str) -> ModernizationPatchPlan:
        """Parses complete raw LLM response text into structured directives."""
        clean_text = raw_text.strip()
        
        # 1. Parse File Creations
        created_files: List[FileCreateBlock] = []
        for m in cls.RE_CREATE_FILE.finditer(clean_text):
            fpath = m.group(1).strip()
            content = m.group(2)
            created_files.append(FileCreateBlock(file_path=fpath, content=content))

        # 2. Parse File Deletions
        deleted_files: List[FileDeleteBlock] = []
        for m in cls.RE_DELETE_FILE.finditer(clean_text):
            fpath = m.group(1).strip()
            deleted_files.append(FileDeleteBlock(file_path=fpath))

        # 3. Parse Search / Replace blocks per FILE header
        file_patches: List[FilePatch] = []
        # Split text by FILE: markers
        file_splits = re.split(r"^FILE:\s*", clean_text, flags=re.MULTILINE)

        for chunk in file_splits:
            if not chunk.strip():
                continue
            lines = chunk.splitlines()
            target_path = lines[0].strip()
            body = "\n".join(lines[1:])

            blocks: List[SearchReplaceBlock] = []
            for block_match in cls.RE_SEARCH_REPLACE.finditer(body):
                search_text = block_match.group(1)
                replace_text = block_match.group(2)
                blocks.append(SearchReplaceBlock(search=search_text, replace=replace_text))

            if blocks:
                file_patches.append(FilePatch(file_path=target_path, blocks=blocks))

        return ModernizationPatchPlan(
            file_patches=file_patches,
            create_files=created_files,
            delete_files=deleted_files,
        )
