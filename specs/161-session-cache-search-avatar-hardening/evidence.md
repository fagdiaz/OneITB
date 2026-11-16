# Evidence: Spec 161 Session Cache, Search and Avatar Hardening

## Commands

### Backend build

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
```

**Result**: PASS.

```text
Compilación correcta.
0 Advertencia(s)
0 Errores
Tiempo transcurrido 00:00:05.92
```

### Frontend build

```powershell
cd FrontEnd/OneItb-FE
npm.cmd run build
```

**Result**: PASS.

```text
vite v8.0.16 building client environment for production...
341 modules transformed.
✓ built in 1.79s
```

### Static checks

```powershell
git diff --check
rg -n "Contrasena|contrasena|contrasenas" FrontEnd/OneItb-FE/src/Components/user
Select-String -Path FrontEnd/OneItb-FE/src/Components/user/Register.jsx -Pattern 'PUBLIC_ROLES','<select id="role"','type="checkbox"'
```

**Result**:

- `git diff --check`: PASS; only Windows LF/CRLF conversion warnings.
- `rg`: PASS by absence of matches for unaccented password copy in auth forms.
- `Select-String`: role remains a single `<select>` with `PUBLIC_ROLES = ['Estudiante', 'Profesor', 'Egresado']`; the remaining checkbox input belongs to careers, not roles.

## Runtime Notes

GraphQL smoke against `http://localhost:5000/graphql` was attempted after starting the backend with the already compiled Release binary:

```powershell
dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB --configuration Release --no-build
```

**Result**: BLOCKED by local HTTPS development certificate before Kestrel completed startup.

Relevant output:

```text
Unable to configure HTTPS endpoint. No server certificate was specified,
and the default developer certificate could not be found or is out of date.
To generate a developer certificate run 'dotnet dev-certs https'.
```

Docker SQL was available and healthy during the attempt:

```text
oneitb23-sql   mcr.microsoft.com/mssql/server:2022-latest   Up 21 hours (healthy)   0.0.0.0:1433->1433/tcp
```

No backend runtime or GraphQL operation is marked verified in this spec because Kestrel did not start. The implemented GraphQL search change is compile-verified only.

## Implementation Evidence

- Apollo provider now exposes `GraphQLProvider.clearApolloStore()` and keeps a singleton client instance.
- Logout and authorization-expiration handling clear Apollo memory with `clearStore()`.
- Apollo `Query` field policies explicitly replace incoming feed and messaging result sets.
- Public profile search now includes `Account.Email`.
- Register/auth visible password copy uses `Contraseña`/`contraseña`.
- Registration email regex is `^[a-zA-Z0-9._%+-]+@itbeltran\.com\.ar$`.
- Avatar editor preview canvas is the exported square crop; the removed inner mask no longer creates preview/export drift.
