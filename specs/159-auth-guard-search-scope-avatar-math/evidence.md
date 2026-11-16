# Evidence: Spec 159

## Implementation Summary

- `Header.jsx` only mounts `GlobalSearch` when an authenticated session and token exist.
- `Nav.jsx` skips the `GET_USER_PROFILE` avatar/profile query unless the session is authenticated and hydrated with a token and user id.
- `GlobalSearch.jsx` now has an explicit `Todas` state for subject filters, keeps it selected by default, clears explicit subjects when toggled, and disables it when a specific subject is selected.
- `SocialService.GetInquiries` enforces backend career scoping for normal users from `UserCareer`, independent of client-provided filters.
- `Administrador` and `Moderador` keep global visibility for feed/search/moderation use cases.
- `Query.GetPublicProfile` scopes publication and comment metrics by viewer career intersection for normal users.
- `/profile` and `/profile/edit` now build `CVPrintTemplate` contact data with the same phone/email/social mapping.
- `AvatarEditorModal.jsx` uses a square crop guide, supports zoom down to `0.1`, and applies drag-to-pan offsets in the same canvas transform pipeline as rotation, flip, filters and vignette.

## Validation Commands

### Backend

Command:

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
```

Result:

- PASS
- `0 Advertencia(s)`
- `0 Errores`
- Elapsed: `00:00:13.18`

### Frontend

Command:

```powershell
npm.cmd run build
```

Working directory:

```text
FrontEnd/OneItb-FE
```

Result:

- PASS
- `341 modules transformed`
- `built in 4.49s`
- `0` compilation errors
- Vite/Rolldown emitted the existing plugin timing advisory for `@tailwindcss/vite:generate:build`; this is a tooling timing warning, not a build failure.

## Runtime Notes

- Browser runtime was not executed in this pass.
- GraphQL runtime schema was not re-introspected in this pass; backend build validates compilation of resolver and service changes.
