# Risk Analysis & Mitigation Matrix

## 1. Engineered Mitigations

| Risk | Impact | Probability | Engineered Mitigation |
| :--- | :---: | :---: | :--- |
| **AI Proposes Malformed or Incompatible Code** | High | Medium | Enforce deterministic OpenRewrite recipes first; require automated sandboxed `mvn compile` and `mvn test` before presenting patch as valid; human approval gate. |
| **Repository Contains Malicious Build Plugins** | Critical | Low | Hardened container sandbox: Two-stage execution (dependency download separate from build), `--network none` during compilation, `--read-only` root filesystem, non-root user, `--cap-drop ALL`, and strict CPU/memory limits. |
| **Test Suite Has Low / Zero Coverage** | Medium | High | Transparently flag unverified code paths in the Modernization Report. Do not falsely certify code as bug-free simply because 0 tests passed. |
| **Integration Tests Fail Without External Services** | Medium | High | Auto-detect Maven profiles; skip integration tests by default (`-DskipITs`); optionally spin up sidecar service containers (PostgreSQL, Redis) for controlled integration test execution. |
| **Migration Path Unsupported** | Medium | Medium | Fail fast with explicit explanations and unsupported feature diagnostics rather than hallucinating an invalid migration. |
| **LLM Rate Limits or API Downtime** | Medium | Low | Provider-independent adapter with automatic retries, backoff, and fallback to local models or offline deterministic recipes. |
| **Scope Creep (Too Many Frameworks/Languages)** | High | High | Strict MVP guardrail: Java + Maven single-repo workflows only. Defer multi-module, Gradle, and other languages to Phase 2. |
| **Non-Reproducible Build Environment** | High | Low | Lock container base images, pin exact JDK and Maven versions, and pin immutable commit SHAs. |
| **Private Repo Credentials Leaked** | Critical | Low | Store Git tokens in encrypted DB columns (Fernet/KMS); never pass host credentials into sandbox containers; credential rotation policies. |
| **AI Context Window Overflow on Large Repos** | High | High | AST Summary Index + Just-In-Time file retrieval; never pass entire repository to LLM. |
| **LLM Generates Brittle Unified Diffs** | Medium | High | Use Search-and-Replace block format instead of exact-line-number unified diffs; validate SEARCH blocks exist in target file before applying. |
| **Upstream Version Data is Stale or Wrong** | Medium | Medium | Query Maven Central / Nexus API at analysis time; cache with short TTL; present version candidates to user for confirmation. |
