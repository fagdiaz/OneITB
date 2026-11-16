# Icon Font Contract

- OneITB no descarga tipografías o iconos desde terceros en runtime.
- Todas las clases `fa-*` usadas existen en `metadata/icon-families.json` del paquete fijado.
- CSS, metadata y WOFF2 pertenecen a la misma versión exacta.
- El build debe emitir archivos WOFF2 con hash de contenido.
- No debe quedar ninguna referencia a `fontawesome-free-6.1.2-web`.
- Los controles con solo icono conservan nombre accesible independiente del glifo.
