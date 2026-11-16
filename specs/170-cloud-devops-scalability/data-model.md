# Data Model: Cloud, DevOps & Scalability

No database schema changes are introduced by this spec.

## Runtime Configuration Entities

### SubscriptionProvider

- `Mode`: `InMemory` or `Redis`
- `RedisConnectionString`: optional, secret-managed
- Validation: Redis mode is selected only when configuration is present.

### StorageProvider

- `Mode`: `LocalDisk` or `Cloudinary`
- `CloudinarySettings:Url`: optional, secret-managed
- Validation: Cloudinary mode is selected only when URL is present.

### RateLimitPolicy

- `PermitLimit`: default 100
- `WindowMinutes`: default 1
- `QueueLimit`: default 0
- Applies to `/graphql` and `/api/upload`.
