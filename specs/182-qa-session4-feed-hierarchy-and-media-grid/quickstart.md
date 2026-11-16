# Quickstart Validation: Spec 182

## Automated gates

```powershell
dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release --no-restore
dotnet ef migrations has-pending-model-changes --project "API Graphql/Data/Data.csproj" --startup-project "API Graphql/OneITB/GraphQL.csproj" --configuration Release --no-build

Set-Location "FrontEnd/OneItb-FE"
npm.cmd run test -- --run
npm.cmd run build
```

## Runtime GraphQL checks

1. Authenticate as an active non-admin user.
2. Execute `myFollowedUserIds`.
3. Execute `followUser`, repeat it, reload the query, then execute `unfollowUser` twice.
4. Create a root comment, reply to it, then create a directed reply targeting the reply; verify both persisted replies have the same root parent and the directed row exposes `replyToUserId`.
5. Verify the generated notification action contains both `inquiryId` and `commentId`.
6. Verify a target comment from another inquiry and a blocked follow request return controlled GraphQL errors.

## Browser checks

1. Open a post with PDF cover plus at least four mixed attachments; verify first-page preview, bounded grid, overflow count, full gallery, View and Download.
2. Repeat with a comment containing more than three media items.
3. Reply to a second-level comment; verify mention prefill, two-level visual hierarchy, persistence and recipient notification.
4. Open the notification and verify thread auto-open, target scroll/focus, temporary highlight and missing-target fallback.
5. Receive a private message with the widget minimized and confirm its badge updates without opening chat.
6. Follow/unfollow from feed and public profile; reload and verify state and feed priority.
7. Open notification settings; verify compact layout, Escape, backdrop close and pending-save guard.

## Evidence rules

- Record actual command output and migration name in `evidence.md`.
- Do not mark browser or authenticated flows verified if credentials/services are unavailable.
- Do not suppress PDF/provider warnings; distinguish first-party defects from external residuals.
