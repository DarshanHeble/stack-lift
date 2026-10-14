"""Core domain models for the analysis engine."""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class DependencyModel(BaseModel):
    """Represents a declared or inherited Maven dependency."""
    group_id: str
    artifact_id: str
    version: Optional[str] = None
    raw_version: Optional[str] = None
    scope: str = "compile"
    classifier: Optional[str] = None
    optional: bool = False
    is_direct: bool = True
    module_path: Optional[str] = None


class PluginModel(BaseModel):
    """Represents a Maven build/reporting plugin."""
    group_id: str = "org.apache.maven.plugins"
    artifact_id: str
    version: Optional[str] = None
    configuration: Dict[str, Any] = Field(default_factory=dict)


class PomModel(BaseModel):
    """Structured representation of an analyzed Maven pom.xml file."""
    file_path: str
    relative_path: str
    group_id: Optional[str] = None
    artifact_id: Optional[str] = None
    version: Optional[str] = None
    packaging: str = "jar"
    name: Optional[str] = None
    
    # Parent coordinates
    parent_group_id: Optional[str] = None
    parent_artifact_id: Optional[str] = None
    parent_version: Optional[str] = None
    parent_relative_path: Optional[str] = None
    
    # Compiler & Runtime versions
    source_version: Optional[str] = None
    target_version: Optional[str] = None
    release_version: Optional[str] = None
    
    # Detected frameworks (e.g. spring_boot: 2.7.5)
    frameworks: Dict[str, str] = Field(default_factory=dict)
    
    # Properties dictionary
    properties: Dict[str, str] = Field(default_factory=dict)
    
    # Dependencies & Plugins
    dependencies: List[DependencyModel] = Field(default_factory=list)
    dependency_management: List[DependencyModel] = Field(default_factory=list)
    plugins: List[PluginModel] = Field(default_factory=list)
    
    # Reactor multi-module definitions
    modules: List[str] = Field(default_factory=list)
    has_wrapper: bool = False


class ASTMethodInfo(BaseModel):
    name: str
    return_type: Optional[str] = None
    parameters: List[str] = Field(default_factory=list)
    annotations: List[str] = Field(default_factory=list)
    line_number: int


class ASTClassInfo(BaseModel):
    name: str
    class_type: str  # class, interface, enum, record, annotation
    package: Optional[str] = None
    annotations: List[str] = Field(default_factory=list)
    implements: List[str] = Field(default_factory=list)
    extends: Optional[str] = None
    methods: List[ASTMethodInfo] = Field(default_factory=list)
    deprecated: bool = False
    line_number: int


class ASTFileInfo(BaseModel):
    file_path: str
    relative_path: str
    imports: List[str] = Field(default_factory=list)
    classes: List[ASTClassInfo] = Field(default_factory=list)
    has_deprecated_usage: bool = False
    has_reflection: bool = False
    has_javax_imports: bool = False
    has_jakarta_imports: bool = False


class UpstreamVersionTargets(BaseModel):
    current: str
    latest_patch: Optional[str] = None
    latest_minor: Optional[str] = None
    latest_major: Optional[str] = None
    is_deprecated: bool = False
    cve_count: int = 0
