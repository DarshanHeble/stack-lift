# Success Metrics & Engineering KPIs

## 1. Measurable Success Criteria

StackLift rejects subjective or unverified claims. Success is measured strictly against tangible engineering outcomes on representative test repositories.

| Metric | Definition | Target Baseline (MVP) | Measurement Source |
| :--- | :--- | :--- | :--- |
| **Analysis Completion Rate** | Percentage of eligible Java/Maven repositories parsed without fatal errors | >= 95% | ModernizationJob logs |
| **Time to Migration Plan** | Latency from repository ingestion to a fully structured, reviewable plan | < 60 seconds | Ingest-to-Plan timer |
| **Build Success Rate** | Percentage of generated patches that pass `mvn clean compile` in the sandbox | >= 85% | ValidationRun exit codes |
| **Test Regression Rate** | Rate at which previously passing unit tests fail post-patch | < 5% | Surefire test reports |
| **Patch Acceptance Rate** | Percentage of proposed patches accepted by reviewing engineers without manual edits | >= 75% | User approval audits |
| **Recovery via Retry Rate** | Percentage of initial build failures resolved by automated diagnostic self-healing | >= 40% | Retry loop tracking |
| **Traceability Ratio** | Percentage of modernized steps linked to exact source commits, diffs, and container logs | 100% | Report audit verification |

---

## 2. The "Truth in Modernization" Rule

> [!IMPORTANT]
> **StackLift Transparency Contract:**
> A modernization run is **NEVER** marked as `SUCCEEDED` unless:
> 1. The patch applies cleanly.
> 2. The project compiles with zero fatal errors.
> 3. All existing pre-migration tests execute and pass.
> 4. Security scanners report zero newly introduced high/critical vulnerabilities.
> 
> If a project lacks unit tests, the report explicitly states: *"Compilation verified. Runtime behavior unverified due to absence of automated test suite."*
>
> If a project mixes unit and integration tests and integration tests are skipped, the report explicitly states: *"Unit tests passed. Integration tests were skipped due to external service dependencies not present in sandbox. Manual integration verification required."*
