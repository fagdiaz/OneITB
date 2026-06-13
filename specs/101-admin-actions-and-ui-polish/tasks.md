# Tasks: Admin Actions & UI Polish

## 1. Fix Encoding in DbInitializer
- [x] Analyze `API Graphql/Data/DbInitializer.cs`.
- [x] Remove accented characters from seed data strings to prevent SQL Server encoding issues.
- [x] Build backend (`dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release`).

## 2. Refactor Comment Report Button
- [x] Analyze `CommentThread.jsx`.
- [x] Move the "Reportar" button to the comment header as a flag icon.
- [x] Align UI with the main `Feed.jsx` report button style.

## 3. Implement Subject CRUD
- [x] Update `Subject.cs` entity to include `IsActive` property.
- [x] Create EF Core migration `AddSubjectIsActive` and apply to database.
- [x] Add `AddSubject`, `UpdateSubject`, and `ToggleSubjectStatus` mutations to `Mutation.cs`.
- [x] Update `subjects.js` and `SubjectManagement.jsx` to include forms and action buttons.
- [x] Build backend and verify functionality.

## 4. Implement Report Status Update
- [x] Add `UpdateReportStatus` mutation to `Mutation.cs`.
- [x] Update `moderation.js` and `ModerationManagement.jsx` to include "Resolver" and "Rechazar" buttons.
- [x] Build frontend (`npm run build` from `FrontEnd/OneItb-FE`).
