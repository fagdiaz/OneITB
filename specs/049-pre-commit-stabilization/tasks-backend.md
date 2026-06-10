# Tasks: Pre-Commit Stabilization — Backend (049-B)

## Phase 1: Audit
- [x] T001 Read EmployerAuthService.cs — nullable dereference on Account.Email at line 81.
- [x] T002 Read ModerationService.cs — orphan `using System.Linq` + Console.WriteLine in service layer.
- [x] T003 Read Startup.cs — usings `HotChocolate.Data` and `HotChocolate.Types.Pagination` unused.
- [x] T004 Read User.cs, Account.cs, CommunityReport.cs, MagicLink.cs — entities clean, no issues.

## Phase 2: Implementation (Backend Fixes)
- [x] T005 `ModerationService.cs` — Remove `using System.Linq` (huérfano).
- [x] T006 `ModerationService.cs` — Replace `Console.WriteLine` with structured TODO comment for ILogger integration.
- [x] T007 `EmployerAuthService.cs` — Replace string concatenation with null-safe interpolation `?.Email ?? "unknown"`.
- [x] T008 `Startup.cs` — Remove unused `HotChocolate.Data` and `HotChocolate.Types.Pagination`, reorder usings alphabetically.

## Phase 3: QA
- [x] T009 npm run build → ✅ 297 modules, 0 errors (run in session 049).
- [ ] T010 dotnet build → pending result.
