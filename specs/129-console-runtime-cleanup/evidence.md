# Evidence: Frontend Console Runtime Cleanup

**Date**: 2026-06-19
**QA risk**: HIGH (JWT, GraphQL, WebSocket lifecycle, outbound URL fetching)

## Diagnosis

- `Drz51tb_-7c4W3yn1GpXoUJhhkELFPQUMd3_Ntwlua8.js`, nested `eval`, `Window.fullScreen`, and Firefox fingerprinting messages are external browser/extension sources. They are absent from the repository and from the clean in-app browser.
- The application-owned entry was `MessageReceived` with `Socket closed` during page load.
- Runtime reproduction showed the backend could crash before listening because the local SQL encryption error was logged through Windows Event Log without permission.
- Spec 128's anonymous endpoint only checked URL scheme and was SSRF-vulnerable; route renaming and removing JWT did not address that risk.

## Implemented

- Mini chat skips `MessageReceived` while collapsed; full chat remains subscribed.
- Expected socket shutdown while the page is hidden is not emitted as a GraphQL operation error.
- Link preview now uses authenticated GraphQL and a bounded service with DNS/IP, port, redirect, timeout, response-size, content-type, and regex-timeout controls.
- Development logging no longer uses Windows Event Log. SQL encryption is strict by default and disabled only in `appsettings.Development.json` for local SQL Express.
- Duplicate feed query logging was removed; Apollo remains the single diagnostic logger and the UI keeps its error state.

## Executed Checks

- QA preflight with HIGH-risk scope: PASS.
- Backend Release build: PASS, 0 errors. A full compile also reports pre-existing nullability warnings outside this feature; the new preview service adds none.
- Frontend Vite build: PASS, 330 modules. Existing bundle-size and Vite plugin deprecation warnings remain terminal build debt, not browser-console findings from `errores.txt`.
- Actual schema introspection: `Query.linkPreview` present.
- Unauthenticated `linkPreview`: rejected with `AUTH_NOT_AUTHENTICATED`.
- Authenticated unsafe targets: loopback, `10.0.0.1`, `169.254.169.254`, credential-bearing URL, and port `8443` all returned `success: false`.
- Clean browser initial load: no warning/error entries and none of the external `Drz51...js` sources reproduced.

## Blocked Runtime Checks

- A valid public preview returned the designed graceful failure because outbound access from the isolated backend process was unavailable; successful external metadata retrieval remains unverified.
- Authenticated feed and chat browser flow could not be completed: the isolated process cannot create an SQL SSPI context, and the browser cannot reach that isolated backend process reliably.
- HTTPS Kestrel verification is blocked by the missing developer certificate in the execution environment. The user's IIS Express profile remains configured for port `44397`.
- Real-time message delivery was not re-executed; static contract and build pass, and the subscription remains active when mini chat or full chat is open.

## Residual Risk

- Re-run authenticated feed, mini-chat, full-chat, and one valid public preview in the normal IDE environment with SQL Server and its development certificate available.
- Browser extension warnings can only be removed by disabling or repairing the responsible Firefox extension/profile; application code cannot clean that external console output.
