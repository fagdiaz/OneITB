# Quickstart: Local Backend Runtime Unblock

## 1. Confirm clean source state

```powershell
git status --short
```

## 2. Recover ASP.NET HTTPS development certificate

```powershell
dotnet dev-certs https --check
dotnet dev-certs https --clean
dotnet dev-certs https --trust
dotnet dev-certs https --check --trust
```

Close and reopen the terminal/IDE after trusting the certificate.

## 3. Verify Development environment

```powershell
dotnet run --project "API Graphql/OneITB/GraphQL.csproj" --launch-profile OneITB
```

Expected launch profile behavior:

- `ASPNETCORE_ENVIRONMENT=Development`
- HTTPS: `https://localhost:44397`
- HTTP: `http://localhost:5000`

## 4. If SQL TLS/certificate fails

Use only in `API Graphql/OneITB/appsettings.Development.json`:

```json
"DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=OneItb;Trusted_Connection=True;Encrypt=True;TrustServerCertificate=True;"
```

If the server accepts non-encrypted local connections, the existing value is also acceptable:

```json
"DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=OneItb;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;"
```

## 5. If SQL SSPI fails

`Failed to generate SSPI context` is not a certificate trust error. Use one of these local-only fallbacks:

```powershell
$env:ConnectionStrings__DefaultConnection='Server=(localdb)\MSSQLLocalDB;Database=OneItb;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;'
```

or:

```powershell
$env:ConnectionStrings__DefaultConnection='Server=localhost\SQLEXPRESS;Database=OneItb;User Id=oneitb_dev;Password=<local-password>;Encrypt=True;TrustServerCertificate=True;'
```

Do not commit local passwords.

## 6. Build and GraphQL probe

```powershell
dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release
```

In a second terminal after the backend is running:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "https://localhost:44397/graphql" `
  -ContentType "application/json" `
  -Body '{"query":"query { __typename }"}'
```

Expected response:

```json
{
  "data": {
    "__typename": "Query"
  }
}
```
