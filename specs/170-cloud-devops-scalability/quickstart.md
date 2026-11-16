# Quickstart: Cloud, DevOps & Scalability

## Local fallback

1. Do not set `ConnectionStrings:Redis`.
2. Do not set `CloudinarySettings:Url`.
3. Run backend normally.
4. Expected: GraphQL subscriptions use in-memory provider and uploads write to `wwwroot/uploads`.

## Production compose

```powershell
$env:ONEITB_SQL_SA_PASSWORD = "<strong-password>"
$env:ONEITB_JWT_KEY = "<at-least-32-characters>"
$env:ONEITB_CORS_ORIGIN = "http://localhost"
docker compose -f docker-compose.prod.yml up --build
```

Optional:

```powershell
$env:ONEITB_REDIS_CONNECTION = "oneitb-redis:6379,abortConnect=false"
$env:ONEITB_CLOUDINARY_URL = "cloudinary://api_key:api_secret@cloud_name"
```

## Validation

- Backend health: `http://localhost:8080/health`
- Frontend: `http://localhost/`
- GraphQL through Nginx: `http://localhost/graphql`
- Upload through Nginx: `http://localhost/api/upload`
