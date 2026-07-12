# 3. Casos de uso principales

## CU-01 Registrar cuenta

**Actor**: visitante.
**Resultado**: se crean `Account` y `User` con password hasheado y rol permitido.

## CU-02 Iniciar sesion

**Actor**: usuario activo.
**Resultado**: se valida BCrypt, se controla lockout por cuenta y se emite un JWT con expiracion.

## CU-03 Editar perfil/CV

**Actor**: usuario autenticado.
**Resultado**: actualiza datos, avatar, carreras, contacto y CV sin modificar privilegios administrativos.

## CU-04 Gestionar carreras y materias

**Actor**: administrador.
**Resultado**: crea o actualiza carreras, materias, anio y correlatividades validas.

## CU-05 Crear publicacion

**Actor**: usuario autenticado no silenciado.
**Resultado**: se crea un `Inquiry` asociado a autor, materia y carrera visible segun reglas de scoping.

## CU-06 Crear publicacion con archivos

1. El cliente permite seleccionar y quitar hasta 10 archivos, con limite agregado de 15 MB y vista previa local.
2. Por cada archivo envia el binario a `POST /api/upload` con JWT.
3. El servidor valida extension/MIME/tamano y devuelve URL, nombre original, tipo y tamano.
4. El cliente ejecuta `addInquiry(..., attachments)`; el backend vuelve a validar alcance de materia y metadatos antes de persistir.
5. El mismo contrato se reutiliza en comentarios y respuestas mediante `addComment(..., attachments)`.
4. La UI actualiza el muro y conserva la URL tras recarga.

## CU-07 Comentar o responder

**Actor**: usuario autenticado no silenciado.
**Resultado**: crea `Comment`; una respuesta usa `ParentCommentId` de un comentario de la misma publicacion. Puede repetir el flujo de upload y enviar `fileUrl`.

## CU-08 Interactuar con contenido

**Actor**: usuario autenticado.
**Resultado**: alterna reaccion, reporta contenido o sigue/silencia/bloquea otro usuario.

## CU-09 Mensajeria privada

**Actor**: usuario autenticado.
**Resultado**: consulta historial, envia un mensaje persistente y el receptor recibe un evento privado.

## CU-10 Moderar

**Actor**: moderador o administrador.
**Resultado**: revisa reportes y aplica la accion permitida por su rol sin borrar contenido fisicamente.

## CU-11 Gestionar recursos academicos

**Actor**: profesor o administrador.
**Resultado**: sube o vincula recursos por materia; estudiantes de carreras relacionadas pueden consultarlos.

## CU-12 Consultar progreso academico

**Actor**: estudiante.
**Resultado**: visualiza notas/progreso propios y puede exportar constancias cuando corresponde.

## CU-13 Sincronizar SIU mock

**Actor**: administrador.
**Resultado**: ejecuta `syncSiuGrades(subjectId)` y actualiza progreso academico local desde registros simulados.

## CU-14 Publicar oferta laboral

**Actor**: empleador o administrador.
**Resultado**: crea `JobOffer`, se notifica a usuarios y aparece en `/empleos`.

## CU-15 Postularse a una oferta

**Actor**: estudiante o egresado.
**Resultado**: crea una unica `JobApplication` para la oferta activa.

## CU-16 Gestionar postulaciones

**Actor**: empleador propietario de la oferta.
**Resultado**: revisa perfiles academicos, filtra postulantes y cambia estado a Revisado/Rechazado, generando notificacion y correo institucional si SMTP esta configurado.
