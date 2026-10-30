---
name: "speckit-doc-audit"
description: "Specialized documentation consistency and truth-alignment audit engine. Contrasts project docs, academic summaries, architecture specs, and runbooks against actual runtime code. Identifies route mismatches, outdated stack versions, broken links, and diagram-to-code drifts. Preserves development logs as strictly immutable."
compatibility: "Cross-platform. Operates strictly read-only on documentation directories."
metadata:
  author: "github-spec-kit"
  version: "1.0.0"
  type: "doc-auditor"
---

# Speckit Doc Audit - Documentation Consistency Engine

An autonomous engine that audits project documentation, academic deliverables, and runbooks against the **Ground Truth** of actual application code and configurations.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   SPECKIT DOCUMENTATION AUDIT                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────▼───────────────────────────────┐
    │ 1. Boundary & Ingestion Rules                                 │
    │    - Target: `docs/project_docs/`, `docs/academic/`, `docs/audit`│
    │    - EXCLUDE: `specs/` (historical specification archive)    │
    │    - IMMUTABLE: `DEVELOPMENT_LOG.md` (read-only verification)  │
    └───────────────────────────────┬───────────────────────────────┘
                                    │
    ┌───────────────────────────────▼───────────────────────────────┐
    │ 2. Ground Truth Cross-Referencing                             │
    │    - Rutas: Contrast doc URLs vs `Routing.jsx` (/register,etc)│
    │    - Stack Versions: .NET 8, HotChocolate 14.2, React 18, Vite│
    │    - Roles: Spanish names (Administrador, Profesor, etc.)     │
    │    - Gaps: Verify GAP-AUTH-01/02, GAP-PRIV-01, GAP-FILE-01    │
    └───────────────────────────────┬───────────────────────────────┘
                                    │
    ┌───────────────────────────────▼───────────────────────────────┐
    │ 3. Link & Diagram Integrity                                   │
    │    - Relative markdown links (check if files exist)           │
    │    - Mermaid diagram syntax validation                        │
    │    - Terminology normalization                                │
    └───────────────────────────────┬───────────────────────────────┘
                                    │
    ┌───────────────────────────────▼───────────────────────────────┐
    │ 4. Output Generation & State Update                           │
    │    Writes `MODULE_09_DOCUMENTATION_ALIGNMENT.md`              │
    │    Updates `audit_state.json`                                 │
    └───────────────────────────────────────────────────────────────┘
```

## Core Rules

1. **Absolute Immutability of Historical Logs**:
   `docs/audit/DEVELOPMENT_LOG.md` is strictly immutable in content. It must only be inspected for structural coherence, date chronological order, and link validity. It must NEVER be truncated, purged, or reworded.
2. **Exclude Historical Specs (`specs/`)**:
   Do not audit historical specs in `specs/`. They represent frozen iterations.
3. **Actionable Alignment Matrix**:
   Produce a clear table showing:
   | Documento | Sección | Afirmación / Ruta en Doc | Realidad en Código | Corrección Sugerida |
4. **Report Output**:
   Write results to `docs/audit/full_audit/MODULE_09_DOCUMENTATION_ALIGNMENT.md`.
