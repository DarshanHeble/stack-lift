# Java & Maven Parsing Engine

## 1. Overview & Parsing Architecture

To analyze legacy repositories rapidly without requiring an immediate heavy compiler execution, StackLift uses a two-tier static analysis pipeline:

1. **Maven Project Object Model (`pom.xml`) Parsing**: Extracts structured dependency trees, compiler configurations, plugin versions, and repository definitions.
2. **Abstract Syntax Tree (AST) Analysis with Tree-sitter**: Scans Java source files in milliseconds to map class definitions, imports, annotations, and deprecated API usages.

---

## 2. Maven POM Analysis Engine

The Python-based Maven analyzer uses `defusedxml` to parse `pom.xml` safely against XML entity injection (XXE) attacks.

### Key Data Extracted:
- **Java Source/Target Version**:
  - Checks `<properties>` for `maven.compiler.source`, `maven.compiler.target`, `java.version`.
  - Checks `<plugin>` configuration under `maven-compiler-plugin`.
- **Declared Dependencies**:
  - `<groupId>`, `<artifactId>`, `<version>`, `<scope>`.
  - Identifies unpinned versions, property-interpolated versions (`${spring.version}`), and version ranges.
- **Dependency Management & Parent POMs**:
  - Resolves inherited Spring Boot starters (`spring-boot-starter-parent`).
- **Multi-Module Reactor Discovery**:
  - Recursively follows `<modules>` declarations to discover all submodules and their internal dependency relationships.
  - Builds an internal module dependency graph used for per-module findings attribution in the UI.
- **Mono-Repo Root Discovery**:
  - Automatically scans up to 3 directories deep to find the root `pom.xml` if the repository is not mounted exactly at the project root, mitigating "pom not found" errors in messy monorepos.

---

## 3. Upstream Version Resolver

> [!IMPORTANT]
> Static POM parsing only reveals what versions are *currently* in use. To recommend upgrades, StackLift needs an **Upstream Version Oracle** that knows what versions are *available*.

### Resolution Strategy:
1. **Maven Central Search API**: Query `https://search.maven.org/solrsearch/select?q=g:{groupId}+AND+a:{artifactId}` to retrieve all published versions.
2. **Private Registry Support (Nexus / Artifactory)**: If the project declares private `<repositories>` in `pom.xml` or `settings.xml`, the resolver queries those endpoints using credentials from the Integration Credentials Manager.
3. **Version Selection Policy**:
   - Prefer the latest stable release (exclude `-SNAPSHOT`, `-alpha`, `-beta`, `-RC` suffixes).
   - Respect major version boundaries unless the modernization goal explicitly targets a major upgrade (e.g., Spring Boot 2.x -> 3.x).
4. **Output**: A `DependencyUpgradeMatrix` mapping each outdated dependency to its current version, latest patch version, latest minor version, and latest major version.

---

## 4. Tree-sitter Java AST Analysis

StackLift embeds `tree-sitter-java` bindings to extract semantic metadata across all `.java` files:

### Target Patterns:
- **Import Declarations**: Detects outdated libraries (e.g., `import org.apache.log4j.Logger;` vs. `org.slf4j.Logger;`, or `javax.servlet.*` vs. `jakarta.servlet.*`).
- **Deprecated Annotations & Calls**: Detects usages of `@Deprecated` methods and classes.
- **Framework Signatures**: Detects architectural style (Spring Web MVC `@RestController`, Spring Data `@Repository`, JPA `@Entity`).
- **Reflection & Dynamic Loading**: Flags occurrences of `Class.forName(...)` or `Method.invoke(...)` as high-risk migration areas.

### AST Index for Context Assembly:
During the `ANALYZING` phase, Tree-sitter produces a lightweight **AST Summary Index** (typically < 1MB even for large repos) containing:
- File path -> list of class/interface declarations.
- Class -> list of method signatures.
- Class -> list of import statements.
- Class -> list of annotations.

This index is passed to the LLM during plan generation to provide full codebase awareness without exhausting the context window.
