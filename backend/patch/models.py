"""Domain models for Search/Replace patch blocks and file transformations."""

from typing import List, Optional
from pydantic import BaseModel, Field


class SearchReplaceBlock(BaseModel):
    """Represents an exact search and replace modification in a file."""
    search: str
    replace: str


class FileCreateBlock(BaseModel):
    """Directive to create a new file."""
    file_path: str
    content: str


class FileDeleteBlock(BaseModel):
    """Directive to delete an obsolete file."""
    file_path: str


class FilePatch(BaseModel):
    """Collection of transformations targeted at a single file."""
    file_path: str
    blocks: List[SearchReplaceBlock] = Field(default_factory=list)


class ModernizationPatchPlan(BaseModel):
    """Complete patch package produced by LLM or OpenRewrite."""
    file_patches: List[FilePatch] = Field(default_factory=list)
    create_files: List[FileCreateBlock] = Field(default_factory=list)
    delete_files: List[FileDeleteBlock] = Field(default_factory=list)
