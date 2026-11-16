# Specification Quality Checklist: GraphQL Mutation Authorization

**Created**: 2026-07-22  
**Feature**: [spec.md](../spec.md)

## Completeness

- [x] All Mutation fields must be classified.
- [x] Public, authenticated, role and ownership layers are distinguished.
- [x] Canonical Spanish roles are explicit.
- [x] Employment, academic, moderation and administration cases are covered.

## Security Correctness

- [x] UpdateProfile is not incorrectly made Admin-only.
- [x] Declarative gates do not replace ownership checks.
- [x] Denied requests require zero side effects.
- [x] Positive and negative tests use the real HotChocolate executor.

## Readiness

- [x] All nine artifacts contain substantive analysis and acceptance gates.
- [x] No migration or frontend security dependency is implied.
- [x] Runtime evidence is mandatory before completion.
