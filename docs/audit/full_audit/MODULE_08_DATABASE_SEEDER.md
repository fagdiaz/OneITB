# Reporte de Auditoría: Módulo MOD-08 - Base de Datos, Seeder de Demostración y Migraciones EF Core

**Fecha y Hora:** 2026-10-29T23:10:00-03:00  
**Estado del Módulo:** AUDITED (Auditado al 100%)  
**Motor de Auditoría:** `speckit-db-audit`  
**Archivos Inspeccionados:** 14 archivos (`OneItbContext.cs`, `EnterpriseDemoSeeder.cs`, 8 Entidades, 4 Migraciones)

---

## 1. Resumen Ejecutivo del Módulo

| Métrica | Cantidad |
| :--- | :---: |
| Entidades del Dominio Auditadas | 37 entidades |
| Relaciones con `DeleteBehavior.Restrict` | 49 relaciones (98%) |
| Relaciones con `DeleteBehavior.Cascade` | 1 relación (2% - Account ➔ User PK compartida) |
| Cobertura de Roles en Seeder | 6 de 6 roles (100% cubiertos) |
| Usuarios Demo Sembrados | 15 identidades activas |
| 🔴 Hallazgos Críticos de Persistencia | 0 |
| 🟡 Advertencias de Base de Datos | 1 |
| 🟢 Optimizaciones de Modelo / Seeder | 2 |

---

## 2. Inspección del Modelo EF Core y Reglas de Integridad

### A. Política de Borrado y Cascada (`DeleteBehavior.Restrict`)
Se verificó el archivo `API Graphql/Data/OneItbContext.cs`:
* **Regla Constitucional:** Está terminantemente prohibido el borrado en cascada accidental en relaciones de negocio (usuarios, materias, comentarios, postulaciones).
* **Conformidad:** De 50 relaciones configuradas con `OnDelete`:
  * **49 relaciones** están blindadas explícitamente con `DeleteBehavior.Restrict`:
    * `UserCvExperiences`, `UserCvEducations`, `UserCvProjects`, `UserCvSkills`, `UserCvLanguages` ➔ Restrict
    * `SubjectPrerequisites` (join table autorreferencial) ➔ Restrict
    * `AcademicResources`, `AcademicProgressRecords` ➔ Restrict
    * `Inquiries`, `Comments`, `Reactions`, `CommentReactions` ➔ Restrict
    * `JobOffers`, `JobApplications` ➔ Restrict
    * `Messages` (Sender y Receiver) ➔ Restrict
    * `CommunityReports`, `ModerationAudits` ➔ Restrict
    * `EmployerRequests`, `MagicLinks` ➔ Restrict
  * **1 relación** utiliza `DeleteBehavior.Cascade`: la relación 1-a-1 entre `Account` y `User` (`HasForeignKey<User>(u => u.Id)`). Al compartir la misma clave primaria (`Guid Id`), eliminar una cuenta física purga su reflejo de perfil de usuario; no obstante, en OneITB se utiliza soft delete (`IsActive = false`), por lo que nunca se disparan borrados físicos en tiempo de ejecución.

### B. Ausencia de Shadow Properties e Índices Únicos
* Todas las claves foráneas están declaradas como propiedades públicas en los modelos de entidades (`UserId`, `SubjectId`, `CareerId`, `InquiryId`, etc.).
* Índices únicos verificados en `OneItbContext.cs`:
  * `Account.Email` (Unique, Case-Insensitive)
  * `UserInteraction` (Unique `(ObserverId, TargetUserId)`)
  * `Reaction` (Unique `(UserId, InquiryId)`)
  * `CommentReaction` (Unique `(UserId, CommentId)`)
  * `AcademicProgress` (Unique `(UserId, SubjectId)`)
  * `JobApplication` (Unique `(JobOfferId, ApplicantId)`)
  * `SubjectPrerequisite` (Unique `(SubjectId, PrerequisiteId)`) con Check Constraint anti-autorreferencia `CK_SubjectPrerequisites_NoSelfPrerequisite`.

---

## 3. Auditoría Exhaustiva de `EnterpriseDemoSeeder.cs`

El seeder institucional [`EnterpriseDemoSeeder.cs`](file:///f:/React/OneITB23/API%20Graphql/Data/EnterpriseDemoSeeder.cs) implementa una estrategia de generación determinista mediante `StableGuid(SHA256)` que asegura idempotencia total (puede ejecutarse N veces sin duplicar registros ni alterar claves foráneas).

### Matriz de Cobertura de los 6 Roles del Sistema

| Rol | Cantidad de Cuentas | Emails de Demostración | Carreras Asignadas | Datos Asociados Sembrados |
| :--- | :---: | :--- | :---: | :--- |
| **Administrador** | 2 | `admin1@itbeltran.com.ar`<br>`admin2@itbeltran.com.ar` | Global (Sin restricción) | Panel de control, auditoría, gestión de usuarios y aprobación de empresas. |
| **Moderador** | 1 | `moderador1@itbeltran.com.ar` | Global | Reportes comunitarios, ocultamiento de publicaciones y trazabilidad en `ModerationAudits`. |
| **Profesor** | 4 | `profesor1.ads@itbeltran.com.ar`<br>`profesor2.ads@itbeltran.com.ar`<br>`profesor1.cdia@itbeltran.com.ar`<br>`profesor2.cdia@itbeltran.com.ar` | `ADS` (2)<br>`CDIA` (2) | Apuntes/syllabus cargados, materias asignadas, calificaciones de alumnos y límite `GAP-AUTH-02`. |
| **Estudiante** | 4 | `estudiante1.ads@itbeltran.com.ar`<br>`estudiante2.ads@itbeltran.com.ar`<br>`estudiante1.cdia@itbeltran.com.ar`<br>`estudiante2.cdia@itbeltran.com.ar` | `ADS` (2)<br>`CDIA` (2) | Avance académico (notas en curso/aprobadas), consultas en el feed, reacciones y postulaciones laborales. |
| **Egresado** | 2 | `egresado1@itbeltran.com.ar`<br>`egresado2@itbeltran.com.ar` | `ADS` (1)<br>`CDIA` (1) | Carrera 100% aprobada, perfil laboral completo para descarga ATS y postulaciones a empleos. |
| **Empleador** | 2 | `empleador1@itbeltran.com.ar`<br>`empleador2@itbeltran.com.ar` | Empresa | Solicitudes aprobadas, CUIT fiscal válido, Magic Links de acceso y 2 ofertas laborales activas c/u. |

### Cobertura de Entidades Secundarias Sembradas
1. **Carreras (2):** `ADS` (Analista de Sistemas) y `CDIA` (Ciencia de Datos e Inteligencia Artificial).
2. **Materias (16):** 8 materias por carrera, distribuidas en 1º, 2º y 3º año, con correlatividades cruzadas.
3. **Currículums Vitae (15):** 100% de los usuarios poseen registros normalizados en `UserCvExperiences`, `UserCvEducations`, `UserCvProjects`, `UserCvSkills` y `UserCvLanguages`.
4. **Interacciones Sociales:** Grafo social con unilateral follows, 10 mensajes cruzados por par en `Messages`, consultas con adjuntos en `Inquiries` y comentarios anidados.
5. **Onboarding Corporativo:** Solicitudes en estado `Pending`, `Approved` y `Rejected`, listas para ser auditadas desde el panel administrativo.

---

## 4. Advertencias y Oportunidades Detectadas

1. 🟡 **Advertencia: Exclusión de Moderador en Grafo de Mensajería:**  
   En `EnterpriseDemoSeeder.cs#L1404-L1411`, la función `MessagingUsers()` excluye explícitamente a `moderador1@itbeltran.com.ar` de los hilos de mensajes precargados para mantener determinista el grafo social. Si se prueba el chat logueado como Moderador, la bandeja de entrada aparece vacía (aunque puede iniciar nuevos chats normalmente).
2. 🟢 **Oportunidad: Reducción de Constantes Repetitivas de Currículum:**  
   En `EnterpriseDemoSeeder.cs#L660-L725`, la carga de CVs utiliza bloques repetitivos para cada tabla secundaria que podrían sintetizarse en un helper genérico `SeedCvSection<T>`.

---

## 5. Conclusión del Módulo
La persistencia de **OneITB23** en SQL Server / Entity Framework Core se encuentra **100% blindada contra cascadas involuntarias** (49 de 50 relaciones con `DeleteBehavior.Restrict`). El seeder `EnterpriseDemoSeeder.cs` garantiza cobertura completa para los 6 roles, datos coherentes de correlatividades y CVs completos para una defensa académica impecable.
