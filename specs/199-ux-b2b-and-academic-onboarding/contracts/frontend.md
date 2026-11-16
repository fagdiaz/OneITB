# Frontend Contracts: UX B2B and Academic Onboarding

## Environment contract

```text
VITE_ENTRA_TENANT_ID=<GUID or common>
VITE_ENTRA_CLIENT_ID=<GUID>                 # canonical
VITE_MICROSOFT_CLIENT_ID=<GUID>             # temporary fallback only
VITE_ENTRA_API_SCOPE=api://<api-id>/<scope>
VITE_ENTRA_REDIRECT_URI=<absolute public URI>
```

Resolution:

1. Trim all values.
2. Use non-blank canonical client ID first.
3. Use legacy client ID only when canonical is blank.
4. Mark configured only if all values pass validation.
5. Never read or expose a client secret.

## GraphQL write

```graphql
mutation LinkUserToCareers($careerIds: [Int!]!) {
  linkUserToCareers(careerIds: $careerIds) {
    id
    name
    code
    isActive
  }
}
```

## Routing contract

- Employer request: `/empleos/solicitud`
- Academic setup: `/onboarding/academic`
- Default authenticated destination: `/feed`
- Protected route restoration: internal paths only

## Role contract

- Required: exact canonical `Estudiante`
- Exempt: `Administrador`, `Moderador`, `Profesor`, `Egresado`, `Empleador`
- Anonymous: redirected to `/login`
- Unknown role: exempt and remains governed by backend authorization
