# 3. Casos de uso principales

## CU-01 Registrar cuenta

**Actor**: visitante.  
**Resultado**: se crean `Account` y `User` con password hasheado y rol permitido.

## CU-02 Iniciar sesion

**Actor**: usuario activo.  
**Resultado**: se valida BCrypt y se emite un JWT con expiracion.

## CU-03 Editar perfil

**Actor**: usuario autenticado.  
**Resultado**: actualiza sus datos y CV sin modificar privilegios administrativos.

## CU-04 Gestionar carreras y materias

**Actor**: administrador.  
**Resultado**: crea o actualiza carreras, materias, anio y correlatividades validas.

## CU-05 Crear publicacion

**Actor**: usuario autenticado no silenciado.  
**Resultado**: se crea un `Inquiry` asociado a autor y materia.

## CU-06 Crear publicacion con archivo

1. El cliente envia el binario a `POST /api/upload` con JWT.
2. El servidor valida formato/tamano y devuelve `/uploads/{guid.ext}`.
3. El cliente ejecuta `addInquiry(..., fileUrl)`.
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
