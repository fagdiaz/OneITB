# Implementation Plan: Backend Employer & Moderation Infrastructure (045)

1. Analyze existing `Entities` project.
2. Create `CommunityReport.cs` with properties: Id, ReporterId, ContentId, Reason, Status, CreatedAt.
3. Create `MagicLink.cs` with properties: Id, AccountId, Token, ExpiresAt, IsUsed.
4. Update `OneItbContext.cs` with `DbSet` and `ToTable` mappings.
5. Create migration and apply database update.
6. Create `AuthService` logic for Magic Link and AFIP simulation.
7. Expose mutations in `Mutation.cs`.
