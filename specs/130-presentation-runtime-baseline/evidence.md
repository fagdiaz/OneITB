# Evidence: Presentation Runtime Baseline

## Status

Implemented with runtime blockers recorded. Application-owned static console causes found in the captured log were corrected where evidence supported a repository fix. Authenticated browser/feed validation remains blocked by local SQL SSPI and missing HTTPS developer certificate in this execution environment.

## Known Inputs

- `Errores.txt` and `errores.txt` currently contain the same captured console output.
- Active branch before this spec was created: `129-console-runtime-cleanup`.
- Existing spec 129 has pending code changes and two unverified runtime criteria: clean-browser app console and open-chat realtime behavior.

## Initial Classification Hypothesis

| Finding | Likely ownership | Action |
|---|---|---|
| Vite connection and React/Apollo DevTools recommendations | Development tooling | Document as non-error development noise unless production build shows them |
| Feature Policy warnings for `autoplay`, `encrypted-media`, `picture-in-picture` | Application-owned integration or browser policy mismatch | Verify iframe attributes and browser support in active bundle |
| YouTube `__Secure-YEC` third-party cookie warnings | Third-party embed/browser privacy behavior | Prefer privacy-conscious embed configuration; document residual external warning if unavoidable |
| CORS blocked `data:text/plain;base64,Cg==` | Needs ownership verification | Identify caller before changing CORS |
| Firefox fingerprinting warning | Browser privacy feature | External, not application-owned |
| `unreachable code after return statement` in minified random script | Third-party or injected script until proven otherwise | Verify source URL and clean profile behavior |

## Execution Log

### 2026-06-23 - Baseline

- Active feature: `specs/130-presentation-runtime-baseline`.
- Working branch observed: `129-console-runtime-cleanup`.
- `git status --short` showed pending spec 129 changes plus this spec work; no revert was performed.
- `Errores.txt` and `errores.txt` contain identical captured console output.

### Console Finding Classification

| Finding | Ownership | Resolution |
|---|---|---|
| `[vite] connecting/connected` | Development tooling | Non-error development status. No production action. |
| React DevTools / Apollo DevTools recommendations | Development tooling | Non-error recommendation. No application fix. |
| `Feature Policy: Saltandose funcion no soportada llamada "autoplay/encrypted-media/picture-in-picture"` | Application-owned iframe integration | Fixed by removing noisy iframe `allow` directives and using privacy-conscious YouTube embeds. |
| YouTube `__Secure-YEC` third-party cookie warnings | Third-party embed / browser privacy | Mitigated by switching embeds to `youtube-nocookie.com`; residual cookie/storage warnings remain external if provider emits them. |
| `Solicitud de origen cruzado bloqueada ... data:text/plain;base64,Cg==` | External or third-party until proven otherwise | Static search found no app-owned `data:text/plain` source. No CORS policy expansion was added. |
| Firefox fingerprinting warning for `screen.availWidth/availHeight` | Browser privacy feature | External. No application fix. |
| `unreachable code after return statement` in random minified script | Third-party or injected script | Static search found no matching app-owned source. No local suppression added. |

### Code Changes With Evidence

- `API Graphql/OneITB/Properties/launchSettings.json`: aligned `OneITB` launch profile to `https://localhost:44397;http://localhost:5000`, matching Apollo/upload defaults and runbook.
- `API Graphql/OneITB/appsettings.json`: aligned local JWT issuer/audience with `https://localhost:44397/`.
- `API Graphql/OneITB/Startup.cs`: configured Development DataProtection keys under `App_Data/DataProtection-Keys` and protects them with DPAPI on Windows, avoiding the user-profile key ring failures seen during runtime.
- `.gitignore` and `API Graphql/OneITB/App_Data/DataProtection-Keys/.gitkeep`: keep generated Development keys out of source control.
- `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx` and `MediaAttachment.jsx`: switched YouTube embeds to `https://www.youtube-nocookie.com/embed/{id}`, removed noisy `allow` feature-policy declarations, and retained `allowFullScreen` plus strict referrer policy.
- `docs/audit/RUNBOOK_DEV.md`: documented `--launch-profile OneITB`, port alignment, HTTPS dev certificate prerequisite, and DataProtection key behavior.

### Static Verification

- Search found no references to removed preview endpoints:
  - `/api/metadata`
  - `/api/link-info`
  - `/api/link-preview`
- Search found no app-owned references to:
  - `data:text/plain`
  - `mozPressure`
  - `mozInputSource`
  - `www.youtube.com/embed`
  - YouTube iframe `allow` directives containing `autoplay`, `encrypted-media`, `picture-in-picture`, `gyroscope`, `accelerometer`, or `web-share`

### Build and QA

- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`: PASS, 0 errors. Manual build after a restore surfaced 10 existing nullable warnings in `Mutation.cs` and `Query.cs`; QA preflight build reported PASS and did not classify them as introduced by this spec.
- `npm.cmd run build` from `FrontEnd/OneItb-FE`: PASS, 330 modules. Vite reports existing tooling/bundle warnings (`vite:react-babel` esbuild deprecation and chunk > 500 kB).
- QA preflight with builds: PASS.
- `git -c core.whitespace=cr-at-eol diff --check`: PASS.

### Runtime Verification

- `dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB` was blocked by NuGet network access in this execution environment even with `--no-restore`.
- Running the compiled DLL from `API Graphql/OneITB` with `ASPNETCORE_URLS=http://localhost:5000`:
  - GraphQL HTTP returned `{"data":{"__typename":"Query"}}`.
  - CORS preflight from `http://localhost:5173` to `/graphql` returned `204`, `Access-Control-Allow-Origin: http://localhost:5173`, `Access-Control-Allow-Methods: POST`, and `Access-Control-Allow-Headers: authorization,content-type`.
  - Backend started in Development and served HTTP.
  - SQL seeding logged `Failed to generate SSPI context`; this is an environment/database authentication blocker.
  - HTTP-only runtime logged `Failed to determine the https port for redirect`; expected because the HTTPS endpoint was intentionally not started for this isolation check.
- Running the compiled DLL with `ASPNETCORE_URLS=https://localhost:44397;http://localhost:5000`:
  - DataProtection user-profile key ring errors no longer appeared after the local key configuration.
  - Startup remained blocked by missing or untrusted HTTPS developer certificate.
- `npm.cmd run dev -- --host 127.0.0.1`: Vite served `http://127.0.0.1:5173/` with HTTP 200.

### Blocked Checks

- Clean-browser authenticated feed console could not be validated because login/feed require a working SQL Server authentication path.
- HTTPS browser validation could not be completed because the current environment lacks a valid trusted ASP.NET development certificate.
- Mini chat open realtime delivery, YouTube/media runtime, and upload/rich media display remain blocked behind authenticated feed/runtime availability.

### Follow-up Activation Notes

- Activate `131-media-embed-console-contract` only if a normal IDE/browser environment still shows application-owned media warnings after this spec.
- Activate `132-realtime-chat-console-contract` only if a normal IDE/browser environment still shows application-owned WebSocket warnings or chat delivery regressions after this spec.
