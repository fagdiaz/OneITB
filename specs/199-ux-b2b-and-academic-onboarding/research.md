# Research: UX B2B and Academic Onboarding

## Existing Microsoft integration

The application already initializes MSAL before rendering and conditionally wraps the
tree with `MsalProvider`. The defect is configuration drift: the browser reads only
`VITE_ENTRA_CLIENT_ID` and treats every tenant as a GUID, while local setup may expose
the temporary alias `VITE_MICROSOFT_CLIENT_ID` and the backend explicitly supports
multi-tenant `common`.

**Decision**: extract a pure resolver. Keep `VITE_ENTRA_CLIENT_ID` canonical, support
the alias only as migration compatibility, and permit only GUID or literal `common`
for the tenant. Do not accept arbitrary authority strings.

## Real public navigation

`PublicLayout` intentionally reuses the modern private Header because its Nav already
switches between anonymous and authenticated actions. The legacy public Header/Nav is
not mounted by current routes.

**Decision**: modify the mounted shared Nav rather than resurrecting legacy CSS
components. Add the B2B CTA to its anonymous desktop and mobile sections.

## Academic identity contract

The backend `LinkUserToCareers` mutation already requires authentication, deduplicates
IDs, loads only active careers, rejects missing/inactive IDs, replaces links with
cancellation, and returns `IReadOnlyList<Career>`. The current Apollo document
incorrectly requests `success` and `message`.

**Decision**: correct the frontend selection set and reuse the backend mutation. No
backend or migration change is justified.

## Gate placement

Placing the gate inside `PrivateLayout` would mount Header, sidebar, chat, and their
queries before academic setup is resolved.

**Decision**: guard the private route group before `PrivateLayout`; expose the setup
route as a dedicated authenticated screen.

## Cache and session isolation

`AuthContext` invalidates Apollo at session boundaries, but route decisions still must
defend against asynchronous stale results.

**Decision**: require `me.id === auth.id`, use a network-first profile read, and never
unlock from mutation response or component state alone. Await a canonical profile
refetch and validate the result.

## Redirect restoration

**Decision**: preserve only same-origin paths beginning with one slash, reject
protocol-relative paths and setup/auth routes, and otherwise use `/feed`.
