# Implementation Plan: Profile Hydration and Avatar Storage

## Strategy

Model the editor as an explicit state machine: `loading -> ready/pristine -> dirty ->
saving -> saved|error`. Hydrate only from a session-matching `me` result. Keep avatar
binary upload separate from profile URL persistence while presenting both phases as one
coherent user flow.

## Implementation Steps

1. Extract a pure profile-to-form normalizer and a session identity matcher.
2. Remove auth fallback from editable input initialization and preview data.
3. Track the hydrated user/session key and dirty state; ignore late network writes once
   the user edits.
4. Render a complete editor skeleton until canonical profile and careers are available.
5. Align Student career input with Spec 204 before enabling save.
6. Harden avatar request cancellation, URL cleanup, status copy and previous-value
   preservation.
7. Verify `IFileStorageService` selection: local in Development without Cloudinary URL,
   cloud only with valid server-side configuration.
8. Add structured provider-selection logging without credentials if no equivalent exists.
9. Test slow hydration, identity replacement, dirty refetch, upload failure and save.

## Expected Files

- `FrontEnd/OneItb-FE/src/Components/profile/CvEditorProfile.tsx`
- profile helper and focused test files
- `FrontEnd/OneItb-FE/src/utils/uploadFile.js`
- `FrontEnd/OneItb-FE/src/Components/profile/AvatarEditorModal.*` if cleanup is needed
- `API Graphql/OneITB/Controllers/UploadController.cs`
- `API Graphql/OneITB/Services/Storage/*`
- `API Graphql/OneITB/Startup.cs`
- canonical operational and delivery documentation

## Risks And Controls

| Risk | Control |
|---|---|
| Auth snapshot overwrites canonical profile | Never hydrate form from auth snapshot |
| Refetch overwrites typing | Dirty/hydration guard keyed by session identity |
| New user logs in over old Apollo cache | Require exact `me.id === auth.id` |
| Upload succeeds but profile save fails | Preserve old URL, show staged failure, orphan cleanup remains active |
| Cloud URL leaks credentials | Cloudinary secret remains backend-only |
| Local demo is broken without cloud | Existing local storage fallback remains canonical Development path |

## Dependency

Spec 205 consumes the Student career rule from Spec 204 and should be implemented after
204 or in the same controlled branch with its tests passing first.

