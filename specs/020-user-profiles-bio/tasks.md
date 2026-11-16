# Tasks: User Profiles Bio & Socials (020)

**Input**: Design documents from `/specs/020-user-profiles-bio/`

## Phase 1: Setup & Data Migration
- [x] T001 Update `User.cs` model class in backend project to support `Bio`, `LinkedIn`, `Facebook`, `Instagram` properties.
- [x] T002 In `OneItbContext.cs`, declare property attributes and generate/run EF Core migration.
- [x] T003 Expose the fields in HotChocolate schema and configure mutations in backend.
- [x] T004 Build validation backend (`dotnet build`).

## Phase 2: Frontend Layouts
- [x] T005 Build profile visualization component (LinkedIn-style card) in frontend.
- [x] T006 Add update profile configurations form view in frontend.
- [x] T007 Build verification (`npm run build`).
