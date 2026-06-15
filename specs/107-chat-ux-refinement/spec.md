# Feature Specification: Chat UX Refinement

## Description
Refinar la experiencia de usuario (UX) del Módulo 4 de mensajería para solucionar tres fricciones detectadas tras la implementación del buscador inteligente y la reactividad en tiempo real.

## Functional Requirements
1. El sistema debe limpiar el estado del buscador automáticamente al seleccionar un usuario o mensaje de los resultados.
2. El sistema debe mover a un "Nuevo Usuario" a la lista de "Conversaciones Activas" de forma reactiva en cuanto se le envíe o se reciba un mensaje.
3. El campo de texto de mensajes debe enviar el mensaje al presionar `Enter` (sin la tecla `Shift`) para agilizar el uso en escritorio, manteniendo `Shift+Enter` para saltos de línea.

## Success Criteria
- Al hacer clic en un resultado de búsqueda, la barra lateral vuelve a listar las conversaciones activas.
- Enviar un mensaje a un usuario con insignia de `(Nuevo)` actualiza dinámicamente el estado para que deje de estar etiquetado como nuevo y persista en la lista activa.
- Presionar `Enter` desencadena el envío exitoso del mensaje y limpia el input.

## User Scenarios & Testing
1. **Limpieza de búsqueda**: El usuario busca un nombre, hace clic en el resultado, el chat principal se enfoca en esa persona y la barra lateral vuelve a su estado normal.
2. **Promoción de Nuevo Usuario**: El usuario busca un usuario que nunca interactuó. Al enviar el mensaje, el usuario aparece arriba en la barra lateral sin la placa verde y la conversación fluye con normalidad.
3. **Envío con teclado**: El usuario tipea un texto, presiona `Enter` e inmediatamente el mensaje se despacha.
