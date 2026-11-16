# Research: Cloud, DevOps & Scalability

## Decision: Conditional Redis subscriptions

Use `HotChocolate.Subscriptions.Redis` only when `ConnectionStrings:Redis` or `Redis:ConnectionString` is configured.

**Rationale**: This gives real distributed Pub/Sub in production while preserving the current local startup behavior.

**Alternatives considered**:

- Always Redis: rejected because it breaks local development without Redis.
- Keep InMemory only: rejected because it does not close the scaling gap.

## Decision: Cloudinary upload via `HttpClient`

Implement Cloudinary upload with signed multipart requests using `CloudinarySettings:Url`, without adding a Cloudinary SDK.

**Rationale**: Reduces dependency surface while providing a real cloud storage adapter. Local disk remains the default.

**Alternatives considered**:

- Cloudinary SDK: acceptable, but unnecessary for the current upload path.
- Abstract object storage only in docs: rejected because roadmap requires implemented infrastructure.

## Decision: Same-origin frontend reverse proxy

Use Nginx to serve the SPA and proxy `/graphql`, `/api` and `/uploads` to the API container.

**Rationale**: Keeps browser traffic on one origin, supports WebSockets and reduces production CORS complexity.

## Decision: Fixed-window rate limiting by IP

Default to 100 requests per minute per IP for GraphQL and upload.

**Rationale**: Simple, deterministic, built into ASP.NET Core and suitable as a production baseline before adding WAF-level policies.
