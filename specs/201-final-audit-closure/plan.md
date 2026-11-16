# Implementation Plan: Final Audit Closure

## Technical Context

- Backend: .NET 8, EF Core 8.0.6, Hot Chocolate 14.2.0, SQL Server.
- Frontend: React 18, Apollo Client 3.7, Vite 8, Tailwind CSS 4.
- Testing: xUnit with EF Core InMemory; Vitest and React Testing Library.
- Delivery: Docker Compose templates plus local runbook.

## Constitution Check

| Principle | Plan response |
|---|---|
| Explicit authorization | Add server-side registration, professor/career and privacy checks. |
| Async/cancellation | Pass `CancellationToken` through all new database/rate-limit operations. |
| Bounded execution | Reuse bounded rate limiter and existing pagination. |
| Sanitized errors | Map public registration failures to stable public codes/messages. |
| Relational integrity | Reuse `UserCareer`; no speculative schema change. |
| Evidence truth | Keep external/manual gates pending and report the dirty worktree separately from a candidate SHA. |
| No automatic Git | No commit or push. |

## Workstreams

### A. Registration hardening

1. Add configurable public-registration policy and limiter using the established in-memory/Redis adapter pattern.
2. Restrict public role to `Estudiante` and enforce `@itbeltran.com.ar` in the service.
3. Return a stable generic rejection contract from GraphQL and log internal causes without PII.
4. Add service and contract tests.

### B. Academic authorization

1. Replace broad `Profesor` manager bypass with an asynchronous subject-career scope check.
2. Apply the guard to resource creation/status, student listing and progress upsert.
3. Preserve administrator global access and student/graduate read access only within linked careers.
4. Add allow/deny tests.

### C. Privacy and infrastructure

1. Remove unilateral Follow from both single-profile and search masking decisions.
2. Require production DB connection string injection; no trust bypass in tracked production compose.
3. Verify health/correlation logging and document central observability as an external deployment gate.
4. Keep local static uploads as an accepted demo boundary; do not perform a late breaking media-delivery rewrite.

### D. Documentation and release evidence

1. Reclassify every open audit finding.
2. Synchronize canonical docs after code/tests.
3. Run finite gates; record commands and results in `evidence/evidence.md`.
4. Produce Go/No-Go for academic demo, print package and public production separately.

## Risk Strategy

- **High**: auth/privacy changes. Mitigate with service plus GraphQL tests.
- **Medium**: academic scoping. Reuse existing relationship; no migration.
- **Medium**: production compose. Require explicit secret and preserve dev compose.
- **High operational**: docs/print deadline. Do not automate approval; provide deterministic checklist.

## Rollback

Changes are isolated by service/config/document. Revert the feature-scoped diff if any gate fails; do not reset unrelated worktree changes.
