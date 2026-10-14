# Security Scanners & Vulnerability Analysis

## 1. Scanner Suite Overview

StackLift integrates two open-source security tools:

1. **OSV-Scanner (Google)**: Dependency vulnerability detection against the OSV.dev distributed vulnerability database.
2. **Semgrep**: Static Application Security Testing (SAST) rule evaluation against Java source files.

---

## 2. OSV-Scanner Integration

- **Execution**: Runs against `pom.xml` or lockfiles in the ingested codebase.
- **Output Format**: Structured JSON containing vulnerability IDs, affected packages, severity, and fixed version recommendations.
- **Reporting**: The Modernization Report calculates the **vulnerability delta** (e.g., "Resolved 4 High CVEs; 0 newly introduced").

---

## 3. Semgrep SAST Rules

### Selected Rule Packs:
- `p/java`: General Java security vulnerabilities.
- `p/owasp-top-ten`: OWASP Top 10 vulnerabilities.
- **Custom StackLift Rules**:
  - Detection of deprecated cryptographic ciphers (e.g., `DES`, `RC4`, `MD5`).
  - Detection of raw `XMLInputFactory` vulnerable to XXE.
  - Insecure Spring Security configurations (`csrf().disable()`, permissive CORS).

---

## 4. Post-Patch Validation Security Gate

> [!IMPORTANT]
> **Two-Phase Security Scanning**:
> Security analysis is NOT only an ingest-time check:
> 1. **Baseline Scan (`ANALYZING`)**: Discovers existing CVEs and SAST smells in the unmodified repository.
> 2. **Post-Patch Verification Scan (`VALIDATING`)**: Runs OSV-Scanner and Semgrep on the *patched* Working Tree.
> 
> If the patch introduces any new high/critical CVEs or SAST vulnerabilities (such as relaxed security configurations or vulnerable transitive libraries), the step validation fails immediately with `build_result = FAILED` and triggers self-healing or developer alert.
