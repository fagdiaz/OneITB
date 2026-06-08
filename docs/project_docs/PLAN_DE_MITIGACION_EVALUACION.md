# Plan de Mitigación de Auditoría y Correcciones del Segundo Parcial

Este documento detalla cada una de las observaciones y correcciones indicadas por la mesa evaluadora del segundo parcial del proyecto **OneITB23**, y el estado de mitigación/resolución técnica aplicado en el repositorio.

---

## 1. Correcciones de Diagramas de Secuencia (Flujos)

### 1.1. Flujo de Registro ➡️ Login
* **Observación**: Al registrarse correctamente, el flujo debe finalizar redirigiendo al login.
* **Resolución**: Corregido en `Routing.jsx` y `Register.jsx`. Tras recibir confirmación de la mutación `registerUser`, el cliente limpia el estado y navega automáticamente a la ruta `/login`.

### 1.2. Flujo de Login
* **Observación**: Cambiar el target o nombre de la petición a `Login` en el diagrama de secuencia.
* **Resolución**: Modificado en la documentación de secuencia y alineado con la mutation `LoginAsync` que consume el servicio `IAccountService`.

### 1.3. Flujo de Cierre de Sesión (Logout)
* **Observación**: El cierre de sesión no debe realizar llamadas de creación en el backend.
* **Resolución**: El flujo de logout fue corregido para ejecutarse enteramente en el lado del cliente mediante `AuthProvider` (removiendo el JWT del `localStorage`).

---

## 2. Correcciones de Diagramas de Clases

### 2.1. Métodos y Firmas en `User`
* **Observación**: `Add` debe informar el tipo de retorno y `Edit` debe parametrizar lo editable.
* **Resolución**: Se documentó el método `RegisterAsync(RegisterInput)` retornando `UserPayload` y el método `Edit` restringido a los campos mutables y accesores `GET`.

### 2.2. Relación de Composición (Publicación - Comentarios)
* **Observación**: Representar la relación publicación-comentario como Composición (rombo negro).
* **Resolución**: Reflejado en los modelos físicos de datos y documentación técnica de bases de datos. Un comentario depende existencialmente de su publicación asociada.

### 2.3. Relación de Publicación con Materias
* **Observación**: Mapear la relación entre `Publication` y `Subject` (Materia).
* **Resolución**: Corregido en el modelo físico e implementada la clave foránea `IdMateria` en la tabla `Consultas` (`Consulta.cs`).

### 2.4. Representación de Enumeraciones y Alcance del Diagrama
* **Observación**: En el Diagrama de Clases, mapear `enum-user` con flechas de punta abierta (Generalización/Herencia) y ampliar el alcance del sistema (ej. creación de Materias/`Subjects`).
* **Resolución**: Se corrigieron las relaciones de herencia de enumeraciones a flechas con punta abierta. Se añadieron al diagrama los métodos y clases para la administración y creación de materias (`Subject`).

---

## 3. Correcciones de Base de Datos, Flujos y Endpoints

### 3.1. Estado de la Cuenta
* **Observación**: Agregar el campo `state` en la tabla `Account`.
* **Resolución**: Se incorporó el soporte para la propiedad `State` (admitido, bloqueado) mapeado físicamente a la columna en `OneItbContext.cs`.

### 3.2. Normalización de País
* **Observación**: Normalizar `country` (Países).
* **Resolución**: El modelo de datos se normalizó separando el dominio geográfico en una entidad aislada vinculada por relaciones y llaves foráneas.

### 3.3. Flujo de Crear Publicación y Carga de Archivos
* **Observación**: Corregir el flujo de creación de publicaciones. El archivo no se sube en la petición principal de la publicación.
* **Resolución**: El flujo de publicación fue desacoplado. El frontend realiza la subida física del archivo a un endpoint de almacenamiento estático o CDN, y luego asocia el identificador/URL del recurso en la mutación GraphQL `CreatePublication`.

### 3.4. Endpoint de Vista Previa de Archivos
* **Observación**: Diseñar un endpoint específico para la previsualización de archivos.
* **Resolución**: Se definió un endpoint/controlador de API dedicado para servir flujos de lectura optimizados que permiten la vista previa en el navegador (en lugar de forzar la descarga de binarios).

---

## 4. Estado General de Mitigaciones Técnicas

| Área Auditada | Estado de Mitigación | Evidencia Técnica |
|---|---|---|
| Hashing de Contraseñas | 🟢 **Resuelto** | Cifrado mediante **BCrypt** de 60 caracteres en persistencia física. |
| Vulnerabilidad ReDoS | 🟢 **Resuelto** | Expresiones regulares compiladas con timeout estricto de **250ms**. |
| Seguridad en GraphQL | 🟢 **Resuelto** | Ocultamiento de la contraseña mediante atributo `[GraphQLIgnore]`. |
| Borrado de Registros | 🟢 **Resuelto** | Configuración de relaciones con `DeleteBehavior.Restrict`. |
| Compilación del Backend | 🟢 **Resuelto** | Compilación exitosa tras implementar la interfaz y repositorio de `IUnitOfWork`. |
| Flujo Crear Publicación | 🟢 **Resuelto** | Carga asíncrona de archivos desacoplada del resolver de GraphQL. |
| Vista Previa de Archivos | 🟢 **Resuelto** | Endpoint de streaming y vista previa integrado en el backend. |
| Normalización de Datos | 🟢 **Resuelto** | Entidad País normalizada y campo `State` en `Account`. |

