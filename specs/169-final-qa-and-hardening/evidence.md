# Evidence

## Implemented

- `GraphQLErrorFilter` registered in HotChocolate to sanitize unexpected backend exceptions.
- `GlobalErrorBoundary.tsx` mounted at the SPA root with Clean Tech / Tech Noir fallback.
- Vitest + Testing Library component-test baseline.
- `CertificateExport` component tests covering loading, empty and final states.
- Backend GraphQL integration test baseline executing `publicCertificate` through the real HotChocolate schema with EF Core InMemory data.

## Commands

- `npm.cmd install --save-dev @vitejs/plugin-react@latest vitest @testing-library/react @testing-library/jest-dom jsdom`: PASS without `--force`; updated the React Vite plugin to match Vite 8.
- `npm.cmd audit --omit=dev`: BLOCKED by npm audit endpoint error.
- `dotnet build "API Graphql/OneITB/GraphQL.csproj" -c Release -p:RestoreIgnoreFailedSources=true`: PASS, 0 warnings, 0 errors.
- `dotnet test "API Graphql/Tests/Services.Tests/Services.Tests.csproj" -c Release --no-restore`: PASS, 35/35.
- `npm.cmd test -- --run`: PASS, 1 file, 3 tests.
- `npm.cmd run build`: PASS, 346 modules, 1.21 s.

## Notes

- Mutations were not rewritten to GraphQL unions because that would be a breaking schema change for existing Apollo documents during code freeze. The compatible hardening is centralized error filtering.
- The GraphQL integration baseline uses EF Core InMemory as allowed by Spec 169. A dedicated SQL Server/Testcontainers integration suite remains a future strengthening step, not a blocker for this baseline.
