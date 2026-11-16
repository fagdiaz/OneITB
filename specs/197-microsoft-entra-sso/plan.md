# Implementation Plan: Microsoft Entra Institutional SSO

**Branch**: `codex/197-microsoft-entra-sso` | **Date**: 2026-07-30 |
**Spec**: [spec.md](spec.md)

## Summary

Introduce a single-tenant Microsoft Entra adapter that validates OneITB API access
tokens and exchanges them for the existing local JWT. Normalize account persistence for
external-only identities, integrate MSAL with the existing React session boundary,
provide a linked-account indicator, and replace active Google SSO documentation.

## Technical Context

**Backend**: .NET 8, EF Core 8.0.6, HotChocolate 14.2.0, SQL Server

**Frontend**: React 18, Apollo Client 3.7, Vite 8, Tailwind CSS 4

**Identity libraries**: Microsoft.IdentityModel 7.1.2; `@azure/msal-browser`;
`@azure/msal-react`

**Protocol**: OAuth 2.0 Authorization Code + PKCE; tenant-specific OpenID metadata;
delegated API scope

**Testing**: xUnit/Moq, HotChocolate schema tests, Vitest/Testing Library, EF migration
drift, finite GraphQL smoke

## Constitution Check

- **Application contracts**: PASS. Token exchange is a GraphQL mutation.
- **Password security**: PASS with documented interpretation: local password accounts
  retain BCrypt `char(60)`; external-only accounts have no password credential rather
  than a placeholder hash.
- **Input validation**: PASS. Tokens/config/claims are bounded and validated.
- **Relational integrity**: PASS. Explicit unique filtered index; no shadow FK.
- **Session security**: PASS. Microsoft tokens are never the OneITB resolver credential.
- **Evidence completion**: PASS. Runtime proof is required or explicitly blocked.

## Architecture

1. `MicrosoftEntraOptions` validates tenant, client/audience, scope and domain.
2. `IMicrosoftTokenValidator` obtains cached tenant metadata/signing keys and returns a
   minimal immutable identity only after full validation.
3. `IMicrosoftEntraAuthService` applies rate limiting, links/provisions inside an EF
   transaction, records sanitized audit events and returns `AuthPayload`.
4. `Mutation.MicrosoftLogin` delegates and maps controlled security failures.
5. React MSAL acquires the API access token in `sessionStorage`, exchanges it, then
   invokes the existing `AuthContext.login` with the local JWT.
6. Local logout clears both canonical application state and the MSAL cache.

## Data Migration

- Make `Accounts.PasswordHash` nullable.
- Add nullable `ExternalProvider` (32), `ExternalTenantId` (64),
  `ExternalSubjectId` (128), and `LastExternalLoginAt`.
- Add a unique filtered index on provider + tenant + subject.
- Preserve all existing hashes and account IDs.
- Never populate external fields for existing local accounts until a validated link.

## Security Decisions

- Fail closed if backend Entra configuration is partial or invalid.
- Hide the frontend Microsoft action if its public configuration is absent.
- Validate the access token against the API audience and required scope.
- Never trust role/group/display claims for local authorization.
- Use generic client errors and detailed sanitized server logging.
- Use rate-limit fingerprints, never raw tokens or emails, as limiter keys.
- Do not persist external tokens or full claims.

## Execution Phases

1. Speckit contracts and HIGH-risk QA.
2. Account model, migration and local-login compatibility.
3. Entra validation, exchange, limiter and audit service.
4. GraphQL contract and authorization matrix.
5. MSAL/session/frontend/profile integration.
6. Unit, integration and runtime validation.
7. Documentation reconciliation and final evidence.
