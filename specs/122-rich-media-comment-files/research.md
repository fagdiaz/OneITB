# Research: rich media y comentarios

## YouTube seguro

- Reconocer solo `youtube.com`, `www.youtube.com`, `m.youtube.com` y `youtu.be`.
- Aceptar `watch?v=`, `youtu.be/{id}`, `shorts/{id}` y `embed/{id}`.
- Validar IDs de 11 caracteres con letras, numeros, guion y guion bajo.
- Renderizar solo el primer video y conservar enlaces adicionales como texto.
- No usar `dangerouslySetInnerHTML`.

## Clasificacion de archivos

- Imagen: jpg, jpeg, png, gif, webp.
- PDF: pdf.
- Presentacion: ppt, pptx.
- Documento: cualquier otro formato admitido.
- Derivar el nombre del ultimo segmento de la URL y decodificarlo de forma tolerante.

## Adjuntos en comentarios

- Reutilizar `POST /api/upload` antes de `addComment`.
- Mantener `Content` obligatorio.
- Validar `FileUrl` en el servicio con la misma normalizacion de Inquiry.
- Cubrir comentarios principales y respuestas anidadas.
