# Research: Authoritative Student Enrollment

- El código actual ya usa radio, confirmación y `confirmStudentCareer`.
- El backend actual de repositorio rechaza múltiples carreras para Estudiante.
- La divergencia reportada es compatible con runtime viejo y caché previa.
- `ISiuIntegrationService` existente sincroniza calificaciones; no debe reutilizarse como
  si validara inscripciones. Se necesita un puerto separado y semánticamente correcto.

## Runtime write ownership audit

| Owner | Contexto | Regla |
|---|---|---|
| `UsersService.RegisterAsync` | Alta inicial del agregado `User` | Crea el primer vínculo en el mismo `SaveChanges`; registro público fuerza rol Estudiante y exactamente una carrera activa. |
| `IUserCareerAssignmentService` | Reemplazos posteriores | Única capa que valida catálogo activo y prepara altas/bajas de `UserCareer`. No ejecuta `SaveChanges`. |
| `StudentEnrollmentService` | Onboarding y mutación self-service | Obtiene actor, exige Estudiante cuando corresponde y conserva transacción serializable. |
| `UsersService.UpdateProfileAsync` | Edición atómica de perfil/CV | Delega el reemplazo al assignment service y persiste junto al resto del perfil. |
| Seeder, migraciones y tests | Bootstrap/evidencia | No son endpoints de runtime ni bypasses públicos. |

`SocialService`, `AcademicService` y `JobService` solo leen asociaciones; no son owners.
El provider de matrícula es `SelfDeclared` mientras no exista contrato institucional:
devuelve fuente y timestamp, pero nunca carrera o materias fabricadas.
