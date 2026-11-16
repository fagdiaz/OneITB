# Evidence: Microsoft Entra Redirect Acceptance

## Root cause

- Observed blocking error: `AADSTS50011`.
- Requested URI: `http://localhost:5173/auth/microsoft/callback`.
- Local frontend configuration: exact callback present (value comparison only).
- Backend Entra settings: required keys present and structurally valid (values not printed).
- Conclusion: local code/config agree; external SPA registration requires alignment.

## Security classification

- Microsoft CSP `unsafe-inline` message: external and non-blocking.
- Browser SSO not supported: external telemetry and non-blocking.
- Third-party cookie/storage partition warnings: browser/Microsoft behavior.
- Microsoft OneCollector CORS failure: telemetry endpoint, not OneITB GraphQL.
- None justify relaxing OneITB CORS, CSP, or security headers.

## Automated evidence

- Speckit QA HIGH: PASS.
- Backend Release preflight: 0 warnings, 0 errors.
- Focused Entra tests: 46/46 PASS.
- Complete frontend suite: 151/151 PASS.
- Vite production build: 551 modules, PASS in 862 ms.
- Redirect validation accepts localhost/loopback HTTP and remote HTTPS; rejects remote
  HTTP, query, fragment, and embedded credentials.
- Static popup scan: no active `loginPopup` or `acquireTokenPopup` call.
- `git diff --check`: PASS.

## Speckit Analyze

- Requirements: 9; tasks: 15.
- Requirement coverage: 100%; FR-001 to FR-009 map to implementation, tests,
  documentation, or the explicit external acceptance task T015.
- Constitution conflicts: none.
- Critical/high ambiguities or duplicated requirements: none.
- Residual risk: T015 depends on Microsoft Entra portal propagation and a real
  institutional browser session.

## External acceptance

Pending operator save in Microsoft Entra and real institutional browser smoke. Do not mark
Spec 202 externally verified until success, cancellation/retry, logout, and second-session
isolation are observed.
