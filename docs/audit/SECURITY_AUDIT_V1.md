# Reporte de Auditoría de Seguridad y Vulnerabilidades (Mitigaciones Completadas)

> Snapshot histórico. No representa conformidad vigente: al 2026-06-13,
> `ValidateLifetime` está desactivado y CORS permite cualquier origen. Consultar
> `docs/audit/fix-roadmap-13-06-2026.md`.

Este documento certifica el estado de seguridad y las mitigaciones implementadas en la plataforma OneITB23 en estricto cumplimiento con la **Constitución del Proyecto (v1.0.0)**.

---

## 1. Vulnerabilidades Críticas y Mitigaciones Implementadas

A través de un ciclo riguroso de auditoría y refactorización, se mitigaron por completo las vulnerabilidades críticas del sistema:

### 1.1. Manejo Inseguro de Contraseñas (Texto Plano) -> **MITIGADO**
* **Ubicación**: `API Graphql/Services/Users/UsersService.cs`
* **Severidad**: CRÍTICA (P0)
* **Mitigación**: Se integró el algoritmo de hashing criptográfico **BCrypt** (`BCrypt.Net-Next`). El método `CreateAsync` aplica hash automático antes del guardado físico. El método `GetByEmailAndPassword` valida el acceso mediante `BCrypt.Verify`.
* **Detalle Físico**: Los hashes se almacenan en una columna física rígida de tipo **`char(60)`** en SQL Server.

### 1.2. Exposición de Datos Sensibles por GraphQL -> **MITIGADO**
* **Ubicación**: `API Graphql/Entities/Models/User.cs`
* **Severidad**: ALTA (P1)
* **Mitigación**: Se aplicó el decorador de HotChocolate `[GraphQLIgnore]` a la propiedad `Password` del modelo físico `User`. Esto previene la serialización de contraseñas hacia los resolvedores GraphQL. La query del frontend `getUsers.js` fue corregida para eliminar la solicitud de contraseñas.

### 1.3. Pipeline de Autenticación Laxo -> **MITIGADO**
* **Ubicación**: `API Graphql/OneITB/Startup.cs`
* **Severidad**: CRÍTICA (P0)
* **Mitigación**: Se inyectó la llamada obligatoria a `app.UseAuthentication()` en el pipeline HTTP de ASP.NET Core, posicionándose justo antes de `app.UseAuthorization()`. Esto permite que HotChocolate valide correctamente el token JWT en las consultas marcadas con `[Authorize]`.

### 1.4. Tokens JWT Infinitos y sin Validación -> **MITIGADO**
* **Ubicación**: `API Graphql/OneITB/Startup.cs` & `Services/Users/UsersService.cs`
* **Severidad**: ALTA (P1)
* **Mitigación**: Se configuró la validez temporal estricta de tokens JWT a un máximo de **2 horas** en `GenerateToken`. En el archivo `Startup.cs`, se habilitó la validación obligatoria de tiempo de expiración cambiando `ValidateLifetime = false` a `ValidateLifetime = true`.

### 1.5. Expresiones Regulares Catastróficas (ReDoS) -> **MITIGADO**
* **Ubicación**: Capa de Validación de Email y Entradas
* **Severidad**: ALTA (P1)
* **Mitigación**: Para evitar denegaciones de servicio (ReDoS) por backtracking malicioso al procesar correos, la expresión regular `EmailRegex` se configuró como **Regex compilada** (`RegexOptions.Compiled`) y posee un timeout estricto de **250 milisegundos** (`TimeSpan.FromMilliseconds(250)`). El motor aborta automáticamente si se supera este tiempo de procesamiento.

### 1.6. Integridad Relacional y Borrados Accidentales -> **MITIGADO**
* **Ubicación**: Entity Framework Core Context
* **Severidad**: MEDIA (P2)
* **Mitigación**: Se reconfiguraron las relaciones críticas de la base de datos (tales como las existentes entre Consultas, Usuarios y Materias) aplicando **`DeleteBehavior.Restrict`** en la Fluent API. Esto previene borrados en cascada no deseados en la base de datos de auditorías.

---

## 2. Recomendaciones de Control Continuo

1. **Revisión de CORS**: Asegurar que la configuración del pipeline no contenga comodines de origen (`*`) en entornos de producción, mapeando únicamente los dominios autorizados de OneITB.
2. **Control de Inyección de Tokens**: Validar periódicamente que el `authLink` de Apollo Client en el frontend esté enviando correctamente la cabecera `Authorization: Bearer <token>` para todas las peticiones académicas protegidas.
