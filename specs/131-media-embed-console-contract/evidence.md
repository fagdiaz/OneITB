# Evidence: Media Embed Console Contract

## Status

Implemented. Initial YouTube rendering now uses a local click-to-load card, so provider iframe scripts are not mounted during feed/comment initial render.

## Input Console Capture

The updated `errores.txt` no longer shows active application-owned GraphQL, CORS, link-preview, or React render errors. The recurring entries are:

| Finding | Ownership | Planned action |
|---|---|---|
| Vite connecting/connected | Development tooling | Document as development status |
| React/Apollo DevTools recommendations | Development tooling | Document as non-error recommendations |
| YouTube third-party cookie/storage partition warning | Third-party iframe/browser privacy | Avoid mounting iframe until explicit playback |
| `unreachable code after return statement` in random/minified YouTube script | Third-party provider script | Avoid executing provider script during initial render |
| Firefox fingerprinting warning for screen dimensions | Browser privacy feature | Document as external |
| `mozPressure`/`mozInputSource` in `base.js` | Third-party provider/browser compatibility | Avoid executing provider script during initial render |

## Execution Log

- 2026-06-23: Activated `specs/131-media-embed-console-contract` after updated console evidence showed remaining noise was tied to auto-mounted YouTube iframes and third-party/browser scripts.
- 2026-06-23: Verified active YouTube iframe render sites:
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaAttachment.jsx`
- 2026-06-23: QA preflight before implementation: PASS.
  - `git-diff-check`: PASS after normalizing LF on previously dirty files that blocked the gate.
  - `frontend-vite-build`: PASS; existing chunk-size warning remains.
- 2026-06-23: Implemented click-to-load YouTube rendering in:
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaAttachment.jsx`
  - `FrontEnd/OneItb-FE/src/Components/publication/MediaComponent.jsx`
- 2026-06-23: Static search found one remaining `youtube-nocookie.com/embed` iframe site, inside `YouTubeEmbed` after local `isPlaying` state is set by a button click.
- 2026-06-23: Static search found no `dangerouslySetInnerHTML`, console suppression, or local warning filters in the publication media layer.

## Validation

- `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; & ".agents/skills/speckit-qa/scripts/preflight.ps1" -RunBuilds`: PASS before implementation.
- `npm.cmd run build` from `FrontEnd/OneItb-FE`: PASS, 332 modules. Existing Vite warnings remain: `vite:react-babel` esbuild deprecation and chunk size over 500 kB.
- `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; & ".agents/skills/speckit-qa/scripts/preflight.ps1" -RunBuilds`: PASS after implementation.
- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore`: PASS, 0 errors; 10 existing nullable warnings in `Mutation.cs` and `Query.cs`.
- Browser-authenticated feed validation was not executed in this environment; see blockers.

## Blockers

- Browser-authenticated feed validation remains blocked in this execution environment by the local SQL SSPI and HTTPS developer certificate issues recorded in spec 130.
- Residual YouTube/browser warnings may still appear after a user explicitly clicks "Reproducir video" because the provider iframe then runs third-party code. That behavior is documented, not suppressed.
