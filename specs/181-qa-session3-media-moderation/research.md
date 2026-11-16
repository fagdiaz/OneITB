# Research: QA Session 3

## Decision 1 - Keep global anti-framing policy

- **Decision**: Preserve `X-Frame-Options: DENY`. Fetch locally hosted PDFs and render an object URL only after explicit user action; provide external-open fallback.
- **Rationale**: `SAMEORIGIN` would still reject the development frontend because ports differ, while weakening headers globally increases clickjacking risk.
- **Alternatives considered**: Global `SAMEORIGIN`; removing the header for uploads; adding a PDF rendering dependency. The first two are insecure or ineffective, and the dependency is unnecessary.

## Decision 2 - Persist cover with order plus one boolean

- **Decision**: Add `Inquiry.PreferAttachmentCover`. The selected attachment is normalized to `SortOrder = 0`; the boolean distinguishes attachment-first from YouTube-first.
- **Rationale**: It covers every requested state without a nullable polymorphic FK or storing duplicate external URLs.
- **Alternatives considered**: `CoverAttachmentId` plus YouTube fields; `IsCover` on every attachment; UI-only state.

## Decision 3 - Separate author state from moderation state

- **Decision**: Keep `IsActive` for author soft-deactivation and add `IsHiddenByModerator` to `Inquiry` and `Comment`. Moderation writes and audit share one unit of work.
- **Rationale**: It prevents privileged text tampering, keeps decisions reversible, and distinguishes user intent from institutional action.
- **Alternatives considered**: Reusing `IsActive`; physical deletion; visibility only in audit rows.

## Decision 4 - Replace attachment sets atomically

- **Decision**: Optional edit attachment input means `null = unchanged`, empty list = remove all, populated list = validate and replace metadata in one save.
- **Rationale**: Deterministic API semantics reuse existing upload validation and ordering.
- **Alternatives considered**: Per-file add/remove mutations, which create partial states and extra round trips.

## Decision 5 - Idempotent unread reminder

- **Decision**: A configurable hosted worker groups qualifying unread messages per receiver. `NotificationService` upserts a fixed group key and only republishes when a newer qualifying message exists.
- **Rationale**: Repeated cycles do not spam rows or WebSocket events, and existing preferences remain authoritative.
- **Alternatives considered**: One notification per message, in-memory timers, and jobs per message.

## Decision 6 - Honest console scope

- **Decision**: Fix first-party lifecycle, permissions, and resource handling. Do not intercept or filter warnings from YouTube or Firefox's internal PDF viewer.
- **Rationale**: Application-level suppression hides actionable failures and cannot change external scripts.
- **Alternatives considered**: ErrorBoundary/log filtering/Vite suppression.

## Canonical document mapping

The planning skill references historical filenames. Their canonical replacements are:

- `REQUERIMIENTOS.md` -> `docs/project_docs/scope-and-requirements.md`
- `PLAN_DE_MITIGACION_EVALUACION.md` -> `docs/audit/FINAL_AUDIT_REPORT.md` plus `docs/project_docs/ROADMAP.md`

No duplicate documentation files are created.
