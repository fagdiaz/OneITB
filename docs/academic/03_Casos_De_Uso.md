# 3. Trazo Fino de los Casos de Uso

A continuación se detalla el flujo formal de interacción de los casos de uso del sistema.

---

### CU 01: Crear Usuario
* **Referencia**: CU-01
* **Actor Primario**: Usuario
* **Descripción**: Crear perfil de usuario para ingresar al sistema.
* **Precondiciones**:
  - El usuario no debe estar registrado en el sistema.
  - El usuario debe ingresar a la pantalla “Registrar”.
* **Flujo de Eventos**:
  1. El usuario completa los campos "Nombre", "Apellidos", "Alias", "Correo electrónico", "Contraseña" y selecciona las carreras inscritas.
  2. El usuario presiona el botón “Registrarse”.
  3. El sistema valida los datos de registro (dominio `@itbeltran.com.ar`).
  4. El sistema muestra un mensaje indicando que el registro fue exitoso y requiere validación de correo.
  5. El usuario acepta el mensaje informativo.
* **Postcondiciones**: Inserción física en la tabla `Users` con estado de cuenta pendiente de validación.

---

### CU 02: Validar Usuario
* **Referencia**: CU-02
* **Actor Primario**: Usuario
* **Descripción**: Validar el correo electrónico del usuario.
* **Precondiciones**: El usuario debe haber completado el registro y recibido el mail de confirmación.
* **Flujo de Eventos**:
  1. El usuario ingresa a su casilla de correo electrónico y hace clic en el link de validación.
  2. El sistema recibe la petición HTTP GET con el token aleatorio y valida la correspondencia de la cuenta.
  3. El sistema actualiza el estado de la cuenta a `Validado` y muestra mensaje de éxito.
* **Postcondiciones**: El estado de admisión cambia de pendiente a habilitado en la tabla `Account`.

---

### CU 03: Cambiar Contraseña
* **Referencia**: CU-03
* **Actor Primario**: Usuario
* **Descripción**: Modificar la contraseña del usuario para acceso seguro.
* **Precondiciones**: El usuario debe estar registrado.
* **Flujo de Eventos**:
  1. El usuario selecciona “Olvidé contraseña” e ingresa su email.
  2. El sistema envía un email con un link/token de restablecimiento.
  3. El usuario abre el link e ingresa la nueva contraseña en los campos de confirmación.
  4. El sistema valida la igualdad de los campos, cifra la nueva contraseña con BCrypt y la guarda.
* **Postcondiciones**: La contraseña encriptada es modificada en la base de datos.

---

### CU 04: Iniciar Sesión (Login)
* **Referencia**: CU-04
* **Actor Primario**: Usuario
* **Descripción**: Iniciar sesión en el sistema para acceder a las secciones privadas.
* **Precondiciones**: El usuario debe estar registrado y validado en la plataforma.
* **Flujo de Eventos**:
  1. El usuario ingresa su correo y contraseña y presiona "Ingresar".
  2. El sistema consulta las credenciales, verifica el hash de contraseña y el estado activo de la cuenta.
  3. El sistema genera un JWT (expirable) y lo retorna al cliente.
  4. El frontend guarda el token en `localStorage` e ingresa al dashboard privado.
* **Postcondiciones**: Sesión activa del usuario iniciada de forma segura.

---

### CU 05: Cerrar Sesión (Logout)
* **Referencia**: CU-05
* **Actor Primario**: Usuario
* **Descripción**: Finalizar la sesión del usuario.
* **Precondiciones**: El usuario debe tener una sesión activa.
* **Flujo de Eventos**:
  1. El usuario selecciona "Cerrar sesión" en la barra de navegación.
  2. El frontend remueve el token JWT del `localStorage` y limpia el estado global.
  3. El sistema redirige automáticamente a la pantalla de `/login`.
* **Postcondiciones**: La sesión se cierra completamente del lado del cliente sin crear llamadas extras en el backend.

---

### CU 06: Modificar Perfil
* **Referencia**: CU-06
* **Actor Primario**: Usuario
* **Descripción**: Actualizar los datos personales y enlaces del perfil.
* **Precondiciones**: Sesión activa.
* **Flujo de Eventos**:
  1. El usuario ingresa a su Perfil y selecciona "Editar".
  2. Completa los campos modificables (Nombre, Alias, Teléfono, biografía, redes).
  3. Presiona el botón "Guardar".
  4. El sistema persiste los cambios actualizados.
* **Postcondiciones**: Se actualizan las tablas físicas correspondientes en SQL Server.

---

### CU 07: Crear Publicación (Carga Desacoplada)
* **Referencia**: CU-07
* **Actor Primario**: Usuario
* **Descripción**: Crea una nueva publicación vinculada a una materia.
* **Precondiciones**: Sesión activa del usuario.
* **Flujo de Eventos**:
  1. El usuario completa el título, contenido y selecciona la materia/curso.
  2. El usuario selecciona un archivo adjunto.
  3. El frontend sube el archivo de forma asíncrona a la API de almacenamiento.
  4. La API de almacenamiento retorna el identificador del archivo (`FileId`).
  5. El usuario presiona "Enviar" y el frontend dispara la Mutation de GraphQL vinculando los campos junto al `FileId`.
  6. El sistema crea la publicación en base de datos.
* **Postcondiciones**: Publicación guardada en la tabla `Consultas` con el archivo asociado correctamente.

---

### CU 08: Eliminar Publicación
* **Referencia**: CU-08
* **Actor Primario**: Usuario (Autor) o Administrador
* **Descripción**: Elimina una publicación existente.
* **Precondiciones**: El usuario debe ser el creador de la publicación o administrador del sistema.
* **Flujo de Eventos**:
  1. El usuario accede a la publicación y presiona "Eliminar publicación".
  2. El sistema solicita confirmación mediante un modal.
  3. El usuario confirma.
  4. El sistema ejecuta el borrado físico o lógico de la publicación.
* **Postcondiciones**: La publicación y sus comentarios dependientes (composición) se eliminan o inhabilitan en la base de datos.

---

### CU 09: Crear Comentario
* **Referencia**: CU-09
* **Actor Primario**: Usuario
* **Descripción**: Añade un comentario o respuesta a una publicación.
* **Precondiciones**: Sesión activa del usuario.
* **Flujo de Eventos**:
  1. El usuario visualiza una publicación y completa el campo de texto de comentarios.
  2. Presiona "Enviar".
  3. El sistema valida los datos y registra el comentario asociado a la publicación padre.
* **Postcondiciones**: Inserción del comentario en la base de datos en relación de composición física.
