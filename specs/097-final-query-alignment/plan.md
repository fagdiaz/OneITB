# Implementation Plan: Final Query Alignment

## Key Changes

1.  **Frontend (`queries/inquiries.js`)**:
    -   Sustituir `usuario` por `user`.
    -   Mantener las propiedades `idUsuario`, `nombre`, `apellidos`, `alias`.
2.  **Frontend (`Feed.jsx`)**:
    -   Sustituir `post.usuario?.nombre` por `post.user?.nombre`.
    -   Sustituir `post.usuario?.apellidos` por `post.user?.apellidos`.
