# Evidence: Spec 176 - QA Resolution and UX Polish

## Scope Clarification

The user prompt says "7 bugs" but lists 8 issues. This spec treats all 8 listed items as required.

## Implemented Fixes

- Backend GraphQL limits:
  - Raised max execution depth from 10 to 15.
  - Added explicit HotChocolate cost limits through `ModifyCostOptions`.
  - Added parser guardrails for nodes, tokens and fields.
- Registration Alias removal:
  - Removed `Username` from `RegisterInput`.
  - Removed Alias validation and input from `Register.jsx`.
  - Removed Alias from registration mutation variables.
  - Updated service tests to the new constructor signature.
  - Kept the GraphQL `alias` field on `User` as compatibility output because existing profile queries still request it.
- Header responsive hardening:
  - Added max-width/min-width guards to header, nav and layouts.
  - Added horizontal overflow containment to public/private layouts.
- Search filters contrast:
  - Selected careers/subjects now render with explicit light background and dark text inside the dark popover.
- Profile edit redirect:
  - Successful profile save navigates back to `/profile`.
- Chat widget behavior:
  - Widget closes on route changes.
  - Widget closes on outside click with listener cleanup.
- Password reveal focus:
  - Login and register reveal buttons prevent `mousedown` from stealing input focus.

## Commands Executed

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; & ".agents/skills/speckit-qa/scripts/preflight.ps1" -RunBuilds
```

Result: PASS before implementation. Backend and frontend baselines were clean.

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
```

Result: PASS, 0 warnings, 0 errors.

```powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
```

Result: PASS, 39/39 tests.

```powershell
npm.cmd run build
```

Directory: `FrontEnd/OneItb-FE`

Result: PASS, 352 modules, build in 1.56s.

```powershell
git -c core.autocrlf=false diff --check
```

Result: PASS after normalizing `DTOs.cs` and `Register.jsx` line endings.

## Runtime Notes

- Browser regression was not executed in this automated run. The implemented changes are covered by build/tests and should be manually verified in the QA browser pass:
  - Header split-screen width.
  - Career/subject selected filter contrast.
  - Chat widget outside click and route-close behavior.
  - Profile save redirect.
