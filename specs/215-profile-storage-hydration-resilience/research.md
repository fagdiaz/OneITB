# Research: Profile Storage and Hydration Resilience

- HTTP 503 confirma que `/api/upload` alcanzó al backend; no es CORS ni Vite.
- `UploadController` convierte cualquier excepción del storage en 503 controlado.
- La selección actual por mera presencia de URL puede activar Cloudinary por un secret
  antiguo, aun cuando se deseaba disco local.
- El editor ya posee snapshot e hidratación; debe verificarse contra el runtime alineado
  antes de ampliar código.

