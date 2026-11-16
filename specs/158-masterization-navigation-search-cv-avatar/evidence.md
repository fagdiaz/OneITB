# Evidence: Spec 158

## Implementation Summary

- Header/Nav: removed focus-driven glow classes from the brand, nav buttons, search button, and notification button. Persistent active state remains route-based through `useLocation().pathname`.
- Notification bell: the open dropdown now applies the same illuminated active style used by search.
- Global search: search button now toggles open/closed, outside click closure remains active, career/subject filters are compact multi-select dropdowns, and subjects are discoverable by code/name.
- Backend search: `inquiries` and `inquiriesPage` accept optional `careerIds` and match search terms against publication content, author identity/email, comments, and comment author identity.
- Feed: `/feed?q=...` now renders a search result structure with `Resultados de Perfiles` above `Resultados de Publicaciones`, 15 publication results per page, `Buscar mas`, and an explicit end state.
- CV print: contact/social data now renders as direct contact first (`phone`, `email`) and social links second.
- Profile edit: avatar file selection opens a native canvas editor before uploading the edited JPEG through `uploadAttachment(file, token)`.
- Avatar editor: modal size reduced and layout constrained to image preview on the left and editing controls on the right from medium screens upward.
- Vite build config: production build no longer loads the legacy React Babel plugin that emitted the Vite 8 `esbuild` deprecation warning.

## Commands Executed

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
```

Initial result:

```text
FAILED: Account did not expose Username in SocialService search predicate.
```

Correction:

```text
Removed Account.Username from inquiry search and retained Account.Email.
```

Final result:

```text
Compilacion correcta.
0 Advertencia(s)
0 Errores
```

```powershell
npm.cmd run build
```

Working directory:

```text
F:\React\OneITB23\FrontEnd\OneItb-FE
```

Result:

```text
vite v8.0.16 building client environment for production...
341 modules transformed.
built in 1.33s
```

## Verification Notes

- Frontend production build completed with 0 compilation errors and no Vite warnings in the final run.
- Backend Release build completed with 0 warnings and 0 errors after correcting the search predicate.
- Browser runtime verification remains recommended for the canvas avatar flow against a running authenticated backend session.
