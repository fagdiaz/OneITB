# Roadmap de estabilizacion - 2026-06-13

## Objetivo

Estabilizar y normalizar OneITB23 sobre el codigo real de la rama
`049-estabilizacion`, priorizando el flujo autenticado de creacion y lectura de
publicaciones antes de ampliar el alcance funcional.

## Evidencia de referencia

- Backend `Release`: compila con 0 errores y 6 advertencias.
- Frontend: compila con Vite 8.0.16.
- Servidor GraphQL activo: introspeccion HTTP 200 verificada el 2026-06-13.
- El esquema activo expone `User.id`, `User.firstName` y `User.lastName`.
- El tipo `Inquiry` activo no expone una navegacion `user`.
- La query frontend actual solicita `Inquiry.user` y campos
  `idUsuario`, `nombre`, `apellidos`; por lo tanto, el feed no esta alineado con
  el esquema activo.
- La mutacion de creacion no actualiza ni refetchea `GET_INQUIRIES`.
- `ValidateLifetime` esta desactivado y CORS permite cualquier origen.

## Regla de estado

- **Implementado**: existe codigo y compila.
- **Verificado**: el escenario se ejecuto de extremo a extremo y produjo el
  resultado esperado.
- **Bloqueado**: existe una condicion concreta que impide validarlo.
- Ninguna entrada historica reemplaza una verificacion actual.

## P0 - Feed de publicaciones

- [ ] Definir un unico contrato GraphQL en ingles para `Inquiry`, `User` y
  `Subject`.
- [x] Exponer la relacion autor de `Inquiry` o resolverla explicitamente sin
  generar N+1.
- [x] Alinear `GET_INQUIRIES` con el esquema real mediante compatibilidad
  temporal backend-only.
- [x] Validar `subjects` e `inquiries` contra el servidor activo.
- [ ] Crear una publicacion autenticada con `addInquiry`.
- [ ] Actualizar Apollo mediante `refetchQueries`, `update` o una respuesta
  suficiente para insertar la publicacion.
- [ ] Confirmar que la publicacion aparece inmediatamente.
- [ ] Recargar el navegador y confirmar persistencia en SQL Server.
- [ ] Mostrar errores GraphQL en la interfaz sin depender de `alert`.

**Bloqueo actual**: la base de datos responde `subjects: []`; no puede
validarse `addInquiry` hasta que exista al menos una materia válida mediante un
flujo institucional, migración de datos o carga autorizada.

## P1 - Seguridad y sesion

- [ ] Activar `ValidateLifetime = true`.
- [ ] Restringir CORS al origen configurado del frontend.
- [ ] Unificar almacenamiento de sesion y eliminar la duplicacion entre
  `token` y `access_token`.
- [ ] Confirmar que operaciones protegidas rechazan solicitudes sin JWT.
- [ ] Confirmar expiracion real del token.

## P2 - Normalizacion tecnica

- [ ] Resolver las 6 advertencias actuales del backend.
- [ ] Definir pruebas automatizadas minimas para autenticacion y publicaciones.
- [ ] Eliminar nombres o compatibilidades GraphQL en espanol del codigo.
- [ ] Revisar cascadas restantes y justificar cada excepcion a
  `DeleteBehavior.Restrict`.
- [ ] Retirar o aislar codigo temporal del frontend.

## P3 - Continuidad funcional

- [ ] Comentarios end-to-end.
- [ ] Reacciones end-to-end.
- [ ] Archivos educativos con una decision arquitectonica compatible con la
  constitucion.
- [ ] Mensajeria privada.
- [ ] Recursos y seguimiento academico.

## Criterio de salida de estabilizacion

La etapa termina cuando:

1. Login, lectura de materias, lectura de publicaciones y creacion de una
   publicacion funcionan en una sesion limpia.
2. La publicacion permanece despues de recargar.
3. Backend y frontend compilan.
4. JWT y CORS cumplen la constitucion.
5. La spec activa, `ROADMAP.md`, `DEVELOPMENT_LOG.md` y
   `DOCUMENTATION_STATUS.md` contienen el mismo estado verificable.
