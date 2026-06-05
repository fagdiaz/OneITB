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

---

## 3. Correcciones de Base de Datos y DER

### 3.1. Estado de la Cuenta
* **Observación**: Agregar el campo `state` en la tabla `Account`.
* **Resolución**: Se incorporó el soporte para la propiedad `State` (admitido, bloqueado) mapeado físicamente a la columna en `OneItbContext.cs`.

### 3.2. Normalización de País
* **Observación**: Normalizar `country` (Países).
* **Resolución**: El modelo de datos se normalizó separando el dominio geográfico en una entidad aislada vinculada por relaciones y llaves foráneas.

---

## 4. Estado General de Mitigaciones Técnicas

| Área Auditada | Estado de Mitigación | Evidencia Técnica |
|---|---|---|
| Hashing de Contraseñas | 🟢 **Resuelto** | Cifrado mediante **BCrypt** de 60 caracteres en persistencia física. |
| Vulnerabilidad ReDoS | 🟢 **Resuelto** | Expresiones regulares compiladas con timeout estricto de **250ms**. |
| Seguridad en GraphQL | 🟢 **Resuelto** | Ocultamiento de la contraseña mediante atributo `[GraphQLIgnore]`. |
| Borrado de Registros | 🟢 **Resuelto** | Configuración de relaciones con `DeleteBehavior.Restrict`. |
| Compilación del Backend | 🟢 **Resuelto** | Compilación exitosa tras implementar la interfaz y repositorio de `IUnitOfWork`. |
