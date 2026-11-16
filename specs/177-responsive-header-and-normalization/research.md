# Research: Responsive Header and Registration Normalization

## Decision: Use hamburger below `lg`

**Rationale**: Existing desktop nav has many role-dependent items. Keeping all text labels visible in medium widths causes overlap. A hamburger keeps route access complete without removing notifications or profile access.

**Alternatives considered**: Icon-only nav for all links on `md`; rejected because admin/employer routes still compete for width and reduce discoverability.

## Decision: Backend remains authoritative for normalization

**Rationale**: Frontend normalization improves UX, but backend must enforce durable consistency for any GraphQL caller.

**Alternatives considered**: Frontend-only normalization; rejected as insufficient.

## Decision: Static file cross-origin headers on `UseStaticFiles`

**Rationale**: `/uploads` files are read by the frontend app origin and may be blocked by browser cross-origin resource policies. Headers on static responses solve this without changing upload authorization or business APIs.

**Alternatives considered**: Proxy images through GraphQL; rejected because binary/static delivery is the constitutional REST/static exception.
