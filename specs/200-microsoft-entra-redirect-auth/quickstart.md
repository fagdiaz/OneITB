# Quickstart: Microsoft Entra Redirect Authentication

## Finite verification

```powershell
Set-Location "FrontEnd/OneItb-FE"
npm.cmd test -- --run src/auth/microsoftEntraConfig.test.js src/auth/microsoftRedirectFlow.test.js src/Components/auth/MicrosoftInstitutionalLogin.test.jsx src/Components/auth/MicrosoftRedirectCallback.test.jsx
npm.cmd test -- --run
npm.cmd run build
```

## Static safety checks

```powershell
rg -n "loginPopup|acquireTokenPopup" FrontEnd/OneItb-FE/src
git diff --check
```

## External acceptance gate

Configure the SPA App Registration redirect URI as:

```text
http://localhost:5173/auth/microsoft/callback
```

The real tenant/browser smoke is intentionally not executed by this spec because the
request prohibits starting servers and no external identity acceptance may be inferred.
