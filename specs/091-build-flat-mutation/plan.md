# Implementation Plan: Flat Mutation Alignment

## Key Changes

1.  **Frontend (`mutations/inquiries.js`)**:
    -   Definir la constante `CREATE_INQUIRY` usando argumentos escalares estrictos.

2.  **Frontend (`queries/subjects.js`)**:
    -   Definir la consulta `GET_SUBJECTS` para obtener el listado de materias.

3.  **Frontend (`Feed.jsx`)**:
    -   Importar `useQuery` y `useMutation`.
    -   Definir el estado local para el título, contenido y materia.
    -   Rellenar el dropdown usando la data de `GET_SUBJECTS`.
    -   En el handler de publicación, llamar a la mutación pasando variables planas y forzando el `parseInt` en `subjectId`.
