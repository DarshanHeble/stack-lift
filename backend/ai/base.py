"""Abstract interface for LLM Modernization Providers."""

from abc import ABC, abstractmethod
from typing import Dict, List, Any


class BaseLLMProvider(ABC):
    """Abstract interface for AI model adapters (Claude, GPT, Gemini, Mock)."""

    @abstractmethod
    async def generate_plan(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generates structured migration roadmap steps from AST & POM findings."""
        pass

    @abstractmethod
    async def generate_patch(self, step_context: Dict[str, Any]) -> str:
        """Generates contextual SEARCH/REPLACE blocks for a specific step."""
        pass

    @abstractmethod
    async def revise_patch(self, revision_context: Dict[str, Any]) -> str:
        """Generates revised SEARCH/REPLACE blocks addressing reviewer feedback."""
        pass

    @abstractmethod
    async def diagnose_failure(self, failure_context: Dict[str, Any]) -> str:
        """Diagnoses compiler/test failure and proposes minimal corrective blocks."""
        pass
