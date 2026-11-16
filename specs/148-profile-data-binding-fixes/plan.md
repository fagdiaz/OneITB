# Implementation Plan: Profile Data Binding Fixes

**Branch**: `148-profile-data-binding-fixes` | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)

## Summary

Add durable avatar URL persistence, bind profile career selection to `UserCareer`, and normalize user identity casing at backend persistence boundaries. The frontend uses `/api/upload` for avatar files, sends the resulting URL through `updateProfile`, and submits selected career IDs with the same save action.

## Technical Context

**Backend**: .NET 8, EF Core 8, HotChocolate 14.2, SQL Server  
**Frontend**: React 18, Apollo Client, Vite 8, Tailwind CSS 4  
**Storage**: Existing authenticated REST `/api/upload` endpoint writes files under `wwwroot/uploads`  
**Constraints**: No shadow properties, explicit EF mapping, authorization on profile updates, no duplicate career persistence flow

## Constitution Check

- **Security**: PASS. Avatar upload uses authenticated endpoint with JWT.
- **Data integrity**: PASS. `AvatarUrl` is mapped explicitly and careers use existing `UserCareer` N:M.
- **Runtime validation**: PASS planned. Build plus GraphQL profile save/readback will be executed.
- **Documentation**: PASS planned. Evidence, roadmap/status, and development log will be updated.

## Design Notes

- Add `User.AvatarUrl` as optional URL/path string.
- Extend `UpdateProfileInput` with `AvatarUrl` and `CareerIds`.
- Update `UsersService.UpdateProfileAsync` to normalize names, persist avatar URL, and replace user career links when `CareerIds` is provided.
- Expose `avatarUrl` in `me`, `publicProfile`, and social user cards.
- Reuse `uploadAttachment(file, token)` for avatar upload.
- Normalize first/last names through `User` setters and migration SQL for legacy rows.

## Validation Plan

1. Generate/apply migration `AddAvatarUrlAndNormalizeIdentity`.
2. `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`.
3. `npm.cmd run build` in `FrontEnd/OneItb-FE`.
4. Runtime GraphQL smoke: update avatar URL/career IDs and verify `me` and `publicProfile` readback.
