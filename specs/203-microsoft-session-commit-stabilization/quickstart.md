# Quickstart: Spec 203 Validation

Run finite checks only from the repository root.

```powershell
Set-Location "FrontEnd/OneItb-FE"
npm.cmd run test -- --run src/context/AuthContext.test.jsx src/Components/auth/MicrosoftRedirectCallback.test.jsx src/Components/user/Login.test.jsx src/Components/onboarding/RequireAcademicOnboarding.test.jsx
npm.cmd run test -- --run
npm.cmd run build
```

Static safety checks:

```powershell
rg -n "loginPopup|acquireTokenPopup" FrontEnd/OneItb-FE/src
rg -n "accessToken|oneitb-jwt" FrontEnd/OneItb-FE/src/Components/auth
git diff --check
```

Manual acceptance is performed separately with the existing local servers and real
institutional account. No secret or token is copied into evidence.

