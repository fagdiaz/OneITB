# Contract: Local Infrastructure Acceptance Gates

## Gate 1 - Moderator Seed

- Exactly one canonical account and user.
- Password hash preserved after a second seed.
- JWT role equals `Moderador`.
- No plaintext password in logs/evidence.

## Gate 2 - Moderator Authorization

- Silence, report transition and reversible hide/restore are allowed.
- Foreign text edit, administrator role change and administrator deactivation are denied.
- Denied operations produce no write.
- Successful moderation produces one bounded audit record with reason.

## Gate 3 - Session Boundary

- Logout removes canonical identity keys.
- Apollo protected cache is cleared.
- WebSocket transport is disposed.
- Session epoch prevents late A responses from entering B.
- Student and Moderator state never coexist.

## Gate 4 - Redis Infrastructure

- Container health reports ready.
- Real client `PING` succeeds.
- Sender/receiver resolve from independent providers.
- Event crosses providers exactly once within 10 seconds.
- Unrelated topic observes zero events.
- Connections and subscriptions are disposed.

## Gate 5 - SMTP Capture

- Container health reports ready.
- `SmtpEmailService` completes without exception.
- Mailpit API contains exactly the expected bounded fixture.
- Recipient and subject match.
- Content contains no forbidden secret pattern.
- Fixture is deleted.

## Gate 6 - Repository Baseline

- Backend/frontend suites pass.
- Backend Release and Vite production builds pass.
- EF model has no pending changes.
- `git diff --check` passes.
- Staged/working diff contains no credential.

## Gate 7 - Cleanup

- Acceptance services are stopped by default.
- Acceptance ports are released.
- SQL container/volume remains untouched.
- No mail, Redis key, PID or temporary file owned by the run remains.

## Non-Claims

- Mailpit does not verify production SMTP.
- Local Redis does not prove managed-cloud Redis.
- Cross-provider Redis delivery does not by itself prove an external WebSocket handshake.
- Cloudinary and Google SSO remain blocked without credentials.
