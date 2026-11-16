# Configuration Contract

## Backend

```text
EntraId__Enabled=true
EntraId__TenantId=<tenant-guid>
EntraId__ClientId=<oneitb-api-app-client-guid>
EntraId__Audience=<oneitb-api-app-client-guid>
EntraId__RequiredScope=access_as_user
EntraId__AllowedDomain=itbeltran.com.ar
```

## Frontend

```text
VITE_ENTRA_CLIENT_ID=<spa-app-client-guid>
VITE_ENTRA_TENANT_ID=<tenant-guid>
VITE_ENTRA_API_SCOPE=api://<api-app-client-guid>/access_as_user
VITE_ENTRA_REDIRECT_URI=http://localhost:5173/login
```

These are identifiers, not secrets. A client secret is forbidden in Vite configuration.
Production values belong to the deployment secret/configuration provider.
