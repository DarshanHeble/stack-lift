"""OpenRewrite Recipe Runner and Maven Recipe Command Generator.

Handles:
- Mapping modernization scenarios to standard OpenRewrite recipe identifiers.
- Generating Maven plugin CLI commands for recipe execution inside sandbox containers.
- Parsing recipe execution logs and detecting applied changes.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class OpenRewriteRecipe(BaseModel):
    id: str
    artifact_coordinates: str
    description: str
    target_version: Optional[str] = None


class OpenRewriteCatalog:
    """Hardcoded catalog of vetted OpenRewrite recipes to prevent AI hallucinations."""

    SUPPORTED_RECIPES: Dict[str, OpenRewriteRecipe] = {
        "UPGRADE_JAVA_17": OpenRewriteRecipe(
            id="org.openrewrite.java.migrate.UpgradeToJava17",
            artifact_coordinates="org.openrewrite.recipe:rewrite-migrate-java:RELEASE",
            description="Migrates Java 8/11 syntax, APIs, and dependencies to Java 17.",
            target_version="17",
        ),
        "UPGRADE_SPRING_BOOT_3": OpenRewriteRecipe(
            id="org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0",
            artifact_coordinates="org.openrewrite.recipe:rewrite-spring:RELEASE",
            description="Upgrades Spring Boot 2.x to 3.0, including javax.* to jakarta.* migration.",
            target_version="3.0.0",
        ),
        "MIGRATE_JUNIT_5": OpenRewriteRecipe(
            id="org.openrewrite.java.testing.junit5.JUnit4to5Migration",
            artifact_coordinates="org.openrewrite.recipe:rewrite-testing-frameworks:RELEASE",
            description="Migrates JUnit 4 annotations and assertions to JUnit 5 Jupiter.",
        ),
        "MIGRATE_LOG4J_TO_SLF4J": OpenRewriteRecipe(
            id="org.openrewrite.java.logging.log4j.Log4jToSlf4j",
            artifact_coordinates="org.openrewrite.recipe:rewrite-logging-frameworks:RELEASE",
            description="Replaces direct Log4j 1.x/2.x calls with SLF4J abstractions.",
        ),
    }

    @classmethod
    def get_recipe(cls, recipe_key: str) -> Optional[OpenRewriteRecipe]:
        return cls.SUPPORTED_RECIPES.get(recipe_key)

    @classmethod
    def build_maven_command(cls, recipe: OpenRewriteRecipe, mvn_bin: str = "mvn") -> List[str]:
        """Constructs the containerized CLI execution arguments for rewrite-maven-plugin."""
        return [
            mvn_bin,
            "org.openrewrite.maven:rewrite-maven-plugin:run",
            f"-Drewrite.recipeArtifactCoordinates={recipe.artifact_coordinates}",
            f"-Drewrite.activeRecipes={recipe.id}",
            "-B",  # Batch mode
        ]
