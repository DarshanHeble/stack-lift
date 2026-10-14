# OpenRewrite Integration & Recipe Automation

## 1. Role in the Modernization Pipeline

[OpenRewrite](https://docs.openrewrite.org/) is the industry standard for large-scale, automated Java refactoring. It parses code into Lossless Semantic Trees (LST), applies deterministic transformation recipes, and emits clean, formatted code diffs.

StackLift uses OpenRewrite as its **primary deterministic refactoring engine** before falling back to generative AI.

---

## 2. Standard Supported Modernization Recipes

| Migration Scenario | OpenRewrite Recipe Identifier | Description |
| :--- | :--- | :--- |
| **Java 8 to 17** | `org.openrewrite.java.migrate.UpgradeToJava17` | Updates language syntax, replaces deprecated runtime methods. |
| **Spring Boot 2.x to 3.x** | `org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0` | Migrates properties, dependencies, and `javax.*` to `jakarta.*`. |
| **JUnit 4 to JUnit 5** | `org.openrewrite.java.testing.junit5.JUnit4to5Migration` | Replaces `@Test(expected=...)` with `assertThrows()`, updates assertions. |
| **Log4j to SLF4J/Logback** | `org.openrewrite.java.logging.log4j.Log4jToSlf4j` | Replaces vulnerable direct Log4j 1.x/2.x calls with SLF4J abstractions. |

### Conservative Transformation Philosophy:
OpenRewrite intentionally leaves ambiguous or unsafe code patterns untouched rather than risk an incorrect change. When recipes leave residual gaps, StackLift detects these via compiler diagnostics and invokes the AI patch generator for targeted contextual fixes.

---

## 3. Recipe Execution Architecture

OpenRewrite recipes are executed inside the sandbox container:

```bash
mvn org.openrewrite.maven:rewrite-maven-plugin:run \
  -Drewrite.recipeArtifactCoordinates=org.openrewrite.recipe:rewrite-spring:RELEASE \
  -Drewrite.activeRecipes=org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0
```

The resulting changes are captured using `git diff` and presented to the developer in the Monaco diff viewer.
