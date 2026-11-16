# Research: QA Session 2 Social Core Fixes

## Multiple social attachments

**Decision**: crear `SocialAttachment` con FK nullable exclusiva a `Inquiry` o `Comment`, metadatos y orden; conservar `FileUrl` temporalmente y migrar sus valores.

**Rationale**: una tabla relacional permite multiples archivos, nombre original, indices, limpieza de huerfanos y futuras reglas sin JSON ni columnas repetidas.

**Alternatives considered**:

- JSON en `FileUrl`: no indexable, validacion debil y rompe el contrato actual.
- Dos tablas (`InquiryAttachment`/`CommentAttachment`): tipado fuerte, pero duplica mapping y servicios para la misma semantica.
- Eliminar `FileUrl`: cambio GraphQL destructivo y riesgo para datos/clientes existentes.

## Upload and original filename

**Decision**: mantener una subida REST por archivo y devolver descriptor (`fileUrl`, `originalFileName`, `contentType`, `size`); GraphQL persiste una lista validada con maximo 10 archivos y 15 MB agregados.

**Rationale**: conserva la arquitectura desacoplada, no cambia perfiles/recursos que consumen el helper historico y permite rollback operacional por el limpiador de huerfanos.

**Alternatives considered**:

- Multipart multiple en un request: complica errores parciales y no aporta valor con el endpoint existente.
- GraphQL Upload: contradice la constitucion.

## PDF preview

**Decision**: usar `iframe/object` nativo con fragmento `#page=1` para previsualizacion y modal; ofrecer apertura en pestana nueva.

**Rationale**: los navegadores modernos renderizan PDF sin agregar peso al bundle. Si el navegador no soporta PDF inline, la tarjeta conserva nombre y enlace.

**Alternatives considered**:

- PDF.js: buena miniatura rasterizada pero dependencia pesada fuera del alcance de estabilizacion.
- Canvas manual: el navegador no decodifica PDF en canvas sin parser.

## Comment reactions

**Decision**: entidad `CommentReaction` separada con indice unico `(CommentId, UserId)` y toggle idempotente.

**Rationale**: evita polimorfismo ambiguo en `Reaction`, mantiene FKs explicitas y permite query filters sobre comentario/publicacion activos.

## Notification grouping

**Decision**: agrupar al escribir con `GroupKey`, `AggregateCount`, `RelatedInquiryId`, `UpdatedAt` y token de concurrencia; reactivar el grupo cuando llega un evento nuevo.

**Rationale**: el estado agrupado sobrevive recargas y WebSockets, el indice unico evita grupos duplicados y el token de concurrencia protege incrementos simultaneos.

**Alternatives considered**:

- Agrupar solo en React: el contador cambia entre dispositivos y pagina limitada.
- Agrupar al leer: consulta mas costosa, semantica de leido ambigua y mayor complejidad.

## Subject scope

**Decision**: filtrar visualmente por `myCareers` y validar en `SocialService` que la materia activa pertenece a una carrera activa del autor; Administrador conserva alcance global ya existente.

**Rationale**: la UI mejora UX y el backend evita bypass/IDOR academico.

## Likes modal

**Decision**: pagina propia acotada desde `SocialService`, disponible solo al autor de la publicacion o rol institucional.

**Rationale**: evita exponer grafos completos en el feed, mantiene ownership server-side y elimina N+1.
