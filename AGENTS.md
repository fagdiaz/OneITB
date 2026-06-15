<!-- SPECKIT START -->
# OneITB23 Agent Instructions

## Source Of Truth

1. Read `.specify/feature.json` to identify the active feature directory.
2. Read the active feature's `spec.md`, `plan.md`, and `tasks.md` when present.
3. Read `.specify/memory/constitution.md`.
4. Use `docs/audit/fix-roadmap-13-06-2026.md` as the current stabilization baseline.

Active implementation plan:
`specs/104-realtime-private-messaging/plan.md`

Do not infer that a feature works because its tasks are checked or because it appears in
`docs/audit/DEVELOPMENT_LOG.md`. Runtime evidence takes precedence over historical notes.

## Current Technical Baseline

- Backend: .NET 8, Entity Framework Core 8.0.6, HotChocolate 14.2.0, SQL Server.
- Frontend: React 18, Apollo Client 3.7, Vite 8, Tailwind CSS 4.
- All client-server application operations use `/graphql`.
- Code and GraphQL names are English. Spanish is reserved for user-facing UI text.

## Stabilization Priority

Until the feed is verified end to end, prioritize:

1. GraphQL schema alignment for `Inquiry`, `User`, and `Subject`.
2. Authenticated publication creation.
3. Apollo cache/refetch behavior after publication creation.
4. Persistence verification after browser reload.
5. JWT, CORS, and session-storage constitutional compliance.

Avoid unrelated refactors while these gates remain open.

## Required Validation

- Backend changes: `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`.
- Frontend changes: `npm.cmd run build` from `FrontEnd/OneItb-FE`.
- GraphQL changes: validate the actual running schema and execute the affected operation.
- User-facing frontend changes: verify the flow in a browser when the local app is available.

Compilation alone is not proof that a GraphQL operation or user flow works.

## Spec Definition Of Done

Every implemented spec must:

1. Complete and check all required tasks in its `tasks.md`.
2. Record commands and runtime checks that were actually executed.
3. Update `docs/project_docs/ROADMAP.md` only from checklist evidence.
4. Add exactly one entry to `docs/audit/DEVELOPMENT_LOG.md` immediately below
   its introductory block. Never append completed specs to the bottom. Keep all
   entries ordered newest to oldest.
5. Update `docs/audit/DOCUMENTATION_STATUS.md` when canonical documents or status change.
6. Leave unverified behavior explicitly marked as unverified or blocked.

Do not create automatic commits. Keep commits manual and feature-scoped.
<!-- SPECKIT END -->
