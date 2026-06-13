# Roadmap funcional - OneITB23

## Estado global: 65%

Calculo: 13 tareas completadas de 20 tareas totales. El porcentaje se deriva
exclusivamente de los checklists de este archivo.

## Modulo 1: Autenticacion y cuentas - 100%

- [x] Registro institucional implementado.
- [x] Passwords almacenados con BCrypt `char(60)`.
- [x] Login entrega JWT.
- [x] Validacion de vigencia JWT activa y verificada.
- [x] Sesion frontend normalizada sobre una unica clave de token.

## Modulo 2: Perfiles de usuario - 100%

- [x] Relacion `User` y `Account`.
- [x] Biografia y redes sociales.
- [x] Datos de carrera/cursada implementados.
- [x] Interfaz de perfil integrada.

## Modulo 3: Publicaciones y comentarios - 80%

- [x] Entidades `Subject` e `Inquiry`.
- [x] Estructura de comentarios existente.
- [x] Creacion y lectura de publicaciones verificadas end-to-end.
- [ ] Archivos educativos.
- [x] Reacciones verificadas end-to-end.

Estado tecnico: el feed permite publicar, reaccionar, comentar, responder y
reportar. El seed administrado aporta 5 materias, 10 usuarios, 30 publicaciones,
90 reacciones, 45 comentarios y 2 reportes sin duplicarse al reiniciar.

## Modulo 4: Mensajeria privada - 0%

- [ ] Conversaciones uno a uno.
- [ ] Persistencia de mensajes.
- [ ] Notificaciones de mensajes nuevos.

## Modulo 5: Recursos y seguimiento - 0%

- [ ] Visualizacion de notas.
- [ ] Integracion o simulacion SIU Guarani.
- [ ] Preferencias de notificacion por materia.

## Prioridad vigente

Completar archivos educativos del Modulo 3 antes de ampliar el alcance hacia
Mensajeria privada o Recursos y seguimiento.
