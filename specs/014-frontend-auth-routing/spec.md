# Feature Specification: Frontend Auth and Routing (014)

**Feature Branch**: `014-frontend-auth-routing`

**Created**: 2026-06-09

**Status**: Draft

**Input**: User description: "El backend ya procesa el login correctamente y devuelve el JWT. Sin embargo, la interfaz de usuario se queda bloqueada en /login. Se requiere implementar la gestión del token en localStorage, un AuthContext para el estado global y usar useNavigate de React Router para redirigir al usuario al Home/Feed. Además, se debe configurar el authLink de Apollo Client para inyectar el token en futuras peticiones."

## User Scenarios & Testing

### User Story 1 - Automatic Redirection on Login (Priority: P1)
As a user logging in, once I submit valid credentials, I should be automatically redirected to the dashboard/feed without having to refresh the page.

### User Story 2 - Persistent Apollo Authentication Header (Priority: P1)
As an authenticated user, my requests to GraphQL should automatically include the `Authorization: Bearer <token>` header in all requests.

## Requirements

### Functional Requirements
- **FR-001**: Configure Apollo Client with `setContext` to fetch token from localStorage.
- **FR-002**: Maintain global authentication context using `AuthProvider` / `useAuth`.
- **FR-003**: Redirect to `/social` (feed) upon successful login.
