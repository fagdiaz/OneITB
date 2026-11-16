# Quickstart: Spec 159 Validation

## Backend Build

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
```

Expected:

```text
0 Warning(s)
0 Error(s)
```

## Frontend Build

```powershell
cd FrontEnd/OneItb-FE
npm.cmd run build
```

Expected:

```text
vite build succeeds with 0 errors
```

## Manual Runtime Checks

1. Logout and load a public page.
   - Header should not render omni-search.
   - Header should not execute the profile/avatar query.

2. Login as a normal user enrolled only in career A.
   - Feed shows only career A publications.
   - Searching a user enrolled in career A and B does not show that user's career B posts.

3. Open global search.
   - Subject filter starts at `Todas`.
   - Selecting a subject unsets `Todas`.
   - Selecting `Todas` clears explicit subjects.

4. Print CV from `/profile` and `/profile/edit`.
   - Contact and social rows match.

5. Open `/profile/edit`, upload avatar.
   - Editor mask is square.
   - Zoom can go down to `0.1`.
   - Dragging the preview pans the image.
   - Export/upload still persists avatar URL after saving profile.
