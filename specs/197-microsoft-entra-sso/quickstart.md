# Quickstart: Microsoft Entra App Registration

1. Register a single-tenant **API** application in Microsoft Entra and set
   `requestedAccessTokenVersion` to `2` in its manifest.
2. Expose the delegated API scope `access_as_user`; use the API application client ID
   as the backend audience.
3. Register a separate single-tenant **SPA** application.
4. Configure exact SPA redirect URIs:
   `http://localhost:5173/login` for development and the deployed HTTPS `/login` URL
   for production. Wildcard redirect URIs are forbidden.
5. Grant the SPA delegated permission to
   `api://<api-app-client-guid>/access_as_user` and complete tenant consent.
6. Configure the backend with `EntraId__Enabled`, `EntraId__TenantId`,
   `EntraId__ClientId`, `EntraId__Audience`, `EntraId__RequiredScope` and
   `EntraId__AllowedDomain`. Use user-secrets locally and the deployment configuration
   provider in production.
7. Configure Vite with `VITE_ENTRA_CLIENT_ID`, `VITE_ENTRA_TENANT_ID`,
   `VITE_ENTRA_API_SCOPE` and `VITE_ENTRA_REDIRECT_URI`.
8. Never create, embed or expose a client secret in the SPA. Identifiers are public
   configuration; credentials and tokens are not.
9. Execute backend/frontend tests and builds, the EF drift check and the controlled
   invalid-token GraphQL smoke documented in `evidence.md`.
10. Real institutional acceptance requires the tenant administrator to approve both
    registrations and an authorized `@itbeltran.com.ar` test account. This external
    gate remains blocked until those values are supplied.
