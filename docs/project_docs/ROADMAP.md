# Roadmap funcional - OneITB23

## Estado global: 88%

Calculo: 21 tareas completadas de 24 tareas totales. El porcentaje se deriva
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

## Modulo 3: Publicaciones y comentarios - 100%

- [x] Entidades `Subject` e `Inquiry`.
- [x] Estructura de comentarios existente.
- [x] Creacion y lectura de publicaciones verificadas end-to-end.
- [x] Archivos educativos.
- [x] Reacciones verificadas end-to-end.

Estado tecnico: el feed permite publicar, reaccionar, comentar, responder,
reportar y adjuntar archivos educativos mediante una carga REST desacoplada y
URLs persistidas en publicaciones y comentarios. La UI clasifica imagenes,
PDF, presentaciones y documentos, y reconoce enlaces seguros de YouTube. El
seed administrado aporta 5 materias, 10 usuarios, 30 publicaciones, 90
reacciones, 45 comentarios y 2 reportes sin duplicarse al reiniciar.

## Modulo 4: Mensajeria privada - 100%

- [x] Conversaciones uno a uno.
- [x] Persistencia de mensajes.
- [x] Notificaciones de mensajes nuevos.

Estado tecnico: GraphQL expone contactos e historial paginados, envio y lectura
autenticados y una suscripcion privada por usuario. Apollo usa WebSockets con
JWT, actualizacion optimista, deduplicacion y reconciliacion al reconectar.
Adicionalmente, se cuenta con un buscador inteligente de contactos y mensajes
integrado con una interfaz reactiva, resolviendo fallos de UX previos.

## Modulo 5: Recursos y seguimiento - 0%

- [ ] Visualizacion de notas.
- [ ] Integracion o simulacion SIU Guarani.
- [ ] Preferencias de notificacion por materia.

## Modulo 6: Administración y Moderación - 100%

- [x] Panel de Usuarios (Roles y Suspensión).
- [x] Panel de Materias (CRUD, carrera obligatoria, anio, correlatividades y desactivacion).
- [x] Panel de Moderación (Cambio de estado de reportes de comunidad).
- [x] Unificación del diseño (Listas tabulares).

## Prioridad vigente

Avanzar sobre Recursos y seguimiento. Para escalar Mensajeria a multiples
instancias se debe reemplazar
el pub/sub en memoria por un transporte distribuido.
