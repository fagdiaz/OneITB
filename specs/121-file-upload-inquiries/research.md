# Research: carga de archivos en publicaciones

## Decision 1: Renombrar, no duplicar

- **Decision**: Cambiar `AttachedFileUrl` a `FileUrl` en modelo, GraphQL y base mediante `RenameColumn`.
- **Rationale**: La base ya contiene la columna y pueden existir URLs persistidas. Agregar otra columna produciria dos fuentes de verdad.
- **Rejected**: Mantener ambos campos o agregar una columna nueva vacia.

## Decision 2: Endpoint dedicado y autenticado

- **Decision**: Usar `POST /api/upload`, JWT obligatorio, `multipart/form-data`, limite de 15 MB y allowlist de extensiones.
- **Rationale**: La transferencia binaria queda fuera de GraphQL y se reduce la superficie de abuso del almacenamiento.
- **Rejected**: GraphQL Upload y endpoint anonimo.

## Decision 3: Archivos estaticos directos

- **Decision**: Retornar `/uploads/{guid}{extension}` y servirlo con `UseStaticFiles`.
- **Rationale**: Evita reconstruir una ruta secundaria de preview y mantiene el URL persistido como contrato estable.
- **Rejected**: Guardar rutas fisicas o depender de un nombre original controlado por el usuario.

## Decision 4: Fallo parcial explicito

- **Decision**: Si la carga funciona y GraphQL falla, informar el error sin reintentar automaticamente la publicacion.
- **Rationale**: Evita publicaciones duplicadas. La limpieza de archivos huerfanos requiere una politica separada.
