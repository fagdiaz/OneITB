# Acta de Validación de Integridad Relacional y Base Demo (CF-03)

- **Fecha de Ejecución:** 2026-11-15T16:09:34-03:00
- **Script Ejecutado:** `scripts/validate-demo-database.ps1`
- **Comando:** `powershell -NoProfile -ExecutionPolicy Bypass -File "scripts/validate-demo-database.ps1"`
- **Código de Salida:** `0` (`PASS`)
- **Rama:** `feature/2026-11-01-debugger-cv-builder`
- **SHA Candidato:** `37ed3608887f3871a8ca2c555004ab63fd6d1e6a`
- **Contenedor SQL:** Docker `oneitb23-sql` (SQL Server 2022, `127.0.0.1:1433`, Up/healthy)
- **Base de Datos:** `OneItb` (Esquema relacional EnterpriseDemoSeeder)

---

## 1. Auditoría de Integridad Relacional (10 Dimensiones SQL)

Ejecución de la consulta de auditoría relacional multi-tabla contra SQL Server 2022:
- Cuentas huérfanas (`Users` sin `Accounts`): **0**
- Carreras huérfanas (`UserCareers` sin `Users` o `Careers`): **0**
- Consultas huérfanas (`Inquiries` sin `Users` o `Subjects`): **0**
- Comentarios huérfanos (`Comments` sin `Inquiries` o `Users`): **0**
- Adjuntos sociales con cardinalidad inválida (`SocialAttachments` != 1 asociación): **0**
- Profundidad de comentarios excesiva (`Comments` con nivel > 2): **0**
- Interacciones consigo mismo (`UserInteractions` con `ObserverId = TargetId`): **0**
- Postulaciones laborales duplicadas (`JobApplications` duplicadas): **0**
- Progreso académico duplicado (`AcademicProgress` duplicado por usuario/materia): **0**
- Bloqueos de seguridad en cuentas seed (`FailedLoginAttempts <> 0` o `LockoutEnd IS NOT NULL`): **0**

**Resultado de Integridad Relacional:** `IntegrityViolations: 0` (`PASS`).

---

## 2. Validación de Autenticación y Cobertura de Seis Roles

Ejecución mediante host temporal de GraphQL (`http://127.0.0.1:5097/graphql`):
- **Administrador (`admin1@itbeltran.com.ar`):** Autenticado (`Token` emitido, `Role = Administrador`).
- **Moderador (`moderador1@itbeltran.com.ar`):** Autenticado (`Token` emitido, `Role = Moderador`).
- **Profesor (`profesor1.ads@itbeltran.com.ar`):** Autenticado (`Token` emitido, `Role = Profesor`).
- **Estudiante (`estudiante1.ads@itbeltran.com.ar`):** Autenticado (`Token` emitido, `Role = Estudiante`).
- **Egresado (`egresado1@itbeltran.com.ar`):** Autenticado (`Token` emitido, `Role = Egresado`).
- **Empleador (`empleador1@itbeltran.com.ar`):** Autenticado (`Token` emitido, `Role = Empleador`).

**Total de Logins de Rol:** `6 / 6 PASS`.

---

## 3. Cobertura de Dominios y Smokes GraphQL

- **Aislamiento de Identidad JWT (`me { id role }`):** Estudiante (`2e9b...`) vs Moderador (`d95f...`) con identidades distintas y roles exactos: `PASS`.
- **Feed Social (`inquiriesPage(first: 1)`):** `PASS`.
- **Dominio Académico (`academicResources`, `myAcademicProgress`):** `PASS`.
- **Mensajería (`messagingContacts(first: 1)`):** `PASS`.
- **Notificaciones (`myNotifications(first: 1)`):** `PASS`.
- **Bolsa de Empleo (`jobOffers(onlyActive: true)`):** `PASS`.
- **Administración (`users { id role }`, `communityReports`):** `PASS`.
- **Moderación (`communityReports`):** `PASS`.
- **Gestión Empleador (`myJobOffers`):** `PASS`.
- **Smoke de Carga Segura (`POST /api/upload`):** Fixture PNG subido, validado en disco local (`wwwroot/uploads/*`) y eliminado limpiamente durante el teardown: `PASS`.

---

## 4. Resumen Consolidado

```
Status              : PASS
IntegrityViolations : 0
RoleLogins          : 6
RoleSet             : Administrador, Egresado, Empleador, Estudiante, Moderador, Profesor
IdentityIsolation   : PASS
Feed                : PASS
Academic            : PASS
Messaging           : PASS
Notifications       : PASS
Jobs                : PASS
Administration      : PASS
Moderation          : PASS
Upload              : PASS
Exit Code           : 0
```
La base demo canónica se encuentra íntegra, sin registros huérfanos, con las seis identidades operativas y sin bloqueos residuales.
