# Plan

## Backend

1. Add a HotChocolate `IErrorFilter` to sanitize unexpected exceptions.
2. Register the filter in GraphQL server configuration.
3. Add a GraphQL integration test in `Services.Tests` referencing the host GraphQL project.
4. Validate `publicCertificate` through the executor with EF Core InMemory data.

## Frontend

1. Add Vitest/Testing Library devDependencies and test script.
2. Configure Vite/Vitest test environment.
3. Add `GlobalErrorBoundary.jsx` and mount it above the SPA.
4. Add component tests for `CertificateExport`.
5. Re-run build and tests.

## Documentation

1. Update `ROADMAP.md` module 8 from 12/14 to 14/14 if both baselines pass.
2. Recalculate global roadmap from 77/83 to 79/83 (95%).
3. Add one top entry in `DEVELOPMENT_LOG.md`.
4. Update `FINAL_AUDIT_REPORT.md` with code-freeze note.
5. Update `DOCUMENTATION_STATUS.md`.
