# Implementation Plan: Queries Alignment and Cache

## Key Changes

1.  **Frontend (`queries/subjects.js`)**:
    -   Renombrar el acceso en GraphQL de `subjects` a `getSubjects`.
2.  **Frontend (`queries/inquiries.js`)**:
    -   Crear consulta `GET_INQUIRIES` apuntando al resolver `getInquiries`.
3.  **Frontend (`Feed.jsx`)**:
    -   Añadir `{ fetchPolicy: 'network-only' }` en `useQuery(GET_SUBJECTS)`.
    -   Consumir `useQuery(GET_INQUIRIES, { fetchPolicy: 'network-only' })` y mapear la respuesta en el JSX de las tarjetas, descartando `MOCK_POSTS`.
