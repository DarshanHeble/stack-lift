"""Hermetic mock LLM provider for deterministic offline execution and unit testing."""

from typing import Dict, Any
from backend.ai.base import BaseLLMProvider


class MockLLMProvider(BaseLLMProvider):
    """Deterministic LLM adapter returning pre-canned valid responses."""

    async def generate_plan(self, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "summary": "Automated migration to Java 17 and Spring Boot 3",
            "steps": [
                {
                    "sequence_order": 1,
                    "title": "Upgrade Log4j to 2.20.0",
                    "risk_level": "LOW",
                    "prerequisites": [],
                    "rationale": "Remediate Log4Shell vulnerability",
                    "affected_files": ["pom.xml"],
                    "verification_criteria": "Project compiles without vulnerable dependencies",
                },
                {
                    "sequence_order": 2,
                    "title": "Migrate javax.servlet to jakarta.servlet",
                    "risk_level": "MEDIUM",
                    "prerequisites": [1],
                    "rationale": "Spring Boot 3 compatibility",
                    "affected_files": ["src/main/java/com/example/LegacyController.java"],
                    "verification_criteria": "All servlet references upgraded to Jakarta EE",
                },
            ],
        }

    async def generate_patch(self, step_context: Dict[str, Any]) -> str:
        # Returns standard Search/Replace blocks
        files = step_context.get("files", {})
        if "src/main/java/com/example/LegacyController.java" in files:
            return """FILE: src/main/java/com/example/LegacyController.java
<<<< SEARCH
import javax.servlet.http.HttpServletRequest;
====
import jakarta.servlet.http.HttpServletRequest;
>>>> REPLACE
"""
        return """FILE: pom.xml
<<<< SEARCH
<version>2.14.1</version>
====
<version>2.20.0</version>
>>>> REPLACE
"""

    async def revise_patch(self, revision_context: Dict[str, Any]) -> str:
        feedback = revision_context.get("feedback", "")
        return f"""FILE: pom.xml
<<<< SEARCH
<version>2.14.1</version>
====
<!-- Revised: {feedback} -->
<version>2.20.0</version>
>>>> REPLACE
"""

    async def diagnose_failure(self, failure_context: Dict[str, Any]) -> str:
        return """FILE: pom.xml
<<<< SEARCH
<version>2.14.1</version>
====
<version>2.20.0</version>
>>>> REPLACE
"""
