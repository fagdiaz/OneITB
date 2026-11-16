# Data Model: archivos adjuntos

## Inquiry

| Field | Type | Required | Rules |
|---|---|---:|---|
| `FileUrl` | string | No | Maximo 500 caracteres; URL relativa generada por el servidor |

La migracion debe renombrar la columna existente `AttachedFileUrl` a `FileUrl`. No se crea una segunda columna y no cambia ninguna relacion ni regla de borrado.

## Stored file

No es una entidad de EF Core. Se almacena bajo `wwwroot/uploads` con formato `{guid}{extension-normalizada}`. El nombre original nunca determina la ruta final.
