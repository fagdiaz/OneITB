# Specification Quality Checklist: Apollo Logout Session Isolation

**Created**: 2026-07-22  
**Feature**: [spec.md](../spec.md)

## Completeness

- [x] Existing clearStore behavior is acknowledged rather than reimplemented blindly.
- [x] Manual, expired and cross-tab session exits are covered.
- [x] Cache, React state and WebSocket lifecycle are all in scope.
- [x] A-to-B isolation and race conditions have measurable outcomes.

## Security and State

- [x] Credentials are removed before cache clearing.
- [x] resetStore refetch risk is explicitly rejected.
- [x] Late old-session events are addressed.
- [x] Cleanup failure remains fail-closed.

## Readiness

- [x] All nine artifacts contain actionable detail.
- [x] No backend or migration change is implied.
- [x] Automated and browser evidence are both required.
