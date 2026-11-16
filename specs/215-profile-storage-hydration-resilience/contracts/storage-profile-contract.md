# Contract: Storage and Profile Hydration

## Configuration

- `FileStorage:Provider=Local|Cloudinary`.
- `Local` permitido en Development/control académico.
- `Cloudinary` requiere URL válida y smoke externo para estado `[V]`.

## Upload response

Éxito: URL persistible, nombre original y modo no sensible. Error: código estable,
mensaje recuperable y correlation ID; nunca stack trace ni credenciales.

