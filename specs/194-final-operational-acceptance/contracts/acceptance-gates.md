# Contract: Final Operational Acceptance Gates

## Baseline

- Backend and frontend tests exit `0`.
- Release/Vite builds exit `0`.
- EF Core reports no pending model changes.
- Docker SQL reports healthy.
- Compose configuration parses without secret substitution errors.
- Dependency and diff checks report their actual result.

## Temporary Host Lifecycle

1. Validate target port availability.
2. Start the backend as a hidden child process.
3. Poll `/health` until success or deadline.
4. Execute finite smoke operations.
5. Stop the recorded PID in `finally`.
6. Assert that the PID no longer exists.
7. Remove only the run-owned temporary directory and fixtures.

## Security Gates

- Valid upload: HTTP 200 and generated URL.
- Hostile/truncated upload: HTTP 400 with stable public error and no persisted file.
- Magic Link threshold: generic success before threshold; `AUTH_RATE_LIMITED` after threshold; recovery after the configured test window.
- Magic Link request response: no token/credential field.
- Silenced reaction: `USER_ERROR`, zero reaction delta and zero notification delta.
- Logs: no JWT, one-time credential, password, full email or email body.

## Pagination Gates

- `inquiries` legacy field absent from schema.
- `inquiriesPage` returns at most 25 and stable cursors.
- Profile/admin author filtering occurs server-side.
- `academicStudents` returns at most 50 and stable ordering.
- Unauthorized actor receives controlled authorization error.

## Session and Browser Gates

- Logout removes canonical `token` and `user`.
- Apollo protected entities are cleared before the next identity is persisted.
- GraphQL WebSocket is terminated and stale payloads are ignored.
- Application-owned console errors/warnings are recorded.
- Provider/bootstrap failures render the institutional recovery view.

## Status Rules

- `[V]`: runtime/browser or real-provider evidence executed successfully.
- `[I]`: implementation and automated evidence pass, but a required operational gate remains.
- `[B]`: execution requires unavailable external settings or institutional approval.
- No status may be promoted from documentation alone.
