# Tasks: Frontend Auth and Routing (014)

**Input**: Design documents from `/specs/014-frontend-auth-routing/`

## Phase 1: Setup and Apollo Links
- [ ] T001 Import `createHttpLink` and `setContext` in `GraphqlProvider.js`.
- [ ] T002 Implement `authLink` to read `access_token` from `localStorage` and inject `Authorization: Bearer <token>`.
- [ ] T003 Use `authLink.concat(httpLink)` for both the default `client` and `this.apolloInstance`.

## Phase 2: Navigation and Context
- [ ] T004 Review `Login.jsx` and use `useNavigate('/social')` instead of full reload where appropriate, or verify page redirects.
