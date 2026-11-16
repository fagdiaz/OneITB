# Quickstart: Microsoft Entra Redirect Acceptance

## Azure portal configuration

1. Open **Microsoft Entra ID > App registrations > OneITB**.
2. Open **Authentication**.
3. Under **Single-page application (SPA)**, add exactly:
   `http://localhost:5173/auth/microsoft/callback`
4. Remove obsolete `/login` callbacks only after confirming no deployed environment uses
   them.
5. Save and allow a short propagation interval.

## Finite local verification

```powershell
Set-Location "FrontEnd/OneItb-FE"
npm.cmd test -- --run src/auth/microsoftEntraConfig.test.js src/auth/microsoftRedirectFlow.test.js
npm.cmd run build
```

These commands terminate. They do not start Vite or the backend.

## Browser acceptance

1. Open `/login` in a normal browser tab.
2. Select Microsoft authentication once.
3. Authenticate with an allowed `@itbeltran.com.ar` account.
4. Confirm return through `/auth/microsoft/callback` and arrival at the authenticated app.
5. Cancel once and confirm a recoverable Spanish error with no redirect loop.
6. Log out and confirm local session, Apollo cache, and MSAL account state are cleared.
7. Log in with a second account and confirm no identity data from the first account remains.

## Diagnostic rule

`AADSTS50011` means the request URI is not registered exactly for the client application.
It is not corrected with OneITB CORS, `Access-Control-Allow-Origin`, iframe permissions, or
weaker CSP headers.
