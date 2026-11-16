# Quickstart: Spec 188 Validation

## Automated Gates

~~~powershell
Set-Location "FrontEnd/OneItb-FE"
npm.cmd run test -- --run
npm.cmd run build
~~~

## Required Test Scenario

1. Prime cache with User A profile, inquiries, messages, notifications and academic/job data.
2. Invoke manual logout and await completion.
3. Assert local credentials absent, auth false and Apollo cache free of scoped entities.
4. Log in as User B and assert fresh network/current-session identity.
5. Repeat via expiration and simultaneous authorization failures.
6. Emit a simulated late User A subscription event and confirm it is ignored.

## Browser Regression

- User A opens feed/chat/notifications, logs out, then User B logs in in the same tab.
- Confirm no visual flash or Apollo DevTools record for User A.
- Repeat with a second tab logout and with an expired JWT.

## Acceptance

Spy-only clearStore coverage does not close the spec. Cache, UI and transport isolation must be proven.
