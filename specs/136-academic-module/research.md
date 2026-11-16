# Research: Academic Module

## Decision: Academic resources are independent from feed inquiries

**Rationale**: The roadmap explicitly separates academic resources from social publications. Keeping resources in their own table avoids feed algorithms, social moderation semantics and publication soft-delete behavior leaking into study material.

**Alternatives considered**:
- Reuse `Inquiry` with a resource type flag: rejected because feed ranking, reactions, reports and comments are unrelated to official study material.
- Store resources only as files without metadata: rejected because users need subject, uploader, title and link context.

## Decision: Resources use logical deactivation, not physical deletion

**Rationale**: The constitution requires restrictive relationship handling and the existing project avoids physical deletion for user-facing content. `IsActive` allows resources to disappear from normal lists while preserving audit/debug context and upload references.

**Alternatives considered**:
- Physical delete resource rows: rejected due to FK/file reference risk.
- Versioning in this spec: deferred because roadmap keeps search/categories/versioning as a separate pending item.

## Decision: Progress is unique by student and subject

**Rationale**: The current P2 goal is progress/grades by materia, not a full transcript with multiple exam attempts. A single current-state record supports demonstration and prevents duplicate ambiguity.

**Alternatives considered**:
- Append-only grade events: stronger audit but larger scope and UI complexity.
- Store grades on UserCareer: rejected because grades are subject-level.

## Decision: Authorization rules stay in the backend service layer

**Rationale**: Frontend controls are convenience only. The constitution requires protected operations to validate JWT identity and role server-side. Services can reuse `UserCareer` membership and avoid resolver bloat.

**Alternatives considered**:
- Resolver-only checks: rejected because the rules would duplicate across queries/mutations.
- Frontend-only role gating: rejected as insecure.

## Decision: Resource visibility is based on subject career membership

**Rationale**: The project currently models user enrollment at career level, not course enrollment. Career membership is the strongest available relationship to authorize subject material.

**Alternatives considered**:
- Allow all authenticated users to see all resources: rejected because it ignores career/materia permissions in the roadmap.
- Add user-subject enrollment: rejected as larger than P2 and overlapping with future cursadas.

## Decision: Avoid N+1 with explicit includes and projection-friendly query shapes

**Rationale**: HotChocolate projections are already used for simple lists, but authorization-filtered service methods benefit from explicit `Include`/`ThenInclude` for stable runtime contracts. Queries return bounded subject-scoped or user-scoped sets.

**Alternatives considered**:
- DataLoader-first implementation: useful for broader graphs but unnecessary for the bounded operations in this spec.
- Lazy loading: rejected because it risks N+1 and is not the local pattern.
