# Specification Quality Checklist: Credential Delivery and Cryptographic Policy Hardening

**Created**: 2026-07-27  
**Feature**: [spec.md](../spec.md)

## Credential Security

- [x] Raw Magic Link is absent from GraphQL, database and logs.
- [x] Generic responses prevent account enumeration.
- [x] Fragment delivery and URL cleanup are specified.
- [x] Replay, expiry and concurrent consumption are tested.
- [x] Production and Development delivery policies are distinct and safe.

## Cryptographic Policy

- [x] BCrypt cost is explicit and centrally governed.
- [x] Existing hashes remain compatible.
- [x] Rehash-on-success is covered.
- [x] Test-only reduced cost cannot reach Production.
- [x] JWT secret ownership and minimum validation are explicit.

## Readiness

- [x] Coordinated frontend/backend rollout is planned.
- [x] Migration expectation and old-link invalidation are documented.
- [x] No unresolved clarification remains.
- [x] Spec is ready for high-reasoning implementation.

