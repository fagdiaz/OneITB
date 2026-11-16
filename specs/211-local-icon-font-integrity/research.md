# Research

## Diagnosis

Firefox cargaba `fa-solid-900.woff2` desde una copia manual de Font Awesome 6.1.2 y
emitía numerosos ajustes `glyf: Glyph bbox was incorrect`. El archivo era accesible y
Vite lo emitía, por lo que no era un defecto de CORS: el problema pertenecía a las tablas
internas del binario antiguo. CSS, metadata y fuentes tampoco estaban declarados como una
dependencia reproducible en `package.json`.

## Decision

Se adopta `@fortawesome/fontawesome-free` 6.7.2 exacto. El lockfile registra su tarball e
integridad SHA-512 y el manifiesto oficial declara licencias CC-BY-4.0, OFL-1.1 y MIT.
La distribución trae CSS, metadata y WOFF2 como una unidad coherente.

## Rejected alternatives

- Silenciar warnings de Firefox: ocultaría un defecto propio.
- Mantener TTF como fallback: Firefox podría seleccionar otro binario con las mismas
  tablas problemáticas y aumenta el artefacto.
- Migrar decenas de iconos durante Code Freeze: mayor superficie de regresión sin
  beneficio funcional proporcional.
