# Data Model

No hay cambios de datos, EF Core ni GraphQL.

El contrato reproducible se limita a artefactos frontend:

| Artefacto | Fuente de verdad | Invariante |
|---|---|---|
| Versión | `package.json` | `6.7.2` exacta |
| Integridad | `package-lock.json` | checksum `sha512-*` presente |
| CSS | paquete npm | `css/all.min.css` |
| Metadata | mismo paquete npm | `metadata/icon-families.json` |
| Fuentes | mismo paquete npm | cuatro WOFF2 requeridos, no vacíos |
