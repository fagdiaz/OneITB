# GraphQL Contract

```graphql
mutation ConfirmStudentCareer($careerId: Int!) {
  confirmStudentCareer(careerId: $careerId) {
    id
    name
    code
    isActive
  }
}
```

- Autorización: rol persistido `Estudiante`.
- Éxito: devuelve la carrera confirmada y reemplaza asociaciones inconsistentes.
- Error de negocio: `STUDENT_CAREER_*` controlado.
- Schema incompatible: recuperación de cliente, sin fallback a la mutación legacy.
