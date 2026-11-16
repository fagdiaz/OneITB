# Evidence: Spec 160

## Implementation Summary

- Registration now sends and persists a non-administrative public role plus selected active career IDs.
- Backend registration validates public roles (`Estudiante`, `Profesor`, `Egresado`) and active careers before creating `UserCareer` links.
- Registration UI includes confirm-password validation, role selector, career checklist and redirects to `/login` with success feedback.
- Profile save preserves the existing `avatarUrl` when no new edited upload is produced.
- Avatar editor clamps zoom/pan math using rotated image bounds so exported canvas remains covered.
- Messaging contacts expose `avatarUrl`; Apollo chat operations request contact and sender/receiver avatars.
- Header `Mensajes` shows an unread badge from `messagingContacts`.
- Chat contact lists strongly highlight unread conversations.
- Received chat bubbles render sender avatar/fallback.
- Fake contact presence labels were removed and replaced with transport status where relevant.
- Global search hides the career filter for single-career normal users and implements the required `Todas` subject behavior.

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
- Elapsed: `00:00:06.53`

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
- `built in 607ms`
- `0` compilation errors

## Runtime Notes

- Browser runtime and GraphQL operation smoke tests were not executed in this pass.
- Registration, profile avatar retention, chat unread/avatar rendering, and smart filters should receive manual QA against the running Docker SQL environment before being marked `[V]` in `ROADMAP.md`.
