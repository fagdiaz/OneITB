# Spec 153: Tech Noir & Clean Tech Theming System

## Objective

Implementar un sistema integral de tema claro/oscuro persistente para OneITB23, con una estetica tecnologica sobria de alta gama:

- **Clean Tech**: modo claro institucional, limpio, con tarjetas blancas, bordes definidos y sombras suaves.
- **Tech Noir**: modo oscuro profundo, elegante, con superficies slate, bordes translucidos y brillo sutil solo en acciones clave.

## Scope

- Crear infraestructura React para administrar `light`/`dark`.
- Persistir preferencia en `localStorage` usando la clave `oneitb-theme`.
- Respetar `prefers-color-scheme` cuando no exista preferencia guardada.
- Inyectar la clase `dark` en `<html>` para Tailwind v4.
- Evitar FOUC aplicando el tema antes de cargar React.
- Agregar selector de tema dentro del menu real de usuario del Header.
- Aplicar variantes `dark:` en las superficies principales: Header, navegacion, notificaciones, layout privado, feed, perfil, chat, widget y modales.
- Mantener reglas de impresion forzadas a fondo claro/texto negro.

## Non Goals

- No se cambia backend, GraphQL ni base de datos.
- No se introducen librerias de UI externas.
- No se modifican contratos de datos.

## Acceptance Criteria

- Al alternar tema desde el menu del avatar, `<html>` cambia entre tener o no tener la clase `dark`.
- La preferencia persiste al refrescar.
- Si no existe preferencia guardada, la app usa la preferencia del sistema operativo.
- Header, feed, perfil, chat/widget y modales tienen superficies legibles en ambos temas.
- El modo impresion sigue usando una salida clara independientemente del tema activo.
- `npm.cmd run build` finaliza sin errores.
