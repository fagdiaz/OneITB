# Data Model

## Comment

| Field | Type | Required | Rules |
|---|---|---:|---|
| `FileUrl` | string | No | Maximo 500 caracteres; ruta interna `/uploads/` |

No se agregan relaciones. La migracion incorpora una columna nullable y mantiene los filtros y `DeleteBehavior.Restrict` actuales.
