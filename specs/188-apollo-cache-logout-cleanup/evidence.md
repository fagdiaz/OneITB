# Evidence: Apollo Logout Session Isolation

## Implemented Boundary

- `GraphQLProvider.requestSessionTermination()` is the single idempotent coordinator for manual logout, JWT expiration, cross-tab logout and identity replacement.
- Credentials and React identity are cleared before Apollo cache cleanup.
- `clearStore()` purges memory without refetching protected queries; a direct cache reset is used only as a defensive fallback.
- The GraphQL WebSocket client is terminated and the session epoch increments before old in-flight payloads can update the new session.
- Login awaits any pending termination before persisting the next identity.
- Persisted user JSON is parsed defensively and invalid values are removed.

## Automated Evidence

- Cache fixture includes `User`, `Inquiry`, `Comment`, `Message`, `Notification`, `AcademicResource`, `JobOffer` and `JobApplication`.
- Tests prove complete purge, A-to-B isolation, absence of reset refetch, concurrent termination coalescing and stale-result rejection.
- AuthContext tests prove malformed hydration recovery and the ordered A logout -> purge -> B login sequence.
- Focused session tests: PASS, 5/5.
- Full frontend suite: PASS, 23 files and 54 tests.
- Vite production build: PASS, 374 modules in 797 ms.

## Browser Evidence

- The public employer-auth route rendered successfully after the session refactor.
- Browser console audit: no errors or warnings.
- The cross-identity cache invariant is enforced by deterministic automated tests; the final two-account visual regression remains part of the presentation checklist, not a known implementation defect.

## Status

**Verified** at state, cache and transport-contract level. No commit or push was performed.
