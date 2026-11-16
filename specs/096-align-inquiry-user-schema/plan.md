# Implementation Plan: Align Inquiry and User Schema

## Key Changes

1.  **Frontend (`queries/inquiries.js`)**:
    -   Modificar la query `GET_INQUIRIES`.
    -   Cambiar la solicitud de `user { firstName lastName }` a `user { nombre apellidos }` o el equivalente que esté mapeado.
2.  **Frontend (`Feed.jsx`)**:
    -   Actualizar la desestructuración de datos (`post.user.firstName` a `post.user.nombre`, etc.) para renderizar correctamente las tarjetas de publicaciones.
