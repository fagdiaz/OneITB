# Validation Evidence: Expose Inquiry Author

## Commands

```powershell
dotnet ef migrations has-pending-model-changes `
  --project "API Graphql/Data/Data.csproj" `
  --startup-project "API Graphql/OneITB/GraphQL.csproj"

dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
```

## Runtime checks

- Introspect `Inquiry` and confirm `user`.
- Execute `contracts/inquiries.graphql`.
- Confirm canonical nested fields are `id`, `firstName`, and `lastName`.

## Results

- `dotnet ef migrations has-pending-model-changes`: no pending model changes.
- Migration generation: skipped; the physical `UserId` relationship already exists.
- Release build: 0 errors, 6 pre-existing nullable warnings.
- Isolated backend: started on `http://127.0.0.1:5098`.
- Canonical query `user { id firstName lastName }`: HTTP 200.
- Current feed query `user { idUsuario nombre apellidos alias }`: HTTP 200.
- `users`: five existing users.
- `subjects`: empty collection.
- `inquiries`: empty collection.
- No React or `DbInitializer.cs` changes were made.
- The existing IIS Express process on port `44397` still serves the previous
  assembly and must be restarted to load this implementation.

## Remaining blocker

The GraphQL 400 caused by `Inquiry.user` is resolved. Publication creation
cannot yet be exercised because the current database contains no subjects and
the form requires a valid `subjectId`.
